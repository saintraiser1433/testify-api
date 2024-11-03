import dotenv from 'dotenv';
dotenv.config();

export default {
    PORT: process.env.APP_PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    // Add any other configs you might need here
};