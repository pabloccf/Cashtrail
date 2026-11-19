// Public URL of the frontend (Vite locally, Vercel in production). The browser always talks to the
// backend through it (Vite proxy / Vercel rewrite), so OAuth callbacks and redirects use it too
const appUrl = process.env.APP_URL;
if (!appUrl) {
  throw new Error('APP_URL is not defined');
}

// Without a trailing slash, so `${APP_URL}/dashboard` never ends up with "//"
export const APP_URL: string = appUrl.replace(/\/+$/, '');
