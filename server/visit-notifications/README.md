# Discord visit notifications

The static site reports a visit to a Cloudflare Worker. The Worker posts the page, public IP, and timestamp to Discord using a server-side secret.

The production relay is `https://portfolio-visit-notifications.visit-notifications.workers.dev/visit`, configured in `../../visit-notifications.js`. Its Discord webhook is stored in the `DISCORD_WEBHOOK_URL` Worker secret. Clear `relayUrl` to disable the browser integration.

## Activate

1. Create an incoming webhook in the destination Discord channel's integration settings. Use a regular text channel.
2. From this directory, run `npx wrangler login` to connect the intended Cloudflare account.
3. Run `npx wrangler deploy` to create the Worker. It rejects notifications until its secret is set.
4. Run `npx wrangler secret put DISCORD_WEBHOOK_URL` and paste the Discord webhook URL into the private prompt. Do not add it to a source file or Git.
5. Set `relayUrl` in `../../visit-notifications.js` to the deployed Worker's HTTPS URL with `/visit` appended, then publish the static site.
6. Visit the production site in a new browser session. Confirm a message arrives with the correct page and time.

The webhook secret is sufficient to post to the configured channel; no Discord bot is needed. See [Discord's webhook documentation](https://docs.discord.com/developers/resources/webhook) and [Cloudflare's secret configuration](https://developers.cloudflare.com/workers/configuration/secrets/).

## Behavior and limits

- One notification per tab session, on the first visible page. Following links or refreshing the same tab does not normally send another. Separate tabs may send another notification. With browser storage blocked, each page may notify.
- Only the canonical and `www` production hosts send notifications. Local previews stay silent.
- Messages contain the page, server time, and public IP observed by Cloudflare. A VPN, proxy, or shared network can mask or share this address; it does not identify a person. The browser cannot choose the reported IP. Query strings, referrers, and browser fingerprints are not sent.
- A failed send does not mark the session as notified. A later page visit can try again; there is no background retry queue.
- JavaScript blockers, closed tabs, network failures, and rate limits can prevent notifications. These are visit signals, not an exact visitor count.
- New pages must be added to the Worker's `pages` map and include the deferred browser script.

The Worker accepts only known page paths and production origins, disables Discord mentions, bounds request bodies, and limits sends to two requests per IP per minute and ten per channel per minute **per Cloudflare location**. Shared IPs can therefore suppress legitimate visits. Origin headers can be spoofed outside a browser; they are not authentication. Cloudflare's rate-limit counters are approximate and local to a location, not a strict global cap. See the [rate-limit binding documentation](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

Run the local checks with `node --test *.test.mjs`. Tests mock Discord and do not send messages.
