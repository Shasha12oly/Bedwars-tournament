import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({ 
        error: 'DATABASE_URL not found in environment',
        envVars: Object.keys(process.env).filter(key => key.includes('DATABASE'))
      }, { status: 500 });
    }

    // Parse the connection string to show details (without password)
    const url = new URL(databaseUrl);
    const connectionInfo = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      database: url.pathname.slice(1), // Remove leading /
      username: url.username,
      password: url.password ? '[REDACTED]' : 'none',
      fullUrl: databaseUrl.replace(/:[^:]*@/, ':[REDACTED]@') // Hide password in full URL
    };

    return NextResponse.json({ 
      success: true,
      message: 'Database URL found and parsed',
      connection: connectionInfo
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to parse DATABASE_URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
