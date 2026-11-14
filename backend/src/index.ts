import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { generateRecurring } from './jobs/generateRecurring.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cookieParser());

app.use('/api', apiRouter);

// Must be registered after all routes
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);

  // Catches up on the days the server was off. Not awaited, so the server answers requests meanwhile
  generateRecurring()
    .then((summary) => console.log('Recurring transactions generated on startup:', summary))
    .catch((error: unknown) => console.error('Recurring transactions generation on startup failed', error));
});
