function parseSheetRows(sheet) {
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (!rows || rows.length === 0) return [];

    // 🔎 Trova ultima riga non vuota (header)
    let headerIndex = -1;
    for (let i = rows.length - 1; i >= 0; i--) {
        const r = rows[i];
        if (r && r.some(cell => String(cell).trim() !== '')) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) return [];

    const header = rows[headerIndex].map(h => ('' + h).toLowerCase().trim());

    const map = {};
    header.forEach((h, idx) => {
        if (!h) return;
        if (h.includes('codic') || h.includes('cod.')) map.code = idx;
        else if (h.includes('lung')) map.length = idx;
        else if (h.includes('qt') || h.includes('q.t') || h.includes('quant')) map.quantity = idx;
        else if (h.includes('descr')) map.description = idx;
        else if (h.includes('mat')) map.material = idx;
    });

    const items = [];

    // 📌 Tutte le righe SOPRA l'header sono dati
    for (let i = 0; i < headerIndex; i++) {
        const r = rows[i];
        if (!r || r.every(c => c === '')) continue;

        const rawCode = map.code !== undefined ? r[map.code] : (r[2] || r[0]);
        const rawLength = map.length !== undefined ? r[map.length] : (r[3] || r[4]);
        const rawQty = map.quantity !== undefined ? r[map.quantity] : (r[1] || r[0]);

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
