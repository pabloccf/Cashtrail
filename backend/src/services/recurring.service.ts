import { generateForRecurring } from '../jobs/generateRecurring.js';
import { AppError } from '../lib/appError.js';
import { addDays, toDate, todayUtc } from '../lib/date.js';
import * as recurringRepository from '../repositories/recurring.repository.js';
import type { RecurringInput } from '../schemas/recurring.schema.js';
import { assertUsableCategory } from './category.service.js';

function toRecurringData(input: RecurringInput): recurringRepository.RecurringData {
  return {
    categoryId: input.categoryId,
    amount: input.amount,
    type: input.type,
    description: input.description,
    frequency: input.frequency,
    dayOfMonth: input.dayOfMonth,
    monthOfYear: input.monthOfYear ?? null,
    startDate: toDate(input.startDate),
    endDate: input.endDate ? toDate(input.endDate) : null,
    mode: input.mode,
  };
}

export function list(userId: string) {
  return recurringRepository.findManyByUser(userId);
}

// Another user's recurring transaction gives the same 404 as one that does not exist
async function getById(userId: string, id: string) {
  const recurring = await recurringRepository.findById(userId, id);
  if (!recurring) {
    throw new AppError(404, 'Recurring transaction not found');
  }
  return recurring;
}

// Generates its records right away (including the past ones if `startDate` is in the past), so the
// user does not wait for the next daily run. Returns it again because `lastGeneratedAt` has changed.
// If the generation fails, the recurring transaction is already saved and the next run creates its records
export async function create(userId: string, input: RecurringInput) {
  await assertUsableCategory(userId, input.categoryId, input.type);
  const recurring = await recurringRepository.create(userId, toRecurringData(input));
  await generateForRecurring(recurring);
  return getById(userId, recurring.id);
}

// Only affects future records: `lastGeneratedAt` is kept, so days already processed are
// never generated again, and records already created are not touched
export async function update(userId: string, id: string, input: RecurringInput) {
  await getById(userId, id);
  await assertUsableCategory(userId, input.categoryId, input.type);
  return recurringRepository.update(userId, id, toRecurringData(input));
}

// Pausing just sets `active` to false. Resuming moves `lastGeneratedAt` to yesterday, so the job
// skips the paused period instead of filling it in, but still generates today's record if one is due
export async function toggle(userId: string, id: string) {
  const recurring = await getById(userId, id);

  if (recurring.active) {
    return recurringRepository.updateActive(userId, id, { active: false });
  }

  const yesterday = addDays(todayUtc(), -1);
  // If the job already processed today (paused and resumed on the same day), it is not moved back
  const lastGeneratedAt =
    recurring.lastGeneratedAt && recurring.lastGeneratedAt > yesterday ? recurring.lastGeneratedAt : yesterday;

  const resumed = await recurringRepository.updateActive(userId, id, { active: true, lastGeneratedAt });
  // Today's record, if one is due, is created now instead of on the next daily run
  await generateForRecurring(resumed);
  return getById(userId, id);
}

export async function remove(userId: string, id: string) {
  await getById(userId, id);
  await recurringRepository.removeWithPendingRecords(userId, id);
}
