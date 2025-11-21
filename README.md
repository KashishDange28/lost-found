# Lost & Found App

This full-stack application is developed to manage lost and found items for K.K. Wagh College. It connects users who report lost items with users who report found items using a smart matching system.

---

## About This Project

The platform allows students and staff to securely report lost or found items. Administrators can review, verify, and approve potential matches. Users have dashboard access to manage their reports, while admins can manage all reports and approve matches.

---

## Features

- Secure authentication (Email and Google OAuth)
- Role-based access (User and Admin)
- Report lost or found items with image upload
- User dashboard to track, edit, and delete reports
- Admin dashboard to oversee all reports and approve matches
- Smart matching system to suggest matches
- Responsive and modern UI

---

## Screenshots

| Home Page | Register Page | Admin Login |
|-----------|---------------|-------------|
| <img src="screenshots/image1.png" width="300"> | <img src="screenshots/image.png" width="300"> | <img src="screenshots/image9.png" width="300"> |

| Report Lost Item | Report Found Item | Admin Dashboard |
|------------------|------------------|-----------------|
| <img src="screenshots/image4.png" width="300"> | <img src="screenshots/image6.png" width="300"> | <img src="screenshots/image10.png" width="300"> |

| My Reports (Matched) | My Reports (Active) | Admin Approvals |
|----------------------|---------------------|------------------|
| <img src="screenshots/image5.png" width="300"> | <img src="screenshots/image7.png" width="300"> | <img src="screenshots/image8.png" width="300"> |

| Profile | Matched Reports |
|---------|-----------------|
| <img src="screenshots/image3.png" width="300"> | <img src="screenshots/image11.png" width="300"> |

---

## Tech Stack

- Frontend: React.js  
- Backend: Node.js with Express  
- Database: MongoDB  
- Authentication: JWT & Google OAuth  
- Deployment: Vercel

---

## Live Deployment

https://lost-found-delta-tan.vercel.app

---

## Environment Variables

### Server (.env)

PORT
NODE_ENV
HOST
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
SESSION_SECRET
COOKIE_MAX_AGE
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
EMAIL_USER
EMAIL_PASS
CORS_ORIGIN
RATE_LIMIT_WINDOW_MS
RATE_LIMIT_MAX

### Client (.env)

REACT_APP_GOOGLE_CLIENT_ID
REACT_APP_API_BASE_URL
---

## Installation

git clone https://github.com/your-username/your-repository-name.git

### Backend Setup

cd server
npm install
npm start

### Frontend Setup

cd ../client
npm install
npm start
---

## License

This project is licensed under the MIT License. Refer to the `LICENSE` file for details.
