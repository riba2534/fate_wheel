/** 加密安全随机数工具 */

export function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) throw new Error("maxExclusive must be > 0");
  const array = new Uint32Array(1);
  // Web Crypto 在浏览器和 Node 18+ 都通过 globalThis.crypto 提供
  globalThis.crypto.getRandomValues(array);
  return array[0]! % maxExclusive;
}

/** 以 seed 字符串为种子生成 [0, max) 区间整数（SHA-256 → 取前 8 字节） */
export async function seededInt(seed: string, maxExclusive: number): Promise<number> {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  const view = new DataView(hashBuffer);
  const highBits = view.getUint32(0, false);
  return highBits % maxExclusive;
}
