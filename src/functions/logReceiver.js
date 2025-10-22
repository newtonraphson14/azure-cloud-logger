const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

app.http('logReceiver', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('📝 Log receiver called');

        try {
            // 1. Ambil dan validasi data
            const body = await request.json();
            const { message, level = 'info', source = 'unknown' } = body;

            if (!message) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        success: false, 
                        error: 'Message is required' 
                    })
                };
            }

            // 2. Buat log object
            const logEntry = {
                timestamp: new Date().toISOString(),
                level: level,
                source: source,
                message: message,
                ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
            };

            context.log('📄 Log entry created:', logEntry);

            // 3. SIMPAN KE AZURE BLOB STORAGE (ONLY)
            const connectionString = process.env.AzureStorageConnectionString;
            let blobSaved = false;
            let blobError = null;

            if (connectionString && connectionString.includes('AccountKey=')) {
                try {
                    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
                    const containerClient = blobServiceClient.getContainerClient('logs');
                    
                    // Buat container jika belum ada
                    await containerClient.createIfNotExists({ access: 'blob' });
                    
                    // Upload log sebagai blob
                    const blobName = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.json`;
                    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                    
                    const logData = JSON.stringify(logEntry, null, 2);
                    await blockBlobClient.upload(logData, Buffer.byteLength(logData));
                    
                    context.log('☁️ Log saved to Azure Blob:', blobName);
                    blobSaved = true;
                    
                } catch (error) {
                    blobError = error.message;
                    context.log('❌ Blob storage error:', error.message);
                    // Continue without failing the request
                }
            } else {
                context.log('⚠️ No valid storage connection string');
            }

            // 4. Return response berdasarkan status blob storage
            return {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    success: true, 
                    message: blobSaved ? 'Log saved to cloud storage' : 'Log processed (storage skipped)',
                    logId: logEntry.timestamp,
                    storage: blobSaved ? 'azure_blob' : 'none',
                    ...(blobError && { warning: blobError })
                })
            };

        } catch (error) {
            context.log('❌ General error:', error);
            return {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Internal server error',
                    details: error.message
                })
            };
        }
    }
});