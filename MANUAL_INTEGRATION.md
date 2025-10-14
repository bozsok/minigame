# Kézi Másolás Integrációs Útmutató

## ✅ Optimalizált Manual Integration

A projekt **teljesen optimalizált** kézi másoláshoz! A `minigame/` namespace védelem biztosít a React alkalmazás assets-eivel való ütközés ellen.

---

## 🚀 **1. Build Folyamat**

```bash
# Projekt root-ban
cd d:\dev\projects\minigame

# Library verzió buildei (React integrációhoz)
npm run build

# Vagy standalone verzió (teszteléshez)
npm run build:standalone
```

**Build kimenet:**
```
dist/
├── library.js              ← UMD Phaser játék (minified) ✅ KELL!
├── library.d.ts            ← TypeScript definíciók ✅ KELL!
├── library.js.LICENSE.txt  ← Licence fájl (opcionális)
├── minigame/               ← NAMESPACE VÉDELEM! ✅ KELL!
│   └── images/             ← Képek mappája
│       ├── beans.png       ← Bab sprite
│       ├── cheese-1.png → cheese-5.png ← Sajt animáció  
│       ├── cursor-eat.png  ← Egér kurzor
│       ├── em.png          ← Egér
│       ├── jar-body.png    ← Befőttes üveg test
│       ├── jar-lid.png     ← Befőttes üveg fedő
│       ├── pantry-bg.jpg   ← Kamra háttér
│       ├── pantry-collision.jpg ← Ütközés maszk
│       ├── pitcher.png     ← Kancsó
│       └── tm.png          ← Mókus
├── assets/                 ← TypeScript definíciós fájlok (NEM KELL)
├── config/                 ← TypeScript definíciós fájlok (NEM KELL)
├── gameObjects/            ← TypeScript definíciós fájlok (NEM KELL)
├── scenes/                 ← TypeScript definíciós fájlok (NEM KELL)
├── systems/                ← TypeScript definíciós fájlok (NEM KELL)
├── types/                  ← TypeScript definíciós fájlok (NEM KELL)
├── utils/                  ← TypeScript definíciós fájlok (NEM KELL)
├── index.d.ts              ← TypeScript definíciós fájl (NEM KELL)
└── main.d.ts               ← TypeScript definíciós fájl (NEM KELL)
```

