# API Documentation

## Opis projekta

Aplikacija za praćenje održavanja automobila i potrošnje goriva. Sistem se sastoji iz dva dela:

### 1. Admin CMS (`/api/admin/*`)

Kada se admin uloguje, prva stvar koju vidi je **Dashboard** sa osnovnim statistikama sistema (ukupan broj korisnika, automobila, održavanja i potrošnji goriva).

U bočnom meniju admin bira jednu od stranica:

- **Korisnici** — stranica sa tabelom svih korisnika. Iznad tabele se prikazuje ukupan broj korisnika, search polje za pretragu i filteri (po datumu kreiranja naloga). U tabeli svaki red ima akcije: **pregled** i **brisanje**. Ako admin klikne na pregled, otvara se stranica sa svim informacijama o tom korisniku, gde admin može da edituje podatke. Pored informacija, na toj stranici se nalazi i tabela sa svim automobilima tog korisnika. U toj tabeli automobila svaki red takođe ima akcije: **pregled** i **brisanje**.

- **Automobili** — stranica sa tabelom svih automobila u sistemu. Iznad tabele ukupan broj, search i filteri (po datumu kreiranja, kilometraži, datumu registracije, pogonskom gorivu, karoseriji). Svaki red ima akcije: **pregled** i **brisanje**. Ako admin klikne na pregled automobila (bilo odavde ili iz tabele unutar korisnika), otvara se stranica sa svim informacijama o tom automobilu gde se podaci mogu editovati. Na toj stranici se nalaze dve tabele: jedna za **održavanja** i druga za **potrošnje goriva** tog automobila. Obe tabele imaju akcije po istom principu: **pregled** i **brisanje** za svaki red.

- **Održavanja** — stranica sa tabelom svih održavanja u sistemu. Iznad tabele ukupan broj, search i filteri (po kilometraži i datumu održavanja). Svaki red ima akcije: **pregled** i **brisanje**. Pregled otvara stranicu sa svim informacijama o održavanju gde se podaci mogu editovati.

- **Potrošnja goriva** — stranica sa tabelom svih zapisa potrošnje goriva u sistemu. Iznad tabele ukupan broj, search i filteri (po datumu sipanja). Svaki red ima akcije: **pregled** i **brisanje**. Pregled otvara stranicu sa svim informacijama o potrošnji gde se podaci mogu editovati.

- **Profil** — link u meniju koji vodi na stranicu profila ulogovanog admina. Admin može da izmeni svoje podatke (ime, prezime, email, password) ili da obriše svoj nalog.

> Komponenta za pregled (detail stranica) je ista bez obzira da li se do nje dolazi iz glavne tabele ili iz ugnježdene tabele unutar drugog entiteta — razlikuje se samo kontekst iz kog se poziva.

### 2. Korisnička aplikacija (`/api/app/*`)

Aplikacija za obične korisnike koji prate svoje automobile. Korisnik nakon prijave vidi **Dashboard** sa svojim statistikama (broj automobila, ukupno održavanja, ukupno potrošnji goriva).

U meniju korisnik bira:

- **Moji automobili** — stranica sa tabelom svih automobila tog korisnika. Iznad tabele ukupan broj, search i filteri (po kilometraži, datumu registracije, pogonskom gorivu, karoseriji). Svaki red ima akcije: **pregled** i **brisanje**. Korisnik može da doda novi automobil. Ako klikne na pregled, otvara se stranica sa svim informacijama o automobilu gde može da edituje podatke. Na toj stranici se nalaze dve tabele: jedna za **održavanja** i druga za **potrošnje goriva** tog automobila. U obe tabele svaki red ima akcije: **pregled** i **brisanje**, a korisnik može i da dodaje nove zapise.

- **Održavanja** — stranica sa tabelom svih održavanja za sve automobile tog korisnika. Iznad tabele ukupan broj, search i filteri (po kilometraži i datumu održavanja). Svaki red ima akcije: **pregled** i **brisanje**. Pregled otvara stranicu sa detaljima gde korisnik može da edituje podatke.

- **Potrošnja goriva** — stranica sa tabelom svih zapisa potrošnje za sve automobile tog korisnika. Iznad tabele ukupan broj, search i filteri (po datumu sipanja). Svaki red ima akcije: **pregled** i **brisanje**. Pregled otvara stranicu sa detaljima gde korisnik može da edituje podatke. Ovde je važan dvofazni unos: korisnik kreira zapis kad sipa gorivo (datum, litri, cena, početna kilometraža), a zatim kad gorivo potroši ažurira zapis (datum nestanka, krajnja kilometraža) — backend tada računa potrošnju na 100km i cenu na 100km.

- **Profil** — stranica profila gde korisnik može da izmeni svoje podatke (ime, prezime, email, password, datum rođenja) ili da obriše svoj nalog.

> Svi podaci su ograničeni na ulogovanog korisnika — korisnik ne može da vidi ili menja podatke drugih korisnika. Backend identifikuje korisnika iz JWT tokena, tako da se `userId` ne šalje u body-ju već se automatski preuzima iz tokena.

Base URL: `/api`

All admin routes require authentication via `Authorization: Bearer <token>` header.

---

## Table of Contents

