interface TeamRegistrationData {
  teamName: string;
  captain: string;
  members: string[];
  discordUsers: string[];
  tournamentName: string;
  tournamentId: string;
}

export async function sendTeamRegistrationNotification(data: TeamRegistrationData) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log('Discord webhook URL not configured');
      return;
    }

    const memberList = data.members.map((member, index) => 
      `${index + 1}. ${member}${data.discordUsers[index] ? ` (${data.discordUsers[index]})` : ''}`
    ).join('\n');

    const embed = {
      title: "🏆 New Team Registration!",
      description: `A new team has registered for **${data.tournamentName}**`,
      color: 0x00ff00, // Green color
      fields: [
        {
          name: "🎮 Team Information",
          value: `**Team Name:** ${data.teamName}\n**Captain:** ${data.captain}\n**Members:**\n${memberList}`,
          inline: false
        },
        {
          name: "📊 Tournament Status",
          value: `**Tournament ID:** ${data.tournamentId}\n**Registration Time:** ${new Date().toLocaleString()}`,
          inline: false
        }
      ],
      footer: {
        text: "BedWars Tournament System",
        icon_url: "https://i.imgur.com/your-logo.png" // Optional: Add your logo
      },
      timestamp: new Date().toISOString()
    };

    const payload = {
      content: `@everyone New team registration alert! 🎮`,
      embeds: [embed]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Failed to send Discord notification:', await response.text());
    } else {
      console.log('Discord notification sent successfully');
    }

  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}
