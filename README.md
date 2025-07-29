# Lost & Found App

A full-stack web application for managing lost and found items for kkwagh college.

## Features

- User authentication and authorization
- Item posting and management
- Search functionality for lost items
- Responsive web interface

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT
- 
## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```
4. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
5. Start the server:
   ```bash
   cd server
   npm start
   ```
6. Start the client:
   ```bash
   cd client
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
