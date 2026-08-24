import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 5000,

  databaseUrl: process.env.DATABASE_URL,

  geminiApiKey: process.env.GEMINI_API_KEY,

  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,

  jwtSecret: process.env.JWT_SECRET,
};