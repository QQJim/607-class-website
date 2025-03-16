// Cloudinary 配置
const cloudinaryConfig = {
    cloudName: "dtyodfbzo", // 替換為您的 Cloud Name
    apiKey: "389857725882518", // 替換為您的 API Key
    uploadPreset: "class607_unsigned" // 您在 Cloudinary 控制台中創建的 upload preset，必須設置為允許未簽名上傳
};

/*
重要說明：如何配置 Cloudinary 未簽名上傳預設
1. 登入 Cloudinary 控制台 (https://console.cloudinary.com/)
2. 進入 Settings > Upload 頁面
3. 在 Upload presets 部分，點擊 "Add upload preset"
4. 創建一個名為 "class607_unsigned" 的預設
5. 確保 "Signing Mode" 設置為 "Unsigned"
6. 保存設置

如果您遇到 "Upload preset must be whitelisted for unsigned uploads" 錯誤，
請確保您已按照上述步驟正確配置 Cloudinary 上傳預設。
*/

// 上傳文件到 Cloudinary
async function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        // 創建一個表單，用於上傳到 Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        formData.append('folder', 'class607'); // 將文件上傳到指定文件夾
        
        // 使用未簽名上傳
        fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('Cloudinary 響應狀態碼:', response.status);
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('上傳到 Cloudinary 時發生錯誤:', data);
                reject(data);
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
            reject(error);
        });
    });
}

// 上傳多個文件到 Cloudinary
async function uploadMultipleToCloudinary(files) {
    const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
    return Promise.all(uploadPromises);
}

// 創建 Cloudinary Upload Widget
function createUploadWidget(options, callback) {
    if (!window.cloudinary) {
        console.error('Cloudinary Upload Widget 未加載');
        return null;
    }
    
    const defaultOptions = {
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: true,
        folder: 'class607',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
        maxFileSize: 10000000 // 10MB
    };
    
    return window.cloudinary.createUploadWidget(
        { ...defaultOptions, ...options },
        callback
    );
}
