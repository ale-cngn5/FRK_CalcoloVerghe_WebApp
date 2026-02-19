// parseSheetRows: utility to parse first sheet to items
function parseSheetRows(sheet) {

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (!rows.length) return [];

    // 1️⃣ Trova ultima riga NON vuota (header)
    let headerIndex = rows.length - 1;

    while (
        headerIndex >= 0 &&
        rows[headerIndex].every(c => c === '')
    ) {
        headerIndex--;
    }

    if (headerIndex < 0) return [];

    // 2️⃣ Mappa header
    const header = rows[headerIndex].map(h => ('' + h).toLowerCase().trim());

    const map = {};
    header.forEach((h, idx) => {
        if (!h) return;

        if (h.includes('codic')) map.code = idx;
        else if (h.includes('lung')) map.length = idx;
        else if (h.includes('qt') || h.includes('q.t') || h.includes('quant')) map.quantity = idx;
        else if (h.includes('descr')) map.description = idx;
        else if (h.includes('mat')) map.material = idx;
    });

    // 3️⃣ Tutte le righe sopra sono dati
    const items = [];

    for (let i = 0; i < headerIndex; i++) {
        const r = rows[i];
        if (!r || r.every(c => c === '')) continue;

        const rawCode = map.code !== undefined ? r[map.code] : '';
        const rawLength = map.length !== undefined ? r[map.length] : '';
        const rawQty = map.quantity !== undefined ? r[map.quantity] : '';

        const code = rawCode ? String(rawCode).trim() : '';

        const lengthStr = rawLength ? String(rawLength).replace(/[^0-9]/g, '') : '';
        const qtyStr = rawQty ? String(rawQty).replace(/[^0-9]/g, '') : '';

        const length = parseInt(lengthStr, 10) || 0;
        const quantity = parseInt(qtyStr, 10) || 0;

        if (length > 0 && quantity > 0) {
            items.push({
                type: code || 'TBQ',
                length: length,
                quantity: quantity,
                description: map.description !== undefined ? r[map.description] : '',
                material: map.material !== undefined ? r[map.material] : ''
            });
        }
    }

    return items;
}
