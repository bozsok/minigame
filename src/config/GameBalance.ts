export const GameBalance = {
  energy: {
    initialTime: 60, // másodperc
    cheeseBonus: 15 // másodperc klikkenként (max 4× sajt esetén = 60 másodperc)
  },
  jar: {
    beansPerJar: 50,     // 50 bab tölt ki egy üveget teljesen
    phasesPerJar: 5,     // 5 fázis van üvegenként (0,1,2,3,4,5)
    beansPerPhase: 10    // 10 bab után változik a fázis
  },
  time: {
    totalTime: 300 // 5 perc
  }
};