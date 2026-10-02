import { closeSync, openSync, readSync, statSync, writeSync } from 'fs';
import { deflateRawSync, inflateRawSync } from 'zlib';

const BLOCK = 2048;

function chooseAlign(total: number): number {
  let align = 0;
  while (total + 8 * 1024 * 1024 > 0x7fffffff * 2 ** align && align < 12) align += 1;
  return align;
}

export function compressIsoToCso(input: string, output: string): { bytesIn: number; bytesOut: number; align: number } {
  const total = statSync(input).size;
  if (total <= 0) throw new Error('That image is empty.');
  const blocks = Math.ceil(total / BLOCK);
  const align = chooseAlign(total);
  const header = Buffer.alloc(24);
  header.write('CISO', 0, 'ascii');
  header.writeUInt32LE(24, 4);
  header.writeBigUInt64LE(BigInt(total), 8);
  header.writeUInt32LE(BLOCK, 16);
  header[20] = 1;
  header[21] = align;
  const index = Buffer.alloc((blocks + 1) * 4);
  const source = openSync(input, 'r');
  const dest = openSync(output, 'w');
  try {
    writeSync(dest, header);
    const indexAt = 24;
    writeSync(dest, index);
    let pos = 24 + index.length;
    const raw = Buffer.alloc(BLOCK);
    for (let i = 0; i < blocks; i += 1) {
      const got = readSync(source, raw, 0, BLOCK, i * BLOCK);
      const slice = Buffer.from(raw.subarray(0, got));
      const compressed = deflateRawSync(slice, { level: 9 });
      const plain = compressed.length >= slice.length;
      const data = plain ? slice : compressed;
      const shifted = Math.floor(pos / 2 ** align);
      if (shifted > 0x7fffffff) throw new Error('Image is too large for a CSO index.');
      index.writeUInt32LE((shifted | (plain ? 0x80000000 : 0)) >>> 0, i * 4);
      writeSync(dest, data);
      pos += data.length;
    }
    index.writeUInt32LE(Math.floor(pos / 2 ** align) >>> 0, blocks * 4);
    writeSync(dest, index, 0, index.length, indexAt);
  } finally {
    closeSync(source);
    closeSync(dest);
  }
  return { bytesIn: total, bytesOut: statSync(output).size, align };
}

export function decompressCso(input: string): Buffer {
  const file = openSync(input, 'r');
  try {
    const header = Buffer.alloc(24);
    readSync(file, header, 0, 24, 0);
    if (header.toString('ascii', 0, 4) !== 'CISO') throw new Error('Not a CSO file.');
    const total = Number(header.readBigUInt64LE(8));
    const block = header.readUInt32LE(16);
    const align = header[21];
    const blocks = Math.ceil(total / block);
    const index = Buffer.alloc((blocks + 1) * 4);
    readSync(file, index, 0, index.length, 24);
    const out = Buffer.alloc(total);
    for (let i = 0; i < blocks; i += 1) {
      const entry = index.readUInt32LE(i * 4);
      const next = index.readUInt32LE((i + 1) * 4);
      const plain = (entry & 0x80000000) !== 0;
      const start = (entry & 0x7fffffff) * 2 ** align;
      const end = (next & 0x7fffffff) * 2 ** align;
      const packed = Buffer.alloc(end - start);
      readSync(file, packed, 0, packed.length, start);
      const chunk = plain ? packed : inflateRawSync(packed);
      chunk.copy(out, i * block, 0, Math.min(chunk.length, total - i * block));
    }
    return out;
  } finally {
    closeSync(file);
  }
}
