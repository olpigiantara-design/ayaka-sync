const express = require('express');
const { sql } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function mask(email) {
  if (!email) return '—';
  const [n, d] = email.split('@');
  if (!d) return '—';
  return n.length <= 2 ? `${n[0]}***@${d}` : `${n.slice(0, 2)}***@${d}`;
}

router.get('/', authRequired, async (req, res) => {
  try {
    const rows = await sql`
      SELECT id, email, order_id, plan_at_time, status, created_at
      FROM activations WHERE user_id = ${req.user.id}
      ORDER BY created_at DESC LIMIT 100
    `;
    res.json(rows.map(r => ({
      id: r.id,
      email: mask(r.email),
      orderId: r.order_id,
      plan: r.plan_at_time,
      status: r.status,
      date: new Date(r.created_at).toLocaleString('id-ID')
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;