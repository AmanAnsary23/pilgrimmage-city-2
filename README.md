# 🇮🇳 Pilgrimage City Itinerary Generator  
A full-stack web application that generates a real-time travel itinerary for pilgrimage cities like **Vrindavan / Mathura**.  
Users can select **pandits**, **temples**, and **food locations**, and the system instantly builds an itinerary, shows routes on **Google Maps**, and generates AI-based summaries.

---

## 🚀 Features
- 🕌 **Temple Selection** – Choose temples to include in the itinerary  
- 👳‍♂️ **Pandit Selection** – Select a pandit for assistance  
- 🍲 **Food/Lunch Spots** – Pick lunch places  
- 🗺️ **Live Google Maps Integration** – Shows markers + routes  
- 🤖 **AI-Generated Itinerary Summary** (Gemini API)  
- ⚡ Instant itinerary updates (React frontend + Django backend)  
- 📍 Directions using Google Maps `DirectionsRenderer`  

---

## 📂 Tech Stack
### **Frontend**
- React (Vite)
- @react-google-maps/api
- Axios  
- Tailwind (optional)

### **Backend**
- Django + Django REST Framework
- Python
- MySQL (or SQLite)

### **AI**
- Gemini API (Google Generative AI)

---

## 🛠️ Setup Instructions

## 📸 Screenshots

<img width="1306" height="878" alt="Screenshot 2025-11-28 183505" src="https://github.com/user-attachments/assets/45869fc5-ffaa-45f9-9db6-3ba1bd5be703" />

<img width="1228" height="878" alt="Screenshot 2025-11-28 183511" src="https://github.com/user-attachments/assets/d7e1bb3f-b2d8-4aca-b1cb-3364f8d1634a" />
 


--After Inserting all informations
<img width="1351" height="887" alt="Screenshot 2025-11-27 145520" src="https://github.com/user-attachments/assets/b4978efd-fedd-4443-96d4-5be0d61c2beb" />

**I User Chatgpt to generating the following database:
--20 pandit data
--20 temples data
--20 food places data

##Note 
Integrating street views , route and loaction asking for billing in google gemini api , so i just place map 
