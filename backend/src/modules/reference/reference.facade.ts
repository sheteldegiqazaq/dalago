import { Inject, Injectable } from '@nestjs/common';
import type { ReferenceRepository } from './repositories/reference.repository';
import { REFERENCE_REPOSITORY } from './reference.tokens';

@Injectable()
export class ReferenceFacade {
  constructor(
    @Inject(REFERENCE_REPOSITORY)
    private readonly reference: ReferenceRepository,
  ) {}

  listCategories() {
    return this.reference.listCategories();
  }

  listCities() {
    return this.reference.listCities();
  }
}
