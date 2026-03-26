// Discord Gateway Auto-Initializer
// This script runs on server startup to ensure bot stays online

const { initializeGateway } = require('./src/app/api/discord/register/route.ts');

// Initialize gateway connection after server starts
setTimeout(async () => {
  console.log('🚀 Server started - Initializing Discord Gateway connection...');
  try {
    await initializeGateway();
    console.log('✅ Discord Gateway auto-initialization complete');
  } catch (error) {
    console.error('❌ Failed to auto-initialize Discord Gateway:', error);
  }
}, 5000); // Wait 5 seconds for server to fully start
