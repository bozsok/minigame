# Asset Integráció Útmutató

## Hogyan használd a React alkalmazásban

### 1. NPM package telepítése
```bash
npm install @bozsok/eger-kaland-jatek
```

### 2. Assets másolása a React app public mappájába

```
your-react-app/
├── public/
│   └── assets/
│       └── images/
│           ├── bean-growth.png
│           ├── beans.png
│           ├── cheese-1.png
│           ├── cheese-2.png
│           ├── cheese-3.png
│           ├── cheese-4.png
│           ├── cheese-5.png
│           ├── cursor-eat.png
│           ├── em.png
│           ├── jar-body.png
│           ├── jar-lid.png
│           ├── pantry-bg.jpg
│           ├── pantry-collision.jpg
│           ├── pitcher.png
│           └── tm.png
```

### 3. React komponens használata

```tsx
import React, { useEffect, useRef } from 'react';
import { EgerKalandJatek, GameConfig, GameStats } from '@bozsok/eger-kaland-jatek';

const GameComponent: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<EgerKalandJatek | null>(null);

  useEffect(() => {
    if (gameContainerRef.current && !gameInstanceRef.current) {
      const gameConfig: GameConfig = {
        parent: gameContainerRef.current,
        width: 860,
        height: 484,
        // FONTOS: Itt állítsd be az asset útvonal prefixet
        assetBasePath: process.env.PUBLIC_URL || '',
        onGameComplete: (stats: GameStats) => {
          console.log('Játék befejezve:', stats);
        },
        onGameStart: () => {
          console.log('Játék elindult');
        }
      };

      gameInstanceRef.current = new EgerKalandJatek(gameConfig);
      gameInstanceRef.current.start();
    }

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={gameContainerRef} 
      style={{ width: '860px', height: '484px' }}
    />
  );
};

export default GameComponent;
```

### 4. Alternatív: Custom asset útvonal

Ha más helyen vannak a képek:

```tsx
const gameConfig: GameConfig = {
  parent: gameContainerRef.current,
  assetBasePath: '/custom/path/to/assets', // Saját útvonal
  // ... többi konfig
};
```

## Előnyök:

1. ✅ **Rugalmas**: Bármilyen React alkalmazásban használható
2. ✅ **Konfigurálható**: Asset útvonalak testreszabhatók
3. ✅ **Típusbiztos**: TypeScript támogatással
4. ✅ **Optimalizált**: Webpack automatikus optimalizáció
5. ✅ **Kompatibilis**: Működik standalone és integrált módban is

## Asset fájlok listája:

- `bean-growth.png` - Bab növekedési animáció
- `beans.png` - Bab sprite sheet
- `cheese-1.png` - `cheese-5.png` - Sajt sprite-ok
- `cursor-eat.png` - Evő kurzor kép
- `jar-body.png`, `jar-lid.png` - Üveg részei
- `pantry-bg.jpg` - Háttér kép
- `pantry-collision.jpg` - Ütközés térkép
- `pitcher.png` - Kancsó
- `em.png`, `tm.png` - Előző Méret/Teljes Méret ikonok