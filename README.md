# Olgito

Mobilna aplikacija za zakazivanje termina kod frizera (Android + iOS, React Native / Expo + Firebase).

## Šta je već urađeno

- Cela app struktura (klijent + admin ekrani), navigacija, tropska tema
- Prijava preko broja telefona (SMS kod) + dopuna profila (ime, godine, slika)
- Zakazivanje termina (30 min po osobi), kalendar, otkazivanje, potvrda dolaska
- Odobravanje/blokiranje klijenata, hitni zahtevi, zahtevi za pomeranje termina
- Radno vreme (nedeljni raspored + izuzeci po datumu + pauze), usluge i cenovnik
- Cloud Functions za notifikacije (nov termin, potvrda, otkazivanje, hitno, 24h podsetnik)
- Firestore/Storage security rules

Kod je napisan i tipski proveren (`npx tsc --noEmit` prolazi bez grešaka), ali **ne može da se testira na uređaju dok se ne poveže sa pravim Firebase projektom** — to zahteva tvoj Google nalog, pa taj deo moraš ti da odradiš (koraci ispod).

## 1. Napravi Firebase projekat

1. Idi na [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → nazovi ga npr. "Olgito".
2. **Authentication** → Sign-in method → uključi **Phone**.
   - Preporuka za razvoj: u istom meniru dodaj par "Phone numbers for testing" (npr. `+381600000000` / kod `123456`) da ne trošiš prave SMS poruke dok testiraš.
3. **Firestore Database** → Create database → production mode → izaberi region (npr. `eur3`).
4. **Storage** → Get started (default bucket, isti region).
5. **Project settings → General → Your apps**:
   - Dodaj **Android** app: package name `com.olgito.app` → preuzmi `google-services.json` → stavi ga u koren projekta (`C:\Users\Todor\Desktop\Olgito\google-services.json`).
   - Dodaj **iOS** app: bundle ID `com.olgito.app` → preuzmi `GoogleService-Info.plist` → stavi ga u koren projekta.
   - Ovi fajlovi su namerno u `.gitignore` (ne idu na git).

## 2. Poveži CLI sa projektom i podesi bazu

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

(izaberi novokreirani projekat kad te pita)

Deploy pravila i indeksa:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

## 3. Olgičin admin nalog

Nalog se pravi automatski pri prvoj prijavi (kao klijent na čekanju), pa admin ulogu treba ručno postaviti:

1. Neka se Olgica jednom uloguje u app (telefon `+381645331269` + SMS kod).
2. U Firebase Console → Firestore → kolekcija `users` → pronađi njen dokument (po `phone`).
3. Izmeni polja: `role` → `"admin"`, `accountStatus` → `"approved"`.

Od tog trenutka njena prijava je uvek prepoznata kao admin.

## 4. Cloud Functions

```bash
cd functions
npm install
npm run deploy
```

(prvi put će tražiti da se izabere/potvrdi Blaze (pay-as-you-go) plan — Cloud Functions to zahtevaju, ali su besplatne do solidnog obima korišćenja)

## 5. EAS build (development client)

Phone Auth i Firebase koriste native module, pa **Expo Go ne radi** — potreban je sopstveni "development build":

```bash
npm install -g eas-cli
eas login
eas init
```

`eas init` će upisati `projectId` u konfiguraciju — to je potrebno da push notifikacije rade.

Zatim:

```bash
eas build --profile development --platform android
```

(ili `--platform ios`, ali za iOS je potreban Apple Developer nalog)

Kad se build završi, instaliraj APK/link na telefon ili emulator, pa pokreni:

```bash
npx expo start --dev-client
```

## Poznata pojednostavljenja (za kasnije, ako zatreba)

- **`availability` kolekcija** (javno vidljivi zauzeti termini, bez imena) trenutno prima upis direktno od klijenata u istoj transakciji kad zakazuju/otkazuju (radi atomske provere da niko ne zakaže isti termin dvaput). Kod male, poverljive baze korisnika ovo je bezbedno, ali teoretski poznati klijent bi mogao rizičnim pristupom da ometa taj dokument. Da se to potpuno zatvori, rezervacija bi trebalo da ide kroz jedan Cloud Function (callable) umesto direktno sa klijenta — nije urađeno sada da ne komplikujemo MVP.
- Podsetnik 24h pre termina šalje se najkasnije u trenutku kad termin uđe u 24h prozor (ako je termin zakazan poslednjeg trenutka, podsetnik stiže odmah, ne tačno "24h pre").

## Struktura projekta

```
app/                    ekrani (expo-router; folderi u zagradama ne utiču na URL)
  (auth)/                prijava, dopuna profila, čekanje odobrenja, blokiran
  (client)/               klijentski tabovi
  (admin)/                Olgičini tabovi (kalendar, klijenti, podešavanja...)
src/
  theme/                 boje, razmaci, tipografija
  types/                  TS tipovi (ogledaju Firestore šemu)
  firebase/               pristup Firestore/Auth/Storage (jedan fajl po kolekciji)
  context/AuthContext.tsx stanje prijavljenog korisnika
  components/             deljene UI komponente
  utils/time.ts           računanje slobodnih termina (30 min slotovi)
  notifications/          registracija push tokena
functions/                Cloud Functions (notifikacije, 24h podsetnik)
firestore.rules / storage.rules   pravila pristupa
```
