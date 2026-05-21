# FeedForward 🍱🌍

> A smart food donation and redistribution platform designed to reduce food waste and connect donors with people in need through real-time location-based sharing.

---

## ✨ Overview

FeedForward is a full-stack web application where:

* Approved donors can share surplus food
* Receivers can discover nearby food posts
* Admins can manage approvals and platform activities
* Users can interact through a modern Google Maps powered interface

The project focuses on:

* reducing food waste
* improving food accessibility
* creating a smarter donation ecosystem

---

# 🚀 Features

## 🔐 Authentication & Security

* User Registration & Login
* Role-Based Access Control
* JWT Authentication
* Secure Password Hashing using Bcrypt
* Forgot Password & Reset Password System
* Protected Admin Routes

---

## 🥗 Food Donation System

* Create Food Donation Posts
* Upload Food Images
* Add Pickup Location & Expiry Time
* Request Food from Donors
* Admin Approval Workflow for Food Posts

---

## 🗺️ Google Maps Integration

* Real-Time Donor Location Tracking
* Food Pickup Locations on Interactive Map
* Current User Location Detection
* Distance Calculation Between Users & Donors
* Search Nearby Donors & Food Posts
* Custom Modern Map Markers
* Clickable Profile Popup Cards

---

## 👤 User Profile System

* Edit User Profile
* Upload Profile Pictures
* Save Live Map Location
* Donor Status Management
* Bio & Contact Information

---

## 🧑‍💼 Admin Dashboard

* Approve/Reject Donor Applications
* Approve/Reject Food Posts
* Manage Pending Requests
* Monitor Platform Activity

---

# 🛠️ Tech Stack

## Frontend

* HTML5
* Tailwind CSS
* Vanilla JavaScript

## Backend

* Node.js
* Express.js

## Database

* MongoDB Atlas
* Mongoose

## APIs & Services

* Google Maps JavaScript API
* Browser Geolocation API
* JWT
* Bcrypt
* Nodemailer
* Multer

---

# 📂 Project Structure

```bash
FeedForward/
│
├── models/
├── routes/
├── public/
│   ├── css/
│   ├── js/
│   ├── uploads/
│   └── images/
│
├── server.js
├── package.json
├── .env
└── README.md
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/feedforward.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Start Server

```bash
npm start
```

or

```bash
node server.js
```

---

# 🌐 Local Development

```bash
http://localhost:5000
```

---

# 🔒 Security Features

* Password Hashing using Bcrypt
* JWT-Based Authentication
* Protected Routes
* Role-Based Authorization
* Secure File Upload Handling

---

# 📍 Core Modules

* Authentication System
* Food Donation Management
* Admin Dashboard
* Google Maps Integration
* Request Management
* User Profile Management

---

# 🎯 Future Improvements

* Real-Time Chat System
* Push Notifications
* Delivery Volunteer Module
* AI-Based Food Recommendations
* Mobile Application Version
* Google Directions Integration

---

# 👨‍💻 Developer

**Razowan** |
Bangladesh University of Professionals (BUP)

---

# 📜 License

This project was developed for academic and educational purposes.
