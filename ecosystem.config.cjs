module.exports = {
  apps: [
    {
      name: "fate-wheel",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/home/ubuntu/fate_wheel",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        NODE_OPTIONS: "--max-old-space-size=1024",
      },
      error_file: "/home/ubuntu/.pm2/logs/fate-wheel-error.log",
      out_file: "/home/ubuntu/.pm2/logs/fate-wheel-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
