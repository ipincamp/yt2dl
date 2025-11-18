module.exports = {
  apps: [
    {
      name: 'yt2dl-dev',
      script: 'tsx',
      args: 'watch src/index.ts',
      instances: 1,
      autorestart: true,
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
      },
      error_file: './logs/dev-error.log',
      out_file: './logs/dev-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
