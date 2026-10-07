// Plain JS (not next.config.ts) so `next start` on cPanel doesn't need SWC to transpile
// the config: SWC spawns a thread per host core, which the account's process limit blocks.

/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Seed-data placeholder images only. Real product photos are served from Cloudinary.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    // On shared hosting (e.g. cPanel/CloudLinux LVE), os.cpus() reports the physical
    // host's core count, not the account's actual CPU allocation — left at the default
    // it tries to spawn far more build workers than the account can fork, failing with
    // `spawn ... EAGAIN`. Cap it to the plan's allocated vCores.
    cpus: 1,
    // Same limits also block extra threads/processes. Turbopack runs PostCSS/Tailwind in
    // worker threads (ERR_WORKER_INIT_FAILED / EAGAIN there), so cPanel builds use
    // `npm run build:cpanel` (webpack), and these keep webpack in a single process.
    webpackBuildWorker: false,
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
  },
};

export default nextConfig;
