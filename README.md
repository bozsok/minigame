# Egér Kaland a Kamrában

Egy 2D oktatási játék gyerekeknek, ahol egérműveleteket gyakorolhatnak szórakoztató módon egy kamra hátteren.

## Játék Leírás

A játék célja az egérkezelés fejlesztése játékos formában. A játékos babokat gyűjt befőttes üvegekbe, sajtokat eszik energiafeltöltéshez, és teli üvegeket szállít el időkorlát alatt.

### Mechanikák
- **Bal klikk:** Bab gyűjtés ⚠️ *RÉSZBEN IMPLEMENTÁLVA*
- **Jobb klikk:** Sajt evés energiafeltöltéshez
- **Dupla klikk:** Üveg nyitás/zárás
- **Húzás:** Üveg szállítás a kancsóhoz
- **Teljesképernyős mód:** tm.png gombbal ✅ *IMPLEMENTÁLVA*

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
│   ├── scenes/          # Játék jelenetek
│   ├── gameObjects/     # Játék objektumok (Bean, FullscreenButton)
│   ├── systems/         # Játék rendszerek (BeanManager)
│   ├── utils/           # Segéd eszközök (ObjectPool)
│   ├── config/          # Konfigurációk
│   ├── types/           # TypeScript típusok
│   └── main.ts          # Belépési pont
├── assets/              # Eszközök
├── docs/                # Dokumentáció
├── dist/                # Build output
└── README.md
```

## Fejlesztési Státusz

### ⚠️ Phase 2 - RÉSZBEN KÉSZ (2025-01-09)
- **Bab Rendszer Alapok:** Bean objektumok 32x20px sprite frame-ekkel
- **Teljesképernyős Mód:** Dinamikus háttér skálázás minden felbontáshoz
- **Külső Integráció:** HTML Play gomb API automatikus teljesképernyős indítással

### 🚧 Következő Fázisok
- **Phase 3:** Sajt evés rendszer (jobb-klikk mechanika)
- **Phase 4:** Üveg kezelés (dupla-klikk, drag-and-drop)
- **Phase 5:** Audio integráció és fényezés

## Licenc

MIT License

## Szerző

Maya (Game Developer)