/**
 * NextoraSMP — Order & Leaderboard Backend (Cloudflare Worker)
 * ---------------------------------------------------------------
 * Kenapa ini perlu ada?
 * Sebelumnya, Discord Webhook URL ditulis LANGSUNG di script.js yang
 * berjalan di browser pembeli. Itu artinya siapa pun yang buka
 * "View Page Source" bisa mengambil webhook itu dan:
 *   - mengirim pesan spam/palsu ke channel staff kamu,
 *   - membuat "order" palsu yang terlihat seperti order asli.
 *
 * Worker ini jadi perantara: browser -> Worker -> Discord.
 * Webhook URL disimpan sebagai SECRET di Cloudflare, tidak pernah
 * dikirim ke browser pembeli.
 *
 * ================= CARA DEPLOY (gratis, ~10 menit) =================
 * 1. Install wrangler:      npm install -g wrangler
 * 2. Login:                 wrangler login
 * 3. Di folder ini, jalankan:
 *      wrangler kv namespace create ORDERS
 *      wrangler kv namespace create LEADERBOARD
 *    lalu tempel id yang muncul ke wrangler.toml.
 * 4. Set secret webhook (JANGAN taruh di kode/file, hanya lewat CLI ini):
 *      wrangler secret put DISCORD_WEBHOOK_URL
 *      wrangler secret put ADMIN_TOKEN     // token acak buatanmu sendiri, buat push leaderboard
 * 5. Deploy:
 *      wrangler deploy
 * 6. Wrangler akan kasih URL seperti:
 *      https://nextorasmp-api.<subdomainmu>.workers.dev
 *    Tempel URL itu ke CONFIG.orderApiUrl & CONFIG.leaderboardApiUrl
 *    di script.js (situs utama kamu).
 * ======================================================================
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    try {
      if (url.pathname === '/api/order' && request.method === 'POST') {
        return await handleOrder(request, env, cors);
      }
      if (url.pathname === '/api/leaderboard' && request.method === 'GET') {
        return await handleGetLeaderboard(env, cors);
      }
      if (url.pathname === '/api/leaderboard' && request.method === 'POST') {
        return await handleSetLeaderboard(request, env, cors);
      }
      return json({ error: 'not found' }, 404, cors);
    } catch (err) {
      return json({ error: 'internal error', detail: String(err) }, 500, cors);
    }
  },
};

// ---------------- ORDER ----------------
async function handleOrder(request, env, cors) {
  let order;
  try {
    order = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400, cors);
  }

  const required = ['id', 'itemName', 'price', 'uniqueCode', 'totalWithCode', 'method', 'platform', 'nickname', 'time'];
  for (const k of required) {
    if (!(k in order)) return json({ error: 'missing field: ' + k }, 400, cors);
  }
  if (typeof order.price !== 'number' || typeof order.totalWithCode !== 'number' || typeof order.uniqueCode !== 'number') {
    return json({ error: 'invalid amount fields' }, 400, cors);
  }
  // batasi panjang string supaya tidak disalahgunakan untuk payload raksasa
  for (const k of ['id', 'itemName', 'method', 'platform', 'nickname']) {
    if (typeof order[k] !== 'string' || order[k].length > 100) {
      return json({ error: 'invalid field: ' + k }, 400, cors);
    }
  }

  // simpan untuk audit trail / tombol "kirim ulang notifikasi"
  if (env.ORDERS) {
    await env.ORDERS.put('order:' + order.id, JSON.stringify(order), {
      expirationTtl: 60 * 60 * 24 * 30, // 30 hari
    });
  }

  const sent = await sendDiscord(order, env);
  return json({ success: sent }, sent ? 200 : 502, cors);
}

async function sendDiscord(order, env) {
  if (!env.DISCORD_WEBHOOK_URL) {
    console.warn('DISCORD_WEBHOOK_URL belum di-set (wrangler secret put DISCORD_WEBHOOK_URL)');
    return false;
  }
  const methodEmoji = order.method === 'QRIS' ? '🟦' : '📲';
  const payload = {
    username: env.WEBHOOK_USERNAME || 'NextoraSMP — Order Bot',
    avatar_url: env.WEBHOOK_AVATAR || undefined,
    content: '@here Pesanan baru masuk, mohon dicek mutasi & dikirim item-nya 👇',
    embeds: [
      {
        title: methodEmoji + ' Pesanan Baru — ' + order.id,
        description: 'Nickname: `' + order.nickname + '`',
        color: 3092790,
        fields: [
          { name: '🎁 Item', value: order.itemName, inline: true },
          { name: '💳 Metode', value: order.method, inline: true },
          { name: '🕹️ Platform', value: order.platform === 'bedrock' ? 'Bedrock' : 'Java', inline: true },
          { name: '👤 Nickname', value: order.nickname, inline: true },
          { name: '🔢 Kode Unik', value: '+' + order.uniqueCode, inline: true },
          { name: '💰 Harga Item', value: 'Rp' + order.price.toLocaleString('id-ID'), inline: true },
          { name: '✅ TOTAL WAJIB DICOCOKKAN', value: '**Rp' + order.totalWithCode.toLocaleString('id-ID') + '**', inline: false },
        ],
        footer: { text: 'NextoraSMP Store · Verifikasi manual via kode unik' },
        timestamp: order.time,
      },
    ],
  };

  try {
    const res = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok || res.status === 204;
  } catch (err) {
    console.error('Gagal kirim ke Discord:', err);
    return false;
  }
}

// ---------------- LEADERBOARD ----------------
// GET  /api/leaderboard        -> publik, dibaca oleh situs
// POST /api/leaderboard        -> hanya dengan header X-Admin-Token, dipakai
//                                  plugin/server/cron kamu untuk update data asli
const EMPTY_LB = { vote: [], donate: [], balance: [], playtime: [] };

async function handleGetLeaderboard(env, cors) {
  if (!env.LEADERBOARD) return json(EMPTY_LB, 200, cors);
  const raw = await env.LEADERBOARD.get('current');
  return json(raw ? JSON.parse(raw) : EMPTY_LB, 200, cors);
}

async function handleSetLeaderboard(request, env, cors) {
  const token = request.headers.get('X-Admin-Token');
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return json({ error: 'unauthorized' }, 401, cors);
  }
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400, cors);
  }
  for (const key of ['vote', 'donate', 'balance', 'playtime']) {
    if (!Array.isArray(data[key])) return json({ error: 'missing/invalid array: ' + key }, 400, cors);
  }
  if (!env.LEADERBOARD) return json({ error: 'KV namespace LEADERBOARD belum di-bind' }, 500, cors);
  await env.LEADERBOARD.put('current', JSON.stringify(data));
  return json({ success: true }, 200, cors);
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}