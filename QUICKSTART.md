# 🚀 Avvio Rapido - Calcolo Tubolari Web App

## 📁 File Creati

✅ **index.html** - Applicazione principale
✅ **app.js** - Logica e calcoli
✅ **style.css** - Stili personalizzati  
✅ **README.md** - Documentazione completa
✅ **esempio_excel.html** - Template per Excel

## 🎯 Come Avviare

### Opzione 1: Apertura Diretta (Consigliata)

1. Vai nella cartella `webapp`
2. Doppio click su **index.html**
3. L'app si aprirà nel tuo browser predefinito
4. ✨ Pronta all'uso!

### Opzione 2: Con Server Locale (Opzionale)

Se preferisci usare un server locale:

**Con Python:**
```bash
cd webapp
python -m http.server 8000
```
Poi apri: http://localhost:8000

**Con Node.js (npx):**
```bash
cd webapp
npx http-server
```

**Con PHP:**
```bash
cd webapp
php -S localhost:8000
```

## 🎓 Tutorial Veloce (5 minuti)

### Test 1: Inserimento Manuale

1. Apri `index.html`
2. Attiva "Inserimento Manuale"
3. Seleziona tipo: TBQ12003 (Tubolare 120x120 sp3)
4. Lunghezza: 1500
5. Quantità: 10
6. Click "Aggiungi Tubolare"
7. Inserisci Codice Silo: TEST001
8. Click "Calcola"
9. ✅ Vedi i risultati!

### Test 2: Import Excel

1. Apri `esempio_excel.html` in un browser
2. Click "Genera Template Excel"
3. Apri il file scaricato con Excel
4. Torna su `index.html`
5. Click "Importa da Excel"
6. Seleziona il template scaricato
7. Click "Calcola"
8. ✅ Dati importati e calcolati!

## 📊 Esempi Pratici

### Esempio 1: Progetto Piccolo
```
Input:
- TBQ12003 (120x120 sp3) 1500mm x 5 pz
- TBQ10003 (100x100 sp3) 2000mm x 3 pz

Output atteso:
- 2-3 verghe da 6m
- Scarto totale: ~500-1000mm
```

### Esempio 2: Progetto Medio
```
Input:
- TBQ15003 (150x150 sp3) 1500mm x 20 pz
- TBQ12003 (120x120 sp3) 2000mm x 15 pz
- TBQ10003 (100x100 sp3) 1800mm x 10 pz

Output atteso:
- 10-12 verghe totali
- Mix ottimizzato 6m/12m
```

## 🔍 Verifica Funzionamento

### Checklist Rapida:
- [ ] `index.html` si apre nel browser
- [ ] I pulsanti sono cliccabili
- [ ] Puoi aggiungere tubolari manualmente
- [ ] Il calcolo produce risultati
- [ ] Le modal si aprono correttamente
- [ ] L'export Excel funziona

### Se qualcosa non funziona:

1. **Console Browser**: Premi F12 e controlla errori
2. **Cache**: Prova CTRL+F5 per ricaricare
3. **Browser**: Usa Chrome, Firefox o Edge aggiornati
4. **JavaScript**: Verifica che JavaScript sia abilitato

## 🎨 Personalizzazioni Rapide

### Cambiare Colori Principali

Apri `style.css` e modifica:
```css
:root {
    --primary-color: #0d6efd;  /* Colore principale */
    --success-color: #198754;   /* Colore successo */
}
```

### Cambiare Lunghezze Verghe

Apri `app.js` e modifica:
```javascript
const STANDARD_ROD = 6000;   // 6 metri
const EXTENDED_ROD = 12000;  // 12 metri
const SAW_BLADE_LOSS = 2;    // Perdita taglio
```

## 📱 Test su Mobile

### Browser Mobile:
1. Apri l'app sul PC
2. Trova l'IP del PC (ipconfig/ifconfig)
3. Sul mobile apri: `http://[IP-PC]:8000`
4. Oppure usa il browser del mobile per aprire il file direttamente

### Test Responsive:
1. Apri index.html
2. Premi F12 (Console)
3. Click icona mobile
4. Testa diverse dimensioni

## 🐛 Problemi Comuni e Soluzioni

### "La pagina non si carica"
✅ Verifica che tutti i file siano nella stessa cartella
✅ Controlla la connessione internet (per Bootstrap CDN)

### "Excel non si importa"
✅ Verifica formato .xlsx o .xls
✅ Controlla che abbia la riga di intestazione
✅ Assicurati che Lunghezza e Quantità siano numeri

### "I calcoli sembrano sbagliati"
✅ Verifica che le lunghezze siano in millimetri
✅ Controlla che le quantità siano positive
✅ Ricarica la pagina e riprova

### "Export Excel non funziona"
✅ Verifica popup bloccati nel browser
✅ Controlla permessi download
✅ Prova con browser diverso

## 📚 Dove Trovare Aiuto

1. **README.md** - Documentazione completa
2. **esempio_excel.html** - Formato Excel
3. **Console Browser (F12)** - Per vedere errori tecnici

## 🔄 Aggiornamenti Futuri

Possibili miglioramenti:
- [ ] Salvataggio progetti in LocalStorage
- [ ] Grafici statistici con Chart.js
- [ ] Export PDF
- [ ] Modalità tema scuro
- [ ] Multilingua (EN/IT)
- [ ] Calcolo costi materiali
- [ ] Storico calcoli

## 💡 Suggerimenti Pro

1. **Salva i risultati**: Usa "Esporta Excel" per archivio
2. **Template Excel**: Crea template specifici per progetti ricorrenti
3. **Browser Tab**: Tieni aperta la pagina esempio_excel.html per riferimento
4. **Screenshot**: Fai screenshot dei risultati per condivisione rapida
5. **Copy-Paste**: Usa "Copia" nella modal risultati per condividere

## 🎉 Tutto Pronto!

L'applicazione è completa e pronta all'uso. 

**Prossimi passi:**
1. ✅ Apri `index.html`
2. ✅ Fai il primo test
3. ✅ Leggi README.md per dettagli
4. ✅ Inizia a calcolare!

---

**Buon lavoro! 🚀**

*Per supporto tecnico, consulta README.md o controlla la console del browser (F12)*
