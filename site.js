(() => {
    const accent = 'color: #64ffda; font-family: system-ui, sans-serif;';
    const body = 'font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.8;';

    function printMessage(asciiArt) {
        if (asciiArt) {
            // Chrome splits console text into separate line boxes and enforces
            // its own row height. Render the actual ASCII characters as SVG text
            // so the drawing retains its proportions in either docking mode.
            const lines = asciiArt.trimEnd().split('\n');
            const columns = Math.max(...lines.map(line => line.length));
            const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const width = columns * 7.8;
            const height = lines.length * 13;
            const text = lines.flatMap((line, row) => [...line].flatMap((character, column) =>
                character === ' ' ? [] : `<text x="${column * 7.8}" y="${row * 13 + 11}">${escape(character)}</text>`
            )).join('');
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g fill="#999999" font-family="monospace" font-size="13" xml:space="preserve">${text}</g></svg>`;
            const image = `data:image/svg+xml;base64,${btoa(svg)}`;
            console.log('%c ', `font-size:0; line-height:0; padding:150px 125px; background-image:url("${image}"); background-size:contain; background-repeat:no-repeat; background-position:center;`);
        }
        console.log('%cAre you a one or a zero?', `${accent} font-size: 15px; font-weight: 700; line-height: 1.8;`);
        console.log('%cme@rylenanil.com', `${accent} font-size: 13px; line-height: 1.8;`);
        console.log('%cLooking to hire me?%c\nCheck out my resume:\nhttps://rylenanil.com/resume.pdf', `${accent} font-size: 13px; font-weight: 600; line-height: 1.8;`, body);
    }

    fetch('/assets/console/fsociety-ascii.txt', {
        credentials: 'omit',
        signal: AbortSignal.timeout(5000),
    })
        .then(response => {
            if (!response.ok) throw new Error('ASCII artwork unavailable');
            return response.text();
        })
        .then(printMessage)
        .catch(() => printMessage());
})();
