require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL tidak ditemukan di file .env');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

module.exports = { sql };