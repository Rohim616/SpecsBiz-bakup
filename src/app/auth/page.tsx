
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
import { Store, LogIn, LogOut, ShieldCheck, Loader2 } from 'lucide-react';

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
      // First attempt to sign in
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome back", description: "You are now connected to the online database." });
      router.push('/');
    } catch (error: any) {
      console.log("Auth Error Code:", error.code);
      
      // If user doesn't exist or credentials failed, try to register 
      // (This handles the first-time setup for your secret account)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          toast({ title: "Account Initialized", description: "The secret account has been created and logged in." });
          router.push('/');
        } catch (regErr: any) {
          // If it still fails, it means the password provided might be wrong for an existing account
          toast({ 
            variant: "destructive", 
            title: "Access Denied", 
            description: error.code === 'auth/invalid-credential' && error.message.includes('password') 
              ? "Incorrect secret password." 
              : "Could not connect to the cloud. Please check your credentials." 
          });
        }
      } else {
        toast({ variant: "destructive", title: "Connection Failed", description: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: "Logged Out", description: "You are now in local-only mode." });
  };

  if (isUserLoading) return (
    <div className="flex h-screen items-center justify-center gap-2 text-primary font-medium">
      <Loader2 className="w-5 h-5 animate-spin" /> Syncing...
    </div>
  );

  if (user) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-6">
        <Card className="w-full max-w-md text-center shadow-xl border-accent/20">
          <CardHeader>
            <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
              <ShieldCheck className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-headline">Cloud Active</CardTitle>
            <CardDescription className="font-medium text-accent">{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              Your business data is currently being backed up to the secure cloud. This data is shared with anyone using these credentials.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full gap-2 border-destructive text-destructive hover:bg-destructive/5" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Disconnect Cloud
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-2xl border-accent/20">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-accent p-4 rounded-2xl w-fit mb-2 shadow-lg shadow-accent/20">
            <Store className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-headline">SpecsBiz Cloud</CardTitle>
          <CardDescription>Enter your shared business credentials to sync data across devices.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Shared Email / ID</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="xrratul4763@gmail.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-12 focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Secret Access Key</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-12 focus:ring-accent"
              />
            </div>
            <Button className="w-full bg-accent hover:bg-accent/90 gap-2 h-14 text-lg font-bold shadow-xl shadow-accent/10" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? "Authenticating..." : "Connect to Business Cloud"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-6 bg-muted/5">
          <p className="text-xs text-center text-muted-foreground px-6 leading-relaxed">
            By connecting, your inventory and sales data will be synchronized with other staff members using this account.
          </p>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => router.push('/')}>
            Continue Without Cloud (Local Only)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
