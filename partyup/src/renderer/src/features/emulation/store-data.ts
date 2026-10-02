export type StoreGame = {
  id: string;
  name: string;
  short: string;
  year: number;
  publisher: string;
  blurb: string;
  hue: number;
  system: string;
  emulator: string;
};

export type StoreSystem = {
  id: string;
  name: string;
  emulator: string;
  games: StoreGame[];
};

function row(system: string, emulator: string, items: [string, string, number, string, string, number][]): StoreGame[] {
  return items.map(([name, short, year, publisher, blurb, hue]) => ({
    id: `${system}-${short.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    short,
    year,
    publisher,
    blurb,
    hue,
    system,
    emulator,
  }));
}

export const STORE_SYSTEMS: StoreSystem[] = [
  {
    id: 'nes',
    name: 'NES',
    emulator: 'retroarch',
    games: row('nes', 'retroarch', [
      ['Super Mario Bros.', 'Mario', 1985, 'Nintendo', 'Run, jump, and clear eight worlds.', 12],
      ['The Legend of Zelda', 'Zelda', 1986, 'Nintendo', 'Find the Triforce and bring down Ganon.', 90],
      ['Metroid', 'Metroid', 1986, 'Nintendo', 'Samus hunts through the corridors of Zebes.', 200],
      ['Mega Man 2', 'Mega Man', 1988, 'Capcom', 'Eight robot masters, then the fortress.', 210],
      ['Contra', 'Contra', 1988, 'Konami', 'A side-scrolling run. Do not stop moving.', 0],
      ['Kirby’s Adventure', 'Kirby', 1993, 'Nintendo', 'Inhale an enemy and keep its ability.', 310],
      ['Castlevania', 'Castlevania', 1986, 'Konami', 'The whip, the stairs, and Dracula’s hall.', 350],
      ['Punch-Out!!', 'Punch-Out', 1987, 'Nintendo', 'Dodge, then land the star punch.', 28],
    ]),
  },
  {
    id: 'snes',
    name: 'Super NES',
    emulator: 'retroarch',
    games: row('snes', 'retroarch', [
      ['Super Mario World', 'Mario World', 1990, 'Nintendo', 'Yoshi, a world map, and secret exits.', 140],
      ['A Link to the Past', 'Zelda', 1991, 'Nintendo', 'One light world, one dark world.', 48],
      ['Chrono Trigger', 'Chrono', 1995, 'Square', 'A fair, a portal, and a future you can still change.', 265],
      ['Super Metroid', 'Metroid', 1994, 'Nintendo', 'Zebes again, quieter and larger.', 190],
      ['Donkey Kong Country', 'DK Country', 1994, 'Nintendo', 'Barrels, mine carts, and a map of levels.', 18],
      ['F-Zero', 'F-Zero', 1990, 'Nintendo', 'A mute city lap at full speed.', 200],
      ['Street Fighter II', 'Street Fighter', 1992, 'Capcom', 'Six buttons and a best of three.', 8],
      ['EarthBound', 'EarthBound', 1994, 'Nintendo', 'A bat, a frying pan, and a town that knows your name.', 300],
    ]),
  },
  {
    id: 'gb',
    name: 'Game Boy',
    emulator: 'retroarch',
    games: row('gb', 'retroarch', [
      ['Tetris', 'Tetris', 1989, 'Nintendo', 'Four squares at a time.', 55],
      ['Pokémon Red', 'Pokémon', 1996, 'Nintendo', 'Catch, train, and take on the league.', 0],
      ['Super Mario Land', 'Mario Land', 1989, 'Nintendo', 'Sarasaland, shorter and stranger.', 120],
      ['Link’s Awakening', 'Link', 1993, 'Nintendo', 'Koholint Island, and a dream at the end.', 80],
    ]),
  },
  {
    id: 'gba',
    name: 'Game Boy Advance',
    emulator: 'mgba',
    games: row('gba', 'mgba', [
      ['Pokémon Emerald', 'Emerald', 2004, 'Nintendo', 'Hoenn, the league, and the battle frontier.', 140],
      ['Metroid Fusion', 'Fusion', 2002, 'Nintendo', 'The station is infected. So is the suit.', 190],
      ['Golden Sun', 'Golden Sun', 2001, 'Nintendo', 'A jrpg about the lighthouses going out.', 35],
      ['Advance Wars', 'Advance Wars', 2001, 'Nintendo', 'Take the cities, then the headquarters.', 210],
      ['Mario Kart: Super Circuit', 'Mario Kart', 2001, 'Nintendo', 'The cups, on one screen.', 12],
    ]),
  },
  {
    id: 'n64',
    name: 'Nintendo 64',
    emulator: 'retroarch',
    games: row('n64', 'retroarch', [
      ['Super Mario 64', 'Mario 64', 1996, 'Nintendo', 'The castle, the paintings, the long jump.', 20],
      ['Ocarina of Time', 'Ocarina', 1998, 'Nintendo', 'A child, an adult, and the temple doors.', 48],
      ['Mario Kart 64', 'Mario Kart', 1996, 'Nintendo', 'Four players and a banana peel.', 0],
      ['GoldenEye 007', 'GoldenEye', 1997, 'Rare', 'Facility, archives, and a silent pistol.', 130],
      ['Banjo-Kazooie', 'Banjo', 1998, 'Rare', 'A bear, a bird, and a note in every hedge.', 28],
    ]),
  },
  {
    id: 'gc',
    name: 'GameCube',
    emulator: 'dolphin',
    games: row('gc', 'dolphin', [
      ['Super Smash Bros. Melee', 'Melee', 2001, 'Nintendo', 'The fastest of the series.', 280],
      ['The Wind Waker', 'Wind Waker', 2002, 'Nintendo', 'A boat, a conductor’s baton, and the great sea.', 150],
      ['Metroid Prime', 'Prime', 2002, 'Retro', 'First person, and the visor logs.', 170],
      ['Mario Kart: Double Dash', 'Double Dash', 2003, 'Nintendo', 'Two characters to a kart.', 12],
      ['Luigi’s Mansion', 'Luigi', 2001, 'Nintendo', 'A vacuum and a dark foyer.', 100],
    ]),
  },
  {
    id: 'wii',
    name: 'Wii',
    emulator: 'dolphin',
    games: row('wii', 'dolphin', [
      ['Super Mario Galaxy', 'Galaxy', 2007, 'Nintendo', 'Small planets and a spin.', 220],
      ['Wii Sports', 'Wii Sports', 2006, 'Nintendo', 'Bowling night, in the living room.', 200],
      ['The Skyward Sword', 'Skyward', 2011, 'Nintendo', 'The sky islands above the surface.', 48],
      ['Mario Kart Wii', 'Mario Kart', 2008, 'Nintendo', 'Twelve racers and a wheel.', 8],
    ]),
  },
  {
    id: 'nds',
    name: 'Nintendo DS',
    emulator: 'melonds',
    games: row('nds', 'melonds', [
      ['New Super Mario Bros.', 'Mario', 2006, 'Nintendo', 'The first modern Mario on two screens.', 16],
      ['Mario Kart DS', 'Mario Kart', 2005, 'Nintendo', 'Snaking, for better or worse.', 0],
      ['Phantom Hourglass', 'Zelda', 2007, 'Nintendo', 'Draw the route on the sea chart.', 40],
      ['Pokémon SoulSilver', 'SoulSilver', 2009, 'Nintendo', 'Johto, with the walker following.', 210],
    ]),
  },
  {
    id: 'mastersystem',
    name: 'Master System',
    emulator: 'retroarch',
    games: row('mastersystem', 'retroarch', [
      ['Alex Kidd in Miracle World', 'Alex Kidd', 1986, 'Sega', 'Punch the blocks. Guess the cup.', 40],
      ['Columns', 'Columns', 1990, 'Sega', 'Three jewels. A match on any line.', 280],
      ['Sonic the Hedgehog', 'Sonic', 1991, 'Sega', 'The Master System outing, shorter and meaner.', 200],
    ]),
  },
  {
    id: 'megadrive',
    name: 'Mega Drive',
    emulator: 'retroarch',
    games: row('megadrive', 'retroarch', [
      ['Sonic the Hedgehog', 'Sonic', 1991, 'Sega', 'Loops, springs, and a two-act rush.', 200],
      ['Streets of Rage', 'Streets', 1991, 'Sega', 'Three characters and a boss at the end of the street.', 12],
      ['Gunstar Heroes', 'Gunstar', 1993, 'Treasure', 'Dice bosses and a weapon you can mix.', 8],
      ['Shinobi III', 'Shinobi', 1993, 'Sega', 'Wall jumps and a last tower.', 220],
      ['Streets of Rage 2', 'Streets 2', 1992, 'Sega', 'The sequel with the better soundtrack.', 18],
      ['Altered Beast', 'Altered Beast', 1988, 'Sega', 'Rise from the grave and change form.', 350],
    ]),
  },
  {
    id: 'gamegear',
    name: 'Game Gear',
    emulator: 'retroarch',
    games: row('gamegear', 'retroarch', [
      ['Columns', 'Columns', 1990, 'Sega', 'The jewel puzzle, on the lit screen.', 280],
      ['Sonic Drift', 'Drift', 1994, 'Sega', 'A short circuit with the blue hedgehog.', 48],
      ['Shinobi', 'Shinobi', 1991, 'Sega', 'The handheld mission.', 220],
    ]),
  },
  {
    id: 'saturn',
    name: 'Saturn',
    emulator: 'retroarch',
    games: row('saturn', 'retroarch', [
      ['NiGHTS into Dreams', 'NiGHTS', 1996, 'Sega', 'Fly the ring before the alarm.', 280],
      ['Panzer Dragoon', 'Panzer', 1995, 'Sega', 'A rail of dragons and lasers.', 160],
      ['Virtua Fighter 2', 'Virtua Fighter', 1995, 'Sega', 'The polygon dojo.', 200],
      ['Guardian Heroes', 'Guardian', 1996, 'Treasure', 'A brawler with a lane you can change.', 20],
    ]),
  },
  {
    id: 'dreamcast',
    name: 'Dreamcast',
    emulator: 'flycast',
    games: row('dreamcast', 'flycast', [
      ['Shenmue', 'Shenmue', 1999, 'Sega', 'Ask around Dobuita until the snow comes.', 30],
      ['Soulcalibur', 'Soulcalibur', 1999, 'Namco', 'The weapon fighter that opened the console.', 210],
      ['Crazy Taxi', 'Crazy Taxi', 1999, 'Sega', 'The arrow says the fare is close.', 45],
      ['Jet Set Radio', 'Jet Set', 2000, 'Sega', 'Tag the street before the timer.', 130],
    ]),
  },
  {
    id: 'psx',
    name: 'PlayStation',
    emulator: 'duckstation',
    games: row('psx', 'duckstation', [
      ['Final Fantasy VII', 'FFVII', 1997, 'Square', 'Midgar, then everywhere else.', 240],
      ['Metal Gear Solid', 'MGS', 1998, 'Konami', 'The codec, the cardboard box, the tank.', 150],
      ['Crash Bandicoot', 'Crash', 1996, 'Naughty Dog', 'Three islands and a spinning mask.', 25],
      ['Gran Turismo', 'Gran Turismo', 1997, 'Polyphony', 'The license tests, then the cups.', 200],
      ['Resident Evil 2', 'RE2', 1998, 'Capcom', 'Raccoon City, two scenarios.', 0],
      ['Spyro the Dragon', 'Spyro', 1998, 'Insomniac', 'Glide to the next platform.', 280],
    ]),
  },
  {
    id: 'ps2',
    name: 'PlayStation 2',
    emulator: 'pcsx2',
    games: row('ps2', 'pcsx2', [
      ['Shadow of the Colossus', 'Colossus', 2005, 'Team Ico', 'Sixteen giants and an empty land.', 40],
      ['God of War', 'God of War', 2005, 'Santa Monica', 'The blades, the hydra, the climb.', 15],
      ['Grand Theft Auto: San Andreas', 'San Andreas', 2004, 'Rockstar', 'Three cities and a bicycle.', 80],
      ['Final Fantasy X', 'FFX', 2001, 'Square', 'Blitzball, the pilgrimage, the laughing scene.', 210],
      ['Metal Gear Solid 3', 'MGS3', 2004, 'Konami', 'The jungle, the camo, the ladder.', 110],
      ['Kingdom Hearts', 'Kingdom Hearts', 2002, 'Square', 'A key and a ship between worlds.', 260],
    ]),
  },
  {
    id: 'psp',
    name: 'PSP',
    emulator: 'ppsspp',
    games: row('psp', 'ppsspp', [
      ['Crisis Core', 'Crisis Core', 2007, 'Square', 'The soldier before the meteor.', 200],
      ['God of War: Chains of Olympus', 'Chains', 2008, 'Ready at Dawn', 'The smaller epic.', 15],
      ['Patapon', 'Patapon', 2007, 'Japan Studio', 'March in time or the line breaks.', 45],
      ['Lumines', 'Lumines', 2004, 'Q Entertainment', 'Two-by-two blocks on a beat.', 180],
    ]),
  },
  {
    id: 'ps3',
    name: 'PlayStation 3',
    emulator: 'rpcs3',
    games: row('ps3', 'rpcs3', [
      ['The Last of Us', 'Last of Us', 2013, 'Naughty Dog', 'A city after the cordyceps.', 30],
      ['Uncharted 2', 'Uncharted 2', 2009, 'Naughty Dog', 'The train, then the village in the snow.', 20],
      ['Metal Gear Solid 4', 'MGS4', 2008, 'Kojima', 'The last codec.', 90],
      ['Demon’s Souls', 'Demon’s Souls', 2009, 'FromSoftware', 'Boletaria, and a corpse run.', 220],
    ]),
  },
  {
    id: 'xbox',
    name: 'Xbox',
    emulator: 'xemu',
    games: row('xbox', 'xemu', [
      ['Halo: Combat Evolved', 'Halo', 2001, 'Bungie', 'The ring, the warthog, the library.', 140],
      ['Halo 2', 'Halo 2', 2004, 'Bungie', 'Dual wield, then the arbiter.', 150],
      ['Fable', 'Fable', 2004, 'Lionhead', 'A hero who can get older and meaner.', 35],
      ['Ninja Gaiden', 'Ninja Gaiden', 2004, 'Team Ninja', 'The hayabusa, unforgiving.', 0],
    ]),
  },
  {
    id: 'xbox360',
    name: 'Xbox 360',
    emulator: 'xenia',
    games: row('xbox360', 'xenia', [
      ['Halo 3', 'Halo 3', 2007, 'Bungie', 'Finish the fight.', 130],
      ['Gears of War', 'Gears', 2006, 'Epic', 'Roadie run and a chainsaw lance.', 10],
      ['Mass Effect', 'Mass Effect', 2007, 'BioWare', 'The Normandy and the council.', 220],
      ['The Elder Scrolls IV: Oblivion', 'Oblivion', 2006, 'Bethesda', 'A gate in the field outside the city.', 90],
      ['Forza Motorsport 3', 'Forza 3', 2009, 'Turn 10', 'The rewind button, used often.', 200],
    ]),
  },
];

export const ALL_GAMES = STORE_SYSTEMS.flatMap((system) => system.games);
