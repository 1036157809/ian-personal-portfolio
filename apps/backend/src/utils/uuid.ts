import crypto from 'crypto';

/**
 * 生成 UUID v7（时间有序）
 * 格式: xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx
 * 前 48 位是 Unix 时间戳（毫秒），保证时间有序
 */
export const uuidv7 =  (): string  => {
  const timestamp = Date.now();
  const rand = crypto.randomBytes(10); // 80 bits of randomness

  // 48-bit timestamp → 12 hex chars
  const tsHex = timestamp.toString(16).padStart(12, '0');

  // version 7: set high nibble of byte[0] (UUID position 12-15) to 0111
  rand[0] = (rand[0] & 0x0f) | 0x70;
  // variant 10: set top 2 bits of byte[2] (UUID position 16-19) to 10
  rand[2] = (rand[2] & 0x3f) | 0x80;

  const randHex = rand.toString('hex'); // 20 hex chars

  // Compose UUID: 8-4-4-4-12
  // tsHex provides positions 0-11, randHex provides positions 12-31
  return [
    tsHex.slice(0, 8),                          // positions 0-7
    tsHex.slice(8, 12),                         // positions 8-11
    randHex.slice(0, 4),                        // positions 12-15 (version in [0])
    randHex.slice(4, 8),                        // positions 16-19 (variant in [4])
    randHex.slice(8, 20),                       // positions 20-31
  ].join('-');
}
