import express, {
  type Request,
  type Response,
  type ErrorRequestHandler,
} from "express";
import asyncHandler from "express-async-handler";
import cors from "cors";
import {
  type DateString,
  loadCurrentSummary,
  loadSummaryByDate,
  validateDateString,
} from "./lib/utils.js";

const app = express();
const PORT = 2345;

// Move middleware to the top, before routes
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "*"], // Add your Next.js development ports
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(express.json());

/**
 * Route to serve the data from the current.json file or a specific date
 * @param {string?} date - The date to load the summary for (optional),
 *                        if not provided, the current.json file is loaded
 * @returns The data from the summary_<date>.json or current.json file
 */
app.get(
  "/data/:date?",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const date = req.params.date as DateString | undefined;

    if (date && !validateDateString(date)) {
      res.status(400).json({
        error: "Invalid date format",
        message: "Date must be in the format YYYY-MM-DD",
      });
      return; // Ensure we return void
    }

    try {
      const data = date
        ? await loadSummaryByDate(date)
        : await loadCurrentSummary();
      res.json(data);
    } catch (error) {
      // Pass any errors to the next middleware
      res.status(500).json({
        error: "Failed to load data",
        message: (error as Error).message,
      });
    }
  })
);

app.get("/health", (_req: Request, res: Response): void => {
  res.status(200).json({ message: "OK" });
});

/**
 * Global error handler
 */
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
};

app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
