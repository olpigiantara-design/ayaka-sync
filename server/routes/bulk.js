const express = require('express');
const { sql } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
const BULK_API = process.env.BULK_API_URL;
const BULK_KEY = process.env.BULK_API_KEY;

router.post('/generate', authRequired, async (req, res) => {
  try {
    const amount = parseInt(req.body.amount);
    if (!amount || amount < 1 || amount > 100)
      return res.status(400).json({ error: 'Amount 1-100' });

    const [p] = await sql`SELECT * FROM user_plans WHERE user_id = ${req.user.id}`;
    if (!p) return res.status(404).json({ error: 'Plan tidak ditemukan' });
    if (p.plan === 'free') return res.status(403).json({ error: 'Bulk khusus Pro/VIP' });
    const current = { free: p.free_limit, pro: p.pro_limit, vip: p.vip_limit };
    if (current[p.plan] < amount) return res.status(400).json({ error: 'Limit tidak cukup' });

    const apiRes = await fetch(`${BULK_API}?amount=${amount}&apikey=${BULK_KEY}`);
    const data = await apiRes.json();
    if (!(data.status && data.result && data.result.result))
      return res.status(500).json({ error: 'Bulk API gagal', detail: data });

    const accounts = data.result.result;

    // Consume limit
    const col = p.plan + '_limit';
    await sql.unsafe(
      `UPDATE user_plans SET ${col}=${col}-${amount}, used_count=used_count+${amount}, updated_at=NOW() WHERE user_id=$1`,
      [req.user.id]
    );

    // Save history
    for (const acc of accounts) {
      await sql`
        INSERT INTO activations (user_id, email, order_id, plan_at_time, status)
        VALUES (${req.user.id}, ${acc.email}, ${acc.orderId}, 'bulk', 'success')
      `;
    }

    // Save bulk job
    await sql`
      INSERT INTO bulk_jobs (user_id, amount, status, result)
      VALUES (${req.user.id}, ${amount}, 'success', ${JSON.stringify(accounts)}::jsonb)
    `;

    res.json({ success: true, accounts });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error', detail: e.message });
  }
});

module.exports = router;