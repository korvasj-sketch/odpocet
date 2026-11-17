# Odpočet (GTA VI styl)

Samostatný časovač/odpočet ve stylu GTA VI — neonový západ slunce, gradientní
číslice. Určený hlavně jako **Browser Source do OBS**, ale jde normálně otevřít
i v prohlížeči nebo v mobilu.

## Rychlé spuštění

- **Online:** `https://korvasj-sketch.github.io/odpocet/`
- **Lokálně:** dvojklik na `index.html`

## Ovládání

| Co | Jak |
|---|---|
| Nastavení času | pole h / m / s, nebo tlačítka 1–60 min |
| Start / pauza | tlačítko, nebo **Mezerník** |
| Reset | tlačítko, nebo **R** |
| ±1 min | **↑ / ↓** (Shift = ±10 s) |
| Nápis | pole nad odpočtem (např. „Začínáme za", „Konec za") |
| Pozadí** | přepínač — západ slunce / **průhledné (pro OBS)** |
| Zvuk | přepínač — 3 pípnutí na konci |

Nastavení (poslední čas, nápis, pozadí, zvuk) se ukládá do prohlížeče.

Panel se po 3,5 s nečinnosti sám schová — na obrazovce zůstane jen odpočet.

## Použití v OBS (Browser Source)

1. OBS → *Zdroje* → **+** → **Prohlížeč (Browser)**
2. URL (příklad — 5 minut, průhledné pozadí, bez panelu, odstartuje samo):

```
https://korvasj-sketch.github.io/odpocet/?t=300&bg=0&controls=0&autostart=1
```

3. Šířka **1920**, výška **1080** (nebo 1280×720)
4. Zaškrtni *„Restartovat zdroj, když se stane aktivním"* — při každém přepnutí
   scény se odpočet spustí znovu od začátku.

S `controls=0` je panel **trvale skrytý** — na stream se nikdy nezobrazí.
Čas upravíš buď v URL (`t=5:00`), nebo v okně *Interakce* (pravé tlačítko na
zdroji → **Interakce**) šipkami **↑/↓** (±1 min, Shift = ±10 s), mezerníkem
start/pauza, **R** reset. Panel se přitom neukáže.

### Parametry v URL

| Parametr | Příklad | Co dělá |
|---|---|---|
| `t` | `t=300`, `t=5:30`, `t=1:02:03` | délka odpočtu (sekundy nebo m:ss / h:mm:ss) |
| `h` `m` `s` | `m=10&s=30` | alternativně hodiny/minuty/sekundy |
| `label` | `label=BRB za chvíli` | nápis nad číslicemi (`label=` **prázdné** = jen číslice) |
| `bg=0` | `bg=0` | **průhledné pozadí** (pro overlay v OBS) |
| `controls=0` | `controls=0` | schová ovládací panel |
| `autostart=1` | `autostart=1` | odstartuje hned po načtení |
| `loop=1` | `loop=1` | po dokončení se sám restartuje (2,5 s pauza) |
| `sound=0` | `sound=0` | vypne zvukový signál |

Příklady:

- **Pauza / BRB na 10 minut:** `…?t=600&label=Pauza&bg=0&controls=0&autostart=1`
- **Konec streamu loop:** `…?t=300&label=Stream končí&bg=0&controls=0&autostart=1&loop=1`
- **Krátký odpočet se zvukem:** `…?t=15&autostart=1`

## Nastavení ve StreamElements (pořádný widget)

Ve widgetu je ovládací panel **vypnutý úplně** — na stream se nikdy nezobrazí.
Čas a nápis se nastavují v **levém panelu editoru** (pole, která definuješ v záložce FIELDS).

### Vytvoření widgetu

1. StreamElements → *Moje overlaye* → **+ Přidat widget** → **Custom**
2. Klikni na **OPEN EDITOR** — otevře se editor se záložkami **HTML / CSS / JS / FIELDS**
3. Do záložek vlož obsah souborů ze složky `streamelements/`:

| Záložka | Soubor |
|---|---|
| **HTML** | `streamelements/markup.html` |
| **CSS** | `streamelements/style.css` |
| **JS** | `streamelements/script.js` |
| **FIELDS** | `streamelements/fields.json` |

4. **Save** — v levém panelu se objeví nastavení widgetu

### Pole v levém panelu

| Pole | Co nastavíš |
|---|---|
| **Čas odpočtu** | `5:00`, `90` (sekund), `1:30:00` |
| **Nápis** | nad číslicemi; prázdné = jen číslice |
| **Pozadí západu slunce** | vypnuto = **průhledné** (overlay) |
| **Zvukový signál** | pípnutí na konci |
| **Odstartovat automaticky** | zapnuto = poběží hned po načtení |
| **Opakovat** | po dokončení restart po 2,5 s |

Změny se projeví okamžitě v náhledu editoru.

## Poznámky

- Zvuk přehraje prohlížeč; když OBS zvuk blokuje (autoplay politika), stejně
  blikají číslice — signál je vždy vidět.
- Odpočet je přesný (počítá podle reálného času, ne podle počtu tiků).
- Nic se nikam neodesílá — jen Google Fonts (Anton, Inter).

## GitHub

Repozitář: `https://github.com/korvasj-sketch/odpocet` (veřejný — je v něm jen
tahle stránka, žádná citlivá data). Webová verze běží přes GitHub Pages:
`https://korvasj-sketch.github.io/odpocet/`
