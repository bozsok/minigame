# Egér Kaland a Kamrában

Egy 2D oktatási játék gyerekeknek, ahol egérműveleteket gyakorolhatnak szórakoztató módon egy kamra hátteren.

## Játék Leírás

A játék célja az egérkezelés fejlesztése játékos formában. A játékos babokat gyűjt befőttes üvegekbe, sajtokat eszik energiafeltöltéshez, és teli üvegeket szállít el időkorlát alatt.

### 🎮 Komplett Játékmenet Folyamat
1. **Play gomb** → Automatikus teljesképernyős mód
2. **1 másodperc késés** → 250 bab spawn + 5 üveg + korsó megjelenés
3. **Bab gyűjtés** → Bal klikk, automatikus üveg töltés (10 bab/fázis)
4. **Üveg kezelés** → Dupla-klikk nyitás/zárás, fedő animációk
5. **Drag & Drop** → Teli üvegek húzása a korsóhoz, glow feedback
6. **Victory** → Mind az 5 üveg leadása után játék befejezés

### 🎯 Fejlesztési Célok (Gyerekeknek)
- **Egér pontosság** - Kis babok precíz klikkelése
- **Dupla-klikk készség** - Üvegek nyitás/zárás (300ms időzítés)
- **Drag & Drop** - Koordináció és célzás fejlesztése
- **Térbeli gondolkodás** - Pozícionálás és közelség értékelése

### Mechanikák
- **Bal klikk:** Bab gyűjtés ✅ *TELJES IMPLEMENTÁCIÓ* (250 bab spawn + klikk kezelés)
- **Dupla klikk:** Üveg nyitás/zárás ✅ *TELJES IMPLEMENTÁCIÓ* (animációkkal)
- **Húzás:** Üveg szállítás a kancsóhoz ✅ *TELJES IMPLEMENTÁCIÓ* (drag & drop)
- **Teljesképernyős mód:** tm.png/em.png gombokkal ✅ *TELJES IMPLEMENTÁCIÓ*
- **Responsive Scaling:** Valós arányosítás ✅ *FORRADALMI ÚJÍTÁS*
- **Jobb klikk:** Sajt evés energiafeltöltéshez ✅ *PIXEL-PERFECT COLLISION*

## Telepítés

1. Klónozd a repository-t:
   ```
   git clone https://github.com/felhasznalonev/eger-kaland-kamraban.git
   cd eger-kaland-kamraban
   ```

2. Telepítsd a függőségeket:
   ```
   npm install
   ```

3. Indítsd a fejlesztési szervert:
   ```
   npm run dev
   ```

4. Nyisd meg a böngészőben: `http://localhost:8080`

## Build

Production build létrehozása:
```
npm run build
```

## Technológia

- **Phaser 3:** Játékmotor
- **TypeScript:** Típusbiztos fejlesztés
- **Webpack:** Build eszköz
- **HTML/CSS:** UI elrendezés

## Projekt Struktúra

```
eger-kaland-kamraban/
├── src/
│   ├── scenes/          # Játék jelenetek (MenuScene, GameScene)
│   ├── gameObjects/     # Játék objektumok
│   │   ├── Bean.ts      # Bab objektum klikk kezeléssel
│   │   ├── Jar.ts       # Interaktív üveg dupla-klikk + drag & drop
│   │   ├── Pitcher.ts   # Drop zone korsó glow effektekkel
│   │   ├── Cheese.ts    # Sajt objektum pixel-perfect right-click evés
│   │   └── FullscreenButton.ts # Teljesképernyős vezérlő
│   ├── systems/         # Játék rendszerek
│   │   ├── BeanManager.ts   # 250 bab spawn + gyűjtés + responsive scaling
│   │   ├── JarManager.ts    # 5 üveg koordináció + progression
│   │   └── CheeseManager.ts # 5 sajt pozicionálás + dev mode slider
│   ├── utils/           # Segéd eszközök (ObjectPool)
│   ├── config/          # Konfigurációk (GameBalance, GameConfig)
│   ├── types/           # TypeScript típusok (BeanTypes, GameData)
│   └── main.ts          # Belépési pont
├── assets/              # Eszközök (images/, képek)
├── docs/                # Dokumentáció
│   └── eger-kaland-kamraban-game-architecture.md
├── dist/                # Build output
├── CHANGELOG.md         # Részletes változásnapló
└── README.md
```

## Fejlesztési Státusz

### ✅ Phase 4 - KOMPLETT JÁTÉK IMPLEMENTÁCIÓ (2025-10-11)

**🫘 Bab Gyűjtés Rendszer (BEFEJEZVE):**
- 250 bab természetes klaszter eloszlással
- Collision map alapú spawning (pantry-collision.jpg)
- Bal klikk gyűjtés animációkkal
- Egér gyakorlás optimalizálás (80px minimum távolság)
- Valós idejű UI frissítés (bab számláló + üveg fázis)

**🏺 Interaktív Üveg Rendszer (ÚJ - BEFEJEZVE):**
- 5 üveg bal felső sarokban (50px spacing)
- Dupla-klikk nyitás/zárás (300ms időzítés)
- Kétfázisú fedő animáció (tetejére ↔ oldalra)
- Bean growth vizualizáció (68x92px, 5 fázis)
- Automatikus jar váltás és highlighting

**🍺 Pitcher Drop Rendszer (ÚJ - BEFEJEZVE):**
- Drag & Drop mechanika teli üvegekkel
- Glow effekt közelség érzékeléssel
- Precision collision detection (téglalap alapú)
- Jar validáció (csak teli és zárt üvegeket fogad)
- Victory detection (5 üveg leadása)

**🧀 Sajt Evés Rendszer (ÚJ - BEFEJEZVE):**
- 5 sajt típus precíz pozicionálással 
- Pixel-perfect collision detection
- Frame alapú evés (0-4): teljes → részleges → morzsák
- Spritesheet animáció setFrame() használattal
- Intelligent click-through (átlátszó területeken babok elérhetők)
- Professional dev mode (D billentyű + slider pozicionálás)

**🎯 Responsive Scaling (FORRADALMI ÚJÍTÁS):**
- **Valós arányosítás** huszárvágás helyett
- Matematikai pontosság (pl. 860/1920 = 0.448)
- Fullscreen ↔ Ablakos zökkenőmentes váltás
- Pozíciók és méretek egységes kezelése
- Child-friendly nagy tolerancia

**📱 Teljesképernyős Rendszer:**
- tm.png/em.png gombokkal mód váltás
- Dinamikus háttér skálázás (cover mode)
- Cross-browser kompatibilitás
- HTML API integráció

**🎮 Komplett Játékmenet:**
- Play gomb → 1s késés → 250 bab + interaktív elemek
- Bab gyűjtés → Üveg töltés → Drag & drop → Victory
- Responsive minden eszközön

### 🚧 Következő Fázisok
- **Phase 4:** Sajt evés rendszer (jobb-klikk mechanika)
- **Phase 5:** Audio integráció és fényezés
- **Phase 6:** Teljesítmény optimalizálás és tesztelés

## Licenc

MIT License

## Szerző

Maya (Game Developer)