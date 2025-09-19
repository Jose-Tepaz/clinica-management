/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones para producción
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Configuración de imágenes
  images: {
    domains: ['placeholder.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Configuración de webpack para optimización
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimizaciones para el bundle del cliente
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
}

export default nextConfig