# Olgito

Mobilna aplikacija za zakazivanje termina kod frizera (Android + iOS, React Native / Expo) + sopstveni server (Node.js + Express + SQLite) — bez Firebase-a, bez mesečnih troškova osim samog hostinga koji već imaš.

## Struktura projekta

```
app/                    ekrani mobilne aplikacije (expo-router)
  (auth)/                 prijava/registracija, dopuna profila, čekanje odobrenja, blokiran
  (client)/                klijentski tabovi
  (admin)/                 Olgičini tabovi (kalendar, klijenti, podešavanja...)
src/
  theme/                   boje, razmaci, tipografija (tropska paleta, beo tekst na jarkoj pozadini)
  types/                    TS tipovi (isti na appu i na serveru)
  api/                      pristup sopstvenom serveru (jedan fajl po celini, HTTP pozivi + JWT)
  context/AuthContext.tsx   stanje prijavljenog korisnika (token se čuva u SecureStore)
  components/               deljene UI komponente
  utils/time.ts             računanje slobodnih termina (30 min slotovi)
  notifications/            registracija push tokena (Expo push)
server/                  sopstveni backend
  src/db.ts                SQLite šema (fajl-baza, bez posebnog DB servera)
  src/routes/               REST rute (auth, users, services, working-hours, appointments...)
  src/reminders.ts          cron posao za 24h podsetnik
```

## Kako radi (ukratko)

- **Baza:** SQLite u jednom fajlu (`server/data/olgito.sqlite`) — nema poseban DB server za instaliranje/plaćanje.
- **Prijava:** email + lozinka, JWT token (važi 180 dana) čuva se na telefonu u SecureStore-u — korisnik ostaje prijavljen dok se ručno ne odjavi.
- **Slike profila:** čuvaju se direktno na serveru (`server/uploads/`), server ih servira kao statičke fajlove.
- **"Realtime" osvežavanje:** pošto nema Firebase-ov realtime servis, aplikacija periodično (na par sekundi) osvežava kalendar/liste pozivima ka serveru — dovoljno brzo za ovu vrstu aplikacije.
- **Push notifikacije:** i dalje idu preko **besplatnog** Expo push servisa (jedina veza sa Google/Apple infrastrukturom — neizbežna za mobilne notifikacije, ali ne košta ništa).
- **Olgičin admin nalog:** pravi se automatski pri prvom pokretanju servera iz `.env` (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) — nema ručnog podešavanja.

## 1. Pokretanje servera

```bash
cd server
npm install
cp .env.example .env
```

Otvori `server/.env` i popuni:
- `JWT_SECRET` — bilo koji dugačak nasumičan string (npr. `openssl rand -hex 32`, ili samo ukucaj 40-50 nasumičnih karaktera)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — Olgičini podaci za prijavu (nalog se pravi automatski pri prvom pokretanju)
- `PUBLIC_BASE_URL` — kad server bude na pravom serveru sa domenom, ovde ide npr. `https://api.olgito.rs` (dok testiraš lokalno, ostavi `http://localhost:4000`)

Pokretanje za razvoj (automatski se restartuje na izmenu koda):

```bash
npm run dev
```

Provera da radi: otvori `http://localhost:4000/health` u browseru — treba da vidiš `{"ok":true}`.

Za produkciju (na pravom serveru):

```bash
npm run build
npm start
```

### Deployment na Windows serveru

Pošto je server na kom ćemo hostovati **Windows**, evo koraka:

