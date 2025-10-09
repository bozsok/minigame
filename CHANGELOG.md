# Változás Napló

Minden lényeges változás ebben a projektben dokumentálva lesz.

A formátum a [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) alapján készült.

## [2.1.0] - 2025-01-09

### Hozzáadva
- **Teljesképernyős Rendszer TELJES:** Dinamikus háttér skálázás minden felbontáshoz
- MenuScene handleResize metódus a cross-scene kompatibilitáshoz
- Debug logging rendszer hibakereséshez
- Cover mode háttér skálázás (math.max algoritmus)
- Cross-browser fullscreen API támogatás

### Javítva
- **KRITIKUS:** Teljesképernyős módban a háttér most teljesen kitölti a képernyőt
- FullscreenButton MenuScene és GameScene kompatibilitás
- Háttér pozicionálás center módban
- Canvas skálázás konzisztencia

### Technikai
- MenuScene háttér skálázás implementáció
- updateBackgroundSizeWithDimensions metódus optimalizálás
- Phaser scale manager integrálás javítása

## [2.0.0] - 2025-01-09

### Hozzáadva
- **Bab Gyűjtés Rendszer ALAPOK:**
  - Bean.ts - Alapvető bab objektum 32x20px sprite frame-ekkel (0,1,2)
  - BeanManager.ts - Egyszerű random spawn rendszer
  - BeanTypes.ts - Alapvető típusdefiníciók
- **UI Rendszer Alapok:**
  - FullscreenButton.ts - tm.png/em.png teljesképernyős váltógomb
  - Alapvető UI elemek (energia, bab számláló szövegek)
- **Játékmechanikák - RÉSZLEGES:**
  - Egyszerű random bab spawning (NEM collision map alapú)
  - Bean objektumok létrehozása véletlenszerű frame-mel
  - Külső HTML Play gomb integráció automatikus teljesképernyős indítással

### Technikai
- Eseményvezérelt kommunikáció rendszerek között
- GameScene integráció UI elemekkel
- Teljesítmény monitoring és optimalizálás
- TypeScript strict mode kompatibilitás

## [1.1.0] - 2025-10-09zás Napló

Minden lényeges változás ebben a projektben dokumentálva lesz.

A formátum a [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) alapján készült.

## [2.2.0] - 2025-01-26

### Hozzáadva
- **Bab gyűjtési rendszer 2. fázis**: Teljes implementáció klikk-alapú babgyűjtéssel
- **BeanManager osztály**: 250 bab egyidejű spawn-olása intelligens pozicionálással
- **Bean.ts objektum**: Egyedi bab sprite-ok klikk kezeléssel és animációkkal
- **Ütközési térkép integráció**: pantry-collision.jpg alapú spawn zóna detektálás
- **Egérmozgás tréning optimalizálás**: 80px minimum távolság algoritmus a babok között
- **Fázis alapú üveg matematika**: GameBalance.ts-ben 50 bab/üveg, 5 fázis/üveg konfiguráció

### Módosítva
- **UI tisztítás**: "Kattints a babokra" szöveg és Menu gomb eltávolítása
- **Spawn rendszer átdolgozás**: Automatikus spawn letiltása, csak manuális indítás
- **Animációk egyszerűsítése**: Hover effektek eltávolítása, 0.3s fade animáció
- **Architektúra dokumentum**: Teljes frissítés a bab rendszer specifikációkkal

### Javított
- **Dupla spawn bug**: Automatikus spawn rendszer teljes eltávolítása
- **Végtelen bab probléma**: Pontos 250 bab limit érvényesítés
- **Klaszteresedés**: Optimális eloszlás az egérmozgás gyakorlásához
- **UI frissítés**: Valós idejű bab számláló és jar állapot megjelenítés

### Technikai
- Collision detection: Pixel-based white area scanning
- Event system: Bean collection és UI update események
- Performance: Optimalizált spawn algoritmus nagy mennyiségű objektumhoz
- TypeScript: Strict mode kompatibilitás minden új osztályban

## [2.1.0] - 2025-01-25

### Hozzáadva
- **Teljesképernyős rendszer**: Külső HTML Play gomb integráció
- **window.EgerKalandAPI**: Játék indítás külső felületről
- **FullscreenButton osztály**: Automatikus teljesképernyős váltás
- **GameScene koordináció**: API és belső logika összekapcsolása

### Módosítva
- HTML struktúra: Play gomb külső pozicionálás
- CSS layout: Központosított játék elrendezés
- Phaser konfiguráció: Teljesképernyős támogatás

### Technikai
- External API: window.EgerKalandAPI.startGame()
- Fullscreen API: Automatikus váltás indításkor
- Scene management: Boot → Preload → Game flow

## [1.1.0] - 2025-10-09

### Hozzáadva
- Teljes játék implementáció Phaser 3-mal és TypeScript-tel
- Egyedi UI elrendezés HTML/CSS-szel
- Egér műveletek gyakorlása: klikk, dupla klikk, húzás
- Játékmechanikák: bab gyűjtés, sajt evés, üveg szállítás
- Energia rendszer időkorláttal
- Projekt dokumentáció: architektúra, brief
- Build rendszer Webpack-kel
- TypeScript konfiguráció strict mode-ban

### Módosítva
- Architektúra dokumentum frissítése megvalósított konfigurációkkal
- UI elrendezés hozzáadása a dokumentumhoz

### Technikai
- Phaser 3.70+ integráció
- TypeScript 5.0+ strict mode
- Webpack build konfiguráció
- HTML/CSS játék elrendezés
- Canvas pozicionálás és stílus

## [1.0.0] - 2025-10-09

### Hozzáadva
- Projekt inicializálás
- Alap fájlok és struktúra
- Dokumentáció alapjai