- [Models](#models)
- [Auth Routes](#auth-routes)
- [Admin — Dashboard](#admin--dashboard)
- [Admin — Profile](#admin--profile)
- [Admin — Users](#admin--users)
- [Admin — Cars](#admin--cars)
- [Admin — Maintenances](#admin--maintenances)
- [Admin — Fuel Consumptions](#admin--fuel-consumptions)
- [App — Dashboard](#app--dashboard)
- [App — Profile](#app--profile)
- [App — Cars](#app--cars)
- [App — Maintenances](#app--maintenances)
- [App — Fuel Consumptions](#app--fuel-consumptions)

---

## Models

### User

| Field         | Type     | Description                                  | Required |
| ------------- | -------- | -------------------------------------------- | -------- |
| `id`          | Integer  | Primary key, auto-increment                  | auto     |
| `firstName`   | String   | First name                                   | yes      |
| `lastName`    | String   | Last name                                    | yes      |
| `dateOfBirth` | Date     | Date of birth (`YYYY-MM-DD`)                 | yes      |
| `email`       | String   | Email address (unique)                       | yes      |
| `password`    | String   | Hashed password (never returned in response) | yes      |
| `createdAt`   | DateTime | Creation date                                | auto     |
| `updatedAt`   | DateTime | Last update date                             | auto     |

---

### Car

| Field              | Type     | Description                            | Required |
| ------------------ | -------- | -------------------------------------- | -------- |
| `id`               | Integer  | Primary key, auto-increment            | auto     |
| `userId`           | Integer  | FK → User, car owner                   | yes      |
| `brand`            | String   | Car brand (e.g. Volkswagen, BMW)       | yes      |
| `model`            | String   | Car model (e.g. Golf 7, Serija 3)      | yes      |
| `year`             | Integer  | Production year (e.g. 2019)            | yes      |
| `fuelType`         | Enum     | Fuel type (see enum below)             | yes      |
| `engineCode`       | String   | Engine code                            | no       |
| `transmissionCode` | String   | Transmission code                      | no       |
| `vinNumber`        | String   | Vehicle identification number (unique) | yes      |
| `color`            | String   | Car color                              | yes      |
| `bodyType`         | Enum     | Body type (see enum below)             | yes      |
| `mileage`          | Integer  | Current mileage (km)                   | yes      |
| `registrationDate` | Date     | Registration date (`YYYY-MM-DD`)       | yes      |
| `createdAt`        | DateTime | Creation date                          | auto     |
| `updatedAt`        | DateTime | Last update date                       | auto     |

**Enum `fuelType`:**

| Value        | Description        |
| ------------ | ------------------ |
| `petrol`     | Gasoline           |
| `diesel`     | Diesel             |
| `petrol_lpg` | Petrol + LPG       |
| `petrol_cng` | Petrol + CNG/Metan |

**Enum `bodyType`:**

| Value         | Description  |
| ------------- | ------------ |
| `sedan`       | Sedan        |
| `wagon`       | Wagon/Estate |
| `hatchback`   | Hatchback    |
| `suv`         | SUV          |
| `coupe`       | Coupe        |
| `convertible` | Convertible  |
| `mpv`         | MPV/Minivan  |
| `pickup`      | Pickup       |

---

### Maintenance

| Field           | Type     | Description                                   | Required |
| --------------- | -------- | --------------------------------------------- | -------- |
| `id`            | Integer  | Primary key, auto-increment                   | auto     |
| `carId`         | Integer  | FK → Car                                      | yes      |
| `name`          | Enum     | Maintenance type (see enum below)             | yes      |
| `mileage`       | Integer  | Mileage at the time of maintenance            | yes      |
| `date`          | Date     | Maintenance date (`YYYY-MM-DD`)               | yes      |
| `replacedParts` | JSON     | Array of objects — replaced parts with prices | yes      |
| `servicePrice`  | Decimal  | Total service price                           | yes      |
| `createdAt`     | DateTime | Creation date                                 | auto     |
| `updatedAt`     | DateTime | Last update date                              | auto     |

**Enum `name`:**

| Value           | Description   |
| --------------- | ------------- |
| `small_service` | Small service |
| `big_service`   | Big service   |
| `tire_change`   | Tire change   |
| `clutch_set`    | Clutch set    |
| `other`         | Other         |

**Structure `replacedParts`:**

```json
[
  { "name": "Oil filter", "price": 1200 },
  { "name": "Engine oil 5W30 4L", "price": 4500 },
  { "name": "Air filter", "price": 1800 }
]
```

---

### FuelConsumption

| Field                 | Type     | Description                                 | Required on create | Required on complete |
| --------------------- | -------- | ------------------------------------------- | ------------------ | -------------------- |
| `id`                  | Integer  | Primary key, auto-increment                 | auto               | —                    |
| `carId`               | Integer  | FK → Car                                    | yes                | —                    |
| `refuelDate`          | Date     | Refuel date (`YYYY-MM-DD`)                  | yes                | —                    |
| `emptyDate`           | Date     | Date fuel ran out (`YYYY-MM-DD`)            | **no**             | yes (PATCH)          |
| `litersRefueled`      | Decimal  | Liters refueled                             | yes                | —                    |
| `pricePerLiter`       | Decimal  | Price per liter                             | yes                | —                    |
| `startMileage`        | Integer  | Mileage at refuel                           | yes                | —                    |
| `endMileage`          | Integer  | Mileage when fuel ran out                   | **no**             | yes (PATCH)          |
| **Computed fields**   |          |                                             |                    |                      |
| `distanceTraveled`    | Integer  | `endMileage - startMileage`                 | —                  | computed             |
| `consumptionPer100km` | Decimal  | `(litersRefueled / distanceTraveled) * 100` | —                  | computed             |
| `costPer100km`        | Decimal  | `consumptionPer100km * pricePerLiter`       | —                  | computed             |
| `totalCost`           | Decimal  | `litersRefueled * pricePerLiter`            | computed           | computed             |
| `completed`           | Boolean  | Whether the entry is complete               | auto (`false`)     | auto (`true`)        |
| `createdAt`           | DateTime | Creation date                               | auto               | —                    |
| `updatedAt`           | DateTime | Last update date                            | auto               | auto                 |

> **Usage flow:** User refuels → creates entry with basic data → drives until fuel runs out → updates entry with `emptyDate` and `endMileage` → backend computes derived fields.

> While entry is not complete (`completed: false`), computed fields `distanceTraveled`, `consumptionPer100km` and `costPer100km` are `null`. Only `totalCost` is available immediately.

---

## Auth Routes

### `POST /api/auth/register`

Register a new user.

**Body:**

```json
{
  "firstName": "Marko",
  "lastName": "Markovic",
  "dateOfBirth": "1995-06-15",
  "email": "marko@example.com",
  "password": "Password123!",
  "passwordConfirm": "Password123!"
}
```

**Response `201`:**

```json
{
  "message": "Registration successful.",
  "user": {
    "id": 1,
    "firstName": "Marko",
    "lastName": "Markovic",
    "dateOfBirth": "1995-06-15",
    "email": "marko@example.com",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Errors:**

- `400` — Validation (missing field, invalid email, passwords don't match)
- `409` — Email already exists

---

### `POST /api/auth/login`

Login.

**Body:**

```json
{
  "email": "marko@example.com",
  "password": "Password123!"
}
```

**Response `200`:**

```json
{
  "message": "Login successful.",
  "user": {
    "id": 1,
    "firstName": "Marko",
    "lastName": "Markovic",
    "dateOfBirth": "1995-06-15",
    "email": "marko@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Errors:**

- `400` — Missing email or password
- `401` — Invalid email or password

---

### `POST /api/auth/forgot-password`

Send password reset link to email.

**Body:**

```json
{
  "email": "marko@example.com"
}
```

**Response `200`:**

```json
{
  "message": "Password reset link sent to email."
}
```

**Errors:**

- `404` — User with this email not found

---

### `POST /api/auth/reset-password`

Reset password using token from email.

**Body:**

```json
{
  "token": "abc123resettoken",
  "password": "NewPassword123!",
  "passwordConfirm": "NewPassword123!"
}
```

**Response `200`:**

```json
{
  "message": "Password successfully changed."
}
```

**Errors:**

- `400` — Token expired or passwords don't match
- `404` — Invalid token

---

## Admin — Dashboard

### `GET /api/admin/dashboard`

Returns system-wide statistics for the admin dashboard.

**Response `200`:**

```json
{
  "data": {
    "totalUsers": 2379,
    "totalCars": 4512,
    "totalMaintenances": 8930,
    "totalFuelConsumptions": 15420
  }
}
```

---

## Admin — Profile

Routes for the currently logged-in admin to manage their own account. The profile link is available in the sidebar menu.

### `GET /api/admin/profile`

Get the currently logged-in admin's profile.

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "firstName": "Marko",
    "lastName": "Markovic",
    "dateOfBirth": "1995-06-15",
    "email": "marko@example.com",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T10:00:00Z"
  }
}
```

---

### `PATCH /api/admin/profile`

Update the currently logged-in admin's profile. Only send fields that need to change.

**Body (all fields optional):**

```json
{
  "firstName": "Marko",
  "lastName": "Nikolic",
  "dateOfBirth": "1995-06-15",
  "email": "marko.new@example.com",
  "password": "NewPassword123!",
  "passwordConfirm": "NewPassword123!"
}
```

**Response `200`:**

```json
{
  "message": "Profile updated.",
  "data": {
    "id": 1,
    "firstName": "Marko",
    "lastName": "Nikolic",
    "dateOfBirth": "1995-06-15",
    "email": "marko.new@example.com",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T15:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation
- `409` — Email already taken

---

### `DELETE /api/admin/profile`

Delete the currently logged-in admin's account.

**Response `200`:**

```json
{
  "message": "Account deleted."
}
```

---

## Admin — Users

### `GET /api/admin/users`

Get paginated list of users with search and filters.

**Query params:**

| Param           | Type    | Default | Description                            |
| --------------- | ------- | ------- | -------------------------------------- |
| `page`          | Integer | 1       | Page number                            |
| `limit`         | Integer | 10      | Results per page                       |
| `search`        | String  | —       | Search across all fields               |
| `dateRangeFrom` | Date    | —       | Filter by account creation date (from) |
| `dateRangeTo`   | Date    | —       | Filter by account creation date (to)   |

**Example:** `GET /api/admin/users?page=1&limit=10&search=marko&dateRangeFrom=2026-01-01&dateRangeTo=2026-01-31`

**Response `200`:**

```json
{
  "pagination": {
    "total": 2379,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 238
  },
  "data": [
    {
      "id": 1,
      "firstName": "Marko",
      "lastName": "Markovic",
      "dateOfBirth": "1995-06-15",
      "email": "marko@example.com",
      "createdAt": "2026-02-03T10:00:00Z",
      "updatedAt": "2026-02-03T10:00:00Z"
    }
  ]
}
```

---

### `GET /api/admin/users/:id`

Get single user by ID.

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | User ID     |

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "firstName": "Marko",
    "lastName": "Markovic",
    "dateOfBirth": "1995-06-15",
    "email": "marko@example.com",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T10:00:00Z"
  }
}
```

**Errors:**

- `404` — User not found

---

### `POST /api/admin/users`

Create a new user.

**Body:**

```json
{
  "firstName": "Ana",
  "lastName": "Anic",
  "dateOfBirth": "1998-03-22",
  "email": "ana@example.com",
  "password": "Password123!"
}
```

**Response `201`:**

```json
{
  "message": "User created.",
  "data": {
    "id": 2,
    "firstName": "Ana",
    "lastName": "Anic",
    "dateOfBirth": "1998-03-22",
    "email": "ana@example.com",
    "createdAt": "2026-02-03T11:00:00Z",
    "updatedAt": "2026-02-03T11:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation
- `409` — Email already exists

---

### `PATCH /api/admin/users/:id`

Update user. Only send fields that need to change.

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | User ID     |

**Body (all fields optional):**

```json
{
  "firstName": "Marko",
  "lastName": "Nikolic",
  "email": "marko.new@example.com"
}
```

**Response `200`:**

```json
{
  "message": "User updated.",
  "data": {
    "id": 1,
    "firstName": "Marko",
    "lastName": "Nikolic",
    "dateOfBirth": "1995-06-15",
    "email": "marko.new@example.com",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T12:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation
- `404` — User not found
- `409` — Email already taken

---

### `DELETE /api/admin/users/:id`

Delete user.

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | User ID     |

**Response `200`:**

```json
{
  "message": "User deleted."
}
```

**Errors:**

- `404` — User not found

---

### `GET /api/admin/users/:id/cars`

Get all cars belonging to a specific user.

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | User ID     |

**Query params:**

| Param    | Type    | Default | Description              |
| -------- | ------- | ------- | ------------------------ |
| `page`   | Integer | 1       | Page number              |
| `limit`  | Integer | 10      | Results per page         |
| `search` | String  | —       | Search across all fields |

**Response `200`:**

```json
{
  "pagination": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 1
  },
  "data": [
    {
      "id": 1,
      "userId": 1,
      "brand": "Volkswagen",
      "model": "Golf 7",
      "year": 2019,
      "fuelType": "diesel",
      "engineCode": "CRLB",
      "transmissionCode": "QSF",
      "vinNumber": "WVWZZZ1KZAW123456",
      "color": "Black",
      "bodyType": "hatchback",
      "mileage": 150000,
      "registrationDate": "2025-06-15",
      "createdAt": "2026-02-03T10:00:00Z",
      "updatedAt": "2026-02-03T10:00:00Z"
    }
  ]
}
```

**Errors:**

- `404` — User not found

---

## Admin — Cars

### `GET /api/admin/cars`

Get paginated list of all cars with search and filters.

**Query params:**

| Param                  | Type    | Default | Description                        |
| ---------------------- | ------- | ------- | ---------------------------------- |
| `page`                 | Integer | 1       | Page number                        |
| `limit`                | Integer | 10      | Results per page                   |
| `search`               | String  | —       | Search across all fields           |
| `dateRangeFrom`        | Date    | —       | Filter by creation date (from)     |
| `dateRangeTo`          | Date    | —       | Filter by creation date (to)       |
| `mileageFrom`          | Integer | —       | Filter by mileage (min)            |
| `mileageTo`            | Integer | —       | Filter by mileage (max)            |
| `registrationDateFrom` | Date    | —       | Filter by registration date (from) |
| `registrationDateTo`   | Date    | —       | Filter by registration date (to)   |
| `fuelType`             | Enum    | —       | Filter by fuel type                |
| `bodyType`             | Enum    | —       | Filter by body type                |

**Example:** `GET /api/admin/cars?page=1&limit=10&fuelType=diesel&bodyType=suv&mileageFrom=50000&mileageTo=200000`

**Response `200`:**

```json
{
  "pagination": {
    "total": 156,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 16
  },
  "data": [
    {
      "id": 1,
      "userId": 1,
      "brand": "Volkswagen",
      "model": "Golf 7",
      "year": 2019,
      "fuelType": "diesel",
      "engineCode": "CRLB",
      "transmissionCode": "QSF",
      "vinNumber": "WVWZZZ1KZAW123456",
      "color": "Black",
      "bodyType": "hatchback",
      "mileage": 150000,
      "registrationDate": "2025-06-15",
      "createdAt": "2026-02-03T10:00:00Z",
      "updatedAt": "2026-02-03T10:00:00Z"
    }
  ]
}
```

---

### `GET /api/admin/cars/:id`

Get single car by ID.

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | Car ID      |

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "userId": 1,
    "brand": "Volkswagen",
    "model": "Golf 7",
    "year": 2019,
    "fuelType": "diesel",
    "engineCode": "CRLB",
    "transmissionCode": "QSF",
    "vinNumber": "WVWZZZ1KZAW123456",
    "color": "Black",
    "bodyType": "hatchback",
    "mileage": 150000,
    "registrationDate": "2025-06-15",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T10:00:00Z"
  }
}
```

**Errors:**

- `404` — Car not found

---

### `POST /api/admin/cars`

Create a new car.

**Body:**

```json
{
  "userId": 1,
  "brand": "Volkswagen",
  "model": "Golf 7",
  "year": 2019,
  "fuelType": "diesel",
  "engineCode": "CRLB",
  "transmissionCode": "QSF",
  "vinNumber": "WVWZZZ1KZAW123456",
  "color": "Black",
  "bodyType": "hatchback",
  "mileage": 150000,
  "registrationDate": "2025-06-15"
}
```

**Response `201`:**

```json
{
  "message": "Car created.",
  "data": {
    "id": 1,
    "userId": 1,
    "brand": "Volkswagen",
    "model": "Golf 7",
    "year": 2019,
    "fuelType": "diesel",
    "engineCode": "CRLB",
    "transmissionCode": "QSF",
    "vinNumber": "WVWZZZ1KZAW123456",
    "color": "Black",
    "bodyType": "hatchback",
    "mileage": 150000,
    "registrationDate": "2025-06-15",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T10:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation (missing field, invalid enum, invalid userId)
- `409` — VIN number already exists

---

### `PATCH /api/admin/cars/:id`

Update car. Only send fields that need to change.

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | Car ID      |

**Body (all fields optional):**

```json
{
  "color": "White",
  "mileage": 155000,
  "fuelType": "petrol_lpg"
}
```

**Response `200`:**

```json
{
  "message": "Car updated.",
  "data": {
    "id": 1,
    "userId": 1,
    "brand": "Volkswagen",
    "model": "Golf 7",
    "year": 2019,
    "fuelType": "petrol_lpg",
    "engineCode": "CRLB",
    "transmissionCode": "QSF",
    "vinNumber": "WVWZZZ1KZAW123456",
    "color": "White",
    "bodyType": "hatchback",
    "mileage": 155000,
    "registrationDate": "2025-06-15",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T14:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation
- `404` — Car not found
- `409` — VIN number already taken

---

### `DELETE /api/admin/cars/:id`

Delete car.

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | Car ID      |

**Response `200`:**

```json
{
  "message": "Car deleted."
}
```

**Errors:**

- `404` — Car not found

---

## Admin — Maintenances

### `GET /api/admin/maintenances`

Get paginated list of all maintenances with search and filters.

**Query params:**

| Param           | Type    | Default | Description                            |
| --------------- | ------- | ------- | -------------------------------------- |
| `page`          | Integer | 1       | Page number                            |
| `limit`         | Integer | 10      | Results per page                       |
| `search`        | String  | —       | Search across all fields               |
| `mileageFrom`   | Integer | —       | Filter by mileage at maintenance (min) |
| `mileageTo`     | Integer | —       | Filter by mileage at maintenance (max) |
| `dateRangeFrom` | Date    | —       | Filter by maintenance date (from)      |
| `dateRangeTo`   | Date    | —       | Filter by maintenance date (to)        |

**Example:** `GET /api/admin/maintenances?page=1&limit=10&dateRangeFrom=2026-01-01&dateRangeTo=2026-06-30&mileageFrom=100000`

**Response `200`:**

```json
{
  "pagination": {
    "total": 42,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 5
  },
  "data": [
    {
      "id": 1,
      "carId": 1,
      "name": "small_service",
      "mileage": 150000,
      "date": "2026-01-15",
      "replacedParts": [
        { "name": "Oil filter", "price": 1200 },
        { "name": "Engine oil 5W30 4L", "price": 4500 }
      ],
      "servicePrice": 7700,
      "createdAt": "2026-01-15T09:00:00Z",
      "updatedAt": "2026-01-15T09:00:00Z"
    }
  ]
}
```

---

### `GET /api/admin/maintenances/:id`

Get single maintenance by ID.

**Params:**

| Param | Type    | Description    |
| ----- | ------- | -------------- |
| `id`  | Integer | Maintenance ID |

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "carId": 1,
    "name": "big_service",
    "mileage": 150000,
    "date": "2026-01-15",
    "replacedParts": [
      { "name": "Oil filter", "price": 1200 },
      { "name": "Engine oil 5W30 4L", "price": 4500 },
      { "name": "Air filter", "price": 1800 },
      { "name": "Cabin filter", "price": 900 },
      { "name": "Spark plugs x4", "price": 3600 }
    ],
    "servicePrice": 14000,
    "createdAt": "2026-01-15T09:00:00Z",
    "updatedAt": "2026-01-15T09:00:00Z"
  }
}
```

**Errors:**

- `404` — Maintenance not found

---

### `POST /api/admin/maintenances`

Create a new maintenance.

**Body:**

```json
{
  "carId": 1,
  "name": "tire_change",
  "mileage": 155000,
  "date": "2026-03-20",
  "replacedParts": [
    { "name": "Summer tires 205/55 R16 x4", "price": 28000 },
    { "name": "Mounting and balancing", "price": 3200 }
  ],
  "servicePrice": 31200
}
```

**Response `201`:**

```json
{
  "message": "Maintenance created.",
  "data": {
    "id": 3,
    "carId": 1,
    "name": "tire_change",
    "mileage": 155000,
    "date": "2026-03-20",
    "replacedParts": [
      { "name": "Summer tires 205/55 R16 x4", "price": 28000 },
      { "name": "Mounting and balancing", "price": 3200 }
    ],
    "servicePrice": 31200,
    "createdAt": "2026-03-20T08:00:00Z",
    "updatedAt": "2026-03-20T08:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation (missing field, invalid enum, invalid carId)
- `404` — Car not found

---

### `PATCH /api/admin/maintenances/:id`

Update maintenance. Only send fields that need to change.

**Params:**

| Param | Type    | Description    |
| ----- | ------- | -------------- |
| `id`  | Integer | Maintenance ID |

**Body (all fields optional):**

```json
{
  "replacedParts": [
    { "name": "Oil filter", "price": 1200 },
    { "name": "Engine oil 5W30 4L", "price": 4500 },
    { "name": "Front brake pads", "price": 3200 }
  ],
  "servicePrice": 11900
}
```

**Response `200`:**

```json
{
  "message": "Maintenance updated.",
  "data": {
    "id": 1,
    "carId": 1,
    "name": "big_service",
    "mileage": 150000,
    "date": "2026-01-15",
    "replacedParts": [
      { "name": "Oil filter", "price": 1200 },
      { "name": "Engine oil 5W30 4L", "price": 4500 },
      { "name": "Front brake pads", "price": 3200 }
    ],
    "servicePrice": 11900,
    "createdAt": "2026-01-15T09:00:00Z",
    "updatedAt": "2026-01-20T14:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation
- `404` — Maintenance not found

---

### `DELETE /api/admin/maintenances/:id`

Delete maintenance.

**Params:**

| Param | Type    | Description    |
| ----- | ------- | -------------- |
| `id`  | Integer | Maintenance ID |

**Response `200`:**

```json
{
  "message": "Maintenance deleted."
}
```

**Errors:**

- `404` — Maintenance not found

---

### `GET /api/admin/cars/:id/maintenances`

Get all maintenances for a specific car.

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | Car ID      |

**Query params:**

| Param    | Type    | Default | Description              |
| -------- | ------- | ------- | ------------------------ |
| `page`   | Integer | 1       | Page number              |
| `limit`  | Integer | 10      | Results per page         |
| `search` | String  | —       | Search across all fields |

**Response `200`:**

```json
{
  "pagination": {
    "total": 5,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 1
  },
  "data": [
    {
      "id": 1,
      "carId": 1,
      "name": "small_service",
      "mileage": 150000,
      "date": "2026-01-15",
      "replacedParts": [
        { "name": "Oil filter", "price": 1200 },
        { "name": "Engine oil 5W30 4L", "price": 4500 }
      ],
      "servicePrice": 7700,
      "createdAt": "2026-01-15T09:00:00Z",
      "updatedAt": "2026-01-15T09:00:00Z"
    },
    {
      "id": 8,
      "carId": 1,
      "name": "tire_change",
      "mileage": 165000,
      "date": "2026-07-20",
      "replacedParts": [
        { "name": "Summer tires 205/55 R16 x4", "price": 28000 },
        { "name": "Mounting and balancing", "price": 3200 }
      ],
      "servicePrice": 31200,
      "createdAt": "2026-07-20T10:00:00Z",
      "updatedAt": "2026-07-20T10:00:00Z"
    }
  ]
}
```

**Errors:**

- `404` — Car not found

---

## Admin — Fuel Consumptions

### `GET /api/admin/fuel-consumptions`

Get paginated list of all fuel consumption entries with search and filters.

**Query params:**

| Param           | Type    | Default | Description                  |
| --------------- | ------- | ------- | ---------------------------- |
| `page`          | Integer | 1       | Page number                  |
| `limit`         | Integer | 10      | Results per page             |
| `search`        | String  | —       | Search across all fields     |
| `dateRangeFrom` | Date    | —       | Filter by refuel date (from) |
| `dateRangeTo`   | Date    | —       | Filter by refuel date (to)   |

**Example:** `GET /api/admin/fuel-consumptions?page=1&limit=10&dateRangeFrom=2026-01-01&dateRangeTo=2026-01-31`

**Response `200`:**

```json
{
  "pagination": {
    "total": 87,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 9
  },
  "data": [
    {
      "id": 1,
      "carId": 1,
      "refuelDate": "2026-01-10",
      "emptyDate": "2026-01-24",
      "litersRefueled": 45,
      "pricePerLiter": 199.9,
      "startMileage": 150000,
      "endMileage": 150680,
      "distanceTraveled": 680,
      "consumptionPer100km": 6.62,
      "costPer100km": 1323.34,
      "totalCost": 8995.5,
      "completed": true,
      "createdAt": "2026-01-10T08:00:00Z",
      "updatedAt": "2026-01-24T18:00:00Z"
    },
    {
      "id": 4,
      "carId": 1,
      "refuelDate": "2026-01-24",
      "emptyDate": null,
      "litersRefueled": 42,
      "pricePerLiter": 202.5,
      "startMileage": 150680,
      "endMileage": null,
      "distanceTraveled": null,
      "consumptionPer100km": null,
      "costPer100km": null,
      "totalCost": 8505.0,
      "completed": false,
      "createdAt": "2026-01-24T18:30:00Z",
      "updatedAt": "2026-01-24T18:30:00Z"
    }
  ]
}
```

---

### `GET /api/admin/fuel-consumptions/:id`

Get single fuel consumption entry by ID.

**Params:**

| Param | Type    | Description         |
| ----- | ------- | ------------------- |
| `id`  | Integer | Fuel consumption ID |

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "carId": 1,
    "refuelDate": "2026-01-10",
    "emptyDate": "2026-01-24",
    "litersRefueled": 45,
    "pricePerLiter": 199.9,
    "startMileage": 150000,
    "endMileage": 150680,
    "distanceTraveled": 680,
    "consumptionPer100km": 6.62,
    "costPer100km": 1323.34,
    "totalCost": 8995.5,
    "completed": true,
    "createdAt": "2026-01-10T08:00:00Z",
    "updatedAt": "2026-01-24T18:00:00Z"
  }
}
```

**Errors:**

- `404` — Fuel consumption entry not found

---

### `POST /api/admin/fuel-consumptions`

Create a new fuel consumption entry (at refuel time).

**Body (only data known at refuel time):**

```json
{
  "carId": 1,
  "refuelDate": "2026-01-10",
  "litersRefueled": 45,
  "pricePerLiter": 199.9,
  "startMileage": 150000
}
```

**Response `201`:**

```json
{
  "message": "Fuel consumption created.",
  "data": {
    "id": 1,
    "carId": 1,
    "refuelDate": "2026-01-10",
    "emptyDate": null,
    "litersRefueled": 45,
    "pricePerLiter": 199.9,
    "startMileage": 150000,
    "endMileage": null,
    "distanceTraveled": null,
    "consumptionPer100km": null,
    "costPer100km": null,
    "totalCost": 8995.5,
    "completed": false,
    "createdAt": "2026-01-10T08:00:00Z",
    "updatedAt": "2026-01-10T08:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation (missing field, negative values)
- `404` — Car not found

---

### `PATCH /api/admin/fuel-consumptions/:id`

Update fuel consumption entry. Typically used to complete the entry when fuel runs out.

**Params:**

| Param | Type    | Description         |
| ----- | ------- | ------------------- |
| `id`  | Integer | Fuel consumption ID |

**Body (all fields optional):**

```json
{
  "emptyDate": "2026-01-24",
  "endMileage": 150680
}
```

**Response `200`:**

```json
{
  "message": "Fuel consumption updated.",
  "data": {
    "id": 1,
    "carId": 1,
    "refuelDate": "2026-01-10",
    "emptyDate": "2026-01-24",
    "litersRefueled": 45,
    "pricePerLiter": 199.9,
    "startMileage": 150000,
    "endMileage": 150680,
    "distanceTraveled": 680,
    "consumptionPer100km": 6.62,
    "costPer100km": 1323.34,
    "totalCost": 8995.5,
    "completed": true,
    "createdAt": "2026-01-10T08:00:00Z",
    "updatedAt": "2026-01-24T18:00:00Z"
  }
}
```

> When both `emptyDate` and `endMileage` are provided, backend automatically sets `completed: true` and computes derived fields.

**Errors:**

- `400` — Validation (`endMileage` less than `startMileage`, negative values)
- `404` — Fuel consumption entry not found

---

### `DELETE /api/admin/fuel-consumptions/:id`

Delete fuel consumption entry.

**Params:**

| Param | Type    | Description         |
| ----- | ------- | ------------------- |
| `id`  | Integer | Fuel consumption ID |

**Response `200`:**

```json
{
  "message": "Fuel consumption deleted."
}
```

**Errors:**

- `404` — Fuel consumption entry not found

---

### `GET /api/admin/cars/:id/fuel-consumptions`

Get all fuel consumption entries for a specific car.

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | Car ID      |

**Query params:**

| Param    | Type    | Default | Description              |
| -------- | ------- | ------- | ------------------------ |
| `page`   | Integer | 1       | Page number              |
| `limit`  | Integer | 10      | Results per page         |
| `search` | String  | —       | Search across all fields |

**Response `200`:**

```json
{
  "pagination": {
    "total": 12,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 2
  },
  "data": [
    {
      "id": 1,
      "carId": 1,
      "refuelDate": "2026-01-10",
      "emptyDate": "2026-01-24",
      "litersRefueled": 45,
      "pricePerLiter": 199.9,
      "startMileage": 150000,
      "endMileage": 150680,
      "distanceTraveled": 680,
      "consumptionPer100km": 6.62,
      "costPer100km": 1323.34,
      "totalCost": 8995.5,
      "completed": true,
      "createdAt": "2026-01-10T08:00:00Z",
      "updatedAt": "2026-01-24T18:00:00Z"
    },
    {
      "id": 4,
      "carId": 1,
      "refuelDate": "2026-01-24",
      "emptyDate": null,
      "litersRefueled": 42,
      "pricePerLiter": 202.5,
      "startMileage": 150680,
      "endMileage": null,
      "distanceTraveled": null,
      "consumptionPer100km": null,
      "costPer100km": null,
      "totalCost": 8505.0,
      "completed": false,
      "createdAt": "2026-01-24T18:30:00Z",
      "updatedAt": "2026-01-24T18:30:00Z"
    }
  ]
}
```

**Errors:**

- `404` — Car not found

---

## App — Dashboard

### `GET /api/app/dashboard`

Returns statistics for the currently logged-in user.

**Response `200`:**

```json
{
  "data": {
    "totalCars": 3,
    "totalMaintenances": 12,
    "totalFuelConsumptions": 28
  }
}
```

---

## App — Profile

### `GET /api/app/profile`

Get the currently logged-in user's profile.

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "firstName": "Marko",
    "lastName": "Markovic",
    "dateOfBirth": "1995-06-15",
    "email": "marko@example.com",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T10:00:00Z"
  }
}
```

---

### `PATCH /api/app/profile`

Update the currently logged-in user's profile. Only send fields that need to change.

**Body (all fields optional):**

```json
{
  "firstName": "Marko",
  "lastName": "Nikolic",
  "dateOfBirth": "1995-06-15",
  "email": "marko.new@example.com",
  "password": "NewPassword123!",
  "passwordConfirm": "NewPassword123!"
}
```

**Response `200`:**

```json
{
  "message": "Profile updated.",
  "data": {
    "id": 1,
    "firstName": "Marko",
    "lastName": "Nikolic",
    "dateOfBirth": "1995-06-15",
    "email": "marko.new@example.com",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T15:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation
- `409` — Email already taken

---

### `DELETE /api/app/profile`

Delete the currently logged-in user's account.

**Response `200`:**

```json
{
  "message": "Account deleted."
}
```

---

## App — Cars

> All routes return only cars belonging to the logged-in user. `userId` is automatically set from the JWT token.

### `GET /api/app/cars`

Get paginated list of the user's own cars with search and filters.

**Query params:**

| Param                  | Type    | Default | Description                        |
| ---------------------- | ------- | ------- | ---------------------------------- |
| `page`                 | Integer | 1       | Page number                        |
| `limit`                | Integer | 10      | Results per page                   |
| `search`               | String  | —       | Search across all fields           |
| `mileageFrom`          | Integer | —       | Filter by mileage (min)            |
| `mileageTo`            | Integer | —       | Filter by mileage (max)            |
| `registrationDateFrom` | Date    | —       | Filter by registration date (from) |
| `registrationDateTo`   | Date    | —       | Filter by registration date (to)   |
| `fuelType`             | Enum    | —       | Filter by fuel type                |
| `bodyType`             | Enum    | —       | Filter by body type                |

**Response `200`:**

```json
{
  "pagination": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 1
  },
  "data": [
    {
      "id": 1,
      "userId": 1,
      "brand": "Volkswagen",
      "model": "Golf 7",
      "year": 2019,
      "fuelType": "diesel",
      "engineCode": "CRLB",
      "transmissionCode": "QSF",
      "vinNumber": "WVWZZZ1KZAW123456",
      "color": "Black",
      "bodyType": "hatchback",
      "mileage": 150000,
      "registrationDate": "2025-06-15",
      "createdAt": "2026-02-03T10:00:00Z",
      "updatedAt": "2026-02-03T10:00:00Z"
    }
  ]
}
```

---

### `GET /api/app/cars/:id`

Get single car by ID (only if it belongs to the logged-in user).

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | Car ID      |

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "userId": 1,
    "brand": "Volkswagen",
    "model": "Golf 7",
    "year": 2019,
    "fuelType": "diesel",
    "engineCode": "CRLB",
    "transmissionCode": "QSF",
    "vinNumber": "WVWZZZ1KZAW123456",
    "color": "Black",
    "bodyType": "hatchback",
    "mileage": 150000,
    "registrationDate": "2025-06-15",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T10:00:00Z"
  }
}
```

**Errors:**

- `404` — Car not found or doesn't belong to user

---

### `POST /api/app/cars`

Create a new car. `userId` is automatically set from the JWT token — no need to send it in body.

**Body:**

```json
{
  "brand": "Volkswagen",
  "model": "Golf 7",
  "year": 2019,
  "fuelType": "diesel",
  "engineCode": "CRLB",
  "transmissionCode": "QSF",
  "vinNumber": "WVWZZZ1KZAW123456",
  "color": "Black",
  "bodyType": "hatchback",
  "mileage": 150000,
  "registrationDate": "2025-06-15"
}
```

**Response `201`:**

```json
{
  "message": "Car created.",
  "data": {
    "id": 1,
    "userId": 1,
    "brand": "Volkswagen",
    "model": "Golf 7",
    "year": 2019,
    "fuelType": "diesel",
    "engineCode": "CRLB",
    "transmissionCode": "QSF",
    "vinNumber": "WVWZZZ1KZAW123456",
    "color": "Black",
    "bodyType": "hatchback",
    "mileage": 150000,
    "registrationDate": "2025-06-15",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T10:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation
- `409` — VIN number already exists

---

### `PATCH /api/app/cars/:id`

Update own car. Only send fields that need to change.

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | Car ID      |

**Body (all fields optional):**

```json
{
  "color": "White",
  "mileage": 155000
}
```

**Response `200`:**

```json
{
  "message": "Car updated.",
  "data": {
    "id": 1,
    "userId": 1,
    "brand": "Volkswagen",
    "model": "Golf 7",
    "year": 2019,
    "fuelType": "diesel",
    "engineCode": "CRLB",
    "transmissionCode": "QSF",
    "vinNumber": "WVWZZZ1KZAW123456",
    "color": "White",
    "bodyType": "hatchback",
    "mileage": 155000,
    "registrationDate": "2025-06-15",
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T14:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation
- `404` — Car not found or doesn't belong to user
- `409` — VIN number already taken

---

### `DELETE /api/app/cars/:id`

Delete own car.

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | Car ID      |

**Response `200`:**

```json
{
  "message": "Car deleted."
}
```

**Errors:**

- `404` — Car not found or doesn't belong to user

---

## App — Maintenances

> All routes return only maintenances for cars belonging to the logged-in user.

### `GET /api/app/maintenances`

Get paginated list of all maintenances across all of the user's cars.

**Query params:**

| Param           | Type    | Default | Description                            |
| --------------- | ------- | ------- | -------------------------------------- |
| `page`          | Integer | 1       | Page number                            |
| `limit`         | Integer | 10      | Results per page                       |
| `search`        | String  | —       | Search across all fields               |
| `mileageFrom`   | Integer | —       | Filter by mileage at maintenance (min) |
| `mileageTo`     | Integer | —       | Filter by mileage at maintenance (max) |
| `dateRangeFrom` | Date    | —       | Filter by maintenance date (from)      |
| `dateRangeTo`   | Date    | —       | Filter by maintenance date (to)        |

**Response `200`:**

```json
{
  "pagination": {
    "total": 12,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 2
  },
  "data": [
    {
      "id": 1,
      "carId": 1,
      "name": "small_service",
      "mileage": 150000,
      "date": "2026-01-15",
      "replacedParts": [
        { "name": "Oil filter", "price": 1200 },
        { "name": "Engine oil 5W30 4L", "price": 4500 }
      ],
      "servicePrice": 7700,
      "createdAt": "2026-01-15T09:00:00Z",
      "updatedAt": "2026-01-15T09:00:00Z"
    }
  ]
}
```

---

### `GET /api/app/maintenances/:id`

Get single maintenance by ID (only if it belongs to user's car).

**Params:**

| Param | Type    | Description    |
| ----- | ------- | -------------- |
| `id`  | Integer | Maintenance ID |

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "carId": 1,
    "name": "small_service",
    "mileage": 150000,
    "date": "2026-01-15",
    "replacedParts": [
      { "name": "Oil filter", "price": 1200 },
      { "name": "Engine oil 5W30 4L", "price": 4500 }
    ],
    "servicePrice": 7700,
    "createdAt": "2026-01-15T09:00:00Z",
    "updatedAt": "2026-01-15T09:00:00Z"
  }
}
```

**Errors:**

- `404` — Maintenance not found or doesn't belong to user's car

---

### `POST /api/app/maintenances`

Create a new maintenance for one of the user's cars.

**Body:**

```json
{
  "carId": 1,
  "name": "small_service",
  "mileage": 150000,
  "date": "2026-01-15",
  "replacedParts": [
    { "name": "Oil filter", "price": 1200 },
    { "name": "Engine oil 5W30 4L", "price": 4500 }
  ],
  "servicePrice": 7700
}
```

**Response `201`:**

```json
{
  "message": "Maintenance created.",
  "data": {
    "id": 1,
    "carId": 1,
    "name": "small_service",
    "mileage": 150000,
    "date": "2026-01-15",
    "replacedParts": [
      { "name": "Oil filter", "price": 1200 },
      { "name": "Engine oil 5W30 4L", "price": 4500 }
    ],
    "servicePrice": 7700,
    "createdAt": "2026-01-15T09:00:00Z",
    "updatedAt": "2026-01-15T09:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation
- `404` — Car not found or doesn't belong to user

---

### `PATCH /api/app/maintenances/:id`

Update maintenance. Only send fields that need to change.

**Params:**

| Param | Type    | Description    |
| ----- | ------- | -------------- |
| `id`  | Integer | Maintenance ID |

**Body (all fields optional):**

```json
{
  "replacedParts": [
    { "name": "Oil filter", "price": 1200 },
    { "name": "Engine oil 5W30 4L", "price": 4500 },
    { "name": "Air filter", "price": 1800 }
  ],
  "servicePrice": 9500
}
```

**Response `200`:**

```json
{
  "message": "Maintenance updated.",
  "data": {
    "id": 1,
    "carId": 1,
    "name": "small_service",
    "mileage": 150000,
    "date": "2026-01-15",
    "replacedParts": [
      { "name": "Oil filter", "price": 1200 },
      { "name": "Engine oil 5W30 4L", "price": 4500 },
      { "name": "Air filter", "price": 1800 }
    ],
    "servicePrice": 9500,
    "createdAt": "2026-01-15T09:00:00Z",
    "updatedAt": "2026-01-20T14:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation
- `404` — Maintenance not found or doesn't belong to user's car

---

### `DELETE /api/app/maintenances/:id`

Delete maintenance.

**Params:**

| Param | Type    | Description    |
| ----- | ------- | -------------- |
| `id`  | Integer | Maintenance ID |

**Response `200`:**

```json
{
  "message": "Maintenance deleted."
}
```

**Errors:**

- `404` — Maintenance not found or doesn't belong to user's car

---

### `GET /api/app/cars/:id/maintenances`

Get all maintenances for a specific car (only if car belongs to user).

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | Car ID      |

**Query params:**

| Param    | Type    | Default | Description              |
| -------- | ------- | ------- | ------------------------ |
| `page`   | Integer | 1       | Page number              |
| `limit`  | Integer | 10      | Results per page         |
| `search` | String  | —       | Search across all fields |

**Response `200`:**

```json
{
  "pagination": {
    "total": 5,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 1
  },
  "data": [
    {
      "id": 1,
      "carId": 1,
      "name": "small_service",
      "mileage": 150000,
      "date": "2026-01-15",
      "replacedParts": [
        { "name": "Oil filter", "price": 1200 },
        { "name": "Engine oil 5W30 4L", "price": 4500 }
      ],
      "servicePrice": 7700,
      "createdAt": "2026-01-15T09:00:00Z",
      "updatedAt": "2026-01-15T09:00:00Z"
    }
  ]
}
```

**Errors:**

- `404` — Car not found or doesn't belong to user

---

## App — Fuel Consumptions

> All routes return only fuel consumption entries for cars belonging to the logged-in user.

### `GET /api/app/fuel-consumptions`

Get paginated list of all fuel consumption entries across all of the user's cars.

**Query params:**

| Param           | Type    | Default | Description                  |
| --------------- | ------- | ------- | ---------------------------- |
| `page`          | Integer | 1       | Page number                  |
| `limit`         | Integer | 10      | Results per page             |
| `search`        | String  | —       | Search across all fields     |
| `dateRangeFrom` | Date    | —       | Filter by refuel date (from) |
| `dateRangeTo`   | Date    | —       | Filter by refuel date (to)   |

**Response `200`:**

```json
{
  "pagination": {
    "total": 28,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 3
  },
  "data": [
    {
      "id": 1,
      "carId": 1,
      "refuelDate": "2026-01-10",
      "emptyDate": "2026-01-24",
      "litersRefueled": 45,
      "pricePerLiter": 199.9,
      "startMileage": 150000,
      "endMileage": 150680,
      "distanceTraveled": 680,
      "consumptionPer100km": 6.62,
      "costPer100km": 1323.34,
      "totalCost": 8995.5,
      "completed": true,
      "createdAt": "2026-01-10T08:00:00Z",
      "updatedAt": "2026-01-24T18:00:00Z"
    }
  ]
}
```

---

### `GET /api/app/fuel-consumptions/:id`

Get single fuel consumption entry by ID (only if it belongs to user's car).

**Params:**

| Param | Type    | Description         |
| ----- | ------- | ------------------- |
| `id`  | Integer | Fuel consumption ID |

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "carId": 1,
    "refuelDate": "2026-01-10",
    "emptyDate": "2026-01-24",
    "litersRefueled": 45,
    "pricePerLiter": 199.9,
    "startMileage": 150000,
    "endMileage": 150680,
    "distanceTraveled": 680,
    "consumptionPer100km": 6.62,
    "costPer100km": 1323.34,
    "totalCost": 8995.5,
    "completed": true,
    "createdAt": "2026-01-10T08:00:00Z",
    "updatedAt": "2026-01-24T18:00:00Z"
  }
}
```

**Errors:**

- `404` — Fuel consumption entry not found or doesn't belong to user's car

---

### `POST /api/app/fuel-consumptions`

Create a new fuel consumption entry at refuel time.

**Body (only data known at refuel time):**

```json
{
  "carId": 1,
  "refuelDate": "2026-01-10",
  "litersRefueled": 45,
  "pricePerLiter": 199.9,
  "startMileage": 150000
}
```

**Response `201`:**

```json
{
  "message": "Fuel consumption created.",
  "data": {
    "id": 1,
    "carId": 1,
    "refuelDate": "2026-01-10",
    "emptyDate": null,
    "litersRefueled": 45,
    "pricePerLiter": 199.9,
    "startMileage": 150000,
    "endMileage": null,
    "distanceTraveled": null,
    "consumptionPer100km": null,
    "costPer100km": null,
    "totalCost": 8995.5,
    "completed": false,
    "createdAt": "2026-01-10T08:00:00Z",
    "updatedAt": "2026-01-10T08:00:00Z"
  }
}
```

**Errors:**

- `400` — Validation
- `404` — Car not found or doesn't belong to user

---

### `PATCH /api/app/fuel-consumptions/:id`

Update fuel consumption entry. Typically used to complete the entry when fuel runs out.

**Params:**

| Param | Type    | Description         |
| ----- | ------- | ------------------- |
| `id`  | Integer | Fuel consumption ID |

**Body (all fields optional):**

```json
{
  "emptyDate": "2026-01-24",
  "endMileage": 150680
}
```

**Response `200`:**

```json
{
  "message": "Fuel consumption updated.",
  "data": {
    "id": 1,
    "carId": 1,
    "refuelDate": "2026-01-10",
    "emptyDate": "2026-01-24",
    "litersRefueled": 45,
    "pricePerLiter": 199.9,
    "startMileage": 150000,
    "endMileage": 150680,
    "distanceTraveled": 680,
    "consumptionPer100km": 6.62,
    "costPer100km": 1323.34,
    "totalCost": 8995.5,
    "completed": true,
    "createdAt": "2026-01-10T08:00:00Z",
    "updatedAt": "2026-01-24T18:00:00Z"
  }
}
```

> When both `emptyDate` and `endMileage` are provided, backend automatically sets `completed: true` and computes derived fields.

**Errors:**

- `400` — Validation (`endMileage` less than `startMileage`)
- `404` — Fuel consumption entry not found or doesn't belong to user's car

---

### `DELETE /api/app/fuel-consumptions/:id`

Delete fuel consumption entry.

**Params:**

| Param | Type    | Description         |
| ----- | ------- | ------------------- |
| `id`  | Integer | Fuel consumption ID |

**Response `200`:**

```json
{
  "message": "Fuel consumption deleted."
}
```

**Errors:**

- `404` — Fuel consumption entry not found or doesn't belong to user's car

---

### `GET /api/app/cars/:id/fuel-consumptions`

Get all fuel consumption entries for a specific car (only if car belongs to user).

**Params:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | Integer | Car ID      |

**Query params:**

| Param    | Type    | Default | Description              |
| -------- | ------- | ------- | ------------------------ |
| `page`   | Integer | 1       | Page number              |
| `limit`  | Integer | 10      | Results per page         |
| `search` | String  | —       | Search across all fields |

**Response `200`:**

```json
{
  "pagination": {
    "total": 8,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 1
  },
  "data": [
    {
      "id": 1,
      "carId": 1,
      "refuelDate": "2026-01-10",
      "emptyDate": "2026-01-24",
      "litersRefueled": 45,
      "pricePerLiter": 199.9,
      "startMileage": 150000,
      "endMileage": 150680,
      "distanceTraveled": 680,
      "consumptionPer100km": 6.62,
      "costPer100km": 1323.34,
      "totalCost": 8995.5,
      "completed": true,
      "createdAt": "2026-01-10T08:00:00Z",
      "updatedAt": "2026-01-24T18:00:00Z"
    }
  ]
}
```

**Errors:**

- `404` — Car not found or doesn't belong to user
