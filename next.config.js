require("dotenv").config();
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    RC_SERVER: process.env.RC_SERVER,
  },
};

module.exports = nextConfig;
