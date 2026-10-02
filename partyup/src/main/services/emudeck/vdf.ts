export type ShortcutRecord = {
  appid: number;
  AppName: string;
  Exe: string;
  StartDir: string;
  icon: string;
  ShortcutPath: string;
  LaunchOptions: string;
  IsHidden: number;
  AllowDesktopConfig: number;
  AllowOverlay: number;
  OpenVR: number;
  Devkit: number;
  DevkitGameID: string;
  DevkitOverrideAppID: number;
  LastPlayTime: number;
  FlatpakAppID: string;
  tags: Record<string, string>;
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(value: string): number {
  const data = Buffer.from(value);
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function steamAppId(quotedExe: string, appName: string): number {
  return (crc32(`${quotedExe}${appName}`) | 0x80000000) >>> 0;
}

function u32(value: number): Buffer {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(value >>> 0, 0);
  return buf;
}

export function writeShortcutVdf(shortcuts: Record<string, ShortcutRecord>): Buffer {
  const chunks: Buffer[] = [];
  const push = (...parts: Buffer[]) => chunks.push(...parts);
  const str = (value: string) => Buffer.from(`${value}\0`, 'utf8');

  const writeObject = (obj: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        push(Buffer.from([0x00]), str(key));
        writeObject(value as Record<string, unknown>);
        push(Buffer.from([0x08]));
      } else if (typeof value === 'string') {
        push(Buffer.from([0x01]), str(key), str(value));
      } else if (typeof value === 'number') {
        push(Buffer.from([0x02]), str(key), u32(value));
      }
    }
  };

  writeObject({ shortcuts });
  push(Buffer.from([0x08]));
  return Buffer.concat(chunks);
}

export function readShortcutVdf(buf: Buffer): Record<string, unknown> {
  let index = 0;
  const readString = () => {
    const start = index;
    while (index < buf.length && buf[index] !== 0) index += 1;
    const value = buf.slice(start, index).toString('utf8');
    index += 1;
    return value;
  };
  const readMap = (): Record<string, unknown> => {
    const obj: Record<string, unknown> = {};
    while (index < buf.length) {
      const type = buf[index];
      index += 1;
      if (type === 0x08) break;
      const key = readString();
      if (type === 0x00) obj[key] = readMap();
      else if (type === 0x01) obj[key] = readString();
      else if (type === 0x02) {
        obj[key] = buf.readUInt32LE(index);
        index += 4;
      } else throw new Error(`Unknown VDF type ${type}`);
    }
    return obj;
  };
  return readMap();
}

export function shortcutFor(name: string, exePath: string, romPath: string, startDir: string): ShortcutRecord {
  const exe = `"${exePath}"`;
  const dir = `"${startDir}"`;
  return {
    appid: steamAppId(exe, name),
    AppName: name,
    Exe: exe,
    StartDir: dir,
    icon: '',
    ShortcutPath: '',
    LaunchOptions: `"${romPath}"`,
    IsHidden: 0,
    AllowDesktopConfig: 1,
    AllowOverlay: 1,
    OpenVR: 0,
    Devkit: 0,
    DevkitGameID: '',
    DevkitOverrideAppID: 0,
    LastPlayTime: 0,
    FlatpakAppID: '',
    tags: { '0': 'PartyUp' },
  };
}
