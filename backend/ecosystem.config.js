
module.exports = {
  apps: [{
    name: "komcs-pjb-api",
    script: "./server.js",
    instances: "2", // Gunakan 2 instance untuk stabilitas pada 1 vCPU, atau 'max' jika core lebih banyak
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: "production",
      PORT: 5000
    }
  }]
}
