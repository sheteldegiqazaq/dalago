import type { RequestDetailsRecord } from '../repositories/procurement.select';
import { visibleRequestFor } from './request-visibility';

const offer = (id: string, supplierCompanyId: string) =>
  ({ id, supplierCompanyId }) as RequestDetailsRecord['offers'][number];

const request = (status: RequestDetailsRecord['status']) =>
  ({
    status,
    buyerCompanyId: 'buyer',
    offers: [offer('o1', 'supplier-a'), offer('o2', 'supplier-b')],
  }) as RequestDetailsRecord;

describe('visibleRequestFor', () => {
  it('owner sees all offers', () => {
    const view = visibleRequestFor(request('OFFERS_RECEIVED'), {
      companyId: 'buyer',
      role: 'BUYER',
    });

    expect(view?.offers).toHaveLength(2);
    expect(view?.isOwner).toBe(true);
  });

  it('supplier sees only own offer and cannot offer twice', () => {
    const view = visibleRequestFor(request('OFFERS_RECEIVED'), {
      companyId: 'supplier-a',
      role: 'SUPPLIER',
    });

    expect(view?.offers.map((o) => o.id)).toEqual(['o1']);
    expect(view?.canOffer).toBe(false);
  });

  it('other supplier can offer on active request but sees no offers or phone', () => {
    const view = visibleRequestFor(request('OPEN'), {
      companyId: 'supplier-c',
      role: 'SUPPLIER',
    });

    expect(view?.offers).toEqual([]);
    expect(view?.showBuyerPhone).toBe(false);
    expect(view?.canOffer).toBe(true);
  });

  it('hides finished requests from outsiders', () => {
    expect(visibleRequestFor(request('ACCEPTED'), {})).toBeNull();
    expect(
      visibleRequestFor(request('CLOSED'), { companyId: 'supplier-b' }),
    ).not.toBeNull();
  });
});
