/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['uploadthing.com', 'avatars.githubusercontent.com'],
  },
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig
