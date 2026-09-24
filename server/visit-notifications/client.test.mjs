import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../../visit-notifications.js', import.meta.url), 'utf8');
const enabled = source.replace(/const relayUrl = '[^']*';/, "const relayUrl = 'https://relay.example/visit';");
const disabled = source.replace(/const relayUrl = '[^']*';/, "const relayUrl = '';");
function browser(overrides = {}) {
    const calls = [];
    const storage = new Map();
    const listeners = new Map();
    const context = {
        location: { hostname: 'rylenanil.com', pathname: '/blog.html', search: '?private=value' },
        document: {
            visibilityState: 'visible',
            addEventListener: (name, fn) => listeners.set(name, fn),
            removeEventListener: name => listeners.delete(name),
        },
        sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
        fetch: async (url, options) => { calls.push({ url, ...options }); return { ok: true }; },
        ...overrides,
    };
    return { calls, context, storage, listeners };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test('stays disabled until configured and ignores local previews', async () => {
    const b = browser();
    runInNewContext(disabled, b.context);
    b.context.location.hostname = 'localhost';
    runInNewContext(enabled, b.context);
    await settle();
    assert.equal(b.calls.length, 0);
});

test('reports each page load, including navigation within the same tab, without query strings', async () => {
    const b = browser();
    runInNewContext(enabled, b.context);
    await settle();
    b.context.location.pathname = '/posts/hacking-gisec-before-speaking-at-gisec.html';
    runInNewContext(enabled, b.context);
    await settle();
    assert.equal(b.calls.length, 2);
    assert.deepEqual(JSON.parse(b.calls[0].body), { path: '/blog.html' });
    assert.deepEqual(JSON.parse(b.calls[1].body), { path: '/posts/hacking-gisec-before-speaking-at-gisec.html' });
    assert.equal(b.calls[0].credentials, 'omit');
    assert.equal(b.calls[0].referrerPolicy, 'no-referrer');
});

test('waits until a hidden tab is visible', async () => {
    const b = browser();
    b.context.document.visibilityState = 'hidden';
    runInNewContext(enabled, b.context);
    assert.equal(b.calls.length, 0);
    b.context.document.visibilityState = 'visible';
    await b.listeners.get('visibilitychange')();
    assert.equal(b.calls.length, 1);
    assert.equal(b.listeners.size, 0);
});

test('network failures are caught and do not affect the page', async () => {
    const b = browser({ fetch: async () => { throw new Error('offline'); } });
    runInNewContext(enabled, b.context);
    await settle();
    assert.equal(b.storage.size, 0);
});