1. Instaliraj [Node.js LTS](https://nodejs.org) na serveru (isti installer kao na ovom računaru).
2. Prekopiraj ceo `server/` folder na server (bez `node_modules` i `data` — ti se prave na serveru).
3. Na serveru: `npm install`, pa `npm run build`.
4. Da server ostane živ i posle restarta mašine/gašenja terminala, koristi **PM2** (radi i na Windows-u):
   ```bash
   npm install -g pm2 pm2-windows-startup
   pm2-startup install
   pm2 start dist/index.js --name olgito-server
   pm2 save
   ```
   Od tad `pm2 restart olgito-server` / `pm2 logs olgito-server` za upravljanje.
5. **HTTPS**: mobilna aplikacija (pogotovo iOS) očekuje HTTPS. Ako server već ima domen, najlakše je staviti **Caddy** ili **nginx** ispred Node servera kao reverse proxy — oba automatski izvuku besplatan HTTPS sertifikat (Let's Encrypt). Javi kad dođeš do ovog koraka i imaš domen spreman, pa podešavamo zajedno.
6. Ne zaboravi da otvoriš port servera (podrazumevano 4000, ili port iza reverse proxy-ja) u Windows Firewall-u ako pristupaš spolja.

(`better-sqlite3` i `sharp` — koristi se za smanjivanje profilnih slika pri uploadu — imaju gotove binarne fajlove za Windows, pa `npm install` na serveru ne bi trebalo da traži dodatne alate poput Pythona/Visual Studio-a — ako ipak zatraži, javi grešku pa rešavamo.)

## 2. Pokretanje mobilne aplikacije

```bash
cp .env.example .env
```

U `.env` postavi `EXPO_PUBLIC_API_URL` na adresu servera:
- Test na fizičkom telefonu (ista Wi-Fi mreža kao računar): `http://<IP-ADRESA-RAČUNARA>:4000` (IP nađeš sa `ipconfig` na Windows-u)
- Android emulator: `http://10.0.2.2:4000`
- Kad server bude na pravom serveru: prava adresa/domen

Pokretanje:

```bash
npm start
```

Skeniraj QR kod **Expo Go** aplikacijom na telefonu (Android: Expo Go sa Play Store-a; iOS: Expo Go sa App Store-a). Skoro ceo app radi normalno u Expo Go — jedino **prave push notifikacije** (ne lokalne) zahtevaju "development build" (EAS), pošto ih Expo Go od skorije verzije ne podržava. Za to:

```bash
npm install -g eas-cli
eas login
eas init
eas build --profile development --platform android
```

## 3. Prava instalacija na telefon (ne Expo Go, ne "web APK")

Ovo pravi **pravu nativnu Android aplikaciju** (.apk fajl) koju Olgica i klijenti instaliraju direktno na telefon i koriste kao svaku drugu app — bez Expo Go, bez pretraživača, bez Play Store-a.

1. U `eas.json` zameni `EXPO_PUBLIC_API_URL` (u `preview` i `production` profilima) sa pravom adresom servera (domen ili javni IP + port), jer se ta adresa "peče" u aplikaciju u trenutku build-a — mora biti tačna PRE pokretanja build-a, ne može da se promeni posle instalacije.
2. Pokreni build (traži besplatan Expo nalog, `eas login` isto kao gore):
   ```bash
   eas build --profile preview --platform android
   ```
3. Kad se build završi (par minuta, radi se na Expo-vim serverima), dobijaš link ka `.apk` fajlu. Taj link otvoriš na telefonu (npr. pošalješ ga sebi preko Viber-a/mejla) i instaliraš — Android će tražiti dozvolu "Instaliraj iz nepoznatih izvora" jer app nije sa Play Store-a, to je očekivano i normalno za internu instalaciju.
4. Za iOS je princip isti (`eas build --profile preview --platform ios`), ali fizička instalacija na iPhone bez App Store-a zahteva Apple Developer nalog (99$/god.) i registraciju uređaja (UDID) — javi ako ti treba i ovo, pa podešavamo zajedno.
5. Kad budeš zadovoljna i želiš finalnu verziju (npr. za Play Store), koristi `production` profil (`eas build --profile production --platform android`) — pravi `.aab` fajl namenjen Play Store-u, ne za direktnu instalaciju.

## Poznata pojednostavljenja

- Kalendar/liste se osvežavaju periodičnim proverama (polling), a ne trenutnim guranjem promena — u praksi kašnjenje je par sekundi, nezametno za ovu vrstu korišćenja.
- Podsetnik 24h pre termina šalje se najkasnije u trenutku kad termin uđe u 24h prozor (ako je termin zakazan poslednjeg trenutka, podsetnik stiže odmah, ne tačno "24h pre").
- Nema slanja emaila (npr. za reset lozinke) — kad zatreba, dodaje se SMTP servis (ima i besplatnih opcija za mali obim).
