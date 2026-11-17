import { AppError } from '../lib/appError.js';
import { fromYearMonth, monthRange, shiftMonth, toYearMonth } from '../lib/month.js';
import * as budgetRepository from '../repositories/budget.repository.js';
import * as statsRepository from '../repositories/stats.repository.js';
import type {
  CopyBudgetsInput,
  CreateBudgetInput,
  ListBudgetsQuery,
  UpdateBudgetInput,
} from '../schemas/budget.schema.js';
import { assertUsableCategory } from './category.service.js';

type BudgetRow = NonNullable<Awaited<ReturnType<typeof budgetRepository.findById>>>;

// The API speaks "YYYY-MM" (like the stats routes and the frontend URL); the database stores two
// integers. This turns a row into what the frontend receives
function toResponse(budget: BudgetRow, spent: number) {
  const { id, amount, category, year, month } = budget;
  return { id, month: fromYearMonth(year, month), amount, spent, category };
}

// Spent per category in the month (in cents). It reuses the stats query, so it follows the same
// rules: only CONFIRMED expenses count, PENDING ones do not until the user confirms them
async function getSpentByCategory(userId: string, month: string): Promise<Map<string, number>> {
  const rows = await statsRepository.sumByCategory(userId, 'EXPENSE', monthRange(month));
  return new Map(rows.map((row) => [row.categoryId, row._sum.amount ?? 0]));
}

// For create and update, which return a single budget: same shape as each item of `list`
async function toResponseWithSpent(userId: string, budget: BudgetRow) {
  const month = fromYearMonth(budget.year, budget.month);
  const spentByCategory = await getSpentByCategory(userId, month);
  return toResponse(budget, spentByCategory.get(budget.category.id) ?? 0);
}

// Another user's budget gives the same 404 as one that does not exist
async function getById(userId: string, id: string) {
  const budget = await budgetRepository.findById(userId, id);
  if (!budget) {
    throw new AppError(404, 'Budget not found');
  }
  return budget;
}

// Each budget of the month with what has been spent in its category. Two queries in total, however
// many budgets there are: one for the budgets and one that adds up the month by category
export async function list(userId: string, { month }: ListBudgetsQuery) {
  const [budgets, spentByCategory] = await Promise.all([
    budgetRepository.findManyByMonth(userId, toYearMonth(month)),
    getSpentByCategory(userId, month),
  ]);

  return budgets.map((budget) => toResponse(budget, spentByCategory.get(budget.category.id) ?? 0));
}

export async function create(userId: string, { categoryId, amount, month }: CreateBudgetInput) {
  // Budgets limit spending, so an income category makes no sense here
  await assertUsableCategory(userId, categoryId, 'EXPENSE');

  const yearMonth = toYearMonth(month);
  const existing = await budgetRepository.findByCategoryAndMonth(userId, categoryId, yearMonth);
  if (existing) {
    throw new AppError(409, 'This category already has a budget for this month');
  }

  const budget = await budgetRepository.create(userId, { categoryId, amount, ...yearMonth });
  return toResponseWithSpent(userId, budget);
}

export async function update(userId: string, id: string, { amount }: UpdateBudgetInput) {
  await getById(userId, id);
  return toResponseWithSpent(userId, await budgetRepository.updateAmount(userId, id, amount));
}

export async function remove(userId: string, id: string) {
  await getById(userId, id);
  await budgetRepository.remove(userId, id);
}

// Copies the budgets of the previous month into `month`. Categories that already have a budget in
// `month` keep theirs (the user may have adjusted it), so running it twice copies nothing new
export async function copyFromPreviousMonth(userId: string, { month }: CopyBudgetsInput) {
  const previous = await budgetRepository.findManyByMonth(userId, toYearMonth(shiftMonth(month, -1)));
  const target = toYearMonth(month);

  const copied = await budgetRepository.createMany(
    userId,
    previous.map((budget) => ({ categoryId: budget.category.id, amount: budget.amount, ...target })),
  );
  return { copied };
}
