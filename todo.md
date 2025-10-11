# JÁTÉK INTERAKCIÓ TILTÁS IMPLEMENTÁCIÓ TODO

## CÉL
Idő lejárta után minden interakció tiltása (sajt evés, jar dobás) biztonságos, centralizált módszerrel.

**FONTOS:** Jelenleg 20 másodperces timer van tesztelés céljából, véglegesen 5 perces lesz!

## FŐBB ELVEK
- ✅ Meglévő kód NEM változhat (csak bővítés)
- ✅ Centralizált vezérlés GameScene-ből
- ✅ Egységes interface minden Manager-ben
- ✅ Visual feedback biztosítása
- ✅ Hibamentes visszaállíthatóság

---

## IMPLEMENTÁCIÓS LÉPÉSEK

### 1. ELŐKÉSZÍTÉS ÉS ELEMZÉS
- [ ] 1.1. CheeseManager teljes feltérképezés:
  - [ ] 1.1.1. Sajt kattintás event handler-ek azonosítása (onPointerDown/onClick)
  - [ ] 1.1.2. Cursor management módszer (CSS vs Phaser cursor)
  - [ ] 1.1.3. Animáció logika (eating animation, frame changes)
  - [ ] 1.1.4. State management (sajt állapotok, spawn logika)
- [ ] 1.2. JarManager/Pitcher teljes feltérképezés:
  - [ ] 1.2.1. Drag lifecycle eseményei (dragstart, dragupdate, dragend)
  - [ ] 1.2.2. Drop zone collision detection mechanizmus
  - [ ] 1.2.3. Jar state management (üres/teli/pozíció)
  - [ ] 1.2.4. Pitcher acceptance logika (mikor fogadja el a jar-t)
- [ ] 1.3. Meglévő enable/disable mechanizmusok:
  - [ ] 1.3.1. Phaser setInteractive() használat keresése
  - [ ] 1.3.2. Event listener remove/add mintázatok
  - [ ] 1.3.3. Visual state change mechanizmusok
- [ ] 1.4. GameScene → Manager kommunikáció:
  - [ ] 1.4.1. Konstruktor paraméterek elemzése
  - [ ] 1.4.2. Public metódus interface-ek listázása
  - [ ] 1.4.3. Event emission/listening mintázatok
  - [ ] 1.4.4. Reference tárolás módszerei

### 2. CHEESEMANAGER BŐVÍTÉSE
- [ ] 2.1. Alapvető flag rendszer:
  - [ ] 2.1.1. `gameActive: boolean = true` private field hozzáadás
  - [ ] 2.1.2. TypeScript type safety ellenőrzés
  - [ ] 2.1.3. Default értékek tesztelése
- [ ] 2.2. Public interface létrehozás:
  - [ ] 2.2.1. `setGameActive(active: boolean): void` metódus
  - [ ] 2.2.2. `isGameActive(): boolean` getter metódus (debug célra)
  - [ ] 2.2.3. JSDoc dokumentáció hozzáadása
- [ ] 2.3. Event handler módosítások:
  - [ ] 2.3.1. Minden sajt click handler elejére gameActive check
  - [ ] 2.3.2. Early return implementáció inactive állapotban
  - [ ] 2.3.3. Console.log debug üzenetek hozzáadása
- [ ] 2.4. Cursor és visual feedback:
  - [ ] 2.4.1. Hover események tiltása inactive állapotban
  - [ ] 2.4.2. CSS cursor override ('not-allowed' vagy default)
  - [ ] 2.4.3. Opcionális: sajt objektumok alpha/tint változtatása
- [ ] 2.5. Animáció kezelés:
  - [ ] 2.5.1. Folyamatban lévő eating animációk befejezésének engedése
  - [ ] 2.5.2. Új animációk indításának tiltása
  - [ ] 2.5.3. Frame változások blokkolása inactive állapotban
