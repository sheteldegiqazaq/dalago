import type { ReferenceRepository } from '../repositories/reference.repository';

export class GetReferenceUseCase {
  constructor(private readonly reference: ReferenceRepository) {}

  async execute() {
    const [regions, categories] = await Promise.all([
      this.reference.listRegions(),
      this.reference.listCategories(),
    ]);

    return { regions, categories };
  }
}
