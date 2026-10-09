# 5. Git სამუშაო პროცესი

## 1. ორი ფაზა ერთ რეპოში

| ფაზა | ბრანჩები | სახელების წესი |
|---|---|---|
| **A. Git მოდული** (Skillwill, LO1–3) | `main`, `feature-header`, `nav-feature`, `nav-alt` | **ზუსტად** დავალების ინსტრუქციით, Jira key-ის გარეშე |
| **B. React პროექტი** | `feature/LOG-<n>-<მოკლე-სახელი>` | Jira key სავალდებულოა |

> ფაზა A სრულდება **პირველი**, React-ის კოდამდე. root-ის `index.html` ფაზა B-ში აღარ იცვლება — React აპი ცხოვრობს `app/` საქაღალდეში.

## 2. ფაზა A — Git მოდულის ჩექლისტი

### ეტაპი 1 — საფუძვლები (LO1)
```bash
mkdir exam-project && cd exam-project
git init
# შექმენი index.html (HTML5 სტრუქტურა) და README.md
git add .
git commit -m "Initial commit: setup project structure"
# GitHub: ახალი საჯარო რეპო "examproject" — README/.gitignore/ლიცენზიის გარეშე!
git branch -M main
git remote add origin <რეპოს_URL>
git push -u origin main
```

### ეტაპი 2 — განშტოებები (LO2)
```bash
git checkout -b feature-header
# index.html → <body>-ში:
#   <header>
#     <h1>Skillwill Exam Project Portal</h1>
#   </header>
git add index.html
git commit -m "Add header component to index.html"
git push -u origin feature-header
```
**Merge — Pull Request-ით** (კოლაბორაციის მტკიცებულება):
1. GitHub → **Compare & pull request** → აღწერა: რა ემატება და რატომ → **Merge**
2. ლოკალურად:
```bash
git checkout main
git pull origin main
```
> ინსტრუქციის ალტერნატივა (`git merge feature-header` + `git push origin main`) ასევე მისაღებია; PR-ით merge რუბრიკის „გუნდთან ურთიერთობის“ კრიტერიუმსაც ფარავს.

**Pull-ის კრიტერიუმი** („ასახავს დისტანციურ ცვლილებებს ლოკალურად“):
1. GitHub-ზე, ვებ-რედაქტორში შეცვალე `README.md` (მაგ. დაამატე „React Final Project“ სექცია) → Commit
2. ლოკალურად:
```bash
git pull origin main
```

### ეტაპი 3 — კონფლიქტი (LO3)
```bash
git checkout main
git checkout -b nav-feature
# ჰედერის ქვემოთ: <nav><ul><li>Home</li><li>About</li></ul></nav>
git commit -am "Add primary navigation menu"

git checkout main
git checkout -b nav-alt
# იმავე ადგილას: <nav><ul><li>Dashboard</li><li>Settings</li></ul></nav>
git commit -am "Add alternative navigation menu"

git checkout main
git merge nav-feature
git merge nav-alt
# → CONFLICT (content): Merge conflict in index.html
```

**გადაჭრა — ორივე მენიუს გაერთიანება, მარკერების წაშლა:**
```html
<nav>
  <ul>
    <li>Home</li>
    <li>About</li>
    <li>Dashboard</li>
    <li>Settings</li>
  </ul>
</nav>
```
```bash
git add index.html
git commit -m "Resolve merge conflict between nav-feature and nav-alt"
git push origin main
```

**კონფლიქტის მიზეზის ახსნა** (Jira Issue-ს კომენტარში ან README-ში):
> ორივე ბრანჩი შეიქმნა `main`-ის ერთი და იმავე კომიტიდან და ორივემ შეცვალა `index.html`-ის ერთი და იგივე ხაზები (ჰედერის ქვემოთ). `nav-feature`-ის merge fast-forward-ით მოხდა, ხოლო `nav-alt`-ის merge-ისას Git-მა ვერ გადაწყვიტა, რომელი ვერსია დაეტოვებინა. გადაწყვეტა: ორივე მენიუ გაერთიანდა ერთ ნავიგაციაში — საჯარო გვერდები (Home, About) და მომხმარებლის სამუშაო სივრცე (Dashboard, Settings).

### ჩაბარებამდე შემოწმება
- [ ] რეპო საჯაროა
- [ ] `git log --oneline --graph --all` აჩვენებს ყველა ბრანჩს და merge-ს
- [ ] `feature-header`, `nav-feature`, `nav-alt` GitHub-ზეც ჩანს
- [ ] `index.html`-ში კონფლიქტის მარკერები (`<<<<<<<`, `=======`, `>>>>>>>`) არ დარჩა
- [ ] ბრძანებების ისტორია შენახულია: `history > git-commands.txt`

