// Cloudinary 配置
const cloudinaryConfig = {
    cloudName: "dtyodfbzo", // 替換為您的 Cloud Name
    apiKey: "389857725882518",       // 替換為您的 API Key
    uploadPreset: "ml_default" // 您需要在 Cloudinary 控制台中創建一個 unsigned upload preset
};

// 上傳文件到 Cloudinary
async function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        
        fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve({
                    url: data.secure_url,
                    publicId: data.public_id,
                    name: file.name,
                    size: data.bytes,
                    format: data.format
                });
            }
        })
        .catch(error => {
            console.error('上傳到 Cloudinary 時發生錯誤:', error);
            reject(error);
        });
    });
}

// 上傳多個文件到 Cloudinary
async function uploadMultipleToCloudinary(files) {
    const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
    return Promise.all(uploadPromises);
}

// 從 Cloudinary 刪除文件
async function deleteFromCloudinary(publicId) {
    // 注意：刪除操作通常需要在服務器端進行，因為它需要 API Secret
    // 這裡僅作為示例，實際應用中應該通過您的後端服務進行
    console.warn('刪除操作需要在服務器端進行，此函數僅作為示例');
    
    return new Promise((resolve, reject) => {
        // 在實際應用中，您應該向您的後端發送請求，然後由後端調用 Cloudinary API
        // 這裡僅模擬成功響應
        resolve({ result: 'ok' });
    });
}
