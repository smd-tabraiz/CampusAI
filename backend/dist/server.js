"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const app = (0, app_1.createApp)();
const server = app.listen(config_1.config.port, () => {
    console.log(`
  🚀 CampusAI Backend Server is running!
  📡 Listening on: http://localhost:${config_1.config.port}
  🔒 Environment: ${config_1.config.nodeEnv}
  🤖 AI Mode: ${config_1.config.ibmApiKey ? 'IBM watsonx.ai (Live Cloud)' : 'Smart Heuristic NLP Engine (Offline Fallback)'}
  `);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
