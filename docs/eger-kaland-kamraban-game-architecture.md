# Egér Kaland a Kamrában Játék Architektúra Dokumentum

## Bevezetés

Ez a dokumentum vázolja a teljes technikai architektúrát az Egér Kaland a Kamrában számára, egy 2D oktatási játékhoz, amely Phaser 3-mal és TypeScript-tel készült. Ez szolgál technikai alapként az AI-vezérelt játékfejlesztéshez, biztosítva a konzisztenciát és skálázhatóságot minden játék rendszerben.

Ez az architektúra úgy lett tervezve, hogy támogassa a játékterv dokumentumban meghatározott játékmechanikákat, miközben fenntartja a 60 FPS teljesítményt és a keresztplatform kompatibilitást.

### Változás Napló

| Dátum | Verzió | Leírás | Szerző |
| :--- | :------ | :---------- | :----- |
| 2025-10-09 | 1.0 | Kezdeti architektúra dokumentum | Maya |
| 2025-10-09 | 1.1 | Megvalósított konfigurációk és UI elrendezés hozzáadása | Maya |
| 2025-01-09 | 2.0 | Phase 2: Bab gyűjtés rendszer implementálva | Maya |
| 2025-01-09 | 2.1 | Phase 2 TELJES: Teljesképernyős rendszer tökéletesítve | Maya |
| 2025-01-09 | 2.2 | Bab gyűjtés rendszer befejezve - klikk mechanika + egér optimalizálás | Maya |

## Technikai Áttekintés

### Architektúra Összefoglaló

- Játékmotor választás: Phaser 3.70+ Arcade Physics-szal egyszerű 2D interakciókhoz
- Projekt struktúra: Moduláris TypeScript szervezettség tiszta elkülönítéssel jelenetek, rendszerek és játékobjektumok között
- Kulcs rendszerek: Jelenet kezelés, bemenet kezelés egér műveletekhez, eszköz kezelés sprite-okhoz, játékállapot előrehaladás nyomonkövetéshez
- Teljesítmény stratégia: Objektum pooling babokhoz, optimalizált sprite renderelés, 60 FPS cél monitoringgal
- GDD követelmények elérése: Támogatja az egér klikk edzést, energia rendszert, üveg töltés mechanikát és időalapú játékmenetet

### Platform Célok

**Elsődleges Platform:** Web böngésző (asztali)  
**Másodlagos Platformok:** Mobil böngészők  
**Minimum Követelmények:** Modern böngésző egér/érintés támogatással  
**Cél Teljesítmény:** 60 FPS asztali gépen, 30 FPS mobilon

### Technológiai Stack

**Mag Motor:** Phaser 3.70+  
**Nyelv:** TypeScript 5.0+ (Strict Mode)  
**Build Eszköz:** Webpack  
**Csomagkezelő:** npm  
**Tesztelés:** Jest  
**Telepítés:** Statikus web hosting

### UI Elrendezés

A játék egyedi HTML/CSS elrendezéssel rendelkezik:

