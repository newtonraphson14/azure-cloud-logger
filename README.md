# ☁️ Azure Cloud Logger

Serverless logging API dengan Azure Functions + Blob Storage.

## 🚀 Fitur
- 📝 HTTP API untuk terima log
- 💾 Simpan ke file lokal + Azure Blob  
- ☁️ Deploy ke Azure Functions
- 🔒 Aman dengan environment variables

## 📡 API Usage

curl -X POST http://localhost:7071/api/logReceiver \
  -H "Content-Type: application/json" \
  -d '{"message": "Test log", "level": "info"}'

## 📁 Structure  

cloud-logger/
├── src/functions/logReceiver.js
├── host.json
└── README.md

## 🛠️ Development
```bash
git clone https://github.com/newtonraphson14/azure-cloud-logger.git
cd azure-cloud-logger
npm install
func start
