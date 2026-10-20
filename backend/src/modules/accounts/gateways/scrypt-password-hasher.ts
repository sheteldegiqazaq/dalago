import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import type { PasswordHasher } from '../ports/password-hasher';

const KEY_LENGTH = 64;

const scryptAsync = (password: string, salt: Buffer, keyLength: number) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keyLength, (error, derived) =>
      error ? reject(error) : resolve(derived),
    );
  });

/** scrypt из стандартной библиотеки Node, без нативных зависимостей. Формат: scrypt$<salt>$<hash>. */
export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const derived = await scryptAsync(password, salt, KEY_LENGTH);

    return ['scrypt', salt.toString('base64'), derived.toString('base64')].join(
      '$',
    );
  }

  async verify(password: string, stored: string): Promise<boolean> {
    const [scheme, saltB64, hashB64] = stored.split('$');

    if (scheme !== 'scrypt' || !saltB64 || !hashB64) {
      return false;
    }

    const expected = Buffer.from(hashB64, 'base64');
    const derived = await scryptAsync(
      password,
      Buffer.from(saltB64, 'base64'),
      expected.length,
    );

    return (
      derived.length === expected.length && timingSafeEqual(derived, expected)
    );
  }
}