**FONTOS: Mit kell másolni React integrációhoz:**
- ✅ **library.js** - Fő játék logika
- ✅ **library.d.ts** - TypeScript definíciók
- ✅ **minigame/** - Teljes mappa összes képpel
- ❌ **assets/, config/, gameObjects/, scenes/, systems/, types/, utils/** - Belső TypeScript definíciók, NEM KELLENEK!

**FONTOS: Abszolút útvonalak**
- A játék `/minigame/images/` formátumú útvonalakat használ
- React app `public/` mappájában kell `minigame/images/` struktúra
- Példa: `/minigame/images/beans.png` → `public/minigame/images/beans.png`

---

## 🔧 **2. Integrációs Lépések**

1. **Fájlok másolása a React projektbe:**
```
my-react-app/
├── public/
│   └── minigame/           # NEM assets/! 
│       └── images/         # Képek mappája
│           ├── beans.png
│           ├── cheese-1.png → cheese-5.png
│           ├── cursor-eat.png
│           ├── em.png
│           ├── jar-body.png
│           ├── jar-lid.png
│           ├── pantry-bg.jpg
│           ├── pantry-collision.jpg
│           ├── pitcher.png
│           └── tm.png
├── src/
│   └── components/
│       └── Game/
│           ├── EgerKalandJatek.js      # dist/library.js
│           └── EgerKalandJatek.d.ts    # dist/library.d.ts (ÁTNEVEZVE!)
```

2. **React komponensben használat:**
```tsx
import React, { useEffect, useRef } from 'react';
import EgerKalandJatek from './EgerKalandJatek.js'; // ← Lokális import
// TypeScript definíció automatikusan betöltődik a library.d.ts-ből

const GameComponent: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current) {
      const gameInstance = new EgerKalandJatek({
        parent: gameRef.current,
        width: 860,
        height: 484
      });
      gameInstance.start();
    }
  }, []);

  return <div ref={gameRef} style={{ width: '860px', height: '484px' }} />;
};
```

### **FONTOS: Abszolút útvonalak**
A játék **abszolút útvonalakat** használ (`/minigame/images/`), ezért a képeket a React alkalmazás `public/minigame/images/` mappájába kell másolni. A public mappából szolgáltatott fájlok a root URL-ről érhetők el.

### **Célstruktúra a React alkalmazásban:**
```
your-react-app/
├── src/
│   └── components/
│       └── Game/
│           ├── EgerKalandJatek.js      ← dist/library.js
│           ├── EgerKalandJatek.d.ts    ← dist/library.d.ts (ÁTNEVEZVE!)
│           └── GameComponent.tsx       ← Te írod
└── public/
    └── minigame/                       ← dist/minigame/ (teljes mappa)
        └── images/
            ├── beans.png
            ├── cheese-1.png → cheese-5.png
            ├── cursor-eat.png
            ├── em.png
            ├── jar-body.png
            ├── jar-lid.png
            ├── pantry-bg.jpg
            ├── pantry-collision.jpg
            ├── pitcher.png
            └── tm.png
```

### **Másolási lépések:**
```bash
# 1. Játék logika másolása (MINDKÉT fájl ugyanazt a nevet kapja!)
copy "d:\dev\projects\minigame\dist\library.js" "path\to\react\app\src\components\Game\EgerKalandJatek.js"
copy "d:\dev\projects\minigame\dist\library.d.ts" "path\to\react\app\src\components\Game\EgerKalandJatek.d.ts"

# 2. Asset mappa másolása (CSAK minigame mappát!)
xcopy "d:\dev\projects\minigame\dist\minigame" "path\to\react\app\public\minigame" /E /I

# Vagy PowerShell-ben:
Copy-Item "d:\dev\projects\minigame\dist\minigame" "path\to\react\app\public\" -Recurse

# FONTOS: TypeScript automatikus párosítás miatt EgerKalandJatek.js és EgerKalandJatek.d.ts azonos névvel!
```

---

## 🎮 **3. React Komponens Használat**

### **GameComponent.tsx példa:**
```tsx
import React, { useEffect, useRef, useCallback } from 'react';
import EgerKalandJatek from './EgerKalandJatek.js'; // ← Lokális import

// TypeScript támogatás (opcionális)
interface GameStats {
  beansCollected: number;
  jarsFilled: number;
  timeRemaining: number;
  energyBonusUsed: number;
  completionTime: number;
}

interface GameComponentProps {
  onGameComplete?: (stats: GameStats) => void;
  onGameStart?: () => void;
  width?: number;
  height?: number;
  enableFullscreen?: boolean;
}

const GameComponent: React.FC<GameComponentProps> = ({
  onGameComplete,
  onGameStart,
  width = 860,
  height = 484,
  enableFullscreen = false
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any>(null); // EgerKalandJatek instance

  // Fullscreen kezelés (opcionális)
  const handleFullscreenRequest = useCallback(() => {
    if (enableFullscreen && gameContainerRef.current) {
      if (gameContainerRef.current.requestFullscreen) {
        gameContainerRef.current.requestFullscreen();
      }
    }
  }, [enableFullscreen]);

  // Játék inicializálás
  useEffect(() => {
    if (gameContainerRef.current && !gameInstanceRef.current) {
      const gameConfig = {
        parent: gameContainerRef.current,
        width,
        height,
        allowFullscreen: enableFullscreen,
        disableAutoScale: true, // React konténer vezérli a méretet
        onGameComplete: (stats: GameStats) => {
          console.log('🎉 Játék befejezve!', stats);
          onGameComplete?.(stats);
        },
        onGameStart: () => {
          console.log('🎮 Játék elindult!');
          onGameStart?.();
        },
        onFullscreenRequest: handleFullscreenRequest
      };

      // Új játék instance létrehozása
      gameInstanceRef.current = new EgerKalandJatek(gameConfig);
      gameInstanceRef.current.start();
    }

    return () => {
      // Cleanup
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
      }
    };
  }, [width, height, enableFullscreen, handleFullscreenRequest, onGameComplete, onGameStart]);

  // Játék vezérlés metódusok
  const pauseGame = useCallback(() => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.pause();
    }
  }, []);

  const resumeGame = useCallback(() => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.resume();
    }
  }, []);

  const restartGame = useCallback(() => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.restart();
    }
  }, []);

  return (
    <div className="game-wrapper">
      {/* Játék konténer */}
      <div 
        ref={gameContainerRef} 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          border: '2px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#e0e0e0'
        }}
      />
      
      {/* Opcionális vezérlők */}
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button onClick={pauseGame} style={{ margin: '0 5px' }}>
          ⏸️ Szünet
        </button>
        <button onClick={resumeGame} style={{ margin: '0 5px' }}>
          ▶️ Folytatás
        </button>
        <button onClick={restartGame} style={{ margin: '0 5px' }}>
          🔄 Újraindítás
        </button>
      </div>
    </div>
  );
};

