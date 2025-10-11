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