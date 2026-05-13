# DoorWash Frontend

Premium on-demand door-step car washing — React frontend.

## Tech Stack
- **React 18** + React Router v6
- **Socket.io client** — Real-time tracking
- **Recharts** — Admin analytics charts
- **Framer Motion** — Animations
- **Axios** — API calls with interceptors
- **date-fns** — Date formatting
- **react-datepicker** — Booking scheduler
- **react-hot-toast** — Toasts

## Design System
| Token | Value |
|---|---|
| `--black` | `#0A0A0B` |
| `--white` | `#FAFAF8` |
| `--accent` | `#C8F04A` (lime green) |
| `--blue` | `#1A3FFF` |
| Font Display | Clash Display |
| Font Heading | Syne |
| Font Body | DM Sans |

## Getting Started
```bash
npm install
cp .env.example .env
# Fill REACT_APP_API_URL, REACT_APP_SOCKET_URL, REACT_APP_RAZORPAY_KEY, REACT_APP_GOOGLE_MAPS_KEY
npm start
```

## Pages

### Public
| Route | Component | Description |
|---|---|---|
| `/` | LandingPage | Hero, marquee, how-it-works, packages, reviews, CTA |
| `/login` | LoginPage | Email + password auth |
| `/register` | RegisterPage | New customer signup |
| `/packages` | PackagesPage | All packages with tier filter |

### Customer (Protected)
| Route | Component | Description |
|---|---|---|
| `/dashboard` | DashboardPage | Stats, active booking, vehicles |
| `/book/:packageId` | BookingPage | 4-step booking + Razorpay payment |
| `/track/:bookingId` | TrackingPage | Live map, status timeline, worker info |
| `/bookings` | BookingHistoryPage | Filterable booking history + actions |
| `/review/:bookingId` | ReviewPage | Star rating + comment |
| `/profile` | ProfilePage | Edit name, manage vehicles |

### Admin (Protected)
| Route | Component | Description |
|---|---|---|
| `/admin` | AdminDashboard | Revenue charts, booking stats, top workers |
| `/admin/bookings` | AdminBookings | Full bookings table + worker assignment |
| `/admin/workers` | AdminWorkers | Worker list + approve/reject |
| `/admin/packages` | AdminPackages | Package CRUD with modal |
| `/admin/users` | AdminUsers | User list with search, verify, delete |

### Worker (Protected)
| Route | Component | Description |
|---|---|---|
| `/worker` | WorkerDashboard | Stats, online/offline toggle, location sharing |
| `/worker/jobs` | WorkerJobsPage | Assigned jobs with status progression |

## Folder Structure
```
src/
├── components/
│   ├── common/          # ProtectedRoute
│   └── layout/          # Navbar, DashboardLayout
├── context/             # AuthContext, SocketContext
├── hooks/               # useBookings, useNotifications
├── pages/
│   ├── customer/        # Dashboard, Booking, Tracking, History, Review, Profile
│   ├── admin/           # Dashboard, Bookings, Workers, Packages, Users
│   └── worker/          # Dashboard, Jobs
├── services/            # api.js (axios instance)
└── utils/               # helpers.js
```
