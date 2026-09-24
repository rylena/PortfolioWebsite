(() => {
    // Set this to the deployed relay's /visit URL. Never put a Discord webhook here.
    const relayUrl = 'https://portfolio-visit-notifications.visit-notifications.workers.dev/visit';
    const allowedHosts = ['rylenanil.com', 'www.rylenanil.com'];
    const sessionKey = 'portfolio-visit-notified';

    if (!relayUrl || !allowedHosts.includes(location.hostname)) return;

    async function notify() {
        if (document.visibilityState !== 'visible') return;
        document.removeEventListener('visibilitychange', notify);

        try {
            if (sessionStorage.getItem(sessionKey)) return;
        } catch {
            // Visits still work when browser storage is unavailable.
        }

        try {
            const response = await fetch(relayUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: location.pathname }),
                credentials: 'omit',
                referrerPolicy: 'no-referrer',
                keepalive: true,
            });
            if (response.ok) {
                try { sessionStorage.setItem(sessionKey, '1'); } catch { /* Storage is optional. */ }
            }
        } catch {
            // A notification failure must not affect the website.
        }
    }

    if (document.visibilityState === 'visible') notify();
    else document.addEventListener('visibilitychange', notify);
})();
