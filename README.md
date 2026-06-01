# gristo-rider

**Gristo Rider Portal** — Progressive Web App for delivery riders.

Part of the Gristo Restaurant Management System, consisting of:
1. `gristo-selfcheckout` — Customer QR/web ordering
2. `gristo-admin` — Admin panel
3. `gristo-chef` — Kitchen display
4. `gristo-waiter` — Waiter portal
5. **`gristo-rider`** — Rider app (this repo)

## Features

- 🔐 Secure login (role-based, same Firebase project)
- 🛵 Real-time delivery queue via Firestore `onSnapshot`
- 📦 Accept orders, mark picked up, mark delivered
- 🗺 One-tap Google Maps navigation to customer
- 📞 One-tap call to customer
- 💰 Earnings tracker (today / this week / all time)
- 📳 In-browser new order alert with audio tone
- 🟢 Online/offline availability toggle
- 🎨 Live brand color & restaurant name from admin settings
- 📱 PWA — install to home screen, offline shell
- 🔒 Real-time freeze/suspension detection

## Firebase

Uses the same `gristo-selfcheckout` Firebase project.

### Firestore Collections Used

| Collection | Purpose |
|---|---|
| `orders` | Delivery orders (filtered by `orderType == 'delivery'`) |
| `employee_roles` | Role check (must be `rider`, `admin`, or `superadmin`) |
| `employees` | Rider profile info |
| `settings/global` | Restaurant name, brand colors, delivery fee, currency |
| `presence` | Rider online status |

### Order Status Flow (Delivery)

```
received → confirmed → preparing → ready → picked_up → delivered
```

Rider interacts with: `ready` (accept), `picked_up` (mark delivered)

## Hosting

Deploy to GitHub Pages. Set CNAME to your desired subdomain (e.g. `rider.yourrestaurant.com`).

```bash
git init
git add .
git commit -m "Initial rider app"
git remote add origin https://github.com/yourusername/gristo-rider.git
git push -u origin main
```

Enable GitHub Pages from repo Settings → Pages → Source: main branch / root.

## Admin Setup

1. In the Admin panel, go to **Staff** → **Add Staff**
2. Set role to **Rider**
3. The rider receives a password setup email
4. They log in at this URL

## Delivery Fee

Set in Admin → **Setup** → delivery section. If not set, earnings will show $0.00 per delivery. Update `settings/global.deliveryFee` in Firestore.
