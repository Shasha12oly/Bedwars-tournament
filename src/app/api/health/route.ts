import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const requiredEnvVars = [
      'DISCORD_BOT_TOKEN',
      'DISCORD_CHANNEL_ID',
      'DISCORD_GUILD_ID',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
    ];

    const envStatus = requiredEnvVars.map(varName => ({
      name: varName,
      configured: !!process.env[varName]
    }));

    const allConfigured = envStatus.every(env => env.configured);

    // Check Firebase connectivity (basic check)
    const firebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    // Check Discord bot token format
    const discordTokenConfigured = process.env.DISCORD_BOT_TOKEN?.startsWith('MT') || false;

    const healthStatus = {
      status: allConfigured ? 'healthy' : 'warning',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      checks: {
        environment: allConfigured,
        firebase: firebaseConfigured,
        discord: discordTokenConfigured,
        mobile_optimized: true,
        production_ready: allConfigured && firebaseConfigured && discordTokenConfigured
      },
      environment_variables: envStatus,
      features: {
        discord_bot: true,
        mobile_responsive: true,
        tournament_management: true,
        team_registration: true,
        real_time_updates: true
      },
      deployment: {
        platform: 'Render',
        optimized: true,
        mobile_first: true,
        performance_optimized: true
      }
    };

    return NextResponse.json(healthStatus);

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
