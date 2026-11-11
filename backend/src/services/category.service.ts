import * as categoryRepository from '../repositories/category.repository.js';

// No business logic yet: the layer is kept for consistency. Phase 3 adds create, update and delete
export function list(userId: string) {
  return categoryRepository.findManyByUser(userId);
}
