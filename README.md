# GeoSecure Attendance

A lightweight, web-based QR attendance management system with GPS tracking — built as a college project demo.

## Features

- **QR-Based Attendance** — Admin generates QR codes for sessions, students scan to mark attendance
- **GPS Geofencing** — Tracks student location every 15 seconds; marks absent if they leave the zone
- **No Backend Required** — Everything runs in the browser using localStorage
- **Dark Premium UI** — Glassmorphism, gradients, micro-animations
- **Mobile-Friendly** — Responsive design works on phones for scanning

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 18 (Vite) |
| Styling | Vanilla CSS (dark mode) |
| QR Scanning | html5-qrcode |
| QR Generation | qrcode.react |
| GPS | Browser Geolocation API |
| Storage | Browser localStorage |
| Icons | Lucide React |
| Notifications | react-hot-toast |

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Demo Credentials

No passwords required! Just select from the dropdown:

| Role | Name | Roll Number |
|------|------|-------------|
| Student | Swanand | CS2024001 |
| Student | Priya Patel | CS2024002 |
| Student | Amit Kumar | CS2024003 |
| Student | Neha Singh | CS2024004 |
| Admin | Admin Panel | — |

## How to Demo

### Step 1: Create a Session (Admin)
1. Login as **Admin**
2. Go to **Sessions** tab
3. Fill in Session Name, Class Name, Start Time, End Time
4. Click **Capture Location & Create** (allow GPS permission)
5. Click **Show QR** on the created session

### Step 2: Mark Attendance (Student)
1. Open another browser/tab → Login as a **Student**
2. Click **Scan QR Code**
3. Point camera at the QR code displayed by admin
4. Attendance is marked with GPS location check

### Step 3: GPS Tracking
- After scanning, the app tracks the student's location every 15 seconds
- If the student moves beyond 100m from the session location → status changes to **Absent**
- If they return within range → status changes back to **Present**

### Step 4: View Records
- **Students** can view their attendance history
- **Admin** can see all attendance records with distance data

## Geofence Configuration

The default geofence radius is **100 meters**. To change it, edit `src/data/students.js`:

```js
export const GEOFENCE_RADIUS_METERS = 100; // change this value
```

## Project Structure

```
frontend/
├── src/
│   ├── data/
│   │   └── students.js          # Demo students + config
│   ├── utils/
│   │   ├── storage.js           # localStorage helpers
│   │   └── geo.js               # Geolocation utilities
│   ├── context/
│   │   └── AppContext.jsx       # App state management
│   ├── pages/
│   │   ├── Login.jsx            # Student/Admin selector
│   │   ├── StudentDashboard.jsx # Student view
│   │   └── AdminPanel.jsx       # Admin view
│   ├── components/
│   │   ├── QRScanner.jsx        # Camera QR scanner
│   │   ├── QRGenerator.jsx      # QR code display
│   │   ├── LocationTracker.jsx  # GPS tracking
│   │   └── AttendanceHistory.jsx
│   ├── App.jsx                  # Routes
│   ├── main.jsx                 # Entry point
│   └── index.css                # Design system
├── index.html
├── package.json
└── vite.config.js
```

## Deployment (Vercel)

```bash
cd frontend
npm run build
```

Deploy the `dist/` folder to Vercel:
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: Vite

## Notes

- This is a **demo project** — all data is stored in the browser's localStorage
- Clearing browser data will reset all attendance records
- GPS requires HTTPS in production (localhost works for development)
- Camera access requires user permission

## License

MIT
