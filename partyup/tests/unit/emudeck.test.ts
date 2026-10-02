import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { compressIsoToCso, decompressCso } from '../../src/main/services/emudeck/cso';
import { accountFolder, addRomsToSteam, buildFolders, extractZip, launchCommand, parseMostRecentUser, pickAsset, scanBios, scanRoms, setManualEmulator } from '../../src/main/services/emudeck/engine';
import { crc32, readShortcutVdf, steamAppId, writeShortcutVdf, shortcutFor } from '../../src/main/services/emudeck/vdf';

function tempRoot() {
  const root = join(tmpdir(), `partyup-deck-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(root, { recursive: true });
  return root;
}

describe('EmuDeck tools', () => {
  it('builds the ROM, BIOS, save, and tool folders', () => {
    const root = tempRoot();
    const built = buildFolders(root);
    expect(built.created.length).toBeGreaterThan(20);
    expect(readFileSync(join(root, 'bios', 'README.txt'), 'utf8')).toContain('does not download');
    const again = buildFolders(root);
    expect(again.created).toEqual([]);
  });

  it('checks BIOS files without shipping any', () => {
    const root = tempRoot();
    buildFolders(root);
    writeFileSync(join(root, 'bios', 'scph5501.bin'), 'not a real bios');
    writeFileSync(join(root, 'bios', 'dc', 'dc_boot.bin'), 'boot');
    const checks = scanBios(root);
    expect(checks.find((item) => item.id === 'psx')?.ok).toBe(true);
    expect(checks.find((item) => item.id === 'dreamcast')?.ok).toBe(false);
    expect(checks.find((item) => item.id === 'ps2')?.ok).toBe(false);
  });

  it('scans games the user already has', () => {
    const root = tempRoot();
    buildFolders(root);
    writeFileSync(join(root, 'roms', 'snes', 'Chrono Trigger.sfc'), 'game');
    writeFileSync(join(root, 'roms', 'psp', 'Game.iso'), Buffer.alloc(4096, 7));
    const roms = scanRoms(root);
    expect(roms.map((item) => item.name).sort()).toEqual(['Chrono Trigger', 'Game']);
  });

  it('round-trips a CSO compressed image', () => {
    const root = tempRoot();
    const iso = join(root, 'game.iso');
    const original = Buffer.alloc(8192);
    original.write('PARTYUP-ISO-BLOCK', 0);
    original.write('PARTYUP-ISO-BLOCK', 2048);
    writeFileSync(iso, original);
    const cso = join(root, 'game.cso');
    const result = compressIsoToCso(iso, cso);
    expect(result.bytesOut).toBeLessThan(result.bytesIn);
    expect(decompressCso(cso).equals(original)).toBe(true);
  });

  it('picks the Windows asset and not a debug symbol package', () => {
    const asset = pickAsset(
      [
        { name: 'pcsx2-v2.8.2-windows-x64-Qt-symbols.7z', browser_download_url: 'https://example.test/symbols' },
        { name: 'pcsx2-v2.8.2-windows-x64-Qt.7z', browser_download_url: 'https://example.test/app' },
      ],
      'windows-x64-Qt\\.7z$',
    );
    expect(asset?.browser_download_url).toBe('https://example.test/app');
  });

  it('writes a Steam shortcut file Steam can read back', () => {
    const exe = '"C:\\\\Emulators\\\\retroarch.exe"';
    const id = steamAppId(exe, 'Chrono Trigger');
    expect(id >>> 31).toBe(1);
    const record = shortcutFor('Chrono Trigger', 'C:\\Emulators\\retroarch.exe', 'C:\\ROMs\\snes\\Chrono Trigger.sfc', 'C:\\Emulators');
    const raw = writeShortcutVdf({ '0': record });
    const parsed = readShortcutVdf(raw) as { shortcuts: Record<string, { AppName: string; appid: number; tags: { '0': string } }> };
    expect(parsed.shortcuts['0'].AppName).toBe('Chrono Trigger');
    expect(parsed.shortcuts['0'].appid).toBe(record.appid);
    expect(parsed.shortcuts['0'].tags['0']).toBe('PartyUp');
  });

  it('adds a scanned ROM to a Steam account shortcuts file', () => {
    const root = tempRoot();
    const steam = join(root, 'Steam');
    mkdirSync(join(steam, 'config'), { recursive: true });
    const id64 = '76561198000000000';
    writeFileSync(
      join(steam, 'config', 'loginusers.vdf'),
      `"users"\n{\n"${id64}"\n{\n"AccountName" "ada"\n"MostRecent" "1"\n}\n}\n`,
    );
    expect(parseMostRecentUser(readFileSync(join(steam, 'config', 'loginusers.vdf'), 'utf8'))).toBe(id64);
    expect(accountFolder(id64)).toBe((BigInt(id64) - 76561197960265728n).toString());
    buildFolders(root);
    writeFileSync(join(root, 'roms', 'snes', 'Link.sfc'), 'game');
    const exe = join(root, 'retroarch.exe');
    writeFileSync(exe, 'exe');
    setManualEmulator(root, 'retroarch', exe);
    const result = addRomsToSteam(root, steam);
    expect(result.added).toBe(1);
    const written = readFileSync(result.file);
    const parsed = readShortcutVdf(written) as { shortcuts: Record<string, { AppName: string }> };
    expect(parsed.shortcuts['0'].AppName).toBe('Link');
  });

  it('launches a ROM with the installed emulator instead of Steam', () => {
    const root = tempRoot();
    buildFolders(root);
    const rom = join(root, 'roms', 'snes', 'Link.sfc');
    writeFileSync(rom, 'game');
    const exe = join(root, 'retroarch.exe');
    writeFileSync(exe, 'exe');
    mkdirSync(join(root, 'cores'), { recursive: true });
    writeFileSync(join(root, 'cores', 'snes9x_libretro.dll'), 'core');
    setManualEmulator(root, 'retroarch', exe);
    const plan = launchCommand(root, rom);
    expect(plan.emulator).toBe('retroarch');
    expect(plan.exe).toBe(exe);
    expect(plan.args[0]).toBe('-f');
    expect(plan.args[2]).toContain('snes9x_libretro.dll');
    expect(plan.args[3]).toBe(rom);
  });

  it('extracts a zip into the emulator folder', async () => {
    const root = tempRoot();
    const zip = join(root, 'pack.zip');
    writeFileSync(zip, storedZip('retroarch.exe', Buffer.from('MZ-fake')));
    await extractZip(zip, join(root, 'out'));
    expect(readFileSync(join(root, 'out', 'retroarch.exe')).toString()).toBe('MZ-fake');
  });
});

function storedZip(name: string, data: Buffer) {
  const nameBuf = Buffer.from(name);
  const crc = crc32(data.toString('latin1'));
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(data.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(nameBuf.length, 28);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(46 + nameBuf.length, 12);
  end.writeUInt32LE(30 + nameBuf.length + data.length, 16);
  return Buffer.concat([local, nameBuf, data, central, nameBuf, end]);
}
