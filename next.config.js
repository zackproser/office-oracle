/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    ELEVEN_LABS_API_KEY: process.env.ELEVEN_LABS_API_KEY,
    ELEVEN_LABS_VOICE_ID: process.env.ELEVEN_LABS_VOICE_ID
  },
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true }
    return config
  }
};
