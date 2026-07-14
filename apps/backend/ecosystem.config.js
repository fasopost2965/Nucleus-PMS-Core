module.exports = {
  apps: [
    {
      name: 'nucleus-pms-backend',
      script: './dist/server.js',
      instances: 'max', // or a specific number depending on hostinger CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
      }
    }
  ]
};