- [ ] 2.6. TESZTELÉSI MATRIX:
  - [ ] 2.6.1. Normál sajt evés (gameActive=true) → működik
  - [ ] 2.6.2. Tiltott sajt evés (gameActive=false) → nem működik  
  - [ ] 2.6.3. State váltás közben eating → graceful handling
  - [ ] 2.6.4. Cursor változás teszt minden sajtfajára
  - [ ] 2.6.5. Multiple cheese click teszt inactive állapotban

### 3. JARMANAGER BŐVÍTÉSE  
- [ ] 3.1. `gameActive` private flag hozzáadása (default: true)
- [ ] 3.2. `setGameActive(boolean)` public metódus létrehozása
- [ ] 3.3. Jar drag kezdés eseményére gameActive ellenőrzés
- [ ] 3.4. Jar drop események gameActive ellenőrzés
- [ ] 3.5. Visual feedback inactive állapotban
- [ ] 3.6. TESZT: Jar húzás tiltás működése
- [ ] 3.7. TESZT: Normál működés változatlan maradása

### 4. PITCHER BŐVÍTÉSE (HA SZÜKSÉGES)
- [ ] 4.1. Pitcher drop zone logika elemzése
- [ ] 4.2. gameActive ellenőrzés hozzáadása ha szükséges
- [ ] 4.3. TESZT: Drop zone tiltás működése

### 5. GAMESCENE CENTRALIZÁLT VEZÉRLÉS
- [ ] 5.1. `disableAllInteractions()` private metódus létrehozása
- [ ] 5.2. CheeseManager setGameActive(false) hívás
- [ ] 5.3. JarManager setGameActive(false) hívás  
- [ ] 5.4. handleTimeUp() metódusba disableAllInteractions() beépítés
- [ ] 5.5. handleGameComplete() metódusba disableAllInteractions() beépítés (ha van)

### 6. VISUAL FEEDBACK JAVÍTÁSOK
- [ ] 6.1. Cursor változás tiltása inactive állapotban
- [ ] 6.2. Egységes visual feedback minden objektumnál
- [ ] 6.3. Opcionális: grayed out / faded megjelenés

### 7. RACE CONDITION ÉS EDGE CASE KEZELÉS
- [ ] 7.1. Folyamatban lévő interakciók:
  - [ ] 7.1.1. Sajt evés animáció közben timer lejár → befejezi animációt, nem ad pontot
  - [ ] 7.1.2. Jar drag közben timer lejár → befejezi mozgást, drop tiltva
  - [ ] 7.1.3. Pitcher drop animáció közben timer lejár → animation completion check
- [ ] 7.2. Timer lejárta közbeni események:
  - [ ] 7.2.1. handleTimeUp() atomikus végrehajtása
  - [ ] 7.2.2. Multiple handleTimeUp() hívás védelem
  - [ ] 7.2.3. Event listener cleanup sorrend optimalizálás
- [ ] 7.3. Browser és environment edge case-ek:
  - [ ] 7.3.1. Tab switch során aktív interakciók kezelése
  - [ ] 7.3.2. Fullscreen váltás közbeni state management
  - [ ] 7.3.3. Browser focus loss/gain események
  - [ ] 7.3.4. Memory leak prevention event listener-eknél
- [ ] 7.4. Scene lifecycle problémák:
  - [ ] 7.4.1. Scene restart közben aktív timer kezelése
  - [ ] 7.4.2. GameScene → MenuScene váltás közben cleanup
  - [ ] 7.4.3. Multiple scene instance protection

### 8. TELJES RENDSZER TESZT (COMPREHENSIVE)
- [ ] 8.1. Baseline funcionality (semmi sem változott):
  - [ ] 8.1.1. Normál játékmenet tesztidőn alatt (jelenleg 20mp, később 5 perc)
  - [ ] 8.1.2. Bab gyűjtés → jar töltés → pitcher delivery
  - [ ] 8.1.3. Sajt evés minden fajtából (cheese-1 to cheese-5)
  - [ ] 8.1.4. Timer visszaszámlálás és UI frissítés
  - [ ] 8.1.5. Fullscreen/windowed mode váltás
