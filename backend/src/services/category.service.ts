import { AppError } from '../lib/appError.js';
import * as categoryRepository from '../repositories/category.repository.js';
import type { CategoryInput } from '../schemas/category.schema.js';

type CategoryUsages = Awaited<ReturnType<typeof categoryRepository.countUsages>>;

function totalUsages(usages: CategoryUsages): number {
  return Object.values(usages).reduce((sum, count) => sum + count, 0);
}

// The name is unique per user and type. `excludeId` lets a category keep its own name when it is updated
async function assertNameAvailable(userId: string, input: CategoryInput, excludeId?: string) {
  const existing = await categoryRepository.findByName(userId, input.type, input.name);
  if (existing && existing.id !== excludeId) {
    throw new AppError(409, `A category named "${existing.name}" already exists for this type`);
  }
}

export function list(userId: string) {
  return categoryRepository.findManyByUser(userId);
}

// Another user's category gives the same 404 as one that does not exist
async function getById(userId: string, id: string) {
  const category = await categoryRepository.findById(userId, id);
  if (!category) {
    throw new AppError(404, 'Category not found');
  }
  return category;
}

export async function create(userId: string, input: CategoryInput) {
  await assertNameAvailable(userId, input);
  return categoryRepository.create(userId, input);
}

export async function update(userId: string, id: string, input: CategoryInput) {
  const category = await getById(userId, id);
  await assertNameAvailable(userId, input, id);

  // Changing the type of a used category would leave expenses inside an income category (or the other way)
  if (input.type !== category.type) {
    const usages = await categoryRepository.countUsages(userId, id);
    if (totalUsages(usages) > 0) {
      throw new AppError(409, 'Cannot change the type of a category that is in use', usages);
    }
  }

  return categoryRepository.update(userId, id, input);
}

// `details` carries the counts so the frontend can say "it has N transactions"
export async function remove(userId: string, id: string) {
  await getById(userId, id);

  const usages = await categoryRepository.countUsages(userId, id);
  if (totalUsages(usages) > 0) {
    throw new AppError(409, 'Cannot delete a category that is in use', usages);
  }

  await categoryRepository.remove(userId, id);
}
