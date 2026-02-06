# Calcolo Tubolari - Web Application

## 📋 Descrizione

Applicazione web per il calcolo ottimale dei tagli di verghe/tubolari per sistemi Silsystem (STX/STL). 
L'applicazione ottimizza il numero di verghe necessarie per un progetto, calcolando i tagli ottimali e minimizzando gli scarti.

## ✨ Caratteristiche Principali

- **Inserimento Manuale**: Aggiungi tubolari specificando tipo, lunghezza e quantità
- **Import da Excel**: Importa dati da file Excel (.xlsx, .xls)
- **Calcolo Ottimale**: Algoritmo di ottimizzazione che sceglie tra verghe da 6m e 12m
- **Visualizzazione Risultati**: 
  - Lista per acquisti (riepilogo verghe necessarie)
  - Lista di taglio dettagliata
  - Formato per Rombo (esportazione)
- **Export Excel**: Esporta i risultati in formato Excel
- **Calcolo Scarti**: Considera le perdite di taglio (~2mm per taglio)
- **Interfaccia Responsiva**: Funziona su desktop, tablet e mobile

## 🚀 Come Utilizzare

### Installazione

1. **Download**: Scarica tutti i file nella cartella `webapp`
2. **Browser**: Apri il file `index.html` in un browser moderno (Chrome, Firefox, Edge, Safari)

**Nota**: L'applicazione è completamente client-side e non richiede server o installazioni speciali.

### Utilizzo

#### 1. Inserimento Dati

**Metodo 1 - Inserimento Manuale:**
1. Attiva il toggle "Inserimento Manuale"
2. Seleziona il tipo di tubolare (TBQ, TBA, TBR, TBS)
3. Inserisci la lunghezza in millimetri (es: 1500)
4. Inserisci la quantità (es: 10)
5. Clicca "Aggiungi Tubolare"

**Metodo 2 - Import da Excel:**
1. Prepara un file Excel con le colonne:
   - **Codice**: Codice tubolare (es: TBQ)
   - **Lunghezza**: Lunghezza in mm (es: 1500)
   - **Quantità**: Numero di pezzi (es: 10)
   - **Descrizione** (opzionale)
   - **Materiale** (opzionale)
2. Clicca su "Importa da Excel" e seleziona il file

#### 2. Configurazione

- **Codice Silo**: Inserisci il codice identificativo (es: STX4848CM0001)
- **Numero Silo**: Specifica il numero di silo (default: 1)
- **Solo Verghe 6m**: Attiva per usare solo verghe da 6 metri, disattiva per ottimizzazione automatica 6m/12m

#### 3. Calcolo

1. Dopo aver aggiunto i tubolari, clicca "Calcola"
2. I risultati appariranno nella sezione "Risultati Calcolo"
3. Le statistiche rapide mostrano:
   - Numero totale di tubolari
   - Verghe necessarie (6m e 12m)
   - Scarto stimato

#### 4. Visualizza Risultati

- **Lista per Acquisti**: Riepilogo delle verghe da ordinare
- **Lista di Taglio**: Dettaglio completo dei tagli per ogni verga
- **Per Rombo**: Formato specifico per esportazione
- **Esporta Excel**: Salva i risultati in un file Excel

## 📊 Algoritmo di Calcolo

L'applicazione utilizza un algoritmo di **Bin Packing** per ottimizzare i tagli:

1. **Ordinamento**: I pezzi vengono ordinati dal più lungo al più corto
2. **Riempimento**: Ogni verga viene riempita con i pezzi più lunghi possibili
3. **Ottimizzazione**: 
   - Se "Solo 6m" è disattivato, l'algoritmo calcola sia con verghe da 6m che da 12m
   - Sceglie la soluzione con minor numero di verghe totali
4. **Perdite**: Ogni taglio comporta una perdita di 2mm per la lama della sega

### Esempio di Calcolo

**Input:**
- 5 pezzi da 2000mm
- 3 pezzi da 1500mm
- 4 pezzi da 800mm

**Output con ottimizzazione:**
- Verga 1 (6m): 2000 + 2000 + 1500 = 5500mm (scarto: 500mm)
- Verga 2 (6m): 2000 + 1500 + 800 + 800 = 5100mm (scarto: 900mm)
- Verga 3 (6m): 2000 + 800 + 800 = 3600mm (scarto: 2400mm)

## 🛠️ Tecnologie Utilizzate

- **HTML5**: Struttura della pagina
- **CSS3**: Stili e layout responsivo
- **Bootstrap 5.3**: Framework CSS per componenti UI
- **JavaScript (ES6+)**: Logica applicativa e algoritmi di calcolo
- **SheetJS (XLSX)**: Libreria per import/export Excel
- **Bootstrap Icons**: Icone dell'interfaccia