export default GameComponent;
```

---

## 🎯 **4. Előnyök és Biztosítékok**

### ✅ **Namespace Védelem:**
- `minigame/images/` - Nincs ütközés React assets-ekkel
- Biztonságos több játék integrálása
- Könnyű törlés/frissítés

### ✅ **Egyszerű Integráció:**
- **Nincs NPM dependency**
- **Nincs asset path konfiguráció**
- **Lokális fájl import**
- **Statikus útvonalak**

### ✅ **Development Workflow:**
```bash
# 1. Módosítod a játékot
# 2. npm run build
# 3. Másolod a dist/ tartalmat
# 4. React app automatikusan frissül
```

---

## 🛠 **5. Troubleshooting**

### **Képek nem jelennek meg:**
1. Ellenőrizd: `public/minigame/images/` létezik a React app-ban
2. Browser DevTools → Network → keress 404 hibákra (`/minigame/images/beans.png` stb.)
3. Konzol hibák ellenőrzése
4. **Útvonal formátum**: A játék `/minigame/images/` abszolút útvonalakat használ

### **TypeScript hibák:**
1. `EgerKalandJatek.d.ts` másolva van-e (dist/library.d.ts átnevezve!)
2. **Fájlnév párosítás:** `EgerKalandJatek.js` és `EgerKalandJatek.d.ts` azonos névvel
3. `@types/phaser` nem szükséges (Phaser included a library.js-ben)

### **Felesleges fájlok a dist/ mappában:**
- **Kérdés:** "Miért van annyi mappa a dist/-ben?"
- **Válasz:** TypeScript fejlesztési definíciók (assets/, config/, gameObjects/ stb.)
- **Mit másolj:** Csak `library.js`, `library.d.ts` és `minigame/` mappát!

### **Cursor méretezési problémák:**
- **Fix:** v4.8.3-tól a cursor automatikusan arányosodik az ablakmérethez
- **Tünet volt:** Sajt-evés cursor ablakos módban túl nagy
- **Megoldás:** Responsive cursor scaling implementálva

### **Játék nem indul:**
1. Container ref megfelelően beállítva
2. Width/height értékek érvényesek
3. Phaser automatikusan betöltődik a library.js-szel

---

## 🎉 **Eredmény**

**100% működőképes, biztonságos React integráció kézi másolással!**

- ✅ **Névtér védelem** - `minigame/` namespace
- ✅ **Egyszerű build** - `npm run build`
- ✅ **Lokális import** - Nincs NPM függőség  
- ✅ **Statikus assets** - Nincs dinamikus path
- ✅ **TypeScript** - Teljes típustámogatás
- ✅ **Game control** - pause/resume/restart

**Most már csak build-elni és másolni kell! 🚀**