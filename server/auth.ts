/**
 * Password hashing utilities using Node.js built-in `crypto`.
 * No additional dependencies required.
 */
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

/**
 * Hash a plain-text password using scrypt + random salt.
 * Returns a string in the format "salt:hash" (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verify a plain-text password against a stored hash.
 * Uses `timingSafeEqual` to prevent timing attacks.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const [salt, storedKey] = storedHash.split(":");
    if (!salt || !storedKey) return false;
    const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
    const storedBuffer = Buffer.from(storedKey, "hex");
    if (derivedKey.length !== storedBuffer.length) return false;
    return timingSafeEqual(derivedKey, storedBuffer);
  } catch {
    return false;
  }
}
