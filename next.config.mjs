/** @type {import('next').NextConfig} */
const nextConfig = {
  // The 3D scene mutates the three.js graph imperatively (attach/detach, material
  // cloning). StrictMode's double-invoke would run that setup twice, so we disable it.
  reactStrictMode: false,
};

export default nextConfig;
