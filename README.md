# ☁️ Azure Cloud Logger

Serverless logging system dengan Azure Functions + Blob Storage. Udah deploy ke cloud dan siap dipake!

## 🚀 Demo
- **API:** `https://ikbar-logger-001.azurewebsites.net/api/logreceiver`
- **Frontend:** Buka `frontend/index.html` di browser
- **GitHub:** `https://github.com/newtonraphson14/azure-cloud-logger`

## 💻 Tech Stack
- Azure Functions (Backend API)
- Azure Blob Storage (Log persistence) 
- Node.js + JavaScript
- HTML/CSS/JS (Frontend)

## 🛠️ Cara Pake

### 🎯 Coba Langsung (Paling Gampang)
1. **Buka file** `frontend/index.html` di browser
2. **Klik button** Info, Warning, atau Error
3. **Selesai!** Log langsung terkirim ke Azure cloud

### Test API
```bash
curl -X POST https://ikbar-logger-001.azurewebsites.net/api/logreceiver \
  -H "Content-Type: application/json" \
  -d '{"message": "Test log", "level": "info"}'
