import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 2345;
const DATA_DIR = path.join(__dirname, 'data');

export type DateString = `${number}-${number}-${number}`;

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const validateDateString = (date: string): date is DateString => {
  return DATE_FORMAT_REGEX.test(date);
};

/**
 * Loads the data from the current.json file
 * @returns The data from the current.json file
 */
const loadCurrentSummary = async () => {
  const dataPath = path.join(DATA_DIR, 'current.json');
  const data = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(data);
};

/**
 * Loads the data from the summary_<date>.json file
 *
 * Date format: YYYY-MM-DD
 *
 * @param {DateString} date - The date to load the summary for
 * @returns The data from the summary_<date>.json file
 */
const loadSummaryByDate = async (date: DateString) => {
  const dataPath = path.join(DATA_DIR, `summary_${date}.json`);
  const data = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(data);
};

/**
 * Route to serve the data from the current.json file or a specific date
 * @param {string?} date - The date to load the summary for (optional),
 *                        if not provided, the current.json file is loaded
 * @returns The data from the summary_<date>.json or current.json file
 */
app.get(
  '/data/:date?',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const date = req.params.date as DateString | undefined;

    if (date && !validateDateString(date)) {
      res.status(400).json({
        error: 'Invalid date format',
        message: 'Date must be in the format YYYY-MM-DD',
      });
      return; // Ensure we return void
    }

    try {
      const data = date ? await loadSummaryByDate(date) : await loadCurrentSummary();
      res.json(data);
    } catch (error) {
      // Pass any errors to the next middleware
      res.status(500).json({
        error: 'Failed to load data',
        message: (error as Error).message,
      });
    }
  })
);

app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({ message: 'OK' });
});

/**
 * Global error handler
 */
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
};

app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
