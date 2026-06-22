# Qalbify – AI-Powered Spiritual and Emotional Companion

## Overview

**Qalbify** is an AI-powered mobile and web platform designed to promote emotional and spiritual well-being. The platform combines Natural Language Processing (NLP) and Islamic guidance to provide users with personalized emotional support.

The mobile application analyzes user emotions using a Hugging Face NLP model and generates empathetic responses along with relevant Qur'anic verses and translations retrieved from a custom MongoDB dataset. The platform also features a comprehensive web-based administration panel for monitoring user activity, managing content, detecting hallucinations, tracking high-risk interactions, and analyzing system performance.

---

## Key Features

### 📱 Mobile Application (Companion App)
* **🧠 Deep Sentiment Analysis:** Emotion detection using real-time Hugging Face NLP models to understand nuanced states (Anxiety, Depression, Fear, Happiness).
* **💬 Empathetic AI Conversations:** Personalized and dynamic AI responses that actively listen and provide judgment-free support.
* **📖 Infallible Qur'anic Wisdom:** Contextually relevant Qur'anic verse recommendations and translations retrieved securely from a custom MongoDB dataset.
* **🔒 Soulful Privacy:** Secure user authentication, profile management, and end-to-end anonymity.
* **⚡ Seamless Syncing:** Real-time interaction with backend services for continuous support.

### 💻 Admin Panel (Web Dashboard)
* **👥 User Operations:** Comprehensive user management and monitoring.
* **🚨 Safety & Crisis Monitoring:** Automated tracking of red flags and crisis alerts.
* **🕌 Truth Audit System:** Hallucination detection and strict response validation to ensure all Islamic content is 100% accurate.
* **🛡️ Content Control:** Advanced moderation and intervention management.
* **📊 Platform Telemetry:** A rich analytics dashboard detailing system insights, user sentiment trends, and AI performance.

---

## Project Structure

```text
/
├── backend/         # Node.js & Express.js backend server
├── admin-panel/     # React.js + Vite admin dashboard
└── (root)           # React Native Expo mobile application
```

---

## Prerequisites

Before running the project, ensure the following are installed and configured:

* Node.js
* MongoDB (Local Instance or MongoDB Atlas)
* Android Studio (for Android development)
* Expo CLI
* Environment variables configured in a `.env` file, including:

  * OpenAI API Key
  * Hugging Face API Key
  * AssemblyAI API Key
  * MongoDB Connection URI
  * Other required service credentials

---

# Running the Project

## 1. Backend Server

The backend server must be running before starting either the mobile application or the admin panel.

### Navigate to the backend directory

```bash
cd backend
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The backend server runs on **Port 5001** by default.

---

## 2. Admin Panel

The admin dashboard provides administrative access to platform monitoring and management features.

### Navigate to the admin panel directory

```bash
cd admin-panel
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

### Default Admin Credentials

| Field    | Value                                         |
| -------- | --------------------------------------------- |
| Email    | [admin@qalbify.com](mailto:admin@qalbify.com) |
| Password | admin123                                      |

---

## 3. Mobile Application (Expo)

### Navigate to the project root directory

```bash
cd ..
```

### Install dependencies

```bash
npm install
```

### Connect Android Device

```bash
adb pair <IP_ADDRESS>
adb connect <IP_ADDRESS>
```

### Run the application

```bash
npx expo run:android
```

Ensure that:

* USB debugging is enabled on your Android device.
* Android Studio SDK and platform tools are properly configured.
* The backend server is running before launching the application.

---

## Technology Stack

### Frontend

* React Native (Expo)
* React.js
* Vite

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Artificial Intelligence & APIs

* Hugging Face NLP Models
* OpenAI API
* AssemblyAI

---

## Authors

**Qalbify FYP 2026**
Bachelor of Software Engineering
Riphah International University
