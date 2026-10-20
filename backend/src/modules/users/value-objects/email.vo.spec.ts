import { DomainException } from '@shared/exceptions/domain.exception';
import { Email } from './email.vo';

describe('Email', () => {
  it('should normalize valid email', () => {
    const email = Email.create('  USER@Example.COM ');

    expect(email.value).toBe('user@example.com');
  });

  it('should throw when email is invalid', () => {
    expect(() => Email.create('invalid-email')).toThrow(DomainException);
  });

  it('should throw when email is empty', () => {
    expect(() => Email.create('   ')).toThrow('Invalid email address');
  });
});
