# Lost & Found App

This full-stack application helps manage lost and found items for K.K. Wagh College. It connects users who report lost items with users who report found items using a smart matching system.

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
|------------------|-------------------|-----------------|
| <img src="screenshots/image4.png" width="300"> | <img src="screenshots/image6.png" width="300"> | <img src="screenshots/image10.png" width="300"> |

| My Reports (Matched) | My Reports (Active) | Admin Approvals |
|----------------------|---------------------|-----------------|
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

Note: I fixed the ".encv" typo to ".env" and organized the lists for clarity. Place these in the appropriate `.env` files in the server and client folders.

### Server (.env)
Use a `.env` file in the server folder with the following variables (example names shown — adapt values to your environment):

```
PORT=5000
NODE_ENV=development
HOST=localhost
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d
SESSION_SECRET=<your_session_secret>
COOKIE_MAX_AGE=86400000
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GOOGLE_CALLBACK_URL=<your_google_callback_url>
EMAIL_USER=<email_address_for_notifications>
EMAIL_PASS=<email_password_or_app_password>
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### Client (.env)
Use a `.env` file in the client folder (prefix with REACT_APP_):

```
REACT_APP_GOOGLE_CLIENT_ID=<your_google_client_id>
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```

### Backend Setup

```bash
cd server
npm install
# create .env with the variables shown above
npm run dev    # or `npm start` depending on your scripts
```

### Frontend Setup

```bash
cd ../client
npm install
# create .env with the client variables shown above
npm start
```

---

## Project Structure (suggested)

- /client — React app
- /server — Express API
- /screenshots — images used in README

---

## Contributing

If you'd like to contribute, please open an issue or submit a pull request. Describe the change and include screenshots if applicable.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact

For questions or help setting this up, open an issue on the repo or contact the maintainers.
