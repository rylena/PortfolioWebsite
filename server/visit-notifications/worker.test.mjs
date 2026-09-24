import test from 'node:test';
import assert from 'node:assert/strict';
import { handleVisit } from './worker.mjs';

const origin = 'https://rylenanil.com';
function request(body = { path: '/blog.html' }, overrides = {}) {
    return new Request('https://relay.example/visit', {
        method: 'POST',
        headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1' },
        body: JSON.stringify(body),
        ...overrides,
    });
}
function setup() {
    const sent = [];
    const counts = new Map();
    const env = {
        DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/123456/test-secret',
        VISITOR_LIMIT: { limit: async () => ({ success: true }) },
        CHANNEL_LIMIT: { limit: async () => ({ success: true }) },
        VISIT_COUNTS: {
            idFromName: ip => ip,
            get: ip => ({ fetch: async () => {
                const count = (counts.get(ip) || 0) + 1;
                counts.set(ip, count);
                return Response.json({ count });
            } }),
        },
    };
    const send = async (url, options) => {
        sent.push({ url, ...options });
        return new Response('{}');
    };
    return { env, send, sent, counts };
}

test('sends a fixed message with Cloudflare-observed IP, ignores client-supplied IP, and waits for Discord', async () => {
    const { env, send, sent } = setup();
    const response = await handleVisit(request({ path: '/blog.html', content: '@everyone', ip: 'ignored' }), env, send);
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
    assert.equal(new URL(sent[0].url).searchParams.get('wait'), 'true');
    assert.equal(sent[0].redirect, 'manual');
    const payload = JSON.parse(sent[0].body);
    assert.deepEqual(payload.allowed_mentions, { parse: [] });
    assert.equal(payload.embeds[0].url, `${origin}/blog.html`);
    assert.equal(payload.embeds[0].description, 'Blog');
    assert.ok(!sent[0].body.includes('@everyone'));
    const fields = Object.fromEntries(payload.embeds[0].fields.map(field => [field.name, field.value]));
    assert.equal(fields['Visitor public IP'], '192.0.2.1');
    assert.equal(fields['Page URL'], `${origin}/blog.html`);
    assert.equal(fields['Approximate IP location'], 'Unavailable');
    assert.equal(fields['Previous recorded visits from this IP'], '0');
    assert.equal(fields['Visit number for this IP'], '1');
    assert.ok(!sent[0].body.includes('ignored'));
    assert.equal(await response.text(), '');
});

test('preflight requires a production origin and never sends a message', async () => {
    const { env, send, sent } = setup();
    assert.equal((await handleVisit(request(null, { method: 'OPTIONS', body: undefined }), env, send)).status, 204);
    for (const badOrigin of ['https://example.com', 'https://rylenanil.com.attacker.example', 'null', '']) {
        const req = request();
        req.headers.set('Origin', badOrigin);
        assert.equal((await handleVisit(req, env, send)).status, 403);
    }
    assert.equal(sent.length, 0);
});

test('rejects unknown paths, query strings, malformed and oversized input', async () => {
    const { env, send, sent } = setup();
    for (const body of [null, {}, { path: '/missing' }, { path: '/?token=private' }, { path: 'https://example.com' }, { path: '/blog.html', large: 'x'.repeat(600) }]) {
        assert.equal((await handleVisit(request(body), env, send)).status, 400);
    }
    assert.equal((await handleVisit(request(null, { body: '{' }), env, send)).status, 400);
    assert.equal(sent.length, 0);
});

test('fails closed without secret or rate limit bindings', async () => {
    for (const missing of ['DISCORD_WEBHOOK_URL', 'VISITOR_LIMIT', 'CHANNEL_LIMIT', 'VISIT_COUNTS']) {
        const { env, send, sent } = setup();
        delete env[missing];
        assert.equal((await handleVisit(request(), env, send)).status, 503);
        assert.equal(sent.length, 0);
    }
    for (const invalid of ['http://discord.com/api/webhooks/123/token', 'https://evil.example/api/webhooks/123/token', 'https://discord.com/api/users/@me']) {
        const { env, send, sent } = setup();
        env.DISCORD_WEBHOOK_URL = invalid;
        assert.equal((await handleVisit(request(), env, send)).status, 503);
        assert.equal(sent.length, 0);
    }
});

test('uses trusted geolocation and maintains separate counts per IP across pages', async () => {
    const { env, send, sent, counts } = setup();
    const first = request({ path: '/blog.html', city: 'Untrusted city', count: 999 });
    Object.defineProperty(first, 'cf', { value: { city: 'Dubai', region: 'Dubai', country: 'AE' } });
    assert.equal((await handleVisit(first, env, send)).status, 204);
    assert.equal((await handleVisit(request({ path: '/' }), env, send)).status, 204);
    const other = request();
    other.headers.set('CF-Connecting-IP', '2001:db8::1');
    assert.equal((await handleVisit(other, env, send)).status, 204);
    const fields = sent.map(message => Object.fromEntries(JSON.parse(message.body).embeds[0].fields.map(f => [f.name, f.value])));
    assert.equal(fields[0]['Approximate IP location'], 'Dubai, United Arab Emirates');
    assert.equal(fields[1]['Previous recorded visits from this IP'], '1');
    assert.equal(fields[1]['Visit number for this IP'], '2');
    assert.equal(fields[2]['Previous recorded visits from this IP'], '0');
    assert.deepEqual([...counts.values()], [2, 1]);
    assert.ok(!JSON.stringify(sent).includes('Untrusted city'));
});

test('invalid and rate-limited requests do not increment counts', async () => {
    const { env, send, counts } = setup();
    await handleVisit(request({ path: '/missing' }), env, send);
    env.CHANNEL_LIMIT.limit = async () => ({ success: false });
    await handleVisit(request(), env, send);
    assert.equal(counts.size, 0);
});

test('counter failure does not send a made-up count', async () => {
    const { env, send, sent } = setup();
    env.VISIT_COUNTS.get = () => ({ fetch: async () => { throw new Error('storage unavailable'); } });
    assert.equal((await handleVisit(request(), env, send)).status, 502);
    assert.equal(sent.length, 0);
});

test('both rate limits block delivery', async () => {
    for (const limiter of ['VISITOR_LIMIT', 'CHANNEL_LIMIT']) {
        const { env, send, sent } = setup();
        env[limiter].limit = async () => ({ success: false });
        assert.equal((await handleVisit(request(), env, send)).status, 429);
        assert.equal(sent.length, 0);
    }
});

test('upstream failures never expose the webhook or response body', async () => {
    const { env } = setup();
    for (const send of [async () => new Response(null, { status: 302, headers: { Location: 'https://example.com' } }), async () => new Response('sensitive upstream details', { status: 429 }), async () => { throw new Error(env.DISCORD_WEBHOOK_URL); }]) {
        const response = await handleVisit(request(), env, send);
        assert.equal(response.status, 502);
        assert.equal(await response.text(), '');
    }
});
