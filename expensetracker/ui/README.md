# Expense Tracker Application

A modern full-stack expense tracker built with **Spring Boot (Java)** for backend and **React** for frontend.

---

## 📁 Project Structure

expensetracker/
├── ui/ # React UI (Create React App)
├── src/ # Spring Boot backend source
├── pom.xml # Maven config for backend
├── data.sql # Initial data for H2 (expenses, salary)
├── schema.sql # (Optional) DB schema for H2
└── README.md


---

## 🚀 Getting Started

### 1️⃣ FrontEnd (React)
```cd ui
npm install
npm install html2pdf.js

npm start
```


### 1️⃣ Backend (Spring Boot)

**Requirements:** Java 17+, Maven

#### **Run with Maven wrapper:**
```bash
./mvnw spring-boot:run

./mvnw clean package
java -jar target/expensetracker-0.0.1-SNAPSHOT.jar
```

Backend runs on: http://localhost:8080

H2 Database Console
Access at: http://localhost:8080/h2-console

JDBC URL: jdbc:h2:mem:testdb

User: sa

Password: (leave blank)


