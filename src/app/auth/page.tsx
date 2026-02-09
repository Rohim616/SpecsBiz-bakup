'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Store, LogIn, UserPlus, LogOut, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth();

  const [email, setEmail] = useState('xrratul4763@gmail.com');
  const [password, setPassword] = useState('11111111');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome back", description: "You are now connected to the online database." });
      router.push('/');
    } catch (error: any) {
      // If user doesn't exist, try to register (for first time use of secret account)
      if (error.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          toast({ title: "Account Created", description: "Secret account initialized." });
          router.push('/');
        } catch (regErr: any) {
          toast({ variant: "destructive", title: "Login Failed", description: regErr.message });
        }
      } else {
        toast({ variant: "destructive", title: "Login Failed", description: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: "Logged Out", description: "You are now in local-only mode." });
  };

  if (isUserLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (user) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle>Connected to Cloud</CardTitle>
            <CardDescription>Logged in as {user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All your data is currently syncing with the secure online database.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-2xl border-accent/20">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto bg-accent p-3 rounded-xl w-fit mb-2">
            <Store className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-headline">SpecsBiz Login</CardTitle>
          <CardDescription>Enter the secret credentials for shared access.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username / Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="xrratul4763@gmail.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Secret Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full bg-accent hover:bg-accent/90 gap-2 h-12 text-lg" disabled={loading}>
              <LogIn className="w-5 h-5" /> {loading ? "Connecting..." : "Enter Business Cloud"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-6">
          <p className="text-xs text-center text-muted-foreground">
            Don't have the secret credentials? Use the app offline.
          </p>
          <Button variant="ghost" className="w-full" onClick={() => router.push('/')}>
            Continue Offline
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
