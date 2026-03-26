export interface Team {
  id: string;
  name: string;
  captain: string;
  members: string[];
  discord: string;
  registeredAt: string;
  status: 'confirmed' | 'pending';
}

export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Elite Warriors',
    captain: 'ProPlayer123',
    members: ['ProPlayer123', 'ShadowNinja', 'BlockMaster', 'BedDestroyer'],
    discord: 'elitecaptain#1234',
    registeredAt: '2024-03-25T10:30:00Z',
    status: 'confirmed'
  },
  {
    id: '2',
    name: 'Dream Squad',
    captain: 'NightHawk',
    members: ['NightHawk', 'PhoenixRise', 'ThunderBolt', 'IceQueen'],
    discord: 'dreamleader#5678',
    registeredAt: '2024-03-25T14:15:00Z',
    status: 'confirmed'
  },
  {
    id: '3',
    name: 'Tactical Force',
    captain: 'StrategicMind',
    members: ['StrategicMind', 'QuickReflex', 'SharpShooter', 'TeamPlayer'],
    discord: 'tacticalcmd#9012',
    registeredAt: '2024-03-26T09:45:00Z',
    status: 'confirmed'
  },
  {
    id: '4',
    name: 'Phoenix Rising',
    captain: 'FireStorm',
    members: ['FireStorm', 'LavaFlow', 'BlazeRunner', 'InfernoKing'],
    discord: 'phoenixlead#3456',
    registeredAt: '2024-03-26T16:20:00Z',
    status: 'confirmed'
  },
  {
    id: '5',
    name: 'Shadow Legion',
    captain: 'DarkKnight',
    members: ['DarkKnight', 'StealthMode', 'GhostWalker', 'NightCrawler'],
    discord: 'shadowcmd#7890',
    registeredAt: '2024-03-27T11:00:00Z',
    status: 'confirmed'
  },
  {
    id: '6',
    name: 'Lightning Squad',
    captain: 'ThunderStrike',
    members: ['ThunderStrike', 'ElectricBolt', 'StormChaser', 'WindRunner'],
    discord: 'lightninglead#2345',
    registeredAt: '2024-03-27T13:30:00Z',
    status: 'confirmed'
  },
  {
    id: '7',
    name: 'Ice Warriors',
    captain: 'FrostByte',
    members: ['FrostByte', 'SnowStorm', 'IceBreaker', 'ColdFusion'],
    discord: 'icecmd#6789',
    registeredAt: '2024-03-28T08:15:00Z',
    status: 'confirmed'
  },
  {
    id: '8',
    name: 'Dragon Force',
    captain: 'DragonSlayer',
    members: ['DragonSlayer', 'FireBreath', 'WingCommander', 'ClawMaster'],
    discord: 'dragonlead#0123',
    registeredAt: '2024-03-28T15:45:00Z',
    status: 'confirmed'
  },
  {
    id: '9',
    name: 'Cyber Knights',
    captain: 'TechWizard',
    members: ['TechWizard', 'DataStream', 'CodeMaster', 'PixelPerfect'],
    discord: 'cybercmd#4567',
    registeredAt: '2024-03-29T10:00:00Z',
    status: 'confirmed'
  },
  {
    id: '10',
    name: 'Ninja Squad',
    captain: 'SilentAssassin',
    members: ['SilentAssassin', 'StealthNinja', 'ShadowStrike', 'QuickBlade'],
    discord: 'ninjacmd#8901',
    registeredAt: '2024-03-29T12:30:00Z',
    status: 'confirmed'
  },
  {
    id: '11',
    name: 'Royal Guard',
    captain: 'KingDefender',
    members: ['KingDefender', 'CrownProtector', 'ShieldBearer', 'CastleKnight'],
    discord: 'royalcaptain#1234',
    registeredAt: '2024-03-29T14:00:00Z',
    status: 'confirmed'
  },
  {
    id: '12',
    name: 'Storm Bringers',
    captain: 'WeatherMaster',
    members: ['WeatherMaster', 'RainMaker', 'CloudWalker', 'WindChaser'],
    discord: 'stormcmd#5678',
    registeredAt: '2024-03-29T16:45:00Z',
    status: 'confirmed'
  }
];

export const availableSlots = 16;
export const registeredTeams = mockTeams.length;