- [ ] 8.2. Idő lejárta scenariók (tesztidő lejárta után - jelenleg 20mp):
  - [ ] 8.2.1. Sajt kattintás minden fajtára → 100% tiltva
  - [ ] 8.2.2. Jar drag attempt → 100% tiltva
  - [ ] 8.2.3. Pitcher drop attempt → 100% tiltva
  - [ ] 8.2.4. Bab collection → már tiltva volt
  - [ ] 8.2.5. Timer megáll 00:00-nál
- [ ] 8.3. Visual és UX feedback:
  - [ ] 8.3.1. Cursor nem változik hover-nél (sajt, jar)
  - [ ] 8.3.2. Maradék babok piros glow megjelenése
  - [ ] 8.3.3. UI elemek konzisztens állapota
  - [ ] 8.3.4. Nincs konfusing visual state
- [ ] 8.4. Race condition stress test:
  - [ ] 8.4.1. Rapid click test timer lejárta előtt/közben/után
  - [ ] 8.4.2. Simultaneous drag attempt timer lejártakor
  - [ ] 8.4.3. Multiple object interaction timer boundary-n
- [ ] 8.5. Cross-browser és performance teszt:
  - [ ] 8.5.1. Chrome, Firefox, Edge compatibility
  - [ ] 8.5.2. Performance impact mérés (FPS, memory)
  - [ ] 8.5.3. Mobile touch event compatibility
- [ ] 8.6. Újrajátszás lifecycle teszt:
  - [ ] 8.6.1. Game over → MenuScene → új játék indítás
  - [ ] 8.6.2. Timer reset és újra aktiválás
  - [ ] 8.6.3. Minden interakció visszaállítása működő állapotba
  - [ ] 8.6.4. Memory cleanup ellenőrzés scene váltásnál

### 9. KÓDMINŐSÉG ELLENŐRZÉS
- [ ] 9.1. TypeScript hibák ellenőrzése
- [ ] 9.2. Console error/warning ellenőrzése
- [ ] 9.3. Teljesítmény impact mérése
- [ ] 9.4. Kód tisztaság review

### 10. DOKUMENTÁCIÓ ÉS CLEANUP
- [ ] 10.1. TODO.md frissítése az implementáció szerint
- [ ] 10.2. Kód kommentek hozzáadása
- [ ] 10.3. Debug console.log-ok eltávolítása/csökkentése
- [ ] 10.4. Végső ellenőrzési lista

---

## SIKERKRITÉRIUMOK

### MUST HAVE
- ✅ Idő lejárta után sajt evés 100%-ban tiltva
- ✅ Idő lejárta után jar műveletek 100%-ban tiltva
- ✅ Normál játékmenet változatlan működése
- ✅ Újrajátszás hibátlan működése

### SHOULD HAVE  
- ✅ Visual feedback az inactive állapotról
- ✅ Graceful handling folyamatban lévő interakcióknak
- ✅ Egységes UX minden tiltott objektumnál

### NICE TO HAVE
- ✅ Jövőbeli bővíthetőség (pause, power-ups stb.)
- ✅ Debug információk a state változásokról
- ✅ Performans optimalizációk

---

## VÉSZHELYZETI ROLLBACK TERV

Ha bármilyen probléma van:
1. **AZONNALI VISSZAÁLLÍTÁS:** Minden `setGameActive()` metódus törölhető
2. **PARTIAL ROLLBACK:** Manager-enkénti visszavonás lehetséges  
3. **TELJES RESET:** Git commit visszaállítás az implementáció előtti állapotba

---

**STATUS:** ⏳ Várakozás implementációra  
**UTOLSÓ FRISSÍTÉS:** 2025.10.11  
**FELELŐS:** GitHub Copilot AI