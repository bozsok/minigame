/**
 * UI konstansok - mágikus számok központosítása
 */

export const UIConstants = {
  // Timer méretek
  timer: {
    baseWidth: 175,
    baseHeight: 75,
    baseFontSize: 42,
    baseStrokeThickness: 4,
    baseBorderWidth: 6,
    baseCornerRadius: 20
  },
  
  // Energia méretek
  energy: {
    baseWidth: 120,
    baseHeight: 12,
    baseFontSize: 10,
    baseStrokeThickness: 1,
    baseBorderWidth: 1, // 1px border
    baseCornerRadius: 0, // Szögletes, nincs lekerekítés
    cursorOffset: 30, // Távolság az egérkurzor felett
    consumptionRate: 2, // 2 pixel/mp = 60 másodperc alatt merül le (120px / 60s = 2px/s)
    borderColor: '#242424' // Border szín
  },
  
  // Pozíciók
  positions: {
    fullscreenButtonOffset: 40,
    timerOffsetFromButton: 10,
    energyOffset: 20,
    instructionOffset: 40
  },
  
  // Színek
  colors: {
    timerWhite: '#ffffff',
    timerOrange: '#ffaa00',
    timerRed: '#ff0000',
    timerStroke: '#333333',
    timerBorder: '#3ba4c2',
    energyBackground: '#4CAF50',
    energyGreen: '#4CAF50',
    energyOrange: '#ff9800',
    energyRed: '#f44336',
    energyStroke: '#333333',
    energyBorder: '#242424',
    instructionBackground: '#2196F3'
  },
  
  // Időzítések (milliszekundumban)
  timings: {
    gameStartDelay: 1000,
    sceneTransitionDelay: 100,
    fullscreenDelay: 500,
    fontCheckInterval: 100,
    fontTimeout: 2000,
    fontFallbackTimeout: 800,
    instructionReset: 2000,
    jarCompletionReset: 3000
  },
  
  // Skálázási értékek
  scaling: {
    fullscreenScale: 1.0,
    windowedScale: 0.25,
    beanFullscreenScale: 0.7,
    beanWindowedScale: 0.175
  },
  
  // Érzékenységi értékek
  thresholds: {
    timerOrangeThreshold: 120, // másodperc
    timerRedThreshold: 30,     // másodperc
    timerDebugRange: 10        // első X másodperc debug-hoz
  }
};