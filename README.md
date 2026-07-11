# 🚀 GrowEasy AI Importer

An AI-powered CSV Importer that intelligently maps leads from any CSV format into the GrowEasy CRM schema using Groq LLM.

## ✨ Features

- AI-powered CSV column mapping
- Automatic CRM field extraction
- CSV preview before import
- Drag & Drop file upload
- AI batch processing
- Lead Details Drawer
- Status badges
- Sticky table headers
- Dark / Light mode
- Responsive UI
- Validation and skipped record handling

---

# 🛠 Tech Stack

### Frontend

- Next.js 16
- React
- Tailwind CSS
- shadcn/ui
- Axios
- Sonner
- Lucide Icons

### Backend

- Node.js
- Express.js
- Multer
- PapaParse
- Groq SDK

### AI

- Groq LLM

---

# 📂 Project Structure

```
groweasy-ai-importer
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── src
│   ├── uploads
│   └── package.json
│
└── README.md
```

---

# ⚙ Prerequisites

Make sure the following are installed:

- Node.js (v18 or above)
- npm
- Groq API Key

---

# 📥 Installation

## 1. Clone Repository

```bash
git clone https://github.com/9346mukesh/groweasy-ai-importer.git

cd groweasy-ai-importer
```

---

## 2. Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file inside the **backend** folder.

```env
PORT=5001

GROQ_API_KEY=YOUR_GROQ_API_KEY

GROQ_MODEL=llama-3.3-70b-versatile

GROQ_BATCH_SIZE=15
```

Start the backend:

```bash
npm run dev
```

Backend runs on:

```
http://localhost:5001
```

---

## 3. Frontend Setup

Open another terminal.

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

# 🚀 Usage

1. Open

```
http://localhost:3000
```

2. Upload a CSV file.

3. Preview the uploaded data.

4. Click **Confirm Import**.

5. The AI extracts CRM fields.

6. Review imported and skipped records.

7. Click **More** to view complete lead details.

---

# 📡 API Endpoints

### Upload CSV

```
POST /api/import/upload
```

### Confirm Import

```
POST /api/import/confirm
```

### Import Progress

```
GET /api/import/progress
```

---

# 🌙 Dark Mode

The application supports:

- Light Theme
- Dark Theme
- System Theme

Toggle the theme using the icon in the top-right corner.

---

# 📷 Screenshots

Add screenshots here before submission.

- Upload Page
- CSV Preview
- AI Processing
- Results Table
- Lead Details Drawer
- Dark Mode

---

# 📝 Notes

- Supports CSV exports from Facebook Lead Ads, Google Ads, Excel, Google Sheets, Real Estate CRMs, Sales CRMs, and custom spreadsheets.
- AI automatically maps unknown column names to GrowEasy CRM fields.
- Invalid rows are skipped with a clear reason.
- Additional information is preserved in CRM Notes and Description whenever possible.

---

# 👨‍💻 Author

**Mukesh Kumar Reddy**

GitHub: https://github.com/<https://github.com/9346mukesh>

LinkedIn: https://linkedin.com/in/<https://www.linkedin.com/in/mukeshkumarreddy-musturu/>

---

# 📄 License

This project was developed as part of the **GrowEasy Software Developer Assignment** for evaluation purposes.