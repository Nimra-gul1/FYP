# Qalbify – AI-Powered Spiritual and Emotional Companion

## Overview

**Qalbify** is an AI-powered mobile and web platform designed to promote emotional and spiritual well-being. The platform combines Natural Language Processing (NLP) and Islamic guidance to provide users with personalized emotional support.

The mobile application analyzes user emotions using a Hugging Face NLP model and generates empathetic responses along with relevant Qur'anic verses and translations retrieved from a custom MongoDB dataset. The platform also features a comprehensive web-based administration panel for monitoring user activity, managing content, detecting hallucinations, tracking high-risk interactions, and analyzing system performance.

---

## Key Features

### 📱 Mobile Application Features

**Secure Authentication**
* User registration and login
* Google OAuth integration
* Password recovery via email

**AI Emotional Chat Companion**
* Real-time AI-powered emotional support
* Context-aware conversations
* Personalized empathetic responses
* Conversation memory for smoother interactions

**Emotion Detection**
* Detects emotions such as sadness, anxiety, fear, stress, and joy
* Real-time sentiment analysis using NLP models
* Emotion tracking during conversations

**Voice-to-Text Support**
* Users can interact using voice input
* Automatic speech-to-text conversion for chatbot conversations

**Emotion-Based Qur'anic Guidance**
* Recommends relevant Qur'anic verses based on detected emotions
* Arabic text with English translation
* Smart verse recommendation system
* Prevents repetition of verses within the same session

**Tafsir Integration**
* Simplified and authentic Tafsir explanations
* Displays verse meaning and context alongside recommendations

**Personal Journaling**
* Create, edit, view, and delete journal entries
* Emotion-tagged reflections
* Timestamped journal records
* Emotional self-reflection and progress tracking

**Progress & Activity Tracking**
* Mood trend monitoring
* User activity streaks
* Emotional wellness insights

**Chat Management**
* Secure chat history storage
* Clear chat functionality
* Personalized chat experience

**Privacy & Security**
* JWT-based authentication
* Bcrypt password hashing
* K-Anonymity and Differential Privacy techniques
* Secure data storage and transmission

---

### 🌐 Admin Panel Features

**Admin Authentication**
* Secure administrator login
* Role-based access control

**User Management**
* View platform users
* Block or unblock users
* Monitor user activity

**System Monitoring Dashboard**
* Real-time platform monitoring
* Overall system health tracking
* Usage statistics and activity insights

**Performance Analytics**
* Tranquility Index monitoring
* Crisis Rate analysis
* Average session duration tracking
* User engagement metrics

**Red Flag Detection**
* Detection of serious distress indicators
* Monitoring of potentially harmful conversations
* Real-time alert generation

**Hallucination Detection & Validation**
* Ensures AI responses remain accurate
* Prevents generation of non-verified religious content

**Content Management**
* Manage Qur'anic content and guidance data
* Maintain content authenticity and quality

**Audit & Transparency Logs**
* Track emotions associated with recommended verses
* Maintain logs for accountability and analysis
* Ensure all verses originate from verified datasets

**Privacy-Preserving Analytics**
* Aggregated system insights
* User anonymity protection
* Secure telemetry monitoring

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

-NIMRA GUL
-MARYAM SAFDAR
-SAMIYYA AFTAB

**Qalbify FYP 2026**
Bachelor of Software Engineering
Riphah International University