## 📱 Compatibilità Browser

- ✅ Google Chrome (v90+)
- ✅ Mozilla Firefox (v88+)
- ✅ Microsoft Edge (v90+)
- ✅ Safari (v14+)
- ✅ Opera (v76+)

## 📝 Formato File Excel

### Import
Il file Excel deve avere la prima riga con le intestazioni:

| Codice    | Descrizione              | Lunghezza | Quantità | Materiale |
|-----------|--------------------------|-----------|----------|-----------|
| TBQ15003  | Tubolare 150x150 sp3     | 1500      | 10       | Acciaio   |
| TBQ12003  | Tubolare 120x120 sp3     | 2000      | 5        | Acciaio   |
| TBQ10003  | Tubolare 100x100 sp3     | 1800      | 8        | Acciaio   |

### Export
Il file esportato conterrà:
- Informazioni silo (codice, numero, data)
- Lista dettagliata dei tagli per ogni verga
- Riepilogo scarti

## 🎨 Caratteristiche UI/UX

- **Design Moderno**: Interfaccia pulita e professionale
- **Responsive**: Si adatta a tutti i dispositivi
- **Visualizzazione Grafiche**: Barre colorate per visualizzare i tagli
- **Toast Notifications**: Feedback immediato per ogni azione
- **Modal Dialogs**: Visualizzazione dettagliata dei risultati
- **Animazioni**: Transizioni fluide e piacevoli

## 🔧 Personalizzazione

### Modificare le Lunghezze Standard

Nel file `app.js`, modifica le costanti:

```javascript
const STANDARD_ROD = 6000; // Cambia la lunghezza della verga standard
const EXTENDED_ROD = 12000; // Cambia la lunghezza della verga estesa
const SAW_BLADE_LOSS = 2; // Cambia la perdita per taglio
```

### Tipi di Tubolare Disponibili

L'applicazione supporta 15 tipologie specifiche di tubolari definite nel sistema:

- TBQ15003 - Tubolare 150x150 sp3
- TBQ15004 - Tubolare 150x150 sp4
- TBQ14003 - Tubolare 140x140 sp3
- TBQ14002 - Tubolare 140x140 sp2
- TBQ12003 - Tubolare 120x120 sp3
- TBQ12004 - Tubolare 120x120 sp4
- TBQ11003 - Tubolare 110x110 sp3
- TBQ10003 - Tubolare 100x100 sp3
- TBQ09003 - Tubolare 90x90 sp3
- TBQ08004 - Tubolare 80x80 sp4
- TBQ07004 - Tubolare 70x70 sp4
- TBQ07003 - Tubolare 70x70 sp3
- TBQ06003 - Tubolare 60x60 sp3
- TBQ05002 - Tubolare 50x50 sp2
- TBQ05004 - Tubolare 50x50 sp4

## 📄 Struttura File

```
webapp/
├── index.html      # Pagina principale
├── style.css       # Stili personalizzati
├── app.js          # Logica applicativa
└── README.md       # Questa documentazione
```

## 🐛 Risoluzione Problemi

### Il file Excel non viene importato
- Verifica che il file sia in formato .xlsx o .xls
- Assicurati che la prima riga contenga le intestazioni
- Controlla che le colonne "Lunghezza" e "Quantità" contengano numeri validi

### I calcoli non sono corretti
- Verifica di aver inserito le lunghezze in millimetri
- Controlla che le quantità siano positive
- Assicurati di aver cliccato "Calcola" dopo aver aggiunto i tubolari

### L'export Excel non funziona
- Verifica che il browser supporti il download di file
- Alcuni browser richiedono l'autorizzazione per i download automatici
- Prova a disabilitare estensioni che potrebbero bloccare i download

## 📞 Supporto

Per problemi o suggerimenti:
1. Controlla la sezione "Risoluzione Problemi"
2. Verifica la compatibilità del browser
3. Consulta la sezione "Regole di Utilizzo" nell'app

## 📜 Licenza

Questa applicazione è sviluppata per uso interno aziendale.

## 🔄 Changelog

### Versione 1.0.0 (2026)
- ✨ Prima versione della web app
- ✅ Conversione dall'applicazione Java originale
- 🎨 Interfaccia moderna con Bootstrap 5
- 📊 Algoritmo di ottimizzazione bin-packing
- 📁 Import/Export Excel
- 📱 Design responsive
- 🎯 Visualizzazione grafica dei tagli

---

**Sviluppato con ❤️ per l'ottimizzazione dei tagli tubolari**
