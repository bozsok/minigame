# Project Brief: Egér Kaland a Kamrában

## Executive Summary

Egy 2D játék gyerekeknek, ahol egérműveleteket gyakorolhatnak szórakoztató módon egy kamra hátteren. A játékos babokat gyűjt befőttes üvegekbe, sajtokat eszik energiafeltöltéshez, és teli üvegeket szállít el 5 perces időkorlát alatt – alkalmas informatika órákon való rövid kikapcsolódásra.

Elsődleges probléma: Gyerekeknek szükségük van az egérkezelés tanulására játékos formában.

Célközönség: Gyerekek, akik számítógépet használnak.

Kulcs értékajánlat: Oktatási játék, amely fejleszti a kéz-szem koordinációt és az egérkezelést vidám történeten keresztül, időkorláttal való kihívással.

## Problem Statement

Jelenlegi állapot: Gyerekek, akik számítógépet tanulnak, gyakran unalmas vagy nem elég interaktív módon gyakorolják az egérműveleteket (bal/jobb klikk, dupla klikk, drag-and-drop), ami frusztrációt okoz és lassítja a tanulást.

Fájdalompontok: Nehézség az egérkezelésben, hiányzó játékos tanulási módszerek, időhiány az órákon.

Hatás: Rossz számítógépes készségek, csökkent önbizalom a technológiában, késleltetett digitális írástudás.

Miért nem elégségesek a meglévő megoldások: Hagyományos oktatóprogramok vagy tutorialok nem szórakoztatóak, nem motiválják a gyerekeket, és nem gyakorolják az időnyomás alatti műveleteket.

Sürgősség és fontosság: A digitális írástudás alapvető ma, és korán kell fejleszteni, hogy a gyerekek magabiztosan használják a számítógépeket.

## Proposed Solution

Mag: Egy 2D játék, ahol gyerekek egérműveleteket gyakorolnak egy kamra környezetben babok gyűjtésével, sajtok evésével és üvegek szállításával.

Kulcs megkülönböztetők: Időkorlát (5 perc), energia rendszer (sajtokkal töltve), fázis alapú progresszió (üvegek töltése), gyerekeknek tervezve informatika órákra.

Miért fog sikerülni ahol mások nem: Szórakoztató tanulás időnyomással, motiváló jutalmak nélkül is (az idő "harc" elég), egyszerű mechanikák gyors tanuláshoz.

Magas szintű vízió: Egy oktatási játékplatform része, ahol különböző számítógépes készségeket lehet gyakorolni rövid játékokban.

## Target Users

### Primary User Segment: Gyerekek számítógép tanuláshoz

Demográfiai profil: 6-12 éves gyerekek, iskolások.

Jelenlegi viselkedések és munkafolyamatok: Számítógépet használnak órákon, de gyakran küzdenek az egérkezeléssel.

Specifikus szükségletek és fájdalompontok: Unalmas tanulás, frusztráció az egérműveleteknél.

Célok: Egérkezelés elsajátítása játékos módon, önbizalom növelése a technológiában.

## Goals & Success Metrics

### Business Objectives
- Legalizáljuk a játékot 100 iskolában 6 hónapon belül.
- 80% felhasználói elégedettség az oktatási értékkel.

### User Success Metrics
- 90% gyerekek sikerrel teljesítik az egérműveleteket első próbálkozásra.
- Átlagos játékidő 4 perc, teljesítési arány 70%.

### Key Performance Indicators (KPIs)
- Teljesítési arány: 70% - mérés: játék vége sikeres/sikertelen.
- Felhasználói visszajelzés: 4/5 csillag átlag - mérés: egyszerű kérdőív játék után.

## MVP Scope

### Core Features (Must Have)
- **Bab gyűjtés:** Bal klikk gyakorlás, fázis töltés.
- **Sajt evés:** Jobb klikk, energia feltöltés.
- **Üveg szállítás:** Drag-and-drop, dupla klikk.
- **Időzítés:** 5 perc energia rendszerrel.
- **Tutorial:** Bevezető szint oktató tippekkel.

### Out of Scope for MVP
- Több szint vagy karakter.
- Online ranglista.
- Hang testreszabás.

### MVP Success Criteria
A játék teljesíti a célokat, ha 70% felhasználó sikeresen befejezi, és pozitív visszajelzést ad.

## Post-MVP Vision

### Phase 2 Features
További szintek, hanghatások, egyszerű ranglista.

### Long-term Vision
Oktatási játékplatform, ahol különböző számítógépes készségeket gyakorolnak rövid játékokban.

### Expansion Opportunities
Mobil verzió, több nyelv, integráció iskolai rendszerekbe.

## Technical Considerations

### Platform Requirements
- **Target Platforms:** Web böngésző (desktop).
- **Browser/OS Support:** Modern böngészők, Windows/Mac.
- **Performance Requirements:** 60 FPS, alacsony erőforrás.

### Technology Preferences
- **Frontend:** Phaser 3, TypeScript.
- **Backend:** Nincs szükség.
- **Database:** Nincs.
- **Hosting/Infrastructure:** Statikus weboldal.

### Architecture Considerations
- **Repository Structure:** Egyszerű, játék fájlok.
- **Service Architecture:** Egyoldalas játék.
- **Integration Requirements:** Nincs.
- **Security/Compliance:** Gyerekbarát, adatvédelem.

## Constraints & Assumptions

### Constraints
- **Budget:** Alacsony, ingyenes eszközök.
- **Timeline:** 3 hónap fejlesztés.
- **Resources:** Egy fejlesztő.
- **Technical:** Phaser 3 ismeret szükséges.

### Key Assumptions
- Gyerekek hozzáférnek számítógépekhez iskolákban.
- Egyszerű játék elég motiváló.

## Risks & Open Questions

### Key Risks
- **Elköteleződés:** Gyerekek unatkozhatnak – hatás: alacsony használtság.
- **Technikai:** Phaser 3 teljesítmény – hatás: lassú játék.

### Open Questions
- Hogyan mérjük az egérkezelés javulását?

### Areas Needing Further Research
- Hasonló oktatási játékok sikeressége.

## Appendices
(Még nincs kutatás vagy stakeholder input.)

## Next Steps

### Immediate Actions
1. Fejlesztés megkezdése Phaser 3-mal.
2. Piackutatás elvégzése.

### PM Handoff
Ez a Project Brief teljes kontextust ad az Egér Kaland a Kamrában projekthez. Kérlek, kezdd 'PRD Generation Mode'-ban, és dolgozd végig a brief-et szakaszonként, kérdezz rá bármilyen szükséges tisztázásra vagy javasolj javításokat.