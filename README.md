# 📍 GeoSecure Attendance

**A GPS-Based QR Attendance Management System**

GeoSecure is a next-generation attendance tracking system designed to completely eliminate proxy attendance. It combines dynamic, time-sensitive QR codes with continuous live GPS geofencing to ensure students are physically present in the classroom during the entire session. 

Built with a premium "Bitcoin DeFi" aesthetic, GeoSecure offers a dark-void theme, mobile-first responsive design, and real-time monitoring capabilities for administrators.

---

## ✨ Key Features

- **🛡️ Anti-Proxy Dynamic QR Codes:** QR codes are generated with embedded, encrypted timestamps that refresh automatically. This prevents students from screenshotting and sharing the QR code with absent peers.
- **🌍 GPS Geofencing Validation:** Upon scanning the QR code, the student's geolocation is captured. If they are not within a 200-meter radius of the classroom (the "Origin Point"), they are marked absent.
- **📡 Continuous Live Monitoring:** Attendance isn't just a one-time scan. GeoSecure actively monitors the student's location throughout the session. If a student leaves the geofence, their risk level increases, and their status is flagged.
- **🗺️ Real-Time Admin Map:** Administrators have access to a live radar map (powered by Leaflet) showing the real-time positions of all scanned students, color-coded by their current presence status.
- **📊 Comprehensive Reporting & Analytics:** Generate detailed CSV reports, view attendance history, and analyze session statistics through an intuitive admin dashboard.
- **📱 Mobile-First Design:** Fully responsive UI optimized for thumb-reachability, featuring pill-shaped buttons, touch-friendly inputs, and bottom-sheet modals.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 18, Vite
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security)
- **Mapping:** React-Leaflet, OpenStreetMap
- **Styling:** Custom Vanilla CSS (Bitcoin DeFi Design System)
- **Icons & UI Utilities:** Lucide React, React Hot Toast
- **QR Processing:** `qrcode.react`, `html5-qrcode`
- **Fonts:** Space Grotesk (Headings), Inter (Body), JetBrains Mono (Data/Code)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/omkarpandharpurkar1600-debug/attendencetracker2431.git
cd attendencetracker2431/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup (Supabase)

1. Create a new Supabase project.
2. Navigate to the SQL Editor in your Supabase dashboard.
3. Run the SQL scripts provided in the root directory (`secure_schema.sql` and `supabase_setup.sql`) to generate the required tables:
   - `sessions`: Stores active class sessions.
   - `attendance`: Stores student attendance records and continuous monitoring states.
   - `location_logs`: Stores real-time GPS tracking data points.
   - `audit_logs`: Tracks administrative actions.

### 4. Environment Variables

Create a `.env` file in the `frontend` directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Development Server

```bash
npm run dev -- --host
```
The application will be available at `http://localhost:5173`. You can also access it on your mobile device via your local network IP (e.g., `http://192.168.x.x:5173`).

---

## 🔒 Security Architecture

1. **Session Lifecycle:** An admin creates a session, which establishes the "Origin Point" GPS coordinates.
2. **Scan Phase:** A student scans the dynamic QR code displayed by the admin. The QR payload contains a timestamp. If the timestamp is older than 10 minutes, the scan is rejected (mitigating screenshot sharing).
3. **Validation Phase:** The student's device requests GPS permissions. Their coordinates are compared against the Origin Point using the Haversine formula. 
4. **Monitoring Phase:** If within the 200m radius, they are marked "Present" and enter "Monitoring" mode. Their location is periodically polled.
5. **Risk Assessment:** If the student drifts significantly from the classroom, their risk level escalates (Low → Medium → High). Admins can view this live on the radar map.

---

## 👥 Development Team

GeoSecure was developed as a First Year Project at **KLS Gogte Institute Of Technology, Belagavi, Karnataka**.

- Omkar (2XI25ME056)
- Bhavana (2XI25CS045)
- Yash (2XI25CV108)
- Kartik (2XI25EC056)

---

## 📄 License

This project is released under the [MIT License](LICENSE).

© 2026 GeoSecure Attendance. All rights reserved.
