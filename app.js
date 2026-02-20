// Calcolo Tubolari Web App - JavaScript

// Core pieces have been moved to separate files:
// - constants.js (STANDARD_ROD, EXTENDED_ROD, SAW_BLADE_LOSS)
// - models.js (Tubolar class)
// - calculator.js (TubolarCalculator class)
// - parser.js (parseSheetRows)
// - ui_helpers.js (showToast, removeTubolarDirect)

// Global state (kept here to avoid changing many references)
let tubolarList = {};
let lastCalculationResult = null;

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

    // Print result button
    document.getElementById('printResultBtn').addEventListener('click', printCurrentModal);
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

// function generatePurchaseList(siloCode, siloNumber) {
//     const calculator = new TubolarCalculator(tubolarList, false);
//     const stats = calculator.getTotalStatistics(lastCalculationResult);

//     let html = `
//         <div class="output-display">
//         <h6>LISTA ACQUISTI</h6>
//         <strong>Codice Silo:</strong> ${siloCode}
//         <strong>Numero Silo:</strong> ${siloNumber}
        
//         <h6 class="mt-3">Verghe Necessarie:</h6>
//     `;

//     // Count rods by type and length
//     const rodCount = {};
//     for (const [type, rods] of Object.entries(lastCalculationResult)) {
//         rods.forEach(rod => {
//             const key = `${type}_${rod.rodLength}`;
//             rodCount[key] = (rodCount[key] || 0) + 1;
//         });
//     }

//     for (const [key, count] of Object.entries(rodCount)) {
//         const [type, length] = key.split('_');
//         const meters = parseInt(length) / 1000;
//         html += `\n${type} - ${meters}m: ${count} pz`;
//     }

//     html += `\n\n<strong>Totale Verghe:</strong> ${stats.total6m} x 6m + ${stats.total12m} x 12m = ${stats.totalRods} verghe
// <strong>Scarto Totale:</strong> ${stats.totalWaste} mm
// <strong>Scarto Medio:</strong> ${stats.averageWaste} mm per verga
//         </div>
//     `;

//     return html;
// }

function generatePurchaseList(siloCode, siloNumber) {
    const calculator = new TubolarCalculator(tubolarList, false);
    const stats = calculator.getTotalStatistics(lastCalculationResult);

    let html = `
        <div class="output-display" id="purchaseListContent">
        <h6>LISTA ACQUISTI</h6>
        <strong>Codice Silo:</strong> ${siloCode}<br>
        <strong>Numero Silo:</strong> ${siloNumber}<br><br>
        
        <h6>Verghe Necessarie:</h6>
    `;

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
        html += `${type} - ${meters}m: ${count} pz<br>`;
    }

    // html += `
    //     <br>
    //     <strong>Totale Verghe:</strong> ${stats.total6m} x 6m + ${stats.total12m} x 12m = ${stats.totalRods} verghe<br>
    //     <strong>Scarto Totale:</strong> ${stats.totalWaste} mm<br>
    //     <strong>Scarto Medio:</strong> ${stats.averageWaste} mm per verga<br><br>

    //     <button onclick="printPurchaseList()" style="margin-top:20px;padding:8px 15px;">
    //         🖨️ Stampa
    //     </button>
    //     </div>
    // `;

    return html;
}

// function printPurchaseList() {
//     const content = document.getElementById("purchaseListContent").innerHTML;

//     const printWindow = window.open('', '', 'width=800,height=600');

//     printWindow.document.write(`
//         <html>
//         <head>
//             <title>Lista Acquisti</title>
//         </head>
//         <body style="font-family: Arial; padding: 20px;">
//             ${content}
//         </body>
//         </html>
//     `);

//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//     printWindow.close();
// }


function generateCutList(siloCode, siloNumber) {

    let html = `
        <div class="output-display" id="cutListContent">
        <h6>LISTA DI TAGLIO DETTAGLIATA</h6>
        <strong>Codice Silo:</strong> ${siloCode}<br>
        <strong>Numero Silo:</strong> ${siloNumber}<br><br>
    `;

    for (const [type, rods] of Object.entries(lastCalculationResult)) {
        html += `<h6>Tipo: ${type}</h6>`;
        
        rods.forEach((rod, index) => {
            const rodLength = rod.rodLength / 1000;
            html += `<div>
                <strong>Verga ${index + 1} (${rodLength}m)</strong><br>`;
            
            rod.cuts.forEach((cut, cutIndex) => {
                html += `${cutIndex + 1}. ${cut.length} mm<br>`;
            });
            
            if (rod.waste > 0) {
                html += `Scarto: ${rod.waste} mm<br>`;
            }
            
            html += `</div><br>`;
        });
    }

    // html += `
    //     <button onclick="printCutList()" style="margin-top:20px;padding:8px 15px;">
    //         🖨️ Stampa
    //     </button>
    //     </div>
    // `;

    return html;
}

