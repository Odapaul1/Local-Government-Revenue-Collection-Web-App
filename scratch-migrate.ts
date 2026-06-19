import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  try {
    await connection.query('ALTER TABLE users ADD COLUMN password VARCHAR(255);');
    console.log('Added password column.');
  } catch (e: any) {
    console.log('Error adding password column (might exist):', e.message);
  }

  try {
    await connection.query('UPDATE users SET email = CONCAT("dev_", id, "@test.com") WHERE email IS NULL OR email = "";');
    await connection.query('ALTER TABLE users ADD UNIQUE INDEX users_email_unique (email);');
    console.log('Added unique constraint to email.');
  } catch (e: any) {
    console.log('Error adding unique constraint (might exist):', e.message);
  }

  await connection.end();
}

run();
