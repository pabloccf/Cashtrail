// Declaration merging: adds our own fields to Express's Request type
declare global {
  namespace Express {
    interface Request {
      // Set by the currentUser middleware (auth middleware from Phase 2 on).
      // Only read it in routes that use that middleware
      userId: string;
    }
  }
}

export {};
