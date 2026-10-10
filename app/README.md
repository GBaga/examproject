# Logistics Platform — React აპლიკაცია

B2B / B2C ლოჯისტიკური და ტრანსპორტირების პლატფორმა: მარშრუტების ძებნა, ფილტრაცია და ექსპრეს ჯავშანი.
Skillwill-ის React ფინალური პროექტი (ვარიანტი №1). დოკუმენტაცია — [`../docs`](../docs/README.md).

## გაშვება

```bash
cd app
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # build-ის ლოკალური ნახვა
```

## დემო ანგარიშები

| როლი | ელფოსტა | პაროლი |
|---|---|---|
| გადამზიდი | `giorgi@demo.ge` | `demo123` |
| გადამზიდი | `nino@demo.ge` | `demo123` |
| კომპანია | `company@demo.ge` | `demo123` |

მგზავრს (სტუმარს) ჯავშნისთვის ანგარიში არ სჭირდება. საწყისი მონაცემების დასაბრუნებლად — footer-ში „დემო მონაცემების განულება“.

## ფუნქციონალი

| როლი | შესაძლებლობები |
|---|---|
| **სტუმარი** | ძებნა (საიდან / სად / თარიღი / ფასი), სორტირება, ფილტრები URL-ში, რუკა, ადგილების არჩევა, ექსპრეს ჯავშანი, დადასტურების კოდი |
| **გადამზიდი** | მარშრუტის შექმნა / რედაქტირება / წაშლა, Dashboard სტატისტიკით, ჯავშნები, ბალანსის შევსება, ტრანზაქციების ისტორია |
| **კომპანია** | ყველაფერი ზემოთ + კომპანიის პროფილი, ბიუჯეტის ლიმიტი და კონტროლი, მძღოლების მართვა, კორპორატიული რეისები მძღოლზე მიბმით |

**ტექნიკური გამოწვევები, რომლებიც დაფარულია:**
- **RBAC** — უფლებების ერთიანი მატრიცა (`src/store/authStore.js` → `PERMISSIONS`) და `ProtectedRoute` guard
- **ძებნის ოპტიმიზაცია** — ფილტრები URL-ში (გაზიარებადი ბმული), ფასის ველების debounce, race condition-ის დაცვა `useAsync`-ში
- **ბალანსი და ტრანზაქციები** — შევსების იმიტაცია, შემოსავლის ჩარიცხვა ჯავშნისას, ხარჯი ბალანსიდან, ისტორია ფილტრით
- **Overbooking-ის პრევენცია** — ადგილების შემოწმება და შემცირება ერთ ოპერაციაში (`lib/api/bookings.js`)
- **ინტერაქტიული რუკა** — react-leaflet + OpenStreetMap, lazy loading (code splitting)
- **ფორმები** — React Hook Form + Zod, ყველა სქემა ერთ ფაილში (`src/lib/schemas.js`)

## სტრუქტურა

```
api/rpc.js          Vercel Serverless Function (backend-ის შესასვლელი)
server/             handlers (ბიზნეს-ლოგიკა), mongo (კავშირი, seed), security (ჰეში, ტოკენი)
src/
├── app/            Layout, router, ProtectedRoute (RBAC guard)
├── pages/          გვერდები (Home, About, Search, RouteDetails, Dashboard, Settings, ...)
├── features/       auth, routes, booking, balance, company, map
├── components/     საერთო UI (Button, Field, Card, EmptyState, ...)
├── store/          Zustand — სესია და უფლებები
└── lib/
    ├── api/        API კლიენტი: auth, routes, bookings, transactions, company → POST /api/rpc
    ├── schemas.js  Zod ვალიდაცია
    ├── seed.js     დემო მონაცემები
    └── cities.js   ქალაქები კოორდინატებით
```

## Backend — MongoDB Atlas

- **API:** Vercel Serverless Function `api/rpc.js` (`POST /api/rpc { action, args }`), ლოგიკა — `server/handlers.js`
- **ბაზა:** MongoDB Atlas, კოლექციები `users`, `companies`, `drivers`, `routes`, `bookings`, `transactions`; ცარიელ ბაზას პირველივე მოთხოვნაზე ავსებს დემო მონაცემებით
- **უსაფრთხოება:** პაროლები — scrypt ჰეში; სესია — HMAC-ით ხელმოწერილი ტოკენი; მომხმარებელს სერვერი ტოკენიდან ადგენს
- **Overbooking:** ატომური პირობითი განახლება (`seatsLeft >= n` → `$inc`), ჩავარდნისას ცვლილებები უკან ბრუნდება
- **გარემოს ცვლადები** (`.env.example`): `MONGODB_URI`, `AUTH_SECRET`, სურვილისამებრ `MONGODB_DB`
- ლოკალურად: `app/.env`-ში ჩაწერე ცვლადები და `npm run dev` — `/api/rpc` იმავე handler-ით მუშაობს

## შეზღუდვები (MVP)

- გადახდა არის იმიტაცია; ბარათის მონაცემები არ მოითხოვება.
- რუკაზე მარშრუტი ნაჩვენებია სწორი ხაზით (საგზაო მარშრუტიზაციის API არ გამოიყენება).

## Deploy (Vercel)

- **Live:** https://examproject-taupe.vercel.app
- **Environment Variables:** `MONGODB_URI`, `AUTH_SECRET`
- **Root Directory:** `app`
- **Framework Preset:** Vite
- `vercel.json` უზრუნველყოფს SPA routing-ს (გვერდის განახლებისას 404 არ ჩნდება).
