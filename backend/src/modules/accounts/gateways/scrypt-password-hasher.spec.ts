import { ScryptPasswordHasher } from './scrypt-password-hasher';

describe('ScryptPasswordHasher', () => {
  const hasher = new ScryptPasswordHasher();

  it('verifies the original password and rejects others', async () => {
    const hash = await hasher.hash('demo12345');

    expect(hash.startsWith('scrypt$')).toBe(true);
    await expect(hasher.verify('demo12345', hash)).resolves.toBe(true);
    await expect(hasher.verify('demo12346', hash)).resolves.toBe(false);
  });

  it('rejects malformed hashes', async () => {
    await expect(hasher.verify('x', 'plain-text')).resolves.toBe(false);
  });
});
