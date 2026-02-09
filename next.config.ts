
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Required for APK and EXE generation
  trailingSlash: true, // Ensures proper routing in local file systems (Android/Electron)
  images: {
    unoptimized: true, // Required for static export as there is no image optimization server
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer, webpack }) => {
    // Critical fix for 'async_hooks', 'fs', and Node.js modules in static/client builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        http2: false,
        undici: false,
        perf_hooks: false,
        process: false,
        util: false,
        stream: false,
        zlib: false,
        http: false,
        https: false,
        url: false,
        vm: false,
        querystring: false,
        timers: false,
        buffer: false,
      };

      // Specifically handle opentelemetry and genkit node-only dependencies
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /@opentelemetry\/context-async-hooks/,
          (resource: any) => {
            resource.request = 'object'; // Replace with a safe no-op
          }
        )
      );
      
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^async_hooks$|^fs$|^path$|^os$|^crypto$|^net$|^tls$|^dns$|^child_process$|^http2$|^undici$|^perf_hooks$|^process$|^util$|^stream$|^zlib$|^http$|^https$|^url$|^vm$|^querystring$|^timers$|^buffer$/
        })
      );
    }
    return config;
  },
};

export default nextConfig;
