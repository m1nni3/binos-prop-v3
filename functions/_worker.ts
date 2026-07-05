interface Env {
  ASSETS: Fetcher;
  PORTALS_DB: D1Database;
  PORTALS_ENCRYPTION_KEY?: string;
}

const DEFAULT_PORTALS = [
  { type: 'Banking', name: 'FNB Business', username: 'mp@binos.co.za', password: '', url: 'https://www.fnb.co.za' },
  { type: 'Banking', name: 'Standard Bank', username: 'mp@binos.co.za', password: '', url: 'https://www.standardbank.co.za' },
  { type: 'Insurance', name: 'Santam', username: 'mp@binos.co.za', password: '', url: 'https://www.santam.co.za' },
  { type: 'Municipal', name: 'Joburg Connect', username: 'mp@binos.co.za', password: '', url: 'https://connect.joburg.org.za' },
  { type: 'Utility', name: 'City Power', username: 'mp@binos.co.za', password: '', url: 'https://www.citypower.co.za' },
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await env.PORTALS_DB.exec(`CREATE TABLE IF NOT EXISTS portals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      password_enc TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`);

    const pathParts = url.pathname.split('/').filter(Boolean);
    const id = pathParts.length >= 3 && pathParts[pathParts.length - 1] !== 'portals'
      ? Number(pathParts[pathParts.length - 1])
      : null;

    if (pathParts[1] !== 'portals') {
      return new Response('Not found', { status: 404, headers: corsHeaders });
    }

    switch (request.method) {
      case 'GET': {
        if (id) {
          const portal = await env.PORTALS_DB.prepare('SELECT * FROM portals WHERE id = ?').bind(id).first<any>();
          if (!portal) return new Response('Not found', { status: 404 });
          portal.password = await decryptField(portal.password_enc, env.PORTALS_ENCRYPTION_KEY);
          delete portal.password_enc;
          return Response.json(portal, { headers: corsHeaders });
        }

        let { results } = await env.PORTALS_DB.prepare('SELECT * FROM portals ORDER BY type, name').all<any>();
        if (results.length === 0) {
          for (const p of DEFAULT_PORTALS) {
            const enc = p.password ? await encrypt(p.password, env.PORTALS_ENCRYPTION_KEY!) : '';
            await env.PORTALS_DB.prepare(
              'INSERT INTO portals (type, name, username, password_enc, url) VALUES (?, ?, ?, ?, ?)'
            ).bind(p.type, p.name, p.username, enc, p.url).run();
          }
          results = await env.PORTALS_DB.prepare('SELECT * FROM portals ORDER BY type, name').all<any>();
          results = results.results;
        }

        for (const portal of results) {
          portal.password = await decryptField(portal.password_enc, env.PORTALS_ENCRYPTION_KEY);
          delete portal.password_enc;
        }

        return Response.json(results, { headers: corsHeaders });
      }

      case 'POST': {
        const body = await request.json() as any;
        const enc = body.password && env.PORTALS_ENCRYPTION_KEY
          ? await encrypt(body.password, env.PORTALS_ENCRYPTION_KEY)
          : '';
        const portal = await env.PORTALS_DB.prepare(
          'INSERT INTO portals (type, name, username, password_enc, url) VALUES (?, ?, ?, ?, ?) RETURNING *'
        ).bind(body.type, body.name, body.username, enc, body.url || '').first<any>();
        portal.password = body.password || '';
        delete portal.password_enc;
        return Response.json(portal, { status: 201, headers: corsHeaders });
      }

      case 'PUT': {
        if (!id) return new Response('Bad request', { status: 400 });
        const body = await request.json() as any;
        let enc: string | undefined;

        if (body.password !== undefined) {
          enc = body.password && env.PORTALS_ENCRYPTION_KEY
            ? await encrypt(body.password, env.PORTALS_ENCRYPTION_KEY)
            : '';
        }

        let query = 'UPDATE portals SET type = ?, name = ?, username = ?, url = ?, updated_at = datetime(\'now\')';
        const params: any[] = [body.type, body.name, body.username, body.url || ''];

        if (enc !== undefined) {
          query += ', password_enc = ?';
          params.push(enc);
        }

        query += ' WHERE id = ? RETURNING *';
        params.push(id);

        const portal = await env.PORTALS_DB.prepare(query).bind(...params).first<any>();
        if (!portal) return new Response('Not found', { status: 404 });
        portal.password = body.password ?? await decryptField(portal.password_enc, env.PORTALS_ENCRYPTION_KEY);
        delete portal.password_enc;
        return Response.json(portal, { headers: corsHeaders });
      }

      case 'DELETE': {
        if (!id) return new Response('Bad request', { status: 400 });
        const result = await env.PORTALS_DB.prepare('DELETE FROM portals WHERE id = ?').bind(id).run();
        if (result.meta.changes === 0) return new Response('Not found', { status: 404 });
        return new Response(null, { status: 204, headers: corsHeaders });
      }
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  } catch (e) {
    console.error('API Error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function decryptField(stored: string, key?: string): Promise<string> {
  if (!stored || !key) return stored;
  try {
    return await decrypt(stored, key);
  } catch {
    return stored;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function encrypt(plaintext: string, keyHex: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', hexToBytes(keyHex), { name: 'AES-GCM' }, false, ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext)
  );
  return bytesToHex(iv) + ':' + bytesToHex(new Uint8Array(ciphertext));
}

async function decrypt(stored: string, keyHex: string): Promise<string> {
  const [ivHex, ctHex] = stored.split(':');
  const key = await crypto.subtle.importKey(
    'raw', hexToBytes(keyHex), { name: 'AES-GCM' }, false, ['decrypt']
  );
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: hexToBytes(ivHex) }, key, hexToBytes(ctHex)
  );
  return new TextDecoder().decode(plaintext);
}
