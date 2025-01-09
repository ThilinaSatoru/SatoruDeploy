const express = require("express");
const os = require("os-utils");
const pm2 = require("pm2");

const app = express();
const PORT = process.env.PORT || 3000;

// Function to get PM2 process status
const getPm2Status = () =>
  new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        reject("Unable to connect to PM2.");
      } else {
        pm2.list((err, processList) => {
          pm2.disconnect();
          if (err) reject("Error fetching PM2 process list.");
          else resolve(processList);
        });
      }
    });
  });

app.get("/", async (req, res) => {
  try {
    // Gather system information
    const uptime = os.sysUptime();
    const load = os.loadavg(1);
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    const cpuUsage = await new Promise((resolve) => os.cpuUsage(resolve));
    const pm2Status = await getPm2Status();

    // Render the dashboard
    res.send(`
      <html>
        <head>
          <title>Server Dashboard</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f9; color: #333; padding: 20px; }
            h1 { color: #5a5afc; }
            .container { max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .status { margin-bottom: 20px; }
            .status h2 { color: #5a5afc; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            table th, table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            table th { background-color: #5a5afc; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Server Dashboard</h1>
            <div class="status">
              <h2>System Information</h2>
              <p><strong>Uptime:</strong> ${uptime.toFixed(2)} seconds</p>
              <p><strong>Load Average:</strong> ${load.toFixed(2)}</p>
              <p><strong>Free Memory:</strong> ${(freeMemory / 1024 / 1024).toFixed(2)} GB</p>
              <p><strong>Total Memory:</strong> ${(totalMemory / 1024 / 1024).toFixed(2)} GB</p>
              <p><strong>CPU Usage:</strong> ${(cpuUsage * 100).toFixed(2)}%</p>
            </div>
            <div class="status">
              <h2>PM2 Processes</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>CPU</th>
                    <th>Memory</th>
                  </tr>
                </thead>
                <tbody>
                  ${pm2Status
        .map(
          (proc) => `
                    <tr>
                      <td>${proc.name}</td>
                      <td>${proc.pm2_env.status}</td>
                      <td>${proc.monit.cpu}%</td>
                      <td>${(proc.monit.memory / 1024 / 1024).toFixed(2)} MB</td>
                    </tr>
                  `
        )
        .join("")}
                </tbody>
              </table>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
