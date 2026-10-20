import { ScryptPasswordHasher } from './scrypt-password-hasher';

describe('ScryptPasswordHasher', () => {
  const hasher = new ScryptPasswordHasher();

  it('verifies the original password and rejects others', async () => {
    const hash = await hasher.hash('correct-horse-1');

    expect(hash.startsWith('scrypt$')).toBe(true);
    await expect(hasher.verify('correct-horse-1', hash)).resolves.toBe(true);
    await expect(hasher.verify('correct-horse-2', hash)).resolves.toBe(false);
  });

  it('rejects malformed hashes', async () => {
    await expect(hasher.verify('x', 'plain-text')).resolves.toBe(false);
  });
});
