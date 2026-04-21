module.exports = {
  apps: [
    {
      name: 'aubasa-backend',
      cwd: './backend',
      script: 'server.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '../logs/backend-error.log',
      out_file:   '../logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}
