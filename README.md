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

## Poznámky

- Zvuk přehraje prohlížeč; když OBS zvuk blokuje (autoplay politika), stejně
  blikají číslice — signál je vždy vidět.
- Odpočet je přesný (počítá podle reálného času, ne podle počtu tiků).
- Nic se nikam neodesílá — jen Google Fonts (Anton, Inter).

## GitHub

Repozitář: `https://github.com/korvasj-sketch/odpocet` (veřejný — je v něm jen
tahle stránka, žádná citlivá data). Webová verze běží přes GitHub Pages:
`https://korvasj-sketch.github.io/odpocet/`
