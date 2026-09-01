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

(preporuka: pokreni ga kroz `pm2` ili systemd servis da ostane živ posle restarta servera — javi kad budeš tu, pomažem oko toga kad budu poznati detalji tvog servera)

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

## Poznata pojednostavljenja

- Kalendar/liste se osvežavaju periodičnim proverama (polling), a ne trenutnim guranjem promena — u praksi kašnjenje je par sekundi, nezametno za ovu vrstu korišćenja.
- Podsetnik 24h pre termina šalje se najkasnije u trenutku kad termin uđe u 24h prozor (ako je termin zakazan poslednjeg trenutka, podsetnik stiže odmah, ne tačno "24h pre").
- Nema slanja emaila (npr. za reset lozinke) — kad zatreba, dodaje se SMTP servis (ima i besplatnih opcija za mali obim).
