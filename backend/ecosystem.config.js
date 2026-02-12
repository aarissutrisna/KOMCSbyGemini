
module.exports = {
  apps: [{
    name: "komcs-pjb-api",
    script: "./server.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    }
  }]
}
