import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import { assertCanStart, assertParticipant } from './inquiry-access';

const context = {
  companyExists: true,
  productOwnerId: 'supplier',
  requestOwnerId: null,
};

describe('inquiry access', () => {
  it('lets only participants read a conversation', () => {
    const inquiry = { fromCompanyId: 'buyer', toCompanyId: 'supplier' };

    expect(() => assertParticipant(inquiry, 'buyer')).not.toThrow();
    expect(() => assertParticipant(inquiry, 'supplier')).not.toThrow();
    expect(() => assertParticipant(inquiry, 'stranger')).toThrow(
      NotFoundApplicationException,
    );
    expect(() => assertParticipant(inquiry, undefined)).toThrow(
      NotFoundApplicationException,
    );
  });

  it('requires a company and forbids writing to yourself', () => {
    const links = { productId: null, requestId: null };

    expect(() => assertCanStart(undefined, 'supplier', context, links)).toThrow(
      ForbiddenApplicationException,
    );
    expect(() =>
      assertCanStart('supplier', 'supplier', context, links),
    ).toThrow(expect.objectContaining({ code: 'SELF_INQUIRY' }) as Error);
  });

  it('rejects a product that belongs to a third company', () => {
    expect(() =>
      assertCanStart(
        'buyer',
        'supplier',
        { ...context, productOwnerId: 'other' },
        {
          productId: 'p1',
          requestId: null,
        },
      ),
    ).toThrow(
      expect.objectContaining({ code: 'INQUIRY_LINK_MISMATCH' }) as Error,
    );
    expect(() =>
      assertCanStart('buyer', 'supplier', context, {
        productId: 'p1',
        requestId: null,
      }),
    ).not.toThrow();
  });
});
