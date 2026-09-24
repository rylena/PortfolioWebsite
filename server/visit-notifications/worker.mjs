const origins = new Set(['https://rylenanil.com', 'https://www.rylenanil.com']);
const pages = new Map([
    ['/', 'Portfolio'],
    ['/index.html', 'Portfolio'],
    ['/blog.html', 'Blog'],
    ['/posts/hacking-gisec-before-speaking.html', 'Hacking GISEC Before Speaking at GISEC'],
    ['/posts/hacking-gisec-before-speaking-at-gisec.html', 'Hacking GISEC Before Speaking at GISEC'],
    ['/posts/jee-advanced-2026-cloud-storage-disclosure.html', 'JEE Advanced disclosure'],
]);
const maxBodyBytes = 512;

// Each IP gets one private Durable Object. A single SQL statement makes increments
// atomic, including concurrent visits reaching different Cloudflare locations.
export class VisitCounter {
    constructor(ctx) {
        this.sql = ctx.storage.sql;
        this.sql.exec('CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY CHECK (id = 1), count INTEGER NOT NULL)');
    }

    async fetch(request) {
        if (request.method !== 'POST') return new Response(null, { status: 405 });
        const { count } = this.sql.exec(`
            INSERT INTO visits (id, count) VALUES (1, 1)
            ON CONFLICT (id) DO UPDATE SET count = count + 1
            RETURNING count
        `).one();
        return Response.json({ count });
    }
}

function approximateLocation(cf = {}) {
    let country = cf.country;
    if (country && /^[A-Z]{2}$/.test(country)) {
        try { country = new Intl.DisplayNames(['en'], { type: 'region' }).of(country); } catch { /* Use country code. */ }
    }
    return [...new Set([cf.city, cf.region, country].filter(value => typeof value === 'string' && value.trim()))]
        .join(', ').slice(0, 250) || 'Unavailable';
}

async function readBody(request) {
    if (!request.body) throw new Error('Missing body');
    const reader = request.body.getReader();
    const chunks = [];
    let size = 0;
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > maxBodyBytes) {
                await reader.cancel();
                throw new Error('Body too large');
            }
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder().decode(body));
}

export async function handleVisit(request, env, send = fetch) {
    if (new URL(request.url).pathname !== '/visit') return new Response(null, { status: 404 });
    const origin = request.headers.get('Origin');
    if (!origins.has(origin)) return new Response(null, { status: 403 });

    const headers = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Cache-Control': 'no-store',
        Vary: 'Origin',
    };
    const reply = status => new Response(null, { status, headers });
    if (request.method === 'OPTIONS') return reply(204);
    if (request.method !== 'POST') return reply(405);
    if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return reply(415);
    const ip = request.headers.get('CF-Connecting-IP');
    if (!ip) return reply(400);

    // Fail closed if the secret or abuse-control bindings are missing.
    let webhook;
    try {
        webhook = new URL(env.DISCORD_WEBHOOK_URL);
        if (webhook.protocol !== 'https:' || webhook.hostname !== 'discord.com' ||
            webhook.port || webhook.username || webhook.password ||
            !/^\/api\/webhooks\/\d+\/[\w-]+$/.test(webhook.pathname)) return reply(503);
        if (!env.VISITOR_LIMIT || !env.CHANNEL_LIMIT || !env.VISIT_COUNTS) return reply(503);
        webhook.searchParams.set('wait', 'true');
    } catch { return reply(503); }

    let stage = 'visitor rate limit';
    try {
        const visitor = await env.VISITOR_LIMIT.limit({ key: ip });
        if (!visitor.success) return reply(429);

        let body;
        try { body = await readBody(request); } catch { return reply(400); }
        if (!body || !pages.has(body.path)) return reply(400);

        stage = 'channel rate limit';
        const channel = await env.CHANNEL_LIMIT.limit({ key: 'discord-channel' });
        if (!channel.success) return reply(429);

        stage = 'visit counter';
        const counter = env.VISIT_COUNTS.get(env.VISIT_COUNTS.idFromName(ip));
        const counted = await counter.fetch('https://counter/increment', { method: 'POST' });
        if (!counted.ok) throw new Error('Counter unavailable');
        const { count } = await counted.json();
        if (!Number.isSafeInteger(count) || count < 1) throw new Error('Invalid counter');

        stage = 'Discord delivery';
        const response = await send(webhook.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            redirect: 'manual',
            signal: AbortSignal.timeout(5000),
            body: JSON.stringify({
                allowed_mentions: { parse: [] },
                embeds: [{
                    title: 'New website visit',
                    description: pages.get(body.path),
                    url: `https://rylenanil.com${body.path}`,
                    fields: [
                        { name: 'Page URL', value: `https://rylenanil.com${body.path}` },
                        { name: 'Visitor public IP', value: ip, inline: true },
                        { name: 'Approximate IP location', value: approximateLocation(request.cf), inline: true },
                        { name: 'Previous recorded visits from this IP', value: String(count - 1), inline: true },
                        { name: 'Visit number for this IP', value: String(count), inline: true },
                    ],
                    footer: { text: 'Counts start September 24, 2026. Shared IPs combine visitors; VPNs affect location.' },
                    color: 0x64ffda,
                    timestamp: new Date().toISOString(),
                }],
            }),
        });
        // Never forward Discord's response body or log its secret URL.
        await response.body?.cancel();
        if (!response.ok) console.warn('Notification delivery HTTP status:', response.status);
        return reply(response.ok ? 204 : 502);
    } catch {
        console.warn('Notification failed at:', stage);
        return reply(502);
    }
}

export default { fetch: (request, env) => handleVisit(request, env) };
