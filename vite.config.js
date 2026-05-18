import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function resetLinkTerminalPlugin() {
  return {
    name: "reset-link-terminal-plugin",
    configureServer(server) {
      server.middlewares.use("/__dev/reset-link", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        let body = "";

        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");

            if (data.resetLink) {
              console.log("\nReset password link:");
              console.log(data.resetLink);
              console.log("");
            }
          } catch {
            console.log("\nReset password link payload could not be read.\n");
          }

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true }));
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), resetLinkTerminalPlugin()],
  server: {
    proxy: {
      // ✅ Forwards /api requests to your Express backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})