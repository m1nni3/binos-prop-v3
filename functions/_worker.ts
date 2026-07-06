interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
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

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  try {
    await initSchema(env);

    const pathParts = url.pathname.split('/').filter(Boolean);
    const resource = pathParts[1];
    const id = pathParts.length >= 3 ? Number(pathParts[pathParts.length - 1]) : null;

    switch (resource) {
      case 'portals':
        return handlePortals(request, env, id);
      case 'properties':
        return handleProperties(request, env, id);
      case 'contacts':
        return handleContacts(request, env, id);
      case 'pl':
        return handlePL(request, env, id);
      case 'pl-monthly':
        return handlePLMonthly(request, env, id);
      case 'pl-entries':
        return handlePLEntries(request, env, id);
      case 'maintenance':
        return handleMaintenance(request, env, id);
      case 'tasks':
        return handleTasks(request, env, id);
      case 'tenants':
        return handleTenants(request, env, id);
      case 'activity':
        return handleActivity(request, env, id);
      case 'petty-cash':
        return handlePettyCash(request, env, pathParts[2], id);
      case 'dashboard':
        return handleDashboard(request, env);
      default:
        return json({ error: 'Not found' }, 404);
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}

async function initSchema(env: Env) {
  await env.DB.exec(`CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheme_name TEXT NOT NULL,
    scheme TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    type TEXT NOT NULL DEFAULT 'Residential',
    purchase_price REAL NOT NULL DEFAULT 0,
    purchase_date TEXT,
    value REAL NOT NULL DEFAULT 0,
    rental_income REAL NOT NULL DEFAULT 0,
    expenses REAL NOT NULL DEFAULT 0,
    profit_margin REAL NOT NULL DEFAULT 0,
    size REAL NOT NULL DEFAULT 0,
    beds INTEGER NOT NULL DEFAULT 0,
    baths INTEGER NOT NULL DEFAULT 0,
    last_maintenance_date TEXT,
    next_maintenance_due TEXT,
    maintenance_budget REAL NOT NULL DEFAULT 0,
    image TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  await env.DB.exec(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    office TEXT,
    phone TEXT,
    office_number TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    category TEXT,
    notes TEXT,
    property_id INTEGER,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  await env.DB.exec(`CREATE TABLE IF NOT EXISTS pl (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id TEXT NOT NULL DEFAULT 'all',
    category TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    last_updated TEXT DEFAULT (datetime('now'))
  )`);

  await env.DB.exec(`CREATE TABLE IF NOT EXISTS pl_monthly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id TEXT NOT NULL DEFAULT 'all',
    category TEXT NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    income REAL NOT NULL DEFAULT 0,
    expenses REAL NOT NULL DEFAULT 0,
    amount REAL NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await env.DB.exec(`CREATE TABLE IF NOT EXISTS pl_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL DEFAULT 0,
    property_id TEXT,
    deducted_expenses INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await env.DB.exec(`CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    property_id TEXT,
    date TEXT,
    location TEXT,
    description TEXT,
    technician TEXT,
    cost REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await env.DB.exec(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await env.DB.exec(`CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    property_id TEXT,
    lease_start TEXT,
    lease_end TEXT,
    lease_file TEXT,
    notes TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await env.DB.exec(`CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_label TEXT,
    actor TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await env.DB.exec(`CREATE TABLE IF NOT EXISTS petty_cash (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    description TEXT,
    property_id TEXT,
    date TEXT,
    category TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

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
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

async function getBody(request: Request) {
  return request.json().catch(() => ({}));
}

/* ============= PORTALS ============= */
async function handlePortals(request: Request, env: Env, id: number | null) {
  switch (request.method) {
    case 'GET': {
      if (id) {
        const portal = await env.PORTALS_DB.prepare('SELECT * FROM portals WHERE id = ?').bind(id).first<any>();
        if (!portal) return json({ error: 'Not found' }, 404);
        portal.password = await decryptField(portal.password_enc, env.PORTALS_ENCRYPTION_KEY);
        delete portal.password_enc;
        return json(portal);
      }
      let { results } = await env.PORTALS_DB.prepare('SELECT * FROM portals ORDER BY type, name').all<any>();
      if (results.length === 0) {
        for (const p of DEFAULT_PORTALS) {
          const enc = p.password ? await encrypt(p.password, env.PORTALS_ENCRYPTION_KEY!) : '';
          await env.PORTALS_DB.prepare('INSERT INTO portals (type, name, username, password_enc, url) VALUES (?, ?, ?, ?, ?)').bind(p.type, p.name, p.username, enc, p.url).run();
        }
        results = (await env.PORTALS_DB.prepare('SELECT * FROM portals ORDER BY type, name').all<any>()).results;
      }
      for (const portal of results) {
        portal.password = await decryptField(portal.password_enc, env.PORTALS_ENCRYPTION_KEY);
        delete portal.password_enc;
      }
      return json(results);
    }
    case 'POST': {
      const body = await getBody(request);
      const enc = body.password && env.PORTALS_ENCRYPTION_KEY ? await encrypt(body.password, env.PORTALS_ENCRYPTION_KEY) : '';
      const portal = await env.PORTALS_DB.prepare('INSERT INTO portals (type, name, username, password_enc, url) VALUES (?, ?, ?, ?, ?) RETURNING *').bind(body.type, body.name, body.username, enc, body.url || '').first<any>();
      portal.password = body.password || '';
      delete portal.password_enc;
      return json(portal, 201);
    }
    case 'PUT': {
      if (!id) return json({ error: 'Bad request' }, 400);
      const body = await getBody(request);
      let enc: string | undefined;
      if (body.password !== undefined) {
        enc = body.password && env.PORTALS_ENCRYPTION_KEY ? await encrypt(body.password, env.PORTALS_ENCRYPTION_KEY) : '';
      }
      let query = 'UPDATE portals SET type = ?, name = ?, username = ?, url = ?, updated_at = datetime(\'now\')';
      const params: any[] = [body.type, body.name, body.username, body.url || ''];
      if (enc !== undefined) { query += ', password_enc = ?'; params.push(enc); }
      query += ' WHERE id = ? RETURNING *';
      params.push(id);
      const portal = await env.PORTALS_DB.prepare(query).bind(...params).first<any>();
      if (!portal) return json({ error: 'Not found' }, 404);
      portal.password = body.password ?? await decryptField(portal.password_enc, env.PORTALS_ENCRYPTION_KEY);
      delete portal.password_enc;
      return json(portal);
    }
    case 'DELETE': {
      if (!id) return json({ error: 'Bad request' }, 400);
      await env.PORTALS_DB.prepare('DELETE FROM portals WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204, headers: CORS });
    }
  }
  return json({ error: 'Method not allowed' }, 405);
}

/* ============= PROPERTIES ============= */
async function handleProperties(request: Request, env: Env, id: number | null) {
  switch (request.method) {
    case 'GET': {
      if (id) {
        const prop = await env.DB.prepare('SELECT * FROM properties WHERE id = ? AND active = 1').bind(id).first<any>();
        if (!prop) return json({ error: 'Not found' }, 404);
        const contacts = await env.DB.prepare('SELECT * FROM contacts WHERE property_id = ? AND active = 1').bind(id).all<any>();
        return json({ ...prop, contacts: contacts.results || [] });
      }
      const { results } = await env.DB.prepare('SELECT * FROM properties WHERE active = 1 ORDER BY scheme_name').all<any>();
      return json(results || []);
    }
    case 'POST': {
      const body = await getBody(request);
      const keys = Object.keys(body).filter(k => k !== 'id');
      const cols = keys.join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const result = await env.DB.prepare(`INSERT INTO properties (${cols}) VALUES (${placeholders})`).bind(...keys.map(k => body[k])).run();
      return json({ id: result.meta.last_row_id, ...body }, 201);
    }
    case 'PUT': {
      if (!id) return json({ error: 'Bad request' }, 400);
      const body = await getBody(request);
      if (body.active === false) {
        await env.DB.prepare('UPDATE properties SET active = 0, updated_at = datetime(\'now\') WHERE id = ?').bind(id).run();
        return json({ success: true });
      }
      const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'property_id');
      const sets = keys.map(k => `${k} = ?`).join(', ');
      const result = await env.DB.prepare(`UPDATE properties SET ${sets}, updated_at = datetime('now') WHERE id = ?`).bind(...keys.map(k => body[k]), id).run();
      return json({ success: true, changes: result.meta.changes });
    }
  }
  return json({ error: 'Method not allowed' }, 405);
}

/* ============= CONTACTS ============= */
async function handleContacts(request: Request, env: Env, id: number | null) {
  switch (request.method) {
    case 'GET': {
      if (id) {
        const contact = await env.DB.prepare('SELECT * FROM contacts WHERE id = ? AND active = 1').bind(id).first<any>();
        if (!contact) return json({ error: 'Not found' }, 404);
        return json(contact);
      }
      const { results } = await env.DB.prepare('SELECT * FROM contacts WHERE active = 1 ORDER BY name').all<any>();
      return json(results || []);
    }
    case 'POST': {
      const body = await getBody(request);
      const keys = Object.keys(body).filter(k => k !== 'id');
      const cols = keys.join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const result = await env.DB.prepare(`INSERT INTO contacts (${cols}) VALUES (${placeholders})`).bind(...keys.map(k => body[k])).run();
      return json({ id: result.meta.last_row_id, ...body }, 201);
    }
    case 'PUT': {
      if (!id) return json({ error: 'Bad request' }, 400);
      const body = await getBody(request);
      const keys = Object.keys(body).filter(k => k !== 'id');
      const sets = keys.map(k => `${k} = ?`).join(', ');
      const result = await env.DB.prepare(`UPDATE contacts SET ${sets}, updated_at = datetime('now') WHERE id = ?`).bind(...keys.map(k => body[k]), id).run();
      return json({ success: true, changes: result.meta.changes });
    }
    case 'DELETE': {
      if (!id) return json({ error: 'Bad request' }, 400);
      await env.DB.prepare('UPDATE contacts SET active = 0, updated_at = datetime(\'now\') WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204, headers: CORS });
    }
  }
  return json({ error: 'Method not allowed' }, 405);
}

/* ============= P&L (BUDGETS) ============= */
async function handlePL(request: Request, env: Env, id: number | null) {
  switch (request.method) {
    case 'GET': {
      const { results } = await env.DB.prepare('SELECT * FROM pl ORDER BY category').all<any>();
      return json(results || []);
    }
    case 'PUT': {
      const body = await getBody(request);
      if (!body.id) return json({ error: 'Bad request' }, 400);
      await env.DB.prepare('UPDATE pl SET amount = ?, last_updated = datetime(\'now\') WHERE id = ?').bind(body.amount, body.id).run();
      return json({ success: true });
    }
    case 'POST': {
      const body = await getBody(request);
      const result = await env.DB.prepare('INSERT INTO pl (property_id, category, amount) VALUES (?, ?, ?)').bind(body.property_id || 'all', body.category, body.amount).run();
      return json({ id: result.meta.last_row_id, ...body }, 201);
    }
  }
  return json({ error: 'Method not allowed' }, 405);
}

async function handlePLMonthly(request: Request, env: Env, id: number | null) {
  switch (request.method) {
    case 'GET': {
      const { results } = await env.DB.prepare('SELECT * FROM pl_monthly ORDER BY year, month').all<any>();
      return json(results || []);
    }
    case 'PUT': {
      const body = await getBody(request);
      if (!body.id) return json({ error: 'Bad request' }, 400);
      await env.DB.prepare('UPDATE pl_monthly SET amount = ? WHERE id = ?').bind(body.amount, body.id).run();
      return json({ success: true });
    }
  }
  return json({ error: 'Method not allowed' }, 405);
}

async function handlePLEntries(request: Request, env: Env, id: number | null) {
  switch (request.method) {
    case 'GET': {
      const { results } = await env.DB.prepare('SELECT * FROM pl_entries ORDER BY date DESC').all<any>();
      return json(results || []);
    }
    case 'POST': {
      const body = await getBody(request);
      const result = await env.DB.prepare('INSERT INTO pl_entries (date, category, description, amount, property_id, deducted_expenses) VALUES (?, ?, ?, ?, ?, ?)').bind(body.date, body.category, body.description, body.amount, body.property_id, body.deducted_expenses ? 1 : 0).run();
      return json({ id: result.meta.last_row_id, ...body }, 201);
    }
    case 'PUT': {
      const body = await getBody(request);
      if (!body.id) return json({ error: 'Bad request' }, 400);
      await env.DB.prepare('UPDATE pl_entries SET amount = ? WHERE id = ?').bind(body.amount, body.id).run();
      return json({ success: true });
    }
  }
  return json({ error: 'Method not allowed' }, 405);
}

/* ============= MAINTENANCE ============= */
async function handleMaintenance(request: Request, env: Env, id: number | null) {
  switch (request.method) {
    case 'GET': {
      const { results } = await env.DB.prepare('SELECT * FROM maintenance WHERE active = 1 ORDER BY date DESC').all<any>();
      return json(results || []);
    }
    case 'POST': {
      const body = await getBody(request);
      const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'images' && k !== 'reports' && k !== 'invoices');
      const cols = keys.join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const result = await env.DB.prepare(`INSERT INTO maintenance (${cols}) VALUES (${placeholders})`).bind(...keys.map(k => body[k])).run();
      return json({ id: result.meta.last_row_id, ...body }, 201);
    }
    case 'PUT': {
      const body = await getBody(request);
      if (body.active === false) {
        await env.DB.prepare('UPDATE maintenance SET active = 0 WHERE id = ?').bind(id).run();
        return json({ success: true });
      }
      if (!id) return json({ error: 'Bad request' }, 400);
      const keys = Object.keys(body).filter(k => k !== 'id');
      const sets = keys.map(k => `${k} = ?`).join(', ');
      await env.DB.prepare(`UPDATE maintenance SET ${sets} WHERE id = ?`).bind(...keys.map(k => body[k]), id).run();
      return json({ success: true });
    }
  }
  return json({ error: 'Method not allowed' }, 405);
}

/* ============= TASKS ============= */
async function handleTasks(request: Request, env: Env, id: number | null) {
  switch (request.method) {
    case 'GET': {
      const { results } = await env.DB.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all<any>();
      return json(results || []);
    }
    case 'POST': {
      const body = await getBody(request);
      const result = await env.DB.prepare('INSERT INTO tasks (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)').bind(body.title, body.description || '', body.status || 'pending', body.priority || 'medium', body.due_date || null).run();
      return json({ id: result.meta.last_row_id, ...body }, 201);
    }
    case 'PUT': {
      if (!id) return json({ error: 'Bad request' }, 400);
      const body = await getBody(request);
      const keys = Object.keys(body).filter(k => k !== 'id');
      const sets = keys.map(k => `${k} = ?`).join(', ');
      await env.DB.prepare(`UPDATE tasks SET ${sets} WHERE id = ?`).bind(...keys.map(k => body[k]), id).run();
      return json({ success: true });
    }
    case 'DELETE': {
      if (!id) return json({ error: 'Bad request' }, 400);
      await env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204, headers: CORS });
    }
  }
  return json({ error: 'Method not allowed' }, 405);
}

/* ============= TENANTS ============= */
async function handleTenants(request: Request, env: Env, id: number | null) {
  switch (request.method) {
    case 'GET': {
      if (id) {
        const tenant = await env.DB.prepare('SELECT * FROM tenants WHERE id = ? AND active = 1').bind(id).first<any>();
        if (!tenant) return json({ error: 'Not found' }, 404);
        return json(tenant);
      }
      const { results } = await env.DB.prepare('SELECT * FROM tenants WHERE active = 1 ORDER BY name').all<any>();
      return json(results || []);
    }
    case 'POST': {
      const body = await getBody(request);
      const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'inspection_reports' && k !== 'inspection_images');
      const cols = keys.join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const result = await env.DB.prepare(`INSERT INTO tenants (${cols}) VALUES (${placeholders})`).bind(...keys.map(k => body[k])).run();
      return json({ id: result.meta.last_row_id, ...body }, 201);
    }
    case 'PUT': {
      if (!id) return json({ error: 'Bad request' }, 400);
      const body = await getBody(request);
      if (body.active === false) {
        await env.DB.prepare('UPDATE tenants SET active = 0 WHERE id = ?').bind(id).run();
        return json({ success: true });
      }
      const keys = Object.keys(body).filter(k => k !== 'id');
      const sets = keys.map(k => `${k} = ?`).join(', ');
      await env.DB.prepare(`UPDATE tenants SET ${sets} WHERE id = ?`).bind(...keys.map(k => body[k]), id).run();
      return json({ success: true });
    }
  }
  return json({ error: 'Method not allowed' }, 405);
}

/* ============= ACTIVITY ============= */
async function handleActivity(request: Request, env: Env, id: number | null) {
  switch (request.method) {
    case 'GET': {
      const { results } = await env.DB.prepare('SELECT * FROM activity ORDER BY created_at DESC LIMIT 100').all<any>();
      return json(results || []);
    }
    case 'POST': {
      const body = await getBody(request);
      const result = await env.DB.prepare('INSERT INTO activity (action, entity_type, entity_label, actor) VALUES (?, ?, ?, ?)').bind(body.action, body.entity_type, body.entity_label, body.actor).run();
      return json({ id: result.meta.last_row_id, ...body }, 201);
    }
    case 'DELETE': {
      await env.DB.prepare('DELETE FROM activity').run();
      return new Response(null, { status: 204, headers: CORS });
    }
  }
  return json({ error: 'Method not allowed' }, 405);
}

/* ============= PETTY CASH ============= */
async function handlePettyCash(request: Request, env: Env, subType: string, id: number | null) {
  switch (request.method) {
    case 'GET': {
      const type = subType === 'income' ? 'income' : subType === 'expenses' ? 'expense' : null;
      if (!type) return json({ error: 'Not found' }, 404);
      const { results } = await env.DB.prepare('SELECT * FROM petty_cash WHERE type = ? AND active = 1 ORDER BY date DESC').bind(type).all<any>();
      return json(results || []);
    }
    case 'POST': {
      const body = await getBody(request);
      const type = subType === 'income' ? 'income' : subType === 'expenses' ? 'expense' : null;
      if (!type) return json({ error: 'Bad request' }, 400);
      const result = await env.DB.prepare('INSERT INTO petty_cash (type, amount, description, property_id, date, category) VALUES (?, ?, ?, ?, ?, ?)').bind(type, body.amount, body.description, body.property_id, body.date, body.category || '').run();
      return json({ id: result.meta.last_row_id, ...body }, 201);
    }
    case 'DELETE': {
      if (!id) return json({ error: 'Bad request' }, 400);
      await env.DB.prepare('UPDATE petty_cash SET active = 0 WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204, headers: CORS });
    }
  }
  return json({ error: 'Method not allowed' }, 405);
}

/* ============= DASHBOARD ============= */
async function handleDashboard(request: Request, env: Env) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const totalProperties = await env.DB.prepare("SELECT COUNT(*) as count FROM properties WHERE active = 1").first<any>();
  const totalContacts = await env.DB.prepare("SELECT COUNT(*) as count FROM contacts WHERE active = 1").first<any>();
  const totalMaintenance = await env.DB.prepare("SELECT COUNT(*) as count FROM maintenance WHERE active = 1").first<any>();
  const totalTenants = await env.DB.prepare("SELECT COUNT(*) as count FROM tenants WHERE active = 1").first<any>();
  return json({
    totalProperties: totalProperties?.count || 0,
    totalContacts: totalContacts?.count || 0,
    totalMaintenance: totalMaintenance?.count || 0,
    totalTenants: totalTenants?.count || 0,
  });
}

/* ============= ENCRYPTION HELPERS ============= */
async function decryptField(stored: string, key?: string): Promise<string> {
  if (!stored || !key) return stored;
  try { return await decrypt(stored, key); } catch { return stored; }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) { bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16); }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function encrypt(plaintext: string, keyHex: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', hexToBytes(keyHex), { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));
  return bytesToHex(iv) + ':' + bytesToHex(new Uint8Array(ciphertext));
}

async function decrypt(stored: string, keyHex: string): Promise<string> {
  const [ivHex, ctHex] = stored.split(':');
  const key = await crypto.subtle.importKey('raw', hexToBytes(keyHex), { name: 'AES-GCM' }, false, ['decrypt']);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: hexToBytes(ivHex) }, key, hexToBytes(ctHex));
  return new TextDecoder().decode(plaintext);
}