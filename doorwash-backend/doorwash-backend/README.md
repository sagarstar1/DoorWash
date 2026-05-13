# DoorWash Backend API

Premium on-demand door-step car washing service — MERN stack backend.

## Tech Stack
- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — Database
- **Socket.io** — Real-time worker tracking & notifications
- **Razorpay** — Payments
- **Cloudinary** — Image uploads
- **Nodemailer** — Transactional emails
- **Twilio** — OTP via SMS
- **JWT + bcryptjs** — Auth

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your keys in .env
```

### 3. Seed the database
```bash
npm run seed
```
Seeded accounts:
| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| Admin    | admin@doorwash.in        | Admin@1234    |
| Worker   | rahul@doorwash.in        | Worker@1234   |
| Customer | customer@doorwash.in     | Customer@1234 |

### 4. Run development server
```bash
npm run dev
```
Server starts at `http://localhost:5000`

---

## API Reference

### Auth  `/api/auth`
| Method | Endpoint            | Access  | Description            |
|--------|---------------------|---------|------------------------|
| POST   | /register           | Public  | Register customer       |
| POST   | /login              | Public  | Login with email+pass   |
| POST   | /send-otp           | Public  | Send OTP to phone       |
| POST   | /verify-otp         | Public  | Verify OTP, get token   |
| GET    | /me                 | Private | Get current user        |
| GET    | /logout             | Private | Logout                  |
| PUT    | /update-profile     | Private | Update profile + avatar |
| POST   | /vehicle            | Private | Add vehicle to profile  |

### Bookings  `/api/bookings`
| Method | Endpoint              | Access         | Description              |
|--------|-----------------------|----------------|--------------------------|
| POST   | /                     | Customer       | Create booking            |
| GET    | /my                   | Customer       | Get my bookings           |
| GET    | /worker/assigned      | Worker         | Get worker's jobs         |
| GET    | /admin/all            | Admin          | All bookings              |
| GET    | /:id                  | Auth           | Single booking details    |
| PUT    | /:id/cancel           | Customer       | Cancel booking            |
| PUT    | /:id/status           | Worker/Admin   | Update booking status     |
| PUT    | /:id/assign           | Admin          | Assign worker             |

### Packages  `/api/packages`
| Method | Endpoint | Access | Description       |
|--------|----------|--------|-------------------|
| GET    | /        | Public | List all packages |
| GET    | /:id     | Public | Single package    |
| POST   | /        | Admin  | Create package    |
| PUT    | /:id     | Admin  | Update package    |
| DELETE | /:id     | Admin  | Deactivate        |

### Payments  `/api/payments`
| Method | Endpoint       | Access   | Description               |
|--------|----------------|----------|---------------------------|
| POST   | /create-order  | Customer | Create Razorpay order      |
| POST   | /verify        | Customer | Verify payment signature   |
| POST   | /webhook       | Public   | Razorpay webhook           |
| GET    | /history       | Customer | Payment history            |

### Reviews  `/api/reviews`
| Method | Endpoint             | Access   | Description           |
|--------|----------------------|----------|-----------------------|
| POST   | /                    | Customer | Create review          |
| GET    | /worker/:workerId    | Public   | Get worker reviews     |
| GET    | /                    | Admin    | All reviews            |
| PUT    | /:id/reply           | Admin    | Reply to review        |

### Workers  `/api/workers`
| Method | Endpoint           | Access | Description           |
|--------|--------------------|--------|-----------------------|
| PUT    | /location          | Worker | Update GPS location    |
| PUT    | /availability      | Worker | Toggle availability    |
| GET    | /stats             | Worker | Earnings & stats       |
| GET    | /                  | Admin  | All workers            |
| PUT    | /:id/approve       | Admin  | Approve worker         |

### Admin  `/api/admin`
| Method | Endpoint      | Access | Description          |
|--------|---------------|--------|----------------------|
| GET    | /analytics    | Admin  | Full dashboard stats  |
| GET    | /users        | Admin  | All users             |
| PUT    | /users/:id    | Admin  | Update user           |
| DELETE | /users/:id    | Admin  | Delete user           |

### Notifications  `/api/notifications`
| Method | Endpoint     | Access | Description         |
|--------|--------------|--------|---------------------|
| GET    | /            | Auth   | Get notifications    |
| PUT    | /read-all    | Auth   | Mark all read        |
| PUT    | /:id/read    | Auth   | Mark one read        |

---

## Socket Events

### Client → Server
| Event                  | Payload                          | Description                   |
|------------------------|----------------------------------|-------------------------------|
| `join_booking`         | `bookingId`                      | Join a booking's room          |
| `leave_booking`        | `bookingId`                      | Leave a booking's room         |
| `worker_location`      | `{ lat, lng, bookingId }`        | Worker broadcasts GPS          |
| `update_booking_status`| `{ bookingId, status }`          | Worker updates status          |

### Server → Client
| Event                    | Description                             |
|--------------------------|-----------------------------------------|
| `worker_location_update` | Worker GPS coordinates                   |
| `booking_status_update`  | Status changed (confirmed/on_the_way…)  |
| `worker_assigned`        | Admin assigned a worker to booking       |
| `booking_status_changed` | Admin dashboard live feed               |

---

## Folder Structure
```
doorwash-backend/
├── config/          # DB, Cloudinary, Razorpay setup
├── controllers/     # Business logic
├── middleware/      # Auth, error handler, validator
├── models/          # Mongoose schemas
├── routes/          # Express route definitions
├── sockets/         # Socket.io event handlers
├── utils/           # Email, OTP, templates, seeder
├── .env.example
├── server.js        # Entry point
└── package.json
```
