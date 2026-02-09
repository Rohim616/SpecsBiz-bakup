import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Required for APK and EXE generation
  trailingSlash: true, // Ensures proper routing in local file systems
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.ibb.co.com' }
    ],
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Robust fallbacks for Node.js modules in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
        fs: false,
        path: require.resolve('path-browserify'),
        os: false,
        crypto: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        http2: false,
        undici: false,
        perf_hooks: false,
        process: require.resolve('process/browser'),
        util: false,
        stream: false,
        zlib: false,
        http: false,
        https: false,
        url: false,
        vm: false,
        querystring: false,
        timers: false,
        buffer: require.resolve('buffer/'),
      };

      // Force-ignore problematic OpenTelemetry and Node modules
      config.resolve.alias = {
        ...config.resolve.alias,
        'async_hooks': false,
        '@opentelemetry/context-async-hooks': false,
        '@opentelemetry/sdk-trace-node': false,
        '@opentelemetry/sdk-node': false,
      };

      // Global variable mocks for client-side bundles
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Specifically replace problematic internal requires
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /async_hooks/,
          require.resolve('path-browserify')
        )
      );
      
      // Ignore warnings for missing optional Node modules
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