- **Fő képernyő:** 1200x700px fehér lekerekített téglalap (#fff, border-radius: 20px)
- **Bal panel:** 300px széles, Play gomb
- **Jobb panel:** 900px széles, játék terület és utasítások
- **Játék terület:** 860x484px lekerekített téglalap (#e0e0e0, border-radius: 15px), canvas konténer
- **Utasítás terület:** Cím, leírás, utasítások szövege
- **Canvas:** 860x484px, pozicionálva felülre-balra, lekerekített sarkokkal (border-radius: 15px)

## Projekt Struktúra

### Repository Szervezet

```
eger-kaland-kamraban/
├── src/
│   ├── scenes/          # Játék jelenetek
│   ├── gameObjects/     # Egyéni játék objektumok (babok, üvegek, sajtok)
│   ├── systems/         # Mag játék rendszerek
│   ├── utils/           # Segéd függvények
│   ├── types/           # TypeScript típus definíciók
│   ├── config/          # Játék konfiguráció
│   └── main.ts          # Belépési pont
├── assets/
│   ├── images/          # Sprite eszközök (pics/)
│   ├── audio/           # Hang fájlok
│   ├── data/            # JSON adat fájlok
│   └── fonts/           # Betűtípus fájlok
├── public/              # Statikus web eszközök
├── tests/               # Teszt fájlok
├── docs/                # Dokumentáció
│   ├── stories/         # Fejlesztési történetek
│   └── architecture/    # Technikai dokumentumok
└── dist/                # Épített játék fájlok
```

### Modul Szervezet

#### Jelenet Struktúra
- Minden jelenet külön fájlban
- Jelenet-specifikus logika tartalmazva
- Tiszta adatátadás jelenetek között

#### Játék Objektum Minta
- Komponens-alapú architektúra
- Újrafelhasználható játék objektum osztályok
- Típusbiztos tulajdonság definíciók

#### Rendszer Architektúra
- Singleton managerek globális rendszerekhez
- Esemény-vezérelt kommunikáció
- Tiszta felelősség elkülönítés

## Mag Játék Rendszerek

### Jelenet Kezelő Rendszer

**Cél:** Játék folyamat és jelenet átmenetek kezelése

**Kulcs Komponensek:**
- Jelenet betöltés és eltávolítás
- Adatátadás jelenetek között
- Átmenet effektek
- Memória kezelés

**Megvalósítási Követelmények:**
- Preload jelenet eszköz betöltéshez
- Menü rendszer navigációval
- Játékmenet jelenetek állapot kezeléssel
- Szünet/folytatás funkcionalitás

**Létrehozandó Fájlok:**
- `src/scenes/BootScene.ts`
- `src/scenes/PreloadScene.ts`
- `src/scenes/MenuScene.ts`
- `src/scenes/GameScene.ts`
- `src/systems/SceneManager.ts`

### Játék Állapot Kezelés

**Cél:** Játékos előrehaladás és játék státusz nyomonkövetése

**Állapot Kategóriák:**
- Játékos előrehaladás (töltött üvegek, hátralévő idő)
- Játék beállítások (hang, vezérlés)
- Munkamenet adatok (aktuális energia, gyűjtött babok)
- Tartós adatok (legjobb idők, eredmények)

**Megvalósítási Követelmények:**
- Mentés/betöltés rendszer localStorage-szal
- Állapot validáció és hiba helyreállítás
- Munkamenetek közötti adat perzisztencia
- Beállítások kezelése

**Létrehozandó Fájlok:**
- `src/systems/GameState.ts`
- `src/systems/SaveManager.ts`
- `src/types/GameData.ts`

### Eszköz Kezelő Rendszer

**Cél:** Hatékony betöltés és kezelés játék eszközökhöz

**Eszköz Kategóriák:**
- Sprite lapok és animációk (bab fázisok, sajt fázisok)
- Hang fájlok és zene
- Szint adatok és konfigurációk
- UI eszközök és betűtípusok

**Megvalósítási Követelmények:**
- Progresszív betöltés stratégia
- Eszköz gyorsítótárazás és optimalizálás
- Hiba kezelés sikertelen betöltéseknél
- Memória kezelés nagy eszközökhöz

**Létrehozandó Fájlok:**
- `src/systems/AssetManager.ts`
- `src/config/AssetConfig.ts`
- `src/utils/AssetLoader.ts`

### Bemenet Kezelő Rendszer

**Cél:** Minden játékos bemenet kezelése platformokon keresztül

**Bemenet Típusok:**
- Egér műveletek (bal klikk, jobb klikk, dupla klikk, húzás)
- Érintés gesztusok (mobil)
- Billentyűzet vezérlők (opcionális)

**Megvalósítási Követelmények:**
- Bemenet mapping egér edzéshez
- Érintés-barát mobil vezérlők
- Bemenet bufferelés reszponzív játékmenethez
- Testreszabható vezérlés sémák

**Létrehozandó Fájlok:**
- `src/systems/InputManager.ts`
- `src/utils/TouchControls.ts`
- `src/types/InputTypes.ts`

### Játék Mechanika Rendszerek

#### Bab Gyűjtés Rendszer

**Cél:** Bab spawn, klikk és üveg töltés mechanika kezelése

**Mag Funkcionalitás:**
- Véletlenszerű bab elhelyezés ütközési térképen
- Bal klikk detekció és eltávolítás
- Fázis-alapú üveg töltés (minden 10. bab után)
- Vizuális visszajelzés és animációk

**Függőségek:** InputManager, GameState

**Teljesítmény Megfontolások:** Objektum pooling babokhoz

**Létrehozandó Fájlok:**
- `src/systems/BeanManager.ts`
- `src/gameObjects/Bean.ts`
- `src/types/BeanTypes.ts`

#### Sajt Evés Rendszer

**Cél:** Sajt sprite-ok, jobb-klikk evés és energia feltöltés kezelése

**Mag Funkcionalitás:**
- Sajt sprite fázis kezelés
- Jobb-klikk detekció és fázis progresszió
- Energia csík frissítések (+15mp fázisonként)
- Pozíció randomizálás

**Függőségek:** InputManager, GameState

**Teljesítmény Megfontolások:** Korlátozott sajt szám

**Létrehozandó Fájlok:**
- `src/systems/CheeseManager.ts`
- `src/gameObjects/Cheese.ts`
- `src/types/CheeseTypes.ts`

#### Üveg Kezelő Rendszer

**Cél:** Üveg állapotok, nyitás/zárás és drag-and-drop szállítás kezelése

**Mag Funkcionalitás:**
- Dupla-klikk nyitás/zárás
- Drag-and-drop kancsóhoz
- Üveg eltűnés szállítás után
- Fázis vizualizáció

**Függőségek:** InputManager, PhysicsManager

**Teljesítmény Megfontolások:** Fizika drag műveletekhez

**Létrehozandó Fájlok:**
- `src/systems/JarManager.ts`
- `src/gameObjects/Jar.ts`
- `src/types/JarTypes.ts`

### Fizika és Ütközés Rendszer

**Fizika Motor:** Arcade Physics

**Ütközés Kategóriák:**
- Bab gyűjtés területek
- Üveg interakció zónák
- Kancsó ejtés zónák
- UI elem interakciók

**Megvalósítási Követelmények:**
- Optimalizált ütközés detekció
- Fizika test kezelés
- Ütközés callback-ok és események
- Teljesítmény monitoring

**Létrehozandó Fájlok:**
- `src/systems/PhysicsManager.ts`
- `src/utils/CollisionGroups.ts`

### Hang Rendszer

**Hang Követelmények:**
- Háttérzene loop-pal
- Hang effektek klikkekhez, fázisokhoz, sikerhez
- Hang beállítások és hangerő vezérlés
- Mobil hang optimalizálás

**Megvalósítási Funkciók:**
- Hang sprite kezelés
- Dinamikus zenei rendszer
- Térbeli hang (ha alkalmazható)
- Hang pooling teljesítményhez

**Létrehozandó Fájlok:**
- `src/systems/AudioManager.ts`
- `src/config/AudioConfig.ts`

### UI Rendszer

**UI Komponensek:**
- Energia csík megjelenítés
- Hátralévő idő számláló
- Üveg töltés indikátorok
- Siker/sikertelenség üzenetek

**Megvalósítási Követelmények:**
- Reszponzív layout rendszer
- Érintés-barát interfész
- Billentyűzet navigáció támogatás
- Animáció és átmenetek

**Létrehozandó Fájlok:**
- `src/systems/UIManager.ts`
- `src/gameObjects/UI/`
- `src/types/UITypes.ts`

## Teljesítmény Architektúra

### Teljesítmény Célok

**Frame Rate:** 60 FPS fenntartott, 30 FPS minimum  
**Memória Használat:** <50MB összesen  
**Betöltési Idők:** <3s kezdeti, <1s szintenként  
**Akkumulátor Optimalizálás:** Csökkentett frissítések láthatatlanságkor

### Optimalizálási Stratégiák

#### Objektum Pooling
- Babok és lövedékek
- Részecske effektek
- UI elemek

#### Eszköz Optimalizálás
- Textúra atlaszok sprite-okhoz
- Hang kompresszió
- Lusta betöltés nagy eszközökhöz
- Progresszív enhancement

#### Renderelés Optimalizálás
- Sprite batching
- Off-screen objektumok culling-ja
- Csökkentett részecske számok mobilon
- Textúra felbontás skálázás

#### Létrehozandó Fájlok
- `src/utils/ObjectPool.ts`
- `src/utils/PerformanceMonitor.ts`
- `src/config/OptimizationConfig.ts`

## Játék Konfiguráció

### Phaser Konfiguráció

```typescript
// src/config/GameConfig.ts
export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 860,
  height: 484,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.NONE,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  backgroundColor: 'transparent',
};
```

### Játék Egyensúly Konfiguráció

```typescript
// src/config/GameBalance.ts
export const GameBalance = {
    energy: {
        initialTime: 60, // másodperc
        cheeseBonus: 15 // másodperc fázisonként
    },
    jar: {
        beansPerJar: 50,
        phasesPerJar: 5,
        beansPerPhase: 10
    },
    time: {
        totalTime: 300 // 5 perc
    }
};
```

## Fejlesztési Irányelvek

### TypeScript Standardok

#### Típus Biztonság
- Strict mode használata
- Interfészek definiálása minden adatstruktúrához
- `any` típus használat kerülése
- Enum-ok játék állapotokhoz

#### Kód Szervezet
- Egy osztály fájlonként
- Tiszta elnevezési konvenciók
- Helyes hiba kezelés
- Átfedő dokumentáció

### Phaser 3 Legjobb Gyakorlatok

#### Jelenet Kezelés
- Erőforrások tisztítása shutdown()-ban
- Scene data használata kommunikációhoz
- Helyes esemény kezelés implementálása
- Memória szivárgás elkerülése

#### Játék Objektum Design
- Phaser osztályok megfelelő kiterjesztése
- Komponens-alapú architektúra
- Objektum pooling implementálása ahol szükséges
- Konzisztens update minták követése

### Tesztelési Stratégia

#### Unit Tesztelés
- Játék logika tesztelése külön Phaser-től
- Phaser függőségek mock-olása
- Segéd függvények tesztelése
- Játék egyensúly számítások validálása

#### Integrációs Tesztelés
- Jelenet betöltés és átmenetek
- Mentés/betöltés funkcionalitás
- Bemenet kezelés
- Teljesítmény benchmark-ok

#### Létrehozandó Fájlok
- `tests/utils/GameLogic.test.ts`
- `tests/systems/SaveManager.test.ts`
- `tests/performance/FrameRate.test.ts`

## Telepítési Architektúra

### Build Folyamat

#### Fejlesztési Build
- Gyors kompiláció
- Source map-ok engedélyezve
- Debug logging aktív
- Hot reload támogatás

#### Production Build
- Minified és optimalizált
- Eszköz kompresszió
- Teljesítmény monitoring
- Hiba tracking

### Telepítési Stratégia

#### Web Telepítés
- Statikus hosting (GitHub Pages/Netlify)
- CDN eszközökhöz
- Progresszív betöltés
- Böngésző kompatibilitás

#### Mobil Csomagolás
- Cordova/Capacitor wrapper
- Platform-specifikus optimalizálás
- App store követelmények
- Teljesítmény tesztelés

## Megvalósítási Útiterv

### 1. Fázis: Alapok (2 hét)

#### Mag Rendszerek
- Projekt setup és konfiguráció
- Alap jelenet kezelés
- Eszköz betöltés pipeline
- Bemenet kezelés keretrendszer

#### Story Epics
- "Engine Setup and Configuration"
- "Basic Scene Management System"
- "Asset Loading Foundation"

### 2. Fázis: Játék Rendszerek (3 hét)

#### Játékmenet Rendszerek
- [x] Bab gyűjtés implementáció - **BEFEJEZVE** (teljes funkcionalitás)
- [x] Teljesképernyős rendszer - **BEFEJEZVE**
- [ ] Fizika és ütközés rendszer
- [ ] Játék állapot kezelés
- [-] UI keretrendszer alapok - **RÉSZBEN KÉSZ**

#### Story Epics
- [x] "Bean Collection System Implementation" - **BEFEJEZVE** (spawn + klikk + UI)
- [x] "Fullscreen System with Dynamic Background Scaling" - **BEFEJEZVE**
- [x] "External HTML Integration API" - **BEFEJEZVE**
- [ ] "Physics and Collision Framework"
- [ ] "Game State Management System"

#### Megvalósított Komponensek (Phase 2 - MAJDNEM KÉSZ):
**Bab Rendszer Funkcionális:**
- ✅ `src/gameObjects/Bean.ts` - Teljes bab objektum klikk kezeléssel és animációkkal
- ✅ `src/systems/BeanManager.ts` - 250 bab egyidejű spawn optimalizált eloszlással
- ✅ `src/types/BeanTypes.ts` - Kiterjesztett bab típusdefiníciók klaszter támogatással
- ✅ Véletlenszerű frame kiválasztás (0,1,2) - 3 különböző bab sprite
- ✅ - Collision map alapú spawning - pantry-collision.jpg pixel alapú fehér területeken
- Egér gyakorlás optimalizáció - 80px minimum távolság a babok között
- Klaszter-mentes eloszlás - minden bab egyedi pozícióban
- 250 bab egyidejű spawn - 5 üveg × 50 bab matematikával
- Klikk gyűjtés mechanika - bal egérgomb kezelés animációval
- UI valós idejű frissítés - bab számláló és üveg fázis kijelző fehér területek
- ✅ Klikk gyűjtés mechanika - bal egérgomb + animáció + eseménykezelés
- ✅ Egér gyakorlás optimalizálás - 80px minimum távolság babok között
- ✅ Üveg fázis számítás - 10 bab/fázis, 50 bab/üveg, 5 üveg összesen
- ✅ UI frissítés rendszer - valós idejű számláló és fázis kijelző

**Teljesképernyős Rendszer:**
- ✅ `src/gameObjects/FullscreenButton.ts` - Teljesképernyős funkció
- ✅ tm.png/em.png képekkel történő mód váltás
- ✅ Automatikus canvas skálázás teljesképernyős módban
- ✅ Cross-browser kompatibilitás (Chrome, Firefox, Safari, Edge)
- ✅ MenuScene és GameScene keresztkompatibilitás
- ✅ Dinamikus háttér skálázás (cover mode) minden felbontáshoz

**Külső Integráció:**
- ✅ HTML Play gomb API (`window.EgerKalandAPI.startGame()`)
- ✅ Automatikus teljesképernyős indítás
- ✅ Tiszta MenuScene külső vezérléshez

### 3. Fázis: Tartalom és Fényezés (2 hét)

#### Tartalom Rendszerek
- Szint betöltés és kezelés
- Hang rendszer integráció
- Teljesítmény optimalizálás
- Végső fényezés és tesztelés

#### Story Epics
- "Level Management System"
- "Audio Integration and Optimization"
- "Performance Optimization and Testing"

## Kockázat Értékelés

| Kockázat                         | Valószínűség | Hatás     | Csökkentési Stratégia |
| ---------------------------- | ----------- | ---------- | ------------------- |
| Teljesítmény problémák mobilon | Közepes      | Magas       | Eszközök optimalizálása, FPS monitoring |
| Eszköz betöltés szűk keresztmetszetek    | Alacsony         | Közepes     | Progresszív betöltés, gyorsítótárazás |
| Keresztplatform kompatibilitás | Közepes      | Magas       | Több eszközön tesztelés, fallback-ok használata |

## Siker Kritériumok

### Technikai Metrikák
- Minden rendszer implementálva specifikáció szerint
- Teljesítmény célok konzisztensen elérve
- Nulla kritikus bug mag rendszerekben
- Sikeres telepítés cél platformokon keresztül

### Kód Minőség
- 90%+ teszt lefedettség játék logikán
- Nulla TypeScript hiba strict mode-ban
- Konzisztens adherence kódolási standardokhoz
- Átfedő dokumentáció lefedettség