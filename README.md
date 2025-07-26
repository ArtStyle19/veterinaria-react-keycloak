# 🐶 Veterinaria React + Spring Boot + Keycloak + AI Disease Prediction

## 👨‍💻 Developed by Jorge Guillermo Olarte Quispe  
## 🏫 Universidad Nacional del Altiplano – Ingeniería de Sistemas

A full-stack veterinary management system that empowers veterinarians, pet owners, and clinic administrators — built with a modular microservices approach and enhanced by AI and biometric login technologies.

---

### 🔧 Tech Stack Overview

- 🧠 **Frontend**: [React + TypeScript (Vite)](https://github.com/ArtStyle19/veterinaria-react-keycloak)
- 🏥 **Backend**: [Spring Boot REST API](https://github.com/ArtStyle19/veterinaria-springboot-keycloak)
- 🔐 **Authentication**: [Keycloak + Custom SPI for Facial Recognition](https://github.com/ArtStyle19/facial-spi-keycloak)
- 🧬 **Facial Recognition Engine**: [DeepFace (Facenet512 + RetinaFace) via GPU-accelerated Docker](https://github.com/ArtStyle19/docker-gpu-deepface)
- 🧠 **AI Disease Prediction**: Integrated via internal Flask microservice (Private Repo)
- 🗃️ **Database**: PostgreSQL

---

### 🚀 Core Features

- 👨‍⚕️ **Vet Dashboard**: Manage pet records, view historical data, and access AI-based diagnostic suggestions
- 👤 **Owner Portal**: Register pets, view records, and track medical history
- 🔐 **Facial Biometric Login**: Secure authentication using DeepFace-powered facial recognition via custom Keycloak SPI
- 🧬 **AI Disease Prediction**: Suggest potential conditions based on input symptoms (Flask model integration)
- 🗂️ **Admin Tools**: Approve new vets, manage clinics, monitor platform activity
- 📍 **QR Pet Status**: Quickly identify pets as “Lost” or “OK” by scanning a generated QR code
- 📱 **QR Import**: Easily **import pets via QR** (by vets or owners) to **grant read/write access to their medical record**

---

### 🔗 Related Repositories

| Project | Description | Link |
|--------|-------------|------|
| 🧩 **Frontend (React)** | Client-side pet management system with facial login | [veterinaria-react-keycloak](https://github.com/ArtStyle19/veterinaria-react-keycloak) |
| ⚙️ **Backend (Spring Boot)** | REST API for clinics, pets, and user roles | [veterinaria-springboot-keycloak](https://github.com/ArtStyle19/veterinaria-springboot-keycloak) |
| 🧠 **Keycloak SPI (Facial Auth)** | Facial login integration using DeepFace | [facial-spi-keycloak](https://github.com/ArtStyle19/facial-spi-keycloak) |
| 🐳 **GPU-Powered DeepFace Server** | Containerized deep learning backend for facial recognition | [docker-gpu-deepface](https://github.com/ArtStyle19/docker-gpu-deepface) |

> 🧪 **AI Disease Prediction Module**: Currently implemented internally via Flask, (Private Repo)

---

### 🗂️ Database Diagram
![Database Diagram](readme-images/db_diagram.jpg)

### 🧑‍⚕️ Vet Registration
![Vet Registration Form](readme-images/vet_registration_modal_form.jpg)
![Vet Registration Modal](readme-images/vet_registration_modal.jpg)
![Vet Registration Modal 2](readme-images/vet_registration_modal2.jpg)
![Vet Registration File Upload](readme-images/vet_registration_modal_file.jpg)

### 🔐 Login and Security
![Facial Vet Login](readme-images/facial_vet_login.jpg)
![Facial Vet Login 2](readme-images/facial_vet_login2.jpg)
![JWT Structure](readme-images/jwt.jpg)





### 👩‍⚕️ Vet Views
![Vet View Pet List](readme-images/vet_view_pet_list.jpg)
![Vet View Pet Modal](readme-images/vet_view_pet_modal.jpg)
![Vet View Pet Record](readme-images/vet_view_pet_record.jpg)

### 👩‍⚕️ Disease Prediction

![Disease Prediction](readme-images/vet_view_disease_prediction.jpg)
![Disease Prediction (Distemper)](readme-images/vet_view_disease_prediction_distemper.jpg)

### 👤 Owner Views
![Owner Pet List](readme-images/owner_view_pet_list.jpg)
![Owner Pet Modal](readme-images/owner_view_pet_modal.jpg)
![Owner Pet Record](readme-images/owner_view_pet_record.jpg)


### 🐾 Pet Detail Status (QR)
![Lost Pet](readme-images/lost_pet.jpg)
![OK Pet](readme-images/ok_pet.jpg)

### 🗺️ Clinics Map
![Clinics Map](readme-images/clinics_map.jpg)


### 📊 Admin Views
![Admin Dashboard](readme-images/admin_view_dashboard.jpg)
![Clinics List](readme-images/admin_view_clinics_list.jpg)

### 🧬 Pet Import Modals
![Import Pet Modal](readme-images/import_pet_modal.jpg)
![Import Pet Modal 2](readme-images/import_pet_modal2.jpg)
![Import Pet QR Modal](readme-images/import_pet_modalQR.jpg)