## 3. ფაზა B — React პროექტის წესები

**ბრანჩები:** `main`-იდან, თითო Jira Issue-ზე ან Epic-ზე.
| ბრანჩი | Jira |
|---|---|
| `docs/LOG-1-project-documentation` | LOG-11…LOG-15 |
| `feature/LOG-21-vite-setup` | LOG-21, LOG-22 |
| `feature/LOG-23-mock-api` | LOG-23 |
| `feature/LOG-24-auth-rbac` | LOG-24, LOG-25 |
| `feature/LOG-26-routes-crud` | LOG-26, LOG-27 |
| `feature/LOG-28-search-filters` | LOG-28 |
| `feature/LOG-29-booking` | LOG-29, LOG-30 |
| `feature/LOG-31-balance` | LOG-31, LOG-32 |
| `feature/LOG-33-company` | LOG-33, LOG-34 |
| `feature/LOG-35-map` | LOG-35 |
| `chore/LOG-37-deploy` | LOG-36, LOG-37, LOG-38 |

**კომიტები:** `LOG-<n> <ზმნა ბრძანებით> <რა>`
```
LOG-25 Add role-based route guards
LOG-28 Add price range filter to search
```

**Merge:** მხოლოდ Pull Request-ით → `main`. PR-ის აღწერაში: Jira Issue-ს ბმული და რა შემოწმდა.

## 4. React კოდის დაკომიტება — ფაილები ბრანჩების მიხედვით

მზა `app/` საქაღალდე ჩასვი რეპოს root-ში (`index.html`-ის გვერდით) და დააკომიტე ქვემოთ მოცემული თანმიმდევრობით. თითოეული ბრანჩი იხსნება `main`-იდან, იტვირთება GitHub-ზე და merge-დება Pull Request-ით.

```bash
git checkout main && git pull
git checkout -b <ბრანჩი>
git add <ფაილები>
git commit -m "<კომიტი>"
git push -u origin <ბრანჩი>
# GitHub → Pull Request → Merge
```

| # | ბრანჩი | `git add` | კომიტი |
|---|---|---|---|
| 1 | `docs/LOG-1-project-documentation` | `docs/` | `LOG-1 Add project documentation` |
| 2 | `feature/LOG-21-vite-setup` | `.gitignore app/package.json app/package-lock.json app/vite.config.js app/index.html app/public app/.gitignore app/.oxlintrc.json app/src/main.jsx app/src/index.css app/src/components app/src/app/Layout.jsx app/src/app/router.jsx app/src/pages/HomePage.jsx app/src/pages/AboutPage.jsx app/src/pages/NotFoundPage.jsx` | `LOG-21 Set up Vite, Tailwind, router and layout` |
| 3 | `feature/LOG-23-mock-api` | `app/src/lib` | `LOG-23 Add localStorage mock API and seed data` |
| 4 | `feature/LOG-24-auth-rbac` | `app/src/store app/src/app/ProtectedRoute.jsx app/src/features/auth app/src/pages/LoginPage.jsx app/src/pages/RegisterPage.jsx` | `LOG-25 Add auth and role-based route guards` |
| 5 | `feature/LOG-26-routes-crud` | `app/src/features/routes app/src/pages/RouteEditorPage.jsx` | `LOG-26 Add route create/edit form with validation` |
| 6 | `feature/LOG-28-search-filters` | `app/src/pages/SearchPage.jsx` | `LOG-28 Add search with URL filters and sorting` |
| 7 | `feature/LOG-29-booking` | `app/src/features/booking app/src/pages/RouteDetailsPage.jsx app/src/pages/BookingConfirmPage.jsx` | `LOG-30 Add express booking with overbooking guard` |
| 8 | `feature/LOG-31-balance` | `app/src/features/balance app/src/pages/SettingsPage.jsx` | `LOG-31 Add balance top-up and transactions` |
| 9 | `feature/LOG-33-company` | `app/src/features/company app/src/pages/DashboardPage.jsx` | `LOG-33 Add company profile, budget and drivers` |
| 10 | `feature/LOG-35-map` | `app/src/features/map` | `LOG-35 Add interactive route map` |
| 11 | `chore/LOG-37-deploy` | `app/vercel.json app/README.md` | `LOG-37 Add Vercel config and app README` |

> აპლიკაცია სრულად იბილდება ბოლო (11) merge-ის შემდეგ, რადგან `router.jsx` ყველა გვერდს ერთად აკავშირებს. შუალედურ ბრანჩებზე `npm run build` შეიძლება ჯერ არ მუშაობდეს — ეს ნორმალურია.
>
> ბოლოს შეამოწმე: `git status` უნდა იყოს სუფთა (ყველა ფაილი დაკომიტებულია).
