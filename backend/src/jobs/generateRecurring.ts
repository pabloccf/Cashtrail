import { addDays, todayUtc } from '../lib/date.js';
import { getOccurrenceDates, type RecurrenceRule } from '../lib/recurrence.js';
import type { RecurringMode, TransactionStatus, TransactionType } from '../generated/prisma/enums.js';
import * as recurringRepository from '../repositories/recurring.repository.js';

// Creates the records of the recurring transactions from the day after `lastGeneratedAt` up to today.
// Runs when the server starts (to catch up on days it was off) and from POST /api/jobs/recurring,
// called once a day by a GitHub Action. It only creates entries in the app: it never pays anything.
//
// Idempotent: running it twice on the same day creates nothing the second time, because
// `lastGeneratedAt` is already today and, if two runs overlap, the unique (recurringTransactionId, date)
// makes the database skip the duplicates

// The fields of a recurring transaction the job needs
export interface GeneratableRecurring extends RecurrenceRule {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description: string;
  mode: RecurringMode;
  active: boolean;
  lastGeneratedAt: Date | null;
}

export interface GenerationSummary {
  processed: number; // Recurring transactions that had days left to process
  created: number; // Records created
  failed: number; // Recurring transactions that threw an error (see the server logs)
}

// Generates the pending records of a single recurring transaction. Also used right after creating
// or resuming one, so the user does not have to wait for the next daily run. Returns how many records it created
export async function generateForRecurring(recurring: GeneratableRecurring, today = todayUtc()): Promise<number> {
  if (!recurring.active) return 0;

  // First day not processed yet. Without `lastGeneratedAt` it has never run, so it starts at `startDate`
  const from = recurring.lastGeneratedAt ? addDays(recurring.lastGeneratedAt, 1) : recurring.startDate;
  if (from > today) return 0;

  const status: TransactionStatus = recurring.mode === 'AUTO' ? 'CONFIRMED' : 'PENDING';
  const records = getOccurrenceDates(recurring, from, today).map((date) => ({
    categoryId: recurring.categoryId,
    amount: recurring.amount,
    type: recurring.type,
    description: recurring.description,
    date,
    status,
  }));

  // Even with no records, `lastGeneratedAt` moves to today: those days are already checked
  return recurringRepository.saveGeneratedRecords(recurring, records, today);
}

// Generates the records of every user's recurring transactions
export async function generateRecurring(today = todayUtc()): Promise<GenerationSummary> {
  const due = await recurringRepository.findDueForGeneration(today);
  const summary: GenerationSummary = { processed: due.length, created: 0, failed: 0 };

  // One by one, and an error in one does not stop the others. Each one is saved in its own
  // database transaction, so a failure leaves it as it was and the next run will retry it
  for (const recurring of due) {
    try {
      summary.created += await generateForRecurring(recurring, today);
    } catch (error) {
      summary.failed += 1;
      console.error(`Failed to generate records for recurring transaction ${recurring.id}`, error);
    }
  }

  return summary;
}
