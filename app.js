// Calcolo Tubolari Web App - JavaScript

// Constants
const STANDARD_ROD = 6000; // 6 meters in mm
const EXTENDED_ROD = 12000; // 12 meters in mm
const SAW_BLADE_LOSS = 2; // mm loss per cut

// Global state
let tubolarList = {};
let lastCalculationResult = null;

// Tubolar Class
class Tubolar {
    constructor(type, length, quantity, description = '', material = '') {
        this.type = type;
        this.length = parseInt(length);
        this.quantity = parseInt(quantity);
        this.description = description;
        this.material = material;
    }

    getTotalLength() {
        return this.length * this.quantity;
    }
}

// Calculator Class
class TubolarCalculator {
    constructor(tubolarMap, useOptimal = true) {
        this.tubolarMap = tubolarMap;
        this.useOptimal = useOptimal;
    }

    calculate() {
        const results = {};
        
        for (const [type, tubolarArray] of Object.entries(this.tubolarMap)) {
            if (this.useOptimal) {
                results[type] = this.calculateOptimal(tubolarArray);
            } else {
                results[type] = this.calculateWithRodLength(tubolarArray, STANDARD_ROD);
            }
        }
        
        return results;
    }

    calculateOptimal(tubolarArray) {
        const resultStandard = this.calculateWithRodLength(tubolarArray, STANDARD_ROD);
        const resultExtended = this.calculateWithRodLength(tubolarArray, EXTENDED_ROD);
        
        // Return the solution that uses fewer rods
        const standardTotal = resultStandard.length;
        const extendedTotal = resultExtended.length;
        const extendedEquivalent = extendedTotal * 2; // Each 12m rod equals two 6m rods
        
        return standardTotal <= extendedEquivalent ? resultStandard : resultExtended;
    }

    calculateWithRodLength(tubolarArray, rodLength) {
        const results = [];
        const workingList = [];
        
        // Create working list with all pieces
        tubolarArray.forEach(tubolar => {
            for (let i = 0; i < tubolar.quantity; i++) {
                workingList.push({
                    length: tubolar.length,
                    type: tubolar.type
                });
            }
        });
        
        // Sort by length descending (largest first)
        workingList.sort((a, b) => b.length - a.length);
        
        // Bin packing algorithm
        while (workingList.length > 0) {
            let remainingLength = rodLength;
            const cuts = [];
            let i = 0;
            
            while (i < workingList.length) {
                const piece = workingList[i];
                
                if (piece.length <= remainingLength) {
                    cuts.push({
                        length: piece.length,
                        type: piece.type
                    });
                    remainingLength -= (piece.length + SAW_BLADE_LOSS);
                    workingList.splice(i, 1);
                } else {
                    i++;
                }
            }
            
            if (cuts.length > 0) {
                results.push({
                    rodLength: rodLength,
                    cuts: cuts,
                    waste: Math.max(0, remainingLength)
                });
            }
        }
        
        return results;
    }

    getTotalStatistics(results) {
        let total6m = 0;
        let total12m = 0;
        let totalWaste = 0;
        let totalCuts = 0;

        for (const [type, rods] of Object.entries(results)) {
            rods.forEach(rod => {
                if (rod.rodLength === STANDARD_ROD) {
                    total6m++;
                } else {
                    total12m++;
                }
                totalWaste += rod.waste;
                totalCuts += rod.cuts.length;
            });
        }

        return {
            total6m,
            total12m,
            totalRods: total6m + total12m,
            totalWaste,
            totalCuts,
            averageWaste: totalCuts > 0 ? (totalWaste / (total6m + total12m)).toFixed(2) : 0
        };
    }
}

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    updateTubolarList();
}

