(() => {
    // Set this to the deployed relay's /visit URL. Never put a Discord webhook here.
    const relayUrl = 'https://portfolio-visit-notifications.visit-notifications.workers.dev/visit';
    const allowedHosts = ['rylenanil.com', 'www.rylenanil.com'];

    if (!relayUrl || !allowedHosts.includes(location.hostname)) return;

    async function notify() {
        if (document.visibilityState !== 'visible') return;
        document.removeEventListener('visibilitychange', notify);

        try {
            await fetch(relayUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: location.pathname }),
                credentials: 'omit',
                referrerPolicy: 'no-referrer',
                keepalive: true,
            });
        } catch {
            // A notification failure must not affect the website.
        }
    }

    if (document.visibilityState === 'visible') notify();
    else document.addEventListener('visibilitychange', notify);
})();
