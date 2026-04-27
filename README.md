# SmartReceipt AI

> Moderná cloudová aplikácia na skenovanie bločkov a automatickú kategorizáciu výdavkov pomocou umelej inteligencie.

---

## Obsah

- [Prehľad projektu](#prehľad-projektu)
- [Funkcie](#funkcie)
- [Architektúra](#architektúra)
- [Technologický stack](#technologický-stack)
- [Štruktúra projektu](#štruktúra-projektu)
- [Predpoklady](#predpoklady)
- [Inštalácia a spustenie](#inštalácia-a-spustenie)
- [Premenné prostredia](#premenné-prostredia)
- [API dokumentácia](#api-dokumentácia)
- [Databáza](#databáza)
- [Nasadenie](#nasadenie)
- [Bezpečnosť](#bezpečnosť)

---

## Prehľad projektu

**SmartReceipt AI** je full-stack SaaS webová aplikácia, ktorá umožňuje používateľom nahrávať fotografie alebo skeny papierových bločkov. Systém využíva AI-powered OCR (AWS Textract) na extrakciu údajov z bločku — názov obchodu, dátum nákupu, celková suma, mena a jednotlivé položky. Používateľ si môže prezerať, upravovať a analyzovať svoje výdavky prostredníctvom grafov a štatistík.

Projekt bol vytvorený ako druhé zadanie pre predmet **Cloudové Technológie**.

---

## Funkcie

| Funkcia | Popis |
|---|---|
| Registrácia / Prihlásenie | Autentifikácia používateľov cez Supabase Auth (email + heslo) |
| Zabudnuté heslo | Obnovenie hesla cez e-mailový odkaz |
| Nahranie bločku | Drag & drop alebo výber súboru (JPG, PNG, WebP, PDF, max 10 MB) |
| AI OCR spracovanie | Extrakcia údajov pomocou AWS Textract AnalyzeExpense API |
| Kontrola extrahovaných dát | Používateľ môže skontrolovať a upraviť výsledok pred uložením |
| História bločkov | Zoznam všetkých nahratých bločkov s filtrovaním |
| Detail bločku | Zobrazenie položiek, sumy, dátumu a obrázka bločku |
| Analytiky | Grafy výdavkov podľa mesiaca a obchodu (koláčové a stĺpcové grafy) |
| Kategórie | Vytváranie vlastných kategórií výdavkov s farebným označením |
| Profil | Správa používateľského účtu |
| Chránené trasy | Všetky funkcie sú dostupné len po prihlásení |
| Stav spracovania | Obrazovka s priebehom spracovania bločku (krok po kroku) |

---

## Architektúra

```
┌─────────────────────────────────────────────────────────────┐
│                        Používateľ                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│             Frontend (React SPA)                            │
│        Azure Static Web Apps / Vite dev server              │
│                  localhost:5173                              │
└───────────────────────┬─────────────────────────────────────┘
                        │  REST API (HTTP/JSON + multipart)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│             Backend (Node.js / Express)                     │
│                  localhost:3001                              │
└─────┬─────────────────┬──────────────────────┬─────────────┘
      │                 │                      │
      ▼                 ▼                      ▼
┌──────────┐    ┌──────────────┐    ┌──────────────────────┐
│ Supabase │    │  Supabase    │    │    AWS Textract       │
│   Auth   │    │  PostgreSQL  │    │  (AnalyzeExpense)     │
│          │    │  + Storage   │    │   eu-central-1        │
└──────────┘    └──────────────┘    └──────────────────────┘
```

**Tok spracovania bločku:**

1. Používateľ nahrá súbor cez frontend
2. Backend overí JWT token (Supabase Auth)
3. Súbor sa nahrá do Supabase Storage (`receipts` bucket)
4. Vytvorí sa záznam v databáze so stavom `processing`
5. AWS Textract analyzuje obrázok (AnalyzeExpense)
6. Extrahované dáta sa uložia do databázy, stav sa zmení na `done`
7. Položky bločku sa uložia do tabuľky `receipt_items`
8. Frontend zobrazí výsledok na kontrolu

---

## Technologický stack

### Frontend

| Technológia | Verzia | Využitie |
|---|---|---|
| React | 19 | UI knižnica |
| TypeScript | 6 | Typová bezpečnosť |
| Vite | 8 | Build nástroj a dev server |
| React Router | 7 | Navigácia (SPA routing) |
| Tailwind CSS | 4 | Štýlovanie komponentov |
| Recharts | 3 | Grafy (koláčové, stĺpcové, čiarové) |
| Lucide React | 1.11 | Ikony |

### Backend

| Technológia | Verzia | Využitie |
|---|---|---|
| Node.js | 20 | Runtime |
| Express | 4 | REST API framework |
| TypeScript | 5 | Typová bezpečnosť |
| Multer | 2 | Spracovanie nahratých súborov |
| @aws-sdk/client-textract | 3 | Komunikácia s AWS Textract |
| @supabase/supabase-js | 2 | Komunikácia so Supabase |
| uuid | 9 | Generovanie unikátnych názvov súborov |
| dotenv | 16 | Správa premenných prostredia |

### Cloudové služby

| Služba | Využitie |
|---|---|
| **Supabase** | PostgreSQL databáza, autentifikácia, úložisko súborov |
| **AWS Textract** | OCR a analýza výdavkov z obrázkov bločkov |
| **Azure Static Web Apps** | Hosting frontendu |
| **Docker** | Kontajnerizácia backendu |

---

## Štruktúra projektu

```
cloud/
├── backend/
│   ├── Dockerfile              # Docker konfigurácia pre backend
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts            # Vstupný bod – Express server
│       ├── routes/
│       │   ├── auth.ts         # Endpointy: registrácia, prihlásenie, reset hesla
│       │   ├── receipts.ts     # Endpointy: nahranie, výpis, detail, úprava, zmazanie
│       │   └── categories.ts   # Endpointy: kategórie výdavkov
│       ├── services/
│       │   ├── supabase.ts     # Inicializácia Supabase klienta
│       │   └── textract.ts     # AWS Textract integrácia + parsovanie výsledkov
│       └── utils/
│           └── auth.ts         # Overenie JWT tokenu z hlavičky Authorization
│
└── frontend/
    ├── index.html
    ├── main.tsx                # React vstupný bod
    ├── vite.config.ts
    ├── staticwebapp.config.json # Konfigurácia pre Azure Static Web Apps
    ├── package.json
    └── app/
        ├── App.tsx             # Definícia routov aplikácie
        ├── components/
        │   ├── LandingPage.tsx         # Úvodná stránka
        │   ├── SignInPage.tsx          # Prihlásenie
        │   ├── SignUpPage.tsx          # Registrácia
        │   ├── ForgotPasswordPage.tsx  # Obnovenie hesla
        │   ├── DashboardLayout.tsx     # Rozloženie s bočným panelom
        │   ├── Dashboard.tsx           # Hlavný prehľad so štatistikami
        │   ├── UploadReceipt.tsx       # Nahranie bločku
        │   ├── ProcessingScreen.tsx    # Obrazovka spracovania
        │   ├── ReviewExtractedData.tsx # Kontrola extrahovaných dát
        │   ├── ReceiptsHistory.tsx     # História bločkov
        │   ├── ReceiptDetail.tsx       # Detail bločku
        │   ├── Analytics.tsx           # Analytiky a grafy
        │   ├── Categories.tsx          # Správa kategórií
        │   ├── Profile.tsx             # Profil používateľa
        │   ├── ProtectedRoute.tsx      # HOC pre chránené trasy
        │   ├── NotFoundPage.tsx        # Stránka 404
        │   └── ui/                     # Shadcn/ui komponenty
        └── src/
            └── lib/
                ├── api.ts      # Funkcie pre volanie backendu
                └── auth.ts     # Správa JWT tokenov a session
```

---

## Predpoklady

Pred spustením projektu potrebuješ:

- **Node.js** v20 alebo novší
- **npm** v9 alebo novší
- Účet na **[Supabase](https://supabase.com)** s vytvoreným projektom
- Účet na **[AWS](https://aws.amazon.com)** s prístupom k Textract (región `eu-central-1`)
- *(voliteľne)* **Docker** pre kontajnerizované spustenie backendu

---

## Inštalácia a spustenie

### 1. Klonovanie repozitára

```bash
git clone <url-repozitara>
cd cloud
```

### 2. Backend – lokálne spustenie

```bash
cd backend
npm install
```

Vytvor súbor `.env` podľa sekcie [Premenné prostredia](#premenné-prostredia), potom:

```bash
npm run dev
```

Backend beží na `http://localhost:3001`.

### 3. Frontend – lokálne spustenie

```bash
cd frontend
npm install
```

Ak backend nebeží na predvolenom porte, vytvor `.env` súbor:

```env
VITE_API_URL=http://localhost:3001
```

Potom:

```bash
npm run dev
```

Frontend beží na `http://localhost:5173`.

### 4. Backend – Docker

```bash
cd backend
docker build -t smartreceipt-backend .
docker run -p 3001:3001 --env-file .env smartreceipt-backend
```

### 5. Build pre produkciu

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Výstup je v priečinku dist/
```

---

## Premenné prostredia

### Backend (`backend/.env`)

```env
# Port, na ktorom beží Express server
PORT=3001

# Supabase
SUPABASE_URL=https://<tvoj-projekt>.supabase.co
SUPABASE_SERVICE_KEY=<supabase-service-role-key>

# AWS Textract
AWS_ACCESS_KEY_ID=<aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<aws-secret-access-key>
AWS_REGION=eu-central-1

# CORS – URL frontendu
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
# URL backendu (voliteľné, predvolená hodnota: http://localhost:3001)
VITE_API_URL=http://localhost:3001
```

> **Dôležité:** Nikdy necommituj `.env` súbory do Gitu. Pridaj ich do `.gitignore`.

---

## API dokumentácia

Základná URL: `http://localhost:3001`

### Autentifikácia

Všetky chránené endpointy vyžadujú hlavičku:
```
Authorization: Bearer <jwt-token>
```

### Endpointy

#### Autentifikácia

| Metóda | Endpoint | Popis | Autorizácia |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Registrácia nového používateľa | Nie |
| `POST` | `/api/auth/signin` | Prihlásenie používateľa | Nie |
| `GET` | `/api/auth/me` | Získanie info o aktuálnom používateľovi | Áno |
| `POST` | `/api/auth/signout` | Odhlásenie | Nie |
| `POST` | `/api/auth/reset-password` | Odoslanie e-mailu na obnovenie hesla | Nie |

**Príklad – registrácia:**
```json
POST /api/auth/signup
{
  "email": "pouzivatel@example.com",
  "password": "bezpecne-heslo"
}
```

#### Bločky (Receipts)

| Metóda | Endpoint | Popis | Autorizácia |
|---|---|---|---|
| `POST` | `/api/receipts/upload` | Nahranie bločku (multipart/form-data) | Áno |
| `GET` | `/api/receipts` | Zoznam všetkých bločkov používateľa | Áno |
| `GET` | `/api/receipts/:id` | Detail konkrétneho bločku | Áno |
| `PATCH` | `/api/receipts/:id` | Úprava metadát bločku | Áno |
| `DELETE` | `/api/receipts/:id` | Zmazanie bločku | Áno |
| `POST` | `/api/receipts/rescan` | Opätovné skenovanie bločku | Áno |

**Príklad – odpoveď po nahraní:**
```json
{
  "success": true,
  "receiptId": "uuid-bločku",
  "extracted": {
    "merchantName": "TESCO",
    "totalAmount": 23.45,
    "currency": "EUR",
    "date": "2026-04-15",
    "items": [
      { "name": "Chlieb", "quantity": 1, "unitPrice": 1.29, "totalPrice": 1.29 }
    ],
    "rawText": "..."
  }
}
```

#### Kategórie

| Metóda | Endpoint | Popis | Autorizácia |
|---|---|---|---|
| `GET` | `/api/categories` | Zoznam kategórií s počtom bločkov a sumou | Áno |
| `POST` | `/api/categories` | Vytvorenie novej kategórie | Áno |
| `PATCH` | `/api/categories/:id` | Úprava kategórie | Áno |
| `DELETE` | `/api/categories/:id` | Zmazanie kategórie | Áno |

#### Zdravotný check

| Metóda | Endpoint | Popis |
|---|---|---|
| `GET` | `/health` | Overenie, že server beží |

---

## Databáza

Aplikácia využíva **Supabase (PostgreSQL)**. Potrebné tabuľky:

### `receipts`

| Stĺpec | Typ | Popis |
|---|---|---|
| `id` | uuid (PK) | Unikátny identifikátor |
| `user_id` | uuid (FK) | Odkaz na Supabase Auth user |
| `image_url` | text | URL obrázka v Supabase Storage |
| `merchant_name` | text | Názov obchodu |
| `total_amount` | numeric | Celková suma |
| `currency` | text | Mena (napr. EUR) |
| `receipt_date` | date | Dátum nákupu |
| `raw_text` | text | Surový text extrahovaný AWS Textract |
| `extracted_data` | jsonb | Kompletné extrahované dáta (JSON) |
| `status` | text | `processing` / `done` / `error` |
| `category_id` | uuid (FK) | Priradená kategória |
| `created_at` | timestamptz | Čas vytvorenia záznamu |

### `receipt_items`

| Stĺpec | Typ | Popis |
|---|---|---|
| `id` | uuid (PK) | Unikátny identifikátor |
| `receipt_id` | uuid (FK) | Odkaz na bloček |
| `name` | text | Názov položky |
| `quantity` | numeric | Množstvo |
| `unit_price` | numeric | Cena za kus |
| `total_price` | numeric | Celková cena položky |

### `categories`

| Stĺpec | Typ | Popis |
|---|---|---|
| `id` | uuid (PK) | Unikátny identifikátor |
| `user_id` | uuid (FK) | Vlastník kategórie |
| `name` | text | Názov kategórie |
| `color` | text | CSS trieda farby (napr. `bg-blue-500`) |

### Supabase Storage

Bucket: **`receipts`** — ukladá nahraté obrázky bločkov.  
Súbory sú organizované podľa schémy: `{user_id}/{uuid}.{ext}`

---

## Nasadenie

### Frontend – Azure Static Web Apps

Súbor `staticwebapp.config.json` zabezpečuje správne fungovanie SPA routingu:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*", "/assets/*"]
  }
}
```

Kroky:
1. Spusti `npm run build` vo frontende
2. Nasaď priečinok `dist/` na Azure Static Web Apps
3. Nastav premennú prostredia `VITE_API_URL` na URL produkčného backendu

### Backend – Docker / cloudová platforma

```bash
docker build -t smartreceipt-backend .
docker run -p 3001:3001 --env-file .env smartreceipt-backend
```

Backend je možné nasadiť na akúkoľvek platformu podporujúcu Docker (Azure Container Apps, Railway, Render, AWS ECS, ...).

---

## Bezpečnosť

- Všetky API endpointy (okrem auth) vyžadujú platný **JWT Bearer token**
- JWT tokeny sú overované priamo voči **Supabase Auth** na každý request
- Nahrávanie súborov je obmedzené na typy `image/jpeg`, `image/png`, `image/webp`, `application/pdf` a maximálnu veľkosť **10 MB**
- CORS je nakonfigurovaný tak, aby akceptoval požiadavky len z povolenej adresy frontendu
- Používatelia majú prístup len k vlastným bločkom a kategóriám (row-level isolation cez `user_id`)

> **Upozornenie:** Nikdy necommituj skutočné hodnoty `SUPABASE_SERVICE_KEY`, `AWS_ACCESS_KEY_ID` ani `AWS_SECRET_ACCESS_KEY` do repozitára. Používaj `.env` súbory lokálne a secrets manažér pri nasadení.
