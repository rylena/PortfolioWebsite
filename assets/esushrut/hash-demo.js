/* Synthetic inputs only. This demo performs no network requests. */
(() => {
    const lab = document.querySelector('[data-hash-lab]');
    if (!lab || !window.crypto?.subtle) return;

    const tokenOutput = lab.querySelector('[data-demo-token]');
    const innerOutput = lab.querySelector('[data-demo-inner]');
    const outerOutput = lab.querySelector('[data-demo-outer]');
    const status = lab.querySelector('[data-demo-status]');
    const button = lab.querySelector('button');
    const algorithmInput = lab.querySelector('[data-demo-algorithm]');
    let attempts = 1;
    let previousHash = '';
    let generation = 0;

    const hash = async (algorithm, value) => {
        const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(value));
        return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
    };

    const render = async (reset = false) => {
        const currentGeneration = ++generation;
        button.disabled = true;
        if (reset) { attempts = 1; previousHash = ''; }
        const fresh = lab.querySelector('input:checked').value === 'fresh';
        const algorithm = algorithmInput.value;
        const fixedToken = algorithm === 'SHA-512' ? '[B@1234abcd' : '[B@5678ef90';
        const bytes = crypto.getRandomValues(new Uint8Array(24));
        const token = fresh ? btoa(String.fromCharCode(...bytes)) : fixedToken;
        try {
            const inner = await hash(algorithm, 'papercrane' + 'demo_user');
            const outer = await hash(algorithm, inner + token);
            if (currentGeneration !== generation) return;
            tokenOutput.textContent = token;
            innerOutput.textContent = inner;
            outerOutput.textContent = outer;
            lab.querySelector('[data-demo-first-label]').textContent = `First ${algorithm}`;
            lab.querySelector('[data-demo-second-label]').textContent = `Second ${algorithm}`;
            status.textContent = previousHash
                ? `Attempt ${attempts}. ${outer === previousHash ? 'Same token. Same submitted hash.' : 'Fresh token. Different submitted hash.'}`
                : fresh ? 'New token each time. Try again.' : 'Token held fixed. Try again.';
            previousHash = outer;
        } catch {
            if (currentGeneration !== generation) return;
            status.textContent = 'This browser could not run the demo. The code above shows the calculation.';
            button.hidden = true;
        } finally {
            if (currentGeneration === generation) button.disabled = false;
        }
    };

    button.addEventListener('click', () => { attempts += 1; render(); });
    lab.querySelectorAll('input').forEach((input) => input.addEventListener('change', () => render(true)));
    algorithmInput.addEventListener('change', () => render(true));
    lab.hidden = false;
    render();
})();
