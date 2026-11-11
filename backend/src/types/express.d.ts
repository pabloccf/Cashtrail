// Declaration merging: adds our own fields to Express's Request type
declare global {
  namespace Express {
    interface Request {
      // Set by the requireAuth middleware. Only read it in routes that use that middleware
      userId: string;
    }
  }
}

export {};
