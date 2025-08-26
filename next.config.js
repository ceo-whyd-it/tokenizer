/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        module: false,
        sharp: false,
        'onnxruntime-node': false,
      };
    }
    
    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Ignore node-specific modules
    config.externals = config.externals || {};
    if (!isServer) {
      config.externals = {
        ...config.externals,
        sharp: 'sharp',
        'onnxruntime-node': 'onnxruntime-node',
      };
    }

    return config;
  },
}

module.exports = nextConfig