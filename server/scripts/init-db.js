require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

(async () => {
  const sql = neon(process.env.DATABASE_URL);
  const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');

  // Pisah per statement (naif — cukup untuk schema ini)
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt);
      console.log('✓', stmt.split('\n')[0].slice(0, 70));
    } catch (e) {
      console.error('✗ GAGAL:', stmt.split('\n')[0]);
      console.error('  ', e.message);
    }
  }
  console.log('\n✅ Database siap.');
})();