function setupEventListeners() {
    // Manual input toggle
    document.getElementById('manualInputSwitch').addEventListener('change', function(e) {
        const section = document.getElementById('manualInputSection');
        section.style.display = e.target.checked ? 'block' : 'none';
    });

    // Add tubolar button
    document.getElementById('addTubolarBtn').addEventListener('click', addTubolar);

    // Remove tubolar button
    document.getElementById('removeTubolarBtn').addEventListener('click', removeTubolar);

    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', calculateTubolar);

    // Show results buttons
    document.getElementById('showPurchaseList').addEventListener('click', () => showResults('purchase'));
    document.getElementById('showCutList').addEventListener('click', () => showResults('cut'));
    document.getElementById('showRomboFormat').addEventListener('click', () => showResults('rombo'));

    // Export Excel button
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetApp);

    // Instructions button
    document.getElementById('showInstructions').addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('instructionsModal'));
        modal.show();
    });

    // Rules button
    document.getElementById('showRules').addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('rulesModal'));
        modal.show();
    });

    // Excel file input
    document.getElementById('excelFile').addEventListener('change', handleExcelImport);

    // Copy result button
    document.getElementById('copyResultBtn').addEventListener('click', copyResultToClipboard);
}

function addTubolar() {
    const type = document.getElementById('tubolarType').value;
    const length = document.getElementById('tubolarLength').value;
    const quantity = document.getElementById('tubolarQuantity').value;

    if (!length || !quantity || length <= 0 || quantity <= 0) {
        showToast('Errore', 'Inserire lunghezza e quantità valide', 'danger');
        return;
    }

    const tubolar = new Tubolar(type, length, quantity);
    
    if (!tubolarList[type]) {
        tubolarList[type] = [];
    }

    // Check if same length exists and merge
    const existingIndex = tubolarList[type].findIndex(t => t.length === tubolar.length);
    if (existingIndex >= 0) {
        tubolarList[type][existingIndex].quantity += tubolar.quantity;
    } else {
        tubolarList[type].push(tubolar);
    }

    // Clear inputs
    document.getElementById('tubolarLength').value = '';
    document.getElementById('tubolarQuantity').value = '';

    updateTubolarList();
    showToast('Successo', 'Tubolare aggiunto correttamente', 'success');
}

function removeTubolar() {
    const type = document.getElementById('tubolarType').value;
    const length = document.getElementById('tubolarLength').value;

    if (!length || length <= 0) {
        showToast('Errore', 'Inserire la lunghezza del tubolare da rimuovere', 'danger');
        return;
    }

    if (!tubolarList[type]) {
        showToast('Errore', 'Nessun tubolare di questo tipo presente', 'warning');
        return;
    }

    const index = tubolarList[type].findIndex(t => t.length === parseInt(length));
    if (index >= 0) {
        tubolarList[type].splice(index, 1);
        if (tubolarList[type].length === 0) {
            delete tubolarList[type];
        }
        updateTubolarList();
        showToast('Successo', 'Tubolare rimosso correttamente', 'success');
    } else {
        showToast('Errore', 'Tubolare non trovato', 'warning');
    }
}

