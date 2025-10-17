// Asset útvonalak exportálása - minigame namespace (abszolút útvonalak)
export const GAME_ASSETS = {
  images: {
    // Háttér
    'pantry-bg': './minigame/images/pantry-bg.jpg',
    'pantry-collision': './minigame/images/pantry-collision.jpg',
    
    // Sprite-ok
    'beans': './minigame/images/beans.png',
    'jar-body': './minigame/images/jar-body.png',
    'jar-lid': './minigame/images/jar-lid.png',
    'pitcher': './minigame/images/pitcher.png',
    'bean-growth': './minigame/images/bean-growth.png',
    
    // Sajt sprite-ok
    'cheese-1': './minigame/images/cheese-1.png',
    'cheese-2': './minigame/images/cheese-2.png',
    'cheese-3': './minigame/images/cheese-3.png',
    'cheese-4': './minigame/images/cheese-4.png',
    'cheese-5': './minigame/images/cheese-5.png',
    
    // Kurzor képek
    'cursor-eat': './minigame/images/cursor-eat.png',
    
    // Egyéb
    'em': './minigame/images/em.png',
    'tm': './minigame/images/tm.png'
  }
};

// Asset kulcsok exportálása TypeScript support-hoz
export type AssetKey = keyof typeof GAME_ASSETS.images;