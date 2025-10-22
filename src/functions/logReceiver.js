const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs').promises;
const path = require('path');

app.http('logReceiver', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('📝 Log receiver called');

        try {
            // 1. Ambil data dari request body
            const body = await request.json();
            const { message, level = 'info', source = 'unknown' } = body;

            // 2. Buat log object
            const logEntry = {
                timestamp: new Date().toISOString(),
                level: level,
                source: source,
                message: message,
                ip: request.headers.get('x-forwarded-for') || 'localhost'
            };

            context.log('📄 Log entry:', logEntry);

            // 3. SIMPAN KE FILE LOKAL
            const logsDir = path.join(process.cwd(), 'logs');
            const logFile = path.join(logsDir, 'app-logs.json');
            
            await fs.mkdir(logsDir, { recursive: true });
            
            let logs = [];
            try {
                const existingData = await fs.readFile(logFile, 'utf8');
                logs = JSON.parse(existingData);
            } catch (error) {
                // File belum ada
            }
            
            logs.push(logEntry);
            await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
            context.log('💾 Log saved to local file');

            // 4. SIMPAN KE AZURE BLOB STORAGE
            const connectionString = process.env.AzureStorageConnectionString;
            if (connectionString) {
                try {
                    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
                    const containerClient = blobServiceClient.getContainerClient('logs');
                    
                    // Buat container jika belum ada
                    await containerClient.createIfNotExists();
                    
                    // Upload log sebagai blob
                    const blobName = `log-${Date.now()}.json`;
                    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                    
                    await blockBlobClient.upload(JSON.stringify(logEntry), JSON.stringify(logEntry).length);
                    context.log('☁️ Log saved to Azure Blob:', blobName);
                } catch (blobError) {
                    context.log('❌ Blob storage error:', blobError.message);
                    // Continue anyway, jangan gagal hanya karena blob error
                }
            }

            // 5. Return response
            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Log saved successfully (local + cloud)',
                    logId: logEntry.timestamp 
                })
            };

        } catch (error) {
            context.log('❌ Error:', error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    success: false, 
                    error: error.message 
                })
            };
        }
    }
});