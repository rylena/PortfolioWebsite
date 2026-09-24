# Discord visit notifications

The static site reports each visible page load to a Cloudflare Worker. The Worker posts the page title and URL, public IP, approximate city/region/country, previous recorded visits from that IP, current visit number, and timestamp to Discord using a server-side secret.

The production relay is `https://portfolio-visit-notifications.visit-notifications.workers.dev/visit`, configured in `../../visit-notifications.js`. Its Discord webhook is stored in the `DISCORD_WEBHOOK_URL` Worker secret. Clear `relayUrl` to disable the browser integration.

## Activate

1. Create an incoming webhook in the destination Discord channel's integration settings. Use a regular text channel.
2. From this directory, run `npx wrangler login` to connect the intended Cloudflare account.
3. Run `npx wrangler deploy` to create the Worker. It rejects notifications until its secret is set.
4. Run `npx wrangler secret put DISCORD_WEBHOOK_URL` and paste the Discord webhook URL into the private prompt. Do not add it to a source file or Git.
5. Set `relayUrl` in `../../visit-notifications.js` to the deployed Worker's HTTPS URL with `/visit` appended, then publish the static site.
6. Visit the production site and follow a link to another page. Confirm messages arrive with the correct pages and an increasing visit count.

The webhook secret is sufficient to post to the configured channel; no Discord bot is needed. See [Discord's webhook documentation](https://docs.discord.com/developers/resources/webhook) and [Cloudflare's secret configuration](https://developers.cloudflare.com/workers/configuration/secrets/).

## Behavior and limits

- Each visible page load sends a notification, including refreshes and navigation to another page. Switching tabs does not send another notification for an already reported document. Restoring a page from the browser's back/forward cache does not run the script again.
- Only the canonical and `www` production hosts send notifications. Local previews stay silent.
- The IP and approximate location come from Cloudflare's request metadata, never browser-supplied values. Missing location data is shown as unavailable. A VPN, proxy, or shared network can mask or share this address; it does not identify a person. Query strings, referrers, and browser fingerprints are not sent. See [Cloudflare request metadata](https://developers.cloudflare.com/workers/runtime-apis/request/).
- Counts start with this feature's deployment on September 24, 2026; earlier visits cannot be reconstructed. One SQLite-backed Durable Object per IP stores a single atomic counter, retained across deployments with no expiry. Multiple people sharing an IP contribute to the same count; changing IP starts another count. The object is privately addressed by Cloudflare's ID derived from the IP; no public count lookup is exposed. See [Durable Object storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/).
- Only valid requests that pass both rate limits increment the counter. Incrementing happens before Discord delivery, so a delivery failure still counts the recorded visit. There is no background retry queue. A later page load records a new visit.
- JavaScript blockers, closed tabs, network failures, and rate limits can prevent notifications. These are visit signals, not an exact visitor count.
- New pages must be added to the Worker's `pages` map and include the deferred browser script.

The Worker accepts only known page paths and production origins, disables Discord mentions, bounds request bodies, and limits sends to ten requests per IP per minute and thirty per channel per minute **per Cloudflare location**. Shared IPs can therefore suppress legitimate visits. Origin headers can be spoofed outside a browser; they are not authentication. Cloudflare's rate-limit counters are approximate and local to a location, not a strict global cap. See the [rate-limit binding documentation](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

Run the local checks with `node --test *.test.mjs`. Tests mock Discord and do not send messages.
