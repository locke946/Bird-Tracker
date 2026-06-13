import { kv } from '@vercel/kv';

const KEY = 'uk-bird-sightings';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    // ── GET: return all shared sightings ──
    if (req.method === 'GET') {
      const data = (await kv.get(KEY)) || {};
      return res.status(200).json(data);
    }

    // ── POST: add or update one sighting ──
    if (req.method === 'POST') {
      const { wiki, sighting } = req.body;
      if (!wiki || !sighting) return res.status(400).json({ error: 'wiki and sighting required' });
      const data = (await kv.get(KEY)) || {};
      data[wiki] = sighting;
      await kv.set(KEY, data);
      return res.status(200).json({ ok: true });
    }

    // ── DELETE: remove one sighting ──
    if (req.method === 'DELETE') {
      const { wiki } = req.body;
      if (!wiki) return res.status(400).json({ error: 'wiki required' });
      const data = (await kv.get(KEY)) || {};
      delete data[wiki];
      await kv.set(KEY, data);
      return res.status(200).json({ ok: true });
    }

    // ── PATCH: wipe all sightings ──
    if (req.method === 'PATCH') {
      await kv.set(KEY, {});
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
