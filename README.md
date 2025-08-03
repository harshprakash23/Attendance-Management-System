# Attendance Management System

A comprehensive web application for managing student attendance with features for adding students, marking attendance, viewing reports, and generating downloadable reports in multiple formats.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Student Management**
  - Add new students with detailed information
  - Remove existing students
  - View student list with details

- **Attendance Tracking**
  - Mark attendance for students
  - View attendance records
  - Check attendance by date

- **Reporting**
  - Generate attendance reports for specific date ranges
  - Download reports in multiple formats (CSV, PDF, DOCX)
  - View attendance trends

- **Dashboard**
  - Visual representation of attendance data
  - Quick overview of student information

## Technologies Used

### Frontend
- React.js
- Tailwind CSS
- Chart.js (for data visualization)
- Axios (for HTTP requests)
- React Router (for navigation)

### Backend
- Node.js
- Express.js
- MySQL (database)
- PDFKit (PDF generation)
- DOCX (DOCX generation)
- csv-writer (CSV generation)

## Project Structure

```
attendance-management-system/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # React components and assets
│       ├── components/     # React components
│       ├── assets/         # Images and other assets
│       ├── App.js          # Main App component
│       └── index.js        # Entry point
├── server/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── routes/             # API routes
│   ├── server.js           # Express server
│   └── package.json        # Backend dependencies
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/harshprakash23/Attendance-Management-System.git
   cd Attendance-Management-System
   ```

2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../server
   npm install
   ```

## Database Setup

1. Create a MySQL database:
   ```sql
   CREATE DATABASE attendance_management;
   ```

2. Create the required tables:
   ```sql
   USE attendance_management;
   
   CREATE TABLE students (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     register_number VARCHAR(50) UNIQUE NOT NULL,
     year_of_study INT,
     branch VARCHAR(50),
     dob DATE,
     gender VARCHAR(10),
     community VARCHAR(50),
     minority VARCHAR(10) DEFAULT 'No',
     blood_group VARCHAR(10),
     aadhar VARCHAR(20),
     mobile VARCHAR(15),
     email VARCHAR(100)
   );
   
   CREATE TABLE attendance (
     id INT AUTO_INCREMENT PRIMARY KEY,
     student_id INT,
     date DATE,
     status VARCHAR(10),
     FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
   );
   ```

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=attendance_management
PORT=5000
```

## Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Student Management
- `POST /api/form/insert` - Add a new student
- `GET /api/read` - Get all students
- `GET /api/remove/getStudent/:registerNumber` - Get student by register number
- `DELETE /api/remove/delete/:registerNumber` - Delete student by register number

### Attendance Management
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/all` - Get all attendance records
- `GET /api/attendance/by-date/:date` - Get attendance by date

### Reports
- `GET /api/data/download?startDate=&endDate=&format=` - Download attendance report (format: csv, pdf, docx)
- `GET /api/attendanceToday/:date` - Download today's attendance report in DOCX format

## Screenshots

*(Add screenshots of your application here to showcase the UI)*

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using the MERN stack
