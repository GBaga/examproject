# Exam Project

Skillwill-ის Git მოდულის პრაქტიკული დავალება: ვერსიების კონტროლი Git-ისა და GitHub-ის გამოყენებით.
პროექტი ასევე მოიცავს React ფინალურ პროექტს: B2B / B2C ლოჯისტიკური პლატფორმა.

| | ბმული |
|---|---|
| 🌐 აპლიკაცია (Vercel) | https://examproject-taupe.vercel.app |
| 📋 Jira დაფა (`LOG`) | https://gbagaskillwill.atlassian.net/jira/software/projects/LOG/boards |
| 📚 დოკუმენტაცია | [`docs/`](./docs/README.md) |
| ⚛️ React აპის README | [`app/README.md`](./app/README.md) |

## 1. Git მოდული (სწავლის შედეგები 1–3)

ფაილები: [`index.html`](./index.html) და ეს `README.md`. მტკიცებულებაა კომიტების ისტორია (`git log --oneline --graph --all`).

| ეტაპი | რა გაკეთდა |
|---|---|
| I — საფუძვლები | `git init`, `index.html` + `README.md`, `Initial commit: setup project structure`, საჯარო რეპოსთან დაკავშირება და push |
| II — განშტოებები | `feature-header` ბრანჩი, ჰედერის დამატება, push, [PR #1](https://github.com/GBaga/examproject/pull/1), merge `main`-ში; GitHub-ზე შეცვლილი README ჩამოტანილია `git pull`-ით |
| III — კონფლიქტი | `nav-feature` და `nav-alt` ერთი და იმავე კომიტიდან, ერთსა და იმავე ადგილას განსხვავებული ნავიგაციით → `CONFLICT` → მარკერები წაიშალა, ორივე მენიუ გაერთიანდა → `Resolve merge conflict between nav-feature and nav-alt` |

## 2. React ფინალური პროექტი

**ვარიანტი №1 — B2B / B2C ლოჯისტიკური და ტრანსპორტირების პლატფორმა** (ინდივიდუალური პროექტი).

- **დაგეგმვა (სწავლის შედეგი 1):** ტექნიკური დავალება, როლები, სტეკი, რისკების ანალიზი და Timeline / Gantt — [`docs/`](./docs/README.md); ამოცანები — Jira `LOG`
- **კოდი:** [`app/`](./app) — Vite, React, Tailwind CSS, React Router, Zustand, React Hook Form + Zod, react-leaflet
- **Backend და ბაზა:** Vercel Serverless Function (`app/api/rpc.js`) + **MongoDB Atlas**
- **სამუშაო პროცესი:** თითო ფუნქცია ცალკე ბრანჩში, Jira-ს გასაღებით (`feature/LOG-<n>-…`), merge — Pull Request-ით (#2–#13)

### დემო ანგარიშები

| როლი | ელფოსტა | პაროლი |
|---|---|---|
| გადამზიდი | `giorgi@demo.ge` | `demo123` |
| კომპანია | `company@demo.ge` | `demo123` |

სტუმარს (მგზავრს) ძებნისა და ჯავშნისთვის ანგარიში არ სჭირდება.

## ავტორი

Goga Bagauri
