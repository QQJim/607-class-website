// Cloudinary 配置
const cloudinaryConfig = {
    cloudName: "dtyodfbzo", // 替換為您的 Cloud Name
    apiKey: "389857725882518",       // 替換為您的 API Key
    uploadPreset: "class607_preset" // 將 ml_default 更改為您在 Cloudinary 控制台中創建的 unsigned upload preset
};

// 上傳文件到 Cloudinary
async function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        
        console.log('正在上傳到 Cloudinary，使用預設:', cloudinaryConfig.uploadPreset);
        
        fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                console.error('Cloudinary 響應狀態碼:', response.status);
                return response.json().then(errorData => {
                    throw errorData;
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                reject(data.error);
            } else {
                console.log('Cloudinary 上傳成功:', data.secure_url);
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
            
            // 提供更詳細的錯誤信息
            if (error.message && error.message.includes('Upload preset must be whitelisted')) {
                console.error('上傳預設錯誤: 您需要在 Cloudinary 控制台中將上傳預設設置為允許未簽名上傳');
                reject({
                    message: '上傳預設錯誤: 請確保您已在 Cloudinary 控制台中正確配置上傳預設',
                    originalError: error
                });
            } else {
                reject(error);
            }
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
