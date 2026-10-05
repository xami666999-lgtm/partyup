export type Poster = {
  id: string;
  name: string;
  short: string;
  year: number;
  publisher: string;
  hue: number;
  stars: number;
  blurb: string;
};

export type SystemDef = {
  id: string;
  word: string;
  className: string;
  year: number;
  games: Poster[];
};

export type MakerDef = {
  id: string;
  name: string;
  line: string;
  year: number;
  systems: SystemDef[];
};

function poster(
  id: string,
  name: string,
  short: string,
  year: number,
  publisher: string,
  hue: number,
  stars: number,
  blurb: string,
): Poster {
  return { id, name, short, year, publisher, hue, stars, blurb };
}

export const MAKERS: MakerDef[] = [
  {
    id: 'nintendo',
    name: 'Nintendo',
    line: 'Nintendo Entertainment System - Famicom',
    year: 1983,
    systems: [
      {
        id: 'nes',
        word: 'NES',
        className: 'nes',
        year: 1983,
        games: [
          poster('nes-mario', 'Super Mario Bros.', 'Mario', 1985, 'Nintendo', 12, 5, 'Run, jump, and clear eight worlds. A second player can take the next life.'),
          poster('nes-zelda', 'The Legend of Zelda', 'Zelda', 1986, 'Nintendo', 90, 5, 'Explore an overworld, find the pieces of the Triforce, and bring down Ganon.'),
          poster('nes-metroid', 'Metroid', 'Metroid', 1986, 'Nintendo', 200, 4, 'Samus hunts Metroids through a maze of corridors on Zebes.'),
          poster('nes-mega', 'Mega Man 2', 'Mega Man', 1988, 'Capcom', 210, 5, 'Eight robot masters, then the fortress. The weapons you win come with you.'),
        ],
      },
      {
        id: 'snes',
        word: 'Super NES',
        className: 'snes',
        year: 1990,
        games: [
          poster('snes-mario', 'Super Mario World', 'Mario World', 1990, 'Nintendo', 140, 5, 'Yoshi, a world map, and secret exits off the main path.'),
          poster('snes-link', 'A Link to the Past', 'Zelda', 1991, 'Nintendo', 48, 5, 'Two worlds, one light and one dark, and a master sword between them.'),
          poster('snes-chrono', 'Chrono Trigger', 'Chrono', 1995, 'Square', 265, 5, 'A fair, a portal, and a future you can still change.'),
          poster('snes-dkc', 'Donkey Kong Country', 'DK Country', 1994, 'Nintendo', 18, 4, 'Barrels, mine carts, and a map full of levels.'),
        ],
      },
      {
        id: 'gb',
        word: 'Game Boy',
        className: 'gb',
        year: 1989,
        games: [
          poster('gb-tetris', 'Tetris', 'Tetris', 1989, 'Nintendo', 55, 5, 'Four squares at a time. Clear a line before the stack reaches the top.'),
          poster('gb-pokemon', 'Pokémon Red', 'Pokémon', 1996, 'Nintendo', 0, 5, 'A handheld journey. Catch, train, and take on the league.'),
        ],
      },
      {
        id: 'gbc',
        word: 'Game Boy Color',
        className: 'gbc',
        year: 1998,
        games: [
          poster('gbc-links', 'Link’s Awakening DX', 'Link', 1998, 'Nintendo', 120, 5, 'Koholint Island, in color. The eighth instrument is still the goal.'),
          poster('gbc-wario', 'Wario Land 3', 'Wario', 2000, 'Nintendo', 45, 4, 'A music box, a greedy thief, and a map that opens as you learn new moves.'),
        ],
      },
      {
        id: 'gba',
        word: 'Game Boy Advance',
        className: 'gba',
        year: 2001,
        games: [
          poster('gba-metroid', 'Metroid Fusion', 'Fusion', 2002, 'Nintendo', 190, 5, 'Samus is hunted by an X parasite through a research station.'),
          poster('gba-advance', 'Advance Wars', 'Advance Wars', 2001, 'Nintendo', 28, 4, 'Turn-based battles. CO powers swing a map that looked lost.'),
        ],
      },
      {
        id: 'nds',
        word: 'Nintendo DS',
        className: 'nds',
        year: 2004,
        games: [
          poster('nds-mario', 'Mario Kart DS', 'Mario Kart', 2005, 'Nintendo', 8, 4, 'Two screens, a stylus map, and missions between the cups.'),
          poster('nds-chrono', 'Chrono Trigger', 'Chrono', 2008, 'Square', 265, 5, 'The DS port of the time-travel RPG, with an extra ending.'),
        ],
      },
      {
        id: 'n3ds',
        word: 'Nintendo 3DS',
        className: 'n3ds',
        year: 2011,
        games: [
          poster('3ds-link', 'A Link Between Worlds', 'Zelda', 2013, 'Nintendo', 48, 5, 'Rent an item, merge into a wall, and walk between two kingdoms.'),
          poster('3ds-fire', 'Fire Emblem Awakening', 'Awakening', 2012, 'Nintendo', 330, 4, 'A tactics story about a future you can still refuse.'),
        ],
      },
      {
        id: 'n64',
        word: 'Nintendo 64',
        className: 'n64',
        year: 1996,
        games: [
          poster('n64-mario', 'Super Mario 64', 'Mario 64', 1996, 'Nintendo', 12, 5, 'A castle hub and courses you can finish in more than one way.'),
          poster('n64-ocarina', 'Ocarina of Time', 'Ocarina', 1998, 'Nintendo', 140, 5, 'A child, an adult, and songs that open doors.'),
        ],
      },
      {
        id: 'gc',
        word: 'GameCube',
        className: 'gc',
        year: 2001,
        games: [
          poster('gc-sunshine', 'Super Mario Sunshine', 'Sunshine', 2002, 'Nintendo', 190, 4, 'Isle Delfino, a water pack, and a shadow that copies Mario.'),
          poster('gc-melee', 'Super Smash Bros. Melee', 'Melee', 2001, 'Nintendo', 300, 5, 'A four-player fighter. The trophy gallery is half the reason to wander.'),
        ],
      },
      {
        id: 'wii',
        word: 'Wii',
        className: 'wii',
        year: 2006,
        games: [
          poster('wii-galaxy', 'Super Mario Galaxy', 'Galaxy', 2007, 'Nintendo', 220, 5, 'Small planets, a spin, and a pull star between them.'),
          poster('wii-sports', 'Wii Sports', 'Wii Sports', 2006, 'Nintendo', 200, 4, 'Tennis, bowling, and baseball with the remote.'),
        ],
      },
      {
        id: 'wiiu',
        word: 'Wii U',
        className: 'wiiu',
        year: 2012,
        games: [
          poster('wiiu-kart', 'Mario Kart 8', 'Mario Kart', 2014, 'Nintendo', 16, 5, 'Anti-gravity tracks. The game pad shows the map.'),
          poster('wiiu-smash', 'Super Smash Bros.', 'Smash', 2014, 'Nintendo', 310, 5, 'Eight-player battles and a stage builder.'),
        ],
      },
      {
        id: 'switch',
        word: 'Nintendo Switch',
        className: 'switch',
        year: 2017,
        games: [
          poster('sw-odyssey', 'Super Mario Odyssey', 'Odyssey', 2017, 'Nintendo', 12, 5, 'A hat that captures enemies, and a kingdom per world.'),
          poster('sw-botw', 'Breath of the Wild', 'Zelda', 2017, 'Nintendo', 90, 5, 'A ruined Hyrule you can climb. The towers are optional.'),
        ],
      },
    ],
  },
  {
    id: 'sega',
    name: 'Sega',
    line: 'Sega Master System and Mega Drive',
    year: 1986,
    systems: [
      {
        id: 'ms',
        word: 'Master System',
        className: 'ms',
        year: 1986,
        games: [
          poster('ms-cloud', 'Cloud Master', 'Cloud Master', 1989, 'Sega', 18, 3, 'Ride the clouds and clear the path. A short action game from the Master System library.'),
          poster('ms-columns', 'Columns', 'Columns', 1990, 'Sega', 280, 4, 'Stack jewels so three of the same color touch. They can meet sideways, up and down, or on a diagonal.'),
          poster('ms-cyborg', 'Cyborg Hunter', 'Cyborg Hunter', 1988, 'Sega', 210, 3, 'A side-view hunt through a base full of machines.'),
        ],
      },
      {
        id: 'md',
        word: 'Mega Drive',
        className: 'md',
        year: 1988,
        games: [
          poster('md-aero', 'Aero the Acro-Bat', 'Aero', 1993, 'Sunsoft', 25, 3, 'A bat in a circus. Swing the bar, then dive through the ring.'),
          poster('md-aero2', 'Aero the Acro-Bat 2', 'Aero 2', 1994, 'Sunsoft', 350, 3, 'The sequel. Same dive, a new stage behind the clown.'),
          poster('md-aladdin', 'Aladdin', 'Aladdin', 1993, 'Sega', 265, 4, 'Disney’s Aladdin on the Mega Drive. Press start on the title, then run the rooftops.'),
          poster('md-alex', 'Alex Kidd in the Enchanted Castle', 'Alex Kidd', 1989, 'Sega', 160, 3, 'Alex punches blocks and rides through the Enchanted Castle.'),
          poster('md-alisia', 'Alisia Dragoon', 'Alisia', 1992, 'Game Arts', 140, 4, 'A lightning witch and a pet that clears the smaller enemies.'),
          poster('md-altered', 'Altered Beast', 'Altered Beast', 1988, 'Sega', 0, 3, 'Rise from the grave, collect spirit balls, and change form.'),
          poster('md-world', 'Another World', 'Another World', 1991, 'Delphine', 220, 4, 'A scientist falls through a particle test into somewhere else.'),
          poster('md-aof', 'Art of Fighting', 'Art of Fighting', 1992, 'SNK', 15, 3, 'A one-on-one fighter. The spirit gauge decides how hard you hit.'),
        ],
      },
      {
        id: 'gg',
        word: 'Game Gear',
        className: 'gg',
        year: 1990,
        games: [
          poster('gg-columns', 'Columns', 'Columns', 1990, 'Sega', 280, 4, 'The same jewel puzzle, on the handheld.'),
          poster('gg-sonic', 'Sonic Drift', 'Drift', 1994, 'Sega', 48, 3, 'A short circuit racer with the blue hedgehog.'),
        ],
      },
      {
        id: 'saturn',
        word: 'Saturn',
        className: 'saturn',
        year: 1994,
        games: [
          poster('sat-nights', 'Nights into Dreams', 'NiGHTS', 1996, 'Sega', 280, 5, 'Fly a loop, grab the chips, and land before the timer ends.'),
          poster('sat-panzer', 'Panzer Dragoon', 'Panzer', 1995, 'Sega', 200, 4, 'A rail shooter on the back of a dragon.'),
        ],
      },
      {
        id: 'dc',
        word: 'Dreamcast',
        className: 'dreamcast',
        year: 1998,
        games: [
          poster('dc-crazy', 'Crazy Taxi', 'Crazy Taxi', 1999, 'Sega', 45, 4, 'Pick up a fare, skip the traffic, and stop on the marker.'),
          poster('dc-sonic', 'Sonic Adventure', 'Sonic', 1998, 'Sega', 200, 4, 'Six stories in Station Square. The chao garden is the quiet part.'),
        ],
      },
    ],
  },
  {
    id: 'sony',
    name: 'Sony',
    line: 'PlayStation',
    year: 1994,
    systems: [
      {
        id: 'psx',
        word: 'PlayStation',
        className: 'psx',
        year: 1994,
        games: [
          poster('psx-castlevania', 'Castlevania: Symphony of the Night', 'Symphony', 1997, 'Konami', 340, 5, 'A castle that opens as you learn a new ability.'),
          poster('psx-metal', 'Metal Gear Solid', 'Metal Gear', 1998, 'Konami', 120, 5, 'A sneaking mission on Shadow Moses. The codec calls are part of the map.'),
        ],
      },
      {
        id: 'ps2',
        word: 'PlayStation 2',
        className: 'ps2',
        year: 2000,
        games: [
          poster('ps2-shadow', 'Shadow of the Colossus', 'Colossus', 2005, 'Sony', 30, 5, 'Sixteen giants. You climb them. There is no town in between.'),
          poster('ps2-sanandreas', 'Grand Theft Auto: San Andreas', 'San Andreas', 2004, 'Rockstar', 80, 4, 'Three cities and a countryside. The map is the game.'),
        ],
      },
      {
        id: 'ps3',
        word: 'PlayStation 3',
        className: 'ps3',
        year: 2006,
        games: [
          poster('ps3-last', 'The Last of Us', 'Last of Us', 2013, 'Sony', 80, 5, 'A trip across a collapsed country. Listen before you step.'),
          poster('ps3-demon', 'Demon’s Souls', 'Demon’s Souls', 2009, 'Sony', 210, 5, 'A hub of archstones. Dying sends you back to the start of the level.'),
        ],
      },
      {
        id: 'psp',
        word: 'PSP',
        className: 'psp',
        year: 2004,
        games: [
          poster('psp-loco', 'LocoRoco', 'LocoRoco', 2006, 'Sony', 50, 4, 'Tilt the world. The blobs stick together if you let them.'),
          poster('psp-patapon', 'Patapon', 'Patapon', 2007, 'Sony', 10, 4, 'Drum the rhythm. The army only moves when the beat is right.'),
        ],
      },
      {
        id: 'psvita',
        word: 'PlayStation Vita',
        className: 'psvita',
        year: 2011,
        games: [
          poster('vita-persona', 'Persona 4 Golden', 'Persona', 2012, 'Atlus', 40, 5, 'A rural town, a midnight TV, and a dungeon for each rumor.'),
          poster('vita-gravity', 'Gravity Rush', 'Gravity', 2012, 'Sony', 270, 4, 'Fall upward. The city is a set of floating districts.'),
        ],
      },
    ],
  },
  {
    id: 'other',
    name: 'More systems',
    line: 'Arcade, Xbox, computers, and point-and-click',
    year: 1977,
    systems: [
      {
        id: 'arcade',
        word: 'Arcade',
        className: 'arcade',
        year: 1978,
        games: [
          poster('arc-pac', 'Pac-Man', 'Pac-Man', 1980, 'Namco', 55, 5, 'Eat the dots. The ghosts each take a different turn.'),
          poster('arc-sf', 'Street Fighter II', 'Street Fighter', 1991, 'Capcom', 0, 5, 'Six buttons. A special move is a direction and a punch.'),
        ],
      },
      {
        id: 'xbox',
        word: 'Xbox',
        className: 'xbox',
        year: 2001,
        games: [
          poster('xb-halo', 'Halo', 'Halo', 2001, 'Microsoft', 140, 5, 'A ring world. The warthog is the last level.'),
          poster('xb-ninja', 'Ninja Gaiden', 'Ninja Gaiden', 2004, 'Tecmo', 200, 4, 'A hard action game. The statues save, the murals heal.'),
        ],
      },
      {
        id: 'xbox360',
        word: 'Xbox 360',
        className: 'xbox360',
        year: 2005,
        games: [
          poster('360-gears', 'Gears of War', 'Gears', 2006, 'Microsoft', 20, 4, 'Cover, then a chainsaw rifle. The set pieces are the levels.'),
          poster('360-mass', 'Mass Effect', 'Mass Effect', 2007, 'BioWare', 210, 5, 'A conversation wheel and a galaxy map.'),
        ],
      },
      {
        id: 'scummvm',
        word: 'ScummVM',
        className: 'scummvm',
        year: 1987,
        games: [
          poster('scumm-monkey', 'The Secret of Monkey Island', 'Monkey Island', 1990, 'Lucasfilm', 35, 5, 'Insult sword fighting. Use everything on everything else.'),
          poster('scumm-sam', 'Sam & Max Hit the Road', 'Sam & Max', 1993, 'LucasArts', 18, 4, 'A freelance police pair and a tourist trap mystery.'),
        ],
      },
    ],
  },
];

export const CONSOLE_FOLDER: Record<string, string> = {
  nes: 'nes',
  snes: 'snes',
  gb: 'gb',
  gbc: 'gbc',
  gba: 'gba',
  nds: 'nds',
  n3ds: 'n3ds',
  n64: 'n64',
  gc: 'gc',
  wii: 'wii',
  wiiu: 'wiiu',
  switch: 'switch',
  ms: 'mastersystem',
  md: 'megadrive',
  gg: 'gamegear',
  saturn: 'saturn',
  dc: 'dreamcast',
  psx: 'psx',
  ps2: 'ps2',
  ps3: 'ps3',
  psp: 'psp',
  psvita: 'psvita',
  arcade: 'arcade',
  xbox: 'xbox',
  xbox360: 'xbox360',
  scummvm: 'scummvm',
};
