// Asset útvonalak exportálása
export const GAME_ASSETS = {
  images: {
    // Háttér
    'pantry-bg': 'assets/images/pantry-bg.jpg',
    'pantry-collision': 'assets/images/pantry-collision.jpg',
    
    // Sprite-ok
    'beans': 'assets/images/beans.png',
    'jar-body': 'assets/images/jar-body.png',
    'jar-lid': 'assets/images/jar-lid.png',
    'pitcher': 'assets/images/pitcher.png',
    'bean-growth': 'assets/images/bean-growth.png',
    
    // Sajt sprite-ok
    'cheese-1': 'assets/images/cheese-1.png',
    'cheese-2': 'assets/images/cheese-2.png',
    'cheese-3': 'assets/images/cheese-3.png',
    'cheese-4': 'assets/images/cheese-4.png',
    'cheese-5': 'assets/images/cheese-5.png',
    
    // Kurzor képek
    'cursor-eat': 'assets/images/cursor-eat.png',
    
    // Egyéb
    'em': 'assets/images/em.png',
    'tm': 'assets/images/tm.png'
  }
};

// Asset útvonal resolver függvény
export const getAssetPath = (assetKey: string, basePath?: string): string => {
  const asset = GAME_ASSETS.images[assetKey as keyof typeof GAME_ASSETS.images];
  if (!asset) {
    throw new Error(`Asset not found: ${assetKey}`);
  }
  
  // Ha van basePath (React app esetén), azt használjuk
  if (basePath) {
    return `${basePath}/${asset}`;
  }
  
  // Különben az eredeti útvonal
  return asset;
};