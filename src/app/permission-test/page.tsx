'use client';

import { useState } from 'react';

export default function BotPermissionTest() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBotPermissions = async () => {
    setLoading(true);
    addResult('=== Detailed Bot Permission Test ===');
    
    try {
      const DISCORD_BOT_TOKEN = 'MTQ4NjI1ODQ0NjQ1MzE3ODQxMA.GBVUrE.8WqKqDFcu2MpECsuAqsT9zu1ZFkQveOXWl3Op0';
      const channelId = '1486259852144807976';
      const serverId = '1485623548855713923';
      
      addResult(`📡 Using Channel ID: ${channelId}`);
      addResult(`🏛️ Using Server ID: ${serverId}`);
      
      // Test 1: Bot Info
      addResult('🔐 Getting bot info...');
      const botResponse = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        }
      });
      
      if (botResponse.ok) {
        const botInfo = await botResponse.json();
        addResult(`✅ Bot: ${botInfo.username} (${botInfo.id})`);
      } else {
        addResult(`❌ Bot info failed: ${botResponse.status}`);
        return;
      }
      
      // Test 2: Server Info
      addResult('🏛️ Getting server info...');
      const serverResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}`, {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        }
      });
      
      if (serverResponse.ok) {
        const serverInfo = await serverResponse.json();
        addResult(`✅ Server: ${serverInfo.name} (${serverInfo.id})`);
        addResult(`👥 Server Members: ${serverInfo.member_count || 'Unknown'}`);
        addResult(`📢 Server Channels: ${serverInfo.channels?.length || 'Unknown'}`);
      } else {
        addResult(`❌ Server info failed: ${serverResponse.status}`);
        const errorText = await serverResponse.text();
        addResult(`Error: ${errorText}`);
      }
      
      // Test 3: Channel Info (Detailed)
      addResult('📢 Getting detailed channel info...');
      const channelResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        }
      });
      
      if (channelResponse.ok) {
        const channelInfo = await channelResponse.json();
        addResult(`✅ Channel: ${channelInfo.name} (${channelInfo.id})`);
        addResult(`💬 Channel Type: ${channelInfo.type === 0 ? 'Text' : channelInfo.type === 2 ? 'Voice' : 'Other'}`);
        addResult(`👥 Channel Position: ${channelInfo.position || 'Unknown'}`);
        addResult(`📝 Channel Topic: ${channelInfo.topic || 'No topic'}`);
        addResult(`🔒 NSFW: ${channelInfo.nsfw ? 'Yes' : 'No'}`);
        addResult(`👑 Channel Owner: ${channelInfo.owner_id || 'Unknown'}`);
      } else {
        addResult(`❌ Channel info failed: ${channelResponse.status}`);
        const errorText = await channelResponse.text();
        addResult(`Error: ${errorText}`);
        
        if (channelResponse.status === 403) {
          addResult('🚫 403 Forbidden - Bot lacks permission');
          addResult('💡 Solution: Check bot permissions in server');
        } else if (channelResponse.status === 404) {
          addResult('🔍 404 Not Found - Channel doesn\'t exist');
          addResult('💡 Solution: Verify channel ID is correct');
        }
      }
      
      // Test 4: Try to Send a Simple Message
      addResult('📨 Attempting to send simple message...');
      
      const simpleMessage = {
        content: "🤖 Bot Test Message - If you see this, permissions are working!"
      };
      
      const messageResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simpleMessage)
      });
      
      if (messageResponse.ok) {
        addResult(`✅ Simple message sent successfully!`);
        addResult(`📨 Check your Discord channel!`);
      } else {
        const errorText = await messageResponse.text();
        addResult(`❌ Message send failed: ${messageResponse.status}`);
        addResult(`Error: ${errorText}`);
        
        // Parse error for more details
        try {
          const errorData = JSON.parse(errorText);
          addResult(`🔍 Error Details: ${errorData.message || 'Unknown error'}`);
        } catch (e) {
          addResult(`🔍 Raw Error: ${errorText}`);
        }
      }
      
      // Test 5: List Server Channels
      addResult('📋 Listing server channels...');
      const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}/channels`, {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        }
      });
      
      if (channelsResponse.ok) {
        const channels = await channelsResponse.json();
        addResult(`✅ Found ${channels.length} channels in server`);
        
        const textChannels = channels.filter((ch: any) => ch.type === 0);
        addResult(`📝 Text channels: ${textChannels.length}`);
        
        // Find our target channel
        const targetChannel = channels.find((ch: any) => ch.id === channelId);
        if (targetChannel) {
          addResult(`✅ Target channel found: ${targetChannel.name}`);
          addResult(`📊 Channel type: ${targetChannel.type}`);
          addResult(`🔒 Channel permissions: ${targetChannel.permission_overwrites?.length || 0} overwrites`);
        } else {
          addResult(`❌ Target channel not found in server channel list`);
          addResult(`💡 Available channels:`);
          textChannels.slice(0, 5).forEach((ch: any) => {
            addResult(`   - ${ch.name} (ID: ${ch.id})`);
          });
        }
      } else {
        addResult(`❌ Failed to list channels: ${channelsResponse.status}`);
      }
      
      addResult('🎉 Permission test complete!');
      
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">🔧 Bot Permission Test</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={testBotPermissions}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 px-6 py-3 rounded-lg text-white font-medium"
        >
          {loading ? 'Testing...' : '🔍 Test Bot Permissions'}
        </button>
        
        <button
          onClick={clearResults}
          className="bg-gray-500 hover:bg-gray-600 px-4 py-3 rounded-lg text-white"
        >
          Clear Results
        </button>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg h-96 overflow-y-auto">
        {results.length === 0 ? (
          <div className="text-slate-400 text-center py-8">
            Click "Test Bot Permissions" to start detailed testing...
          </div>
        ) : (
          results.map((result, index) => (
            <div key={index} className={`text-sm mb-2 ${result.includes('✅') ? 'text-green-400' : result.includes('❌') ? 'text-red-400' : result.includes('⚠️') ? 'text-yellow-400' : result.includes('💡') ? 'text-amber-400' : result.includes('🔍') ? 'text-purple-400' : 'text-slate-300'}`}>
              {result}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6 p-4 bg-blue-500/20 rounded-lg">
        <h3 className="text-blue-400 font-bold mb-2">🔍 What This Tests:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
          <li>🔐 Bot authentication</li>
          <li>🏛️ Server access and info</li>
          <li>📢 Channel access and details</li>
          <li>📨 Simple message sending</li>
          <li>📋 Server channel listing</li>
        </ul>
        
        <div className="mt-4 p-3 bg-amber-500/20 rounded">
          <h4 className="text-amber-400 font-semibold mb-1">💡 Expected Results:</h4>
          <p className="text-sm text-slate-300">
            This will tell us exactly why the bot can't access the channel and how to fix it.
          </p>
        </div>
      </div>
    </div>
  );
}
