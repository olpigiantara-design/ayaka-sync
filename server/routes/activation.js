const express = require('express');
const { sql } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const AM = {
  API_KEY: process.env.AM_API_KEY,
  TOKEN: process.env.AM_TOKEN,
  FIREBASE_TOKEN: process.env.AM_FIREBASE_TOKEN,
  PRODUCT_ID: process.env.AM_PRODUCT_ID || 'am.full.sub.annual.19q4',
  HEADERS: {
    'Content-Type': 'application/json',
    'X-Android-Package': 'com.alightcreative.motion',
    'X-Android-Cert': 'ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8',
    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 15; 23127PN0CC Build/BP1A.250505.005)'
  }
};

function extractOobCode(raw) {
  if (!raw) return null;
  try {
    let s = raw.replace(/&amp;/g, '&');
    try { s = decodeURIComponent(s); } catch {}
    try {
      const u = new URL(s);
      let code = u.searchParams.get('oobCode');
      if (!code) {
        const nested = u.searchParams.get('link') || u.searchParams.get('q') || u.searchParams.get('url');
        if (nested) {
          try { code = new URL(nested).searchParams.get('oobCode'); } catch {}
        }
      }
      if (code) return code.replace(/[^a-zA-Z0-9_-]/g, '');
    } catch {}
    const m = s.match(/[?&]oobCode=([a-zA-Z0-9_-]+)/i);
    return m ? m[1] : null;
  } catch { return null; }
}

router.post('/send-link', authRequired, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Email tidak valid' });

    const [p] = await sql`SELECT * FROM user_plans WHERE user_id = ${req.user.id}`;
    if (!p) return res.status(404).json({ error: 'Plan tidak ditemukan' });
    const current = { free: p.free_limit, pro: p.pro_limit, vip: p.vip_limit };
    if (current[p.plan] <= 0) return res.status(400).json({ error: 'Limit habis' });

    const r1 = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/createAuthUri?key=${AM.API_KEY}`,
      { method: 'POST', headers: AM.HEADERS, body: JSON.stringify({ identifier: email, continueUri: 'http://localhost' }) }
    );
    if (!r1.ok) return res.status(400).json({ error: 'Google API error', detail: await r1.text() });

    const r2 = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?key=${AM.API_KEY}`,
      {
        method: 'POST', headers: AM.HEADERS,
        body: JSON.stringify({
          requestType: 6, email,
          androidInstallApp: true, canHandleCodeInApp: true,
          continueUrl: 'https://alightcreative.com?ui_sid=0366624874&ui_sd=0',
          iosBundleId: 'com.alightcreative.motion',
          androidPackageName: 'com.alightcreative.motion',
          androidMinimumVersion: '585',
          clientType: 'CLIENT_TYPE_ANDROID'
        })
      }
    );
    if (!r2.ok) return res.status(400).json({ error: 'Google API error', detail: await r2.text() });

    // Consume 1 limit
    const col = p.plan + '_limit';
    await sql.unsafe(
      `UPDATE user_plans SET ${col}=${col}-1, used_count=used_count+1, updated_at=NOW() WHERE user_id=$1`,
      [req.user.id]
    );

    res.json({ success: true, message: 'Link terkirim' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error', detail: e.message });
  }
});

router.post('/verify', authRequired, async (req, res) => {
  try {
    const { email, link, orderId } = req.body;
    if (!email || !link) return res.status(400).json({ error: 'Email & link wajib' });
    if (!link.includes('oobCode')) return res.status(400).json({ error: 'Link tidak valid (oobCode tidak ditemukan)' });

    const oobCode = extractOobCode(link);
    if (!oobCode) return res.status(400).json({ error: 'Gagal extract oobCode' });

    const r1 = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/emailLinkSignin?key=${AM.API_KEY}`,
      {
        method: 'POST', headers: AM.HEADERS,
        body: JSON.stringify({ email, oobCode, clientType: 'CLIENT_TYPE_ANDROID' })
      }
    );
    if (!r1.ok) return res.status(400).json({ error: 'Login gagal', detail: await r1.text() });
    const signin = await r1.json();

    const r2 = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${AM.API_KEY}`,
      { method: 'POST', headers: AM.HEADERS, body: JSON.stringify({ idToken: signin.idToken }) }
    );
    if (!r2.ok) return res.status(400).json({ error: 'Account info gagal', detail: await r2.text() });

    // Apply premium
    const finalOrder = orderId || ('GPA.' + Math.floor(10000 + Math.random() * 90000));
    const r3 = await fetch('https://us-central1-alight-creative.cloudfunctions.net/verifyPurchase', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer ' + signin.idToken,
        'firebase-instance-id-token': AM.FIREBASE_TOKEN,
        'content-type': 'application/json; charset=utf-8',
        'accept-encoding': 'gzip',
        'user-agent': 'okhttp/3.12.1'
      },
      body: JSON.stringify({
        data: {
          productId: AM.PRODUCT_ID,
          token: AM.TOKEN,
          skuType: 'subs',
          orderId: finalOrder
        }
      })
    });
    if (!r3.ok) return res.status(400).json({ error: 'Apply premium gagal', detail: await r3.text() });
    const premium = await r3.json();

    await sql`
      INSERT INTO activations (user_id, email, order_id, plan_at_time, status)
      VALUES (${req.user.id}, ${email}, ${finalOrder}, 'premium', 'success')
    `;

    res.json({ success: true, data: premium, orderId: finalOrder });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error', detail: e.message });
  }
});

module.exports = router;