const express = require('express');
const { sql } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const DEFAULT = { free: 20, pro: 1000, vip: 2000 };
const VALID = ['free', 'pro', 'vip'];

function fmt(p) {
  return {
    plan: p.plan,
    limits: { free: p.free_limit, pro: p.pro_limit, vip: p.vip_limit },
    used: p.used_count,
    updatedAt: p.updated_at
  };
}

async function getOrCreate(userId) {
  const rows = await sql`SELECT * FROM user_plans WHERE user_id = ${userId}`;
  if (rows.length === 0) {
    const created = await sql`INSERT INTO user_plans (user_id) VALUES (${userId}) RETURNING *`;
    return created[0];
  }
  return rows[0];
}

router.get('/', authRequired, async (req, res) => {
  try {
    const p = await getOrCreate(req.user.id);
    res.json(fmt(p));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/activate', authRequired, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!VALID.includes(plan)) return res.status(400).json({ error: 'Plan tidak valid' });
    const [updated] = await sql`
      UPDATE user_plans SET plan = ${plan}, updated_at = NOW()
      WHERE user_id = ${req.user.id} RETURNING *
    `;
    res.json(fmt(updated));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/consume', authRequired, async (req, res) => {
  try {
    const p = await getOrCreate(req.user.id);
    if (!VALID.includes(p.plan)) return res.status(400).json({ error: 'Plan tidak valid di DB' });
    const current = { free: p.free_limit, pro: p.pro_limit, vip: p.vip_limit };
    if (current[p.plan] <= 0) return res.status(400).json({ error: 'Limit habis' });

    const col = p.plan + '_limit';
    const [updated] = await sql.unsafe(
      `UPDATE user_plans SET ${col} = ${col} - 1, used_count = used_count + 1, updated_at = NOW()
       WHERE user_id = $1 RETURNING *`,
      [req.user.id]
    );
    res.json(fmt(updated));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/consume-bulk', authRequired, async (req, res) => {
  try {
    const amount = parseInt(req.body.amount);
    if (!amount || amount < 1) return res.status(400).json({ error: 'Amount tidak valid' });
    const p = await getOrCreate(req.user.id);
    if (p.plan === 'free') return res.status(403).json({ error: 'Bulk khusus Pro/VIP' });
    const current = { free: p.free_limit, pro: p.pro_limit, vip: p.vip_limit };
    if (current[p.plan] < amount) return res.status(400).json({ error: 'Limit tidak cukup' });

    const col = p.plan + '_limit';
    const [updated] = await sql.unsafe(
      `UPDATE user_plans SET ${col} = ${col} - ${amount}, used_count = used_count + ${amount}, updated_at = NOW()
       WHERE user_id = $1 RETURNING *`,
      [req.user.id]
    );
    res.json(fmt(updated));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/reset', authRequired, async (req, res) => {
  try {
    const [updated] = await sql`
      UPDATE user_plans SET plan='free',
        free_limit=${DEFAULT.free}, pro_limit=${DEFAULT.pro}, vip_limit=${DEFAULT.vip},
        used_count=0, updated_at=NOW()
      WHERE user_id = ${req.user.id} RETURNING *
    `;
    res.json(fmt(updated));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;