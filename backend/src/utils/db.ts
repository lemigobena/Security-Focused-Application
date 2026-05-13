import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

let prisma: PrismaClient;

if (connectionString) {
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  console.warn('DATABASE_URL is missing. Database features will not work.');
  // Fallback client for module loading safety
  prisma = new PrismaClient(); 
}

export default prisma;
