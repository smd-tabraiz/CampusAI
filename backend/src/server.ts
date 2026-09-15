import { createApp } from './app';
import { config } from './config';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`
  🚀 CampusAI Backend Server is running!
  📡 Listening on: http://localhost:${config.port}
  🔒 Environment: ${config.nodeEnv}
  🤖 AI Mode: ${config.ibmApiKey ? 'IBM watsonx.ai (Live Cloud)' : 'Smart Heuristic NLP Engine (Offline Fallback)'}
  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