function updateTubolarList() {
    const container = document.getElementById('tubolarList');
    container.innerHTML = '';

    let totalItems = 0;
    let hasItems = false;

    for (const [type, tubolarArray] of Object.entries(tubolarList)) {
        tubolarArray.forEach((tubolar, index) => {
            hasItems = true;
            totalItems += tubolar.quantity;
            
            const item = document.createElement('div');
            item.className = 'list-group-item tubolar-item';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">
                            <span class="badge bg-primary">${tubolar.type}</span>
                            ${tubolar.length} mm
                        </h6>
                        <small class="text-muted">Quantità: ${tubolar.quantity} pz</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeTubolarDirect('${type}', ${tubolar.length})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    if (!hasItems) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <p class="mt-2 mb-0">Nessun tubolare aggiunto</p>
            </div>
        `;
    }

    // Update stats
    document.getElementById('statTotalItems').textContent = totalItems;
}

function removeTubolarDirect(type, length) {
    if (!tubolarList[type]) return;
    
    const index = tubolarList[type].findIndex(t => t.length === length);
    if (index >= 0) {
        tubolarList[type].splice(index, 1);
        if (tubolarList[type].length === 0) {
            delete tubolarList[type];
        }
        updateTubolarList();
        showToast('Successo', 'Tubolare rimosso', 'success');
    }
}

function calculateTubolar() {
    if (Object.keys(tubolarList).length === 0) {
        showToast('Errore', 'Nessun tubolare presente. Aggiungi tubolari prima di calcolare.', 'warning');
        return;
    }

    const useOptimal = !document.getElementById('onlySixMeters').checked;
    const calculator = new TubolarCalculator(tubolarList, useOptimal);
    
    lastCalculationResult = calculator.calculate();
    const stats = calculator.getTotalStatistics(lastCalculationResult);

    // Update quick stats
    document.getElementById('quickStats').style.display = 'block';
    document.getElementById('statTotalRods').textContent = `${stats.total6m} x 6m + ${stats.total12m} x 12m`;
    document.getElementById('statWaste').textContent = `${stats.totalWaste} mm (media: ${stats.averageWaste} mm/verga)`;

    // Display results in main container
    displayResults('main');

    showToast('Successo', 'Calcolo completato!', 'success');
}

function displayResults(mode = 'main') {
    if (!lastCalculationResult) {
        return;
    }

    const container = mode === 'main' ? 
        document.getElementById('resultsContainer') : 
        document.getElementById('resultModalBody');

    let html = '<div class="result-section">';
    
    for (const [type, rods] of Object.entries(lastCalculationResult)) {
        html += `<h5 class="mb-3"><span class="badge bg-primary">${type}</span></h5>`;
        
        rods.forEach((rod, index) => {
            const rodType = rod.rodLength === STANDARD_ROD ? '6m' : '12m';
            const rodClass = rod.rodLength === STANDARD_ROD ? 'rod-6m' : 'rod-12m';
            
            html += `
                <div class="mb-3">
                    <strong>Verga ${index + 1} (${rodType}):</strong>
                    <div class="cut-visualization">
                        <div class="rod-visual">
                            <div class="rod-label">${rodType}</div>
                            <div class="rod-bar ${rodClass}">
                                <div class="rod-segments">
                                    ${rod.cuts.map(cut => {
                                        const percentage = (cut.length / rod.rodLength) * 100;
                                        return `<div class="segment" style="width: ${percentage}%">${cut.length}</div>`;
                                    }).join('')}
                                    ${rod.waste > 0 ? `<div class="segment waste" style="width: ${(rod.waste / rod.rodLength) * 100}%">↯${rod.waste}</div>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    <small class="text-muted">
                        Tagli: ${rod.cuts.map(c => c.length + 'mm').join(', ')} 
                        ${rod.waste > 0 ? `| Scarto: ${rod.waste}mm` : ''}
                    </small>
                </div>
            `;
        });
        
        html += '<hr>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function showResults(type) {
    if (!lastCalculationResult) {
        showToast('Errore', 'Eseguire prima il calcolo', 'warning');
        return;
    }

    const siloCode = document.getElementById('siloCode').value;
    const siloNumber = document.getElementById('siloNumber').value;

    if (!siloCode) {
        showToast('Errore', 'Inserire un codice Silo valido', 'warning');
        return;
    }

    const modal = new bootstrap.Modal(document.getElementById('resultModal'));
    const modalTitle = document.getElementById('resultModalTitle');
    const modalBody = document.getElementById('resultModalBody');

    let content = '';

    switch(type) {
        case 'purchase':
            modalTitle.textContent = 'Lista per Acquisti';
            content = generatePurchaseList(siloCode, siloNumber);
            break;
        case 'cut':
            modalTitle.textContent = 'Lista di Taglio';
            content = generateCutList(siloCode, siloNumber);
            break;
        case 'rombo':
            modalTitle.textContent = 'Formato per Rombo';
            content = generateRomboFormat(siloCode, siloNumber);
            break;
    }

    modalBody.innerHTML = content;
    modal.show();
}

function generatePurchaseList(siloCode, siloNumber) {
    const calculator = new TubolarCalculator(tubolarList, false);
    const stats = calculator.getTotalStatistics(lastCalculationResult);

    let html = `
        <div class="output-display">
        <h6>LISTA ACQUISTI</h6>
        <strong>Codice Silo:</strong> ${siloCode}
        <strong>Numero Silo:</strong> ${siloNumber}
        
        <h6 class="mt-3">Verghe Necessarie:</h6>
    `;

    // Count rods by type and length
    const rodCount = {};
    for (const [type, rods] of Object.entries(lastCalculationResult)) {
        rods.forEach(rod => {
            const key = `${type}_${rod.rodLength}`;
            rodCount[key] = (rodCount[key] || 0) + 1;
        });
    }

    for (const [key, count] of Object.entries(rodCount)) {
        const [type, length] = key.split('_');
        const meters = parseInt(length) / 1000;
        html += `\n${type} - ${meters}m: ${count} pz`;
    }

    html += `\n\n<strong>Totale Verghe:</strong> ${stats.total6m} x 6m + ${stats.total12m} x 12m = ${stats.totalRods} verghe
<strong>Scarto Totale:</strong> ${stats.totalWaste} mm
<strong>Scarto Medio:</strong> ${stats.averageWaste} mm per verga
        </div>
    `;

    return html;
}

function generateCutList(siloCode, siloNumber) {
    let html = `
        <div class="output-display">
        <h6>LISTA DI TAGLIO DETTAGLIATA</h6>
        <strong>Codice Silo:</strong> ${siloCode}
        <strong>Numero Silo:</strong> ${siloNumber}
        
    `;

    for (const [type, rods] of Object.entries(lastCalculationResult)) {
        html += `\n\n<h6>Tipo: ${type}</h6>\n`;
        
        rods.forEach((rod, index) => {
            const rodLength = rod.rodLength / 1000;
            html += `\nVerga ${index + 1} (${rodLength}m):`;
            
            rod.cuts.forEach((cut, cutIndex) => {
                html += `\n  ${cutIndex + 1}. ${cut.length} mm`;
            });
            
            if (rod.waste > 0) {
                html += `\n  Scarto: ${rod.waste} mm`;
            }
            
            html += '\n';
        });
    }

    html += '</div>';
    return html;
}

function generateRomboFormat(siloCode, siloNumber) {
    let html = `
        <div class="output-display">
        <h6>FORMATO ROMBO</h6>
        <strong>Codice Silo:</strong> ${siloCode}
        <strong>Numero Silo:</strong> ${siloNumber}
        
    `;

    // Group by type and length
    const summary = {};
    
    for (const [type, tubolarArray] of Object.entries(tubolarList)) {
        tubolarArray.forEach(tubolar => {
            const key = `${type}_${tubolar.length}`;
            summary[key] = {
                type: type,
                length: tubolar.length,
                quantity: tubolar.quantity
            };
        });
    }

    html += '\n\nCODICE | LUNGHEZZA | QTÀ\n';
    html += '-------|-----------|-----\n';
    
    for (const [key, item] of Object.entries(summary)) {
        html += `${item.type} | ${item.length} mm | ${item.quantity} pz\n`;
    }

    html += '</div>';
    return html;
}

function parseSheetRows(sheet) {
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    // Find header row by searching for known keywords
    let headerIndex = -1;
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (!r) continue;
        const found = r.some(cell => {
            if (!cell) return false;
            const s = String(cell).toLowerCase();
            return s.includes('codice') || s.includes('cod.') || s.includes('cod') || s.includes('q.t') || s.includes('q.ta') || s.includes('quant');
        });
        if (found) { headerIndex = i; break; }
    }
    if (headerIndex === -1) headerIndex = 0;

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
    for (let i = headerIndex + 1; i < rows.length; i++) {
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

function handleExcelImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

            const parsed = parseSheetRows(firstSheet);

            let importCount = 0;
            parsed.forEach(item => {
                const type = item.type || 'TBQ';
                const length = item.length;
                const quantity = item.quantity;

                if (length > 0 && quantity > 0) {
                    const tubolar = new Tubolar(type, length, quantity, item.description, item.material);

                    if (!tubolarList[type]) tubolarList[type] = [];

                    const existingIndex = tubolarList[type].findIndex(t => t.length === tubolar.length);
                    if (existingIndex >= 0) {
                        tubolarList[type][existingIndex].quantity += tubolar.quantity;
                    } else {
                        tubolarList[type].push(tubolar);
                    }
                    importCount++;
                }
            });

            updateTubolarList();
            showToast('Successo', `Importati ${importCount} tubolari da Excel`, 'success');
        } catch (error) {
            console.error('Error importing Excel:', error);
            showToast('Errore', 'Errore durante l\'importazione del file Excel', 'danger');
        }
    };
    reader.readAsArrayBuffer(file);
}

