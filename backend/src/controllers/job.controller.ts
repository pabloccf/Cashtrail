import type { RequestHandler } from 'express';
import { generateRecurring } from '../jobs/generateRecurring.js';

// Responds 500 if any recurring transaction failed, so the GitHub Action fails and sends an email.
// The others were generated anyway, and the next run will retry the failed ones
export const runRecurring: RequestHandler = async (_req, res) => {
  const summary = await generateRecurring();
  res.status(summary.failed > 0 ? 500 : 200).json(summary);
};