// function printCutList() {
//     const content = document.getElementById("cutListContent").innerHTML;
    
//     const printWindow = window.open('', '', 'width=800,height=600');
//     printWindow.document.write(`
//         <html>
//             <head>
//                 <title>Lista di Taglio</title>
//                 <style>
//                     body { font-family: Arial; padding: 20px; }
//                     h6 { margin-bottom: 5px; }
//                 </style>
//             </head>
//             <body>
//                 ${content}
//             </body>
//         </html>
//     `);
    
//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//     printWindow.close();
// }


// function generateRomboFormat(siloCode, siloNumber) {
//     let html = `
//         <div class="output-display">
//         <h6>FORMATO ROMBO</h6>
//         <strong>Codice Silo:</strong> ${siloCode}
//         <strong>Numero Silo:</strong> ${siloNumber}
        
//     `;

//     // Group by type and length
//     const summary = {};
    
//     for (const [type, tubolarArray] of Object.entries(tubolarList)) {
//         tubolarArray.forEach(tubolar => {
//             const key = `${type}_${tubolar.length}`;
//             summary[key] = {
//                 type: type,
//                 length: tubolar.length,
//                 quantity: tubolar.quantity
//             };
//         });
//     }

//     html += '\n\nCODICE | LUNGHEZZA | QTÀ\n';
//     html += '-------|-----------|-----\n';
    
//     for (const [key, item] of Object.entries(summary)) {
//         html += `${item.type} | ${item.length} mm | ${item.quantity} pz\n`;
//     }

//     html += '</div>';
//     return html;
// }
function generateRomboFormat(siloCode, siloNumber) {

    let html = `
        <div class="output-display" id="romboFormatContent">
        <h6>FORMATO ROMBO</h6>
        <strong>Codice Silo:</strong> ${siloCode}<br>
        <strong>Numero Silo:</strong> ${siloNumber}<br><br>
    `;

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

    html += 'CODICE | LUNGHEZZA | QTÀ<br>';
    html += '-------|-----------|-----<br>';
    
    for (const [key, item] of Object.entries(summary)) {
        html += `${item.type} | ${item.length} mm | ${item.quantity} pz<br>`;
    }

    // html += `
    //     <br>
    //     <button onclick="printRomboFormat()" style="margin-top:20px;padding:8px 15px;">
    //         🖨️ Stampa
    //     </button>
    //     </div>
    // `;

    return html;
}

// function printRomboFormat() {
//     const content = document.getElementById("romboFormatContent").innerHTML;

//     const printWindow = window.open('', '', 'width=800,height=600');

//     printWindow.document.write(`
//         <html>
//         <head>
//             <title>Formato Rombo</title>
//         </head>
//         <body style="font-family: Arial; padding: 20px;">
//             ${content}
//         </body>
//         </html>
//     `);

//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//     printWindow.close();
// }


// Excel parsing moved to parser.js (parseSheetRows)

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

// UI helpers moved to ui_helpers.js (showToast, removeTubolarDirect)

//Funzione generica per stampare il contenuto del modal attivo (acquisti, taglio o rombo) in modo pulito e formattato. Utilizza una nuova finestra per la stampa, assicurando che solo il contenuto rilevante venga stampato senza elementi dell'interfaccia utente.
function printCurrentModal() {
    const title = document.getElementById('resultModalTitle').innerText;
    const content = document.getElementById('resultModalBody').innerHTML;

    const printWindow = window.open('', '', 'width=900,height=700');

    printWindow.document.write(`
        <html>
        <head>
            <title>${title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                }
                h5, h6 {
                    margin-bottom: 15px;
                }
                hr {
                    margin: 20px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ccc;
                    padding: 6px;
                    text-align: left;
                }
            </style>
        </head>
        <body>
            <h3>${title}</h3>
            ${content}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}