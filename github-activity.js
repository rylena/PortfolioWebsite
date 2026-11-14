(() => {
    const calendar = document.getElementById('github-calendar');
    const summary = document.getElementById('github-contribution-summary');
    const desktop = window.matchMedia('(min-width: 769px)');
    const colors = ['#23334b', '#235f5a', '#2e9180', '#48c8ac', '#64ffda'];
    let requested = false;

    async function loadContributions() {
        if (!desktop.matches || requested) return;
        requested = true;
        calendar.querySelector('.github-calendar-status').textContent = 'Loading contributions...';
        try {
            const response = await fetch('https://github-contributions-api.jogruber.de/v4/rylena?y=last', {
                signal: AbortSignal.timeout(10000),
                credentials: 'omit',
                referrerPolicy: 'no-referrer',
            });
            if (!response.ok) throw new Error('Contribution service unavailable');
            const data = await response.json();
            const days = data.contributions;
            if (!Array.isArray(days) || !days.length || days.length > 380 || days.some(day =>
                !/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isInteger(day.count) || day.count < 0 || !Number.isInteger(day.level) || day.level < 0 || day.level > 4
            )) throw new Error('Invalid contribution data');
            days.sort((a, b) => a.date.localeCompare(b.date));
            const ns = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(ns, 'svg');
            const start = new Date(`${days[0].date}T00:00:00Z`);
            const startOffset = start.getUTCDay();
            const weeks = Math.ceil((startOffset + days.length) / 7);
            const left = 30;
            const top = 22;
            const step = 15;
            svg.setAttribute('viewBox', `0 0 ${left + weeks * step} 126`);
            svg.setAttribute('aria-hidden', 'true');
            const label = (text, x, y) => {
                const node = document.createElementNS(ns, 'text');
                node.setAttribute('x', x);
                node.setAttribute('y', y);
                node.textContent = text;
                svg.append(node);
            };
            ['Mon', 'Wed', 'Fri'].forEach((day, index) => label(day, 0, top + (index * 2 + 1) * step + 9));
            let month = -1;
            days.forEach((day, index) => {
                const date = new Date(`${day.date}T00:00:00Z`);
                const slot = Math.round((date - start) / 86400000) + startOffset;
                const column = Math.floor(slot / 7);
                if (date.getUTCMonth() !== month && (index === 0 || column < weeks - 1)) {
                    label(date.toLocaleDateString('en', {month: 'short', timeZone: 'UTC'}), left + column * step, 10);
                    month = date.getUTCMonth();
                }
                const rect = document.createElementNS(ns, 'rect');
                rect.setAttribute('x', left + column * step);
                rect.setAttribute('y', top + (slot % 7) * step);
                rect.setAttribute('width', 11);
                rect.setAttribute('height', 11);
                rect.setAttribute('rx', 3);
                rect.setAttribute('fill', colors[day.level]);
                const title = document.createElementNS(ns, 'title');
                title.textContent = `${day.count} ${day.count === 1 ? 'contribution' : 'contributions'} on ${day.date}`;
                rect.append(title);
                svg.append(rect);
            });
            const total = days.reduce((sum, day) => sum + day.count, 0);
            summary.textContent = `${total.toLocaleString()} contributions in the last year.`;
            calendar.setAttribute('aria-label', `${total.toLocaleString()} GitHub contributions in the last year by Rylen Anil`);
            calendar.replaceChildren(svg);
            document.querySelector('.github-calendar-footer').hidden = false;
        } catch {
            calendar.querySelector('.github-calendar-status').textContent = 'View my contribution activity on GitHub.';
        }
    }
    desktop.addEventListener('change', loadContributions);
    loadContributions();
})();