function exportToExcel() {
    if (!lastCalculationResult) {
        showToast('Errore', 'Eseguire prima il calcolo', 'warning');
        return;
    }

    const siloCode = document.getElementById('siloCode').value || 'N/A';
    const siloNumber = document.getElementById('siloNumber').value || '1';

    // Prepare data for Excel
    const excelData = [];
    
    // Add header info
    excelData.push(['CALCOLO TUBOLARI']);
    excelData.push(['Codice Silo:', siloCode]);
    excelData.push(['Numero Silo:', siloNumber]);
    excelData.push(['Data:', new Date().toLocaleDateString('it-IT')]);
    excelData.push([]);
    
    // Add cut list
    for (const [type, rods] of Object.entries(lastCalculationResult)) {
        excelData.push([`Tipo: ${type}`]);
        excelData.push(['Verga', 'Lunghezza Verga', 'Tagli', 'Scarto']);
        
        rods.forEach((rod, index) => {
            const rodLength = `${rod.rodLength / 1000}m`;
            const cuts = rod.cuts.map(c => `${c.length}mm`).join(', ');
            const waste = `${rod.waste}mm`;
            
            excelData.push([`Verga ${index + 1}`, rodLength, cuts, waste]);
        });
        
        excelData.push([]);
    }

    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Calcolo Tubolari');

    // Save file
    const fileName = `CalcoloTubolari_${siloCode}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    showToast('Successo', 'File Excel esportato correttamente', 'success');
}

function copyResultToClipboard() {
    const modalBody = document.getElementById('resultModalBody');
    const text = modalBody.innerText;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Successo', 'Risultati copiati negli appunti', 'success');
    }).catch(err => {
        console.error('Error copying to clipboard:', err);
        showToast('Errore', 'Errore durante la copia', 'danger');
    });
}

function resetApp() {
    const confirmReset = confirm('Sei sicuro di voler cancellare tutti i dati?');
    if (!confirmReset) return;

    tubolarList = {};
    lastCalculationResult = null;
    
    updateTubolarList();
    
    document.getElementById('resultsContainer').innerHTML = `
        <div class="empty-state">
            <i class="bi bi-bar-chart"></i>
            <p class="mt-2">I risultati appariranno qui dopo il calcolo</p>
        </div>
    `;
    
    document.getElementById('quickStats').style.display = 'none';
    document.getElementById('siloCode').value = '';
    document.getElementById('siloNumber').value = '1';
    document.getElementById('excelFile').value = '';
    
    showToast('Successo', 'Applicazione resettata', 'info');
}

function showToast(title, message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast
    const toastId = 'toast_' + Date.now();
    const bgColor = type === 'success' ? 'bg-success' : 
                    type === 'danger' ? 'bg-danger' : 
                    type === 'warning' ? 'bg-warning' : 'bg-info';

    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header ${bgColor} text-white">
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Make removeTubolarDirect available globally
window.removeTubolarDirect = removeTubolarDirect;
