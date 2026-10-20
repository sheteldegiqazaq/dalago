import { DomainException } from '@shared/exceptions/domain.exception';
import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import {
  assertCanSubmitOffer,
  assertOfferDecidable,
  assertOfferEditable,
  assertRequestModifiable,
  assertRequestOwner,
  statusAfterNewOffer,
} from './request-lifecycle';

const request = (
  status: 'OPEN' | 'OFFERS_RECEIVED' | 'ACCEPTED' | 'CLOSED',
) => ({
  status,
  buyerCompanyId: 'buyer',
});
const offer = (status: 'PENDING' | 'ACCEPTED' | 'REJECTED') => ({
  status,
  supplierCompanyId: 'supplier',
});

describe('request lifecycle', () => {
  it('moves OPEN and OFFERS_RECEIVED to OFFERS_RECEIVED on a new offer', () => {
    expect(statusAfterNewOffer('OPEN')).toBe('OFFERS_RECEIVED');
    expect(statusAfterNewOffer('OFFERS_RECEIVED')).toBe('OFFERS_RECEIVED');
  });

  it.each(['ACCEPTED', 'CLOSED'] as const)(
    'does not accept offers when request is %s',
    (status) => {
      expect(() => statusAfterNewOffer(status)).toThrow(DomainException);
      expect(() =>
        assertCanSubmitOffer(request(status), 'supplier', false),
      ).toThrow(
        expect.objectContaining({ code: 'REQUEST_NOT_ACTIVE' }) as Error,
      );
      expect(() => assertRequestModifiable(request(status))).toThrow(
        DomainException,
      );
    },
  );

  it('forbids buyers from offering on their own request and duplicate offers', () => {
    expect(() => assertCanSubmitOffer(request('OPEN'), 'buyer', false)).toThrow(
      expect.objectContaining({ code: 'OWN_REQUEST' }) as Error,
    );
    expect(() =>
      assertCanSubmitOffer(request('OPEN'), 'supplier', true),
    ).toThrow(
      expect.objectContaining({ code: 'OFFER_ALREADY_EXISTS' }) as Error,
    );
    expect(() =>
      assertCanSubmitOffer(request('OFFERS_RECEIVED'), 'supplier', false),
    ).not.toThrow();
  });

  it('only the request owner can decide on offers', () => {
    expect(() => assertRequestOwner(request('OPEN'), 'someone-else')).toThrow(
      ForbiddenApplicationException,
    );
    expect(() =>
      assertOfferDecidable(
        offer('PENDING'),
        request('OFFERS_RECEIVED'),
        undefined,
      ),
    ).toThrow(ForbiddenApplicationException);
    expect(() =>
      assertOfferDecidable(
        offer('PENDING'),
        request('OFFERS_RECEIVED'),
        'buyer',
      ),
    ).not.toThrow();
  });

  it('cannot accept an already decided offer or an offer on a finished request', () => {
    expect(() =>
      assertOfferDecidable(
        offer('REJECTED'),
        request('OFFERS_RECEIVED'),
        'buyer',
      ),
    ).toThrow(expect.objectContaining({ code: 'OFFER_NOT_PENDING' }) as Error);
    expect(() =>
      assertOfferDecidable(offer('PENDING'), request('ACCEPTED'), 'buyer'),
    ).toThrow(expect.objectContaining({ code: 'REQUEST_NOT_ACTIVE' }) as Error);
  });

  it('suppliers can edit only their own pending offers', () => {
    expect(() =>
      assertOfferEditable(offer('PENDING'), request('OPEN'), 'other'),
    ).toThrow(ForbiddenApplicationException);
    expect(() =>
      assertOfferEditable(offer('ACCEPTED'), request('ACCEPTED'), 'supplier'),
    ).toThrow(DomainException);
    expect(() =>
      assertOfferEditable(
        offer('PENDING'),
        request('OFFERS_RECEIVED'),
        'supplier',
      ),
    ).not.toThrow();
  });
});
