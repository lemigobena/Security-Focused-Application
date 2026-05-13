import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

let prisma: PrismaClient;

if (connectionString) {
  try {
    const pool = new Pool({ 
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    console.log('Prisma Client initialized successfully with adapter.');
  } catch (err) {
    console.error('Failed to initialize Prisma Client with adapter:', err);
    prisma = new PrismaClient();
  }
} else {
  console.error('CRITICAL: DATABASE_URL is missing in environment variables!');
  prisma = new PrismaClient(); 
}

export default prisma;
