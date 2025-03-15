// Cloudinary 配置
const cloudinaryConfig = {
    cloudName: "dtyodfbzo", // 替換為您的 Cloud Name
    apiKey: "389857725882518", // 替換為您的 API Key
    apiSecret: "", // 注意：在前端暴露 API Secret 是不安全的，這裡僅作為臨時解決方案
    uploadPreset: "ml_default" // 您在 Cloudinary 控制台中創建的 upload preset
};

// 生成 Cloudinary 簽名
function generateSignature(paramsToSign) {
    // 注意：在前端生成簽名是不安全的，這是一個臨時解決方案
    // 在生產環境中，應該使用後端服務生成簽名
    console.warn('警告：在前端生成簽名是不安全的，這只是一個臨時解決方案');
    
    // 由於無法在前端安全地生成簽名，我們將使用替代方案
    return "";
}

// 上傳文件到 Cloudinary
async function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        // 由於無法在前端安全地生成簽名，我們將使用 Cloudinary Upload Widget
        // 這是一個臨時解決方案，直到您配置好 Cloudinary 上傳預設
        
        console.log('嘗試使用 Cloudinary Upload Widget 上傳文件');
        
        // 創建一個臨時表單，用於手動上傳到 Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        
        // 嘗試使用未簽名上傳
        fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                console.error('Cloudinary 響應狀態碼:', response.status);
                return response.json().then(errorData => {
                    // 如果是上傳預設錯誤，顯示詳細的錯誤信息
                    if (errorData.error && errorData.error.message && 
                        errorData.error.message.includes('Upload preset must be whitelisted')) {
                        console.error('上傳預設錯誤: 您需要在 Cloudinary 控制台中將上傳預設設置為允許未簽名上傳');
                        console.error('請按照以下步驟操作:');
                        console.error('1. 登入 Cloudinary 控制台 (https://cloudinary.com/console)');
                        console.error('2. 點擊 "Settings" -> "Upload" -> "Upload Presets"');
                        console.error('3. 點擊 "Add upload preset" 或編輯現有預設');
                        console.error(`4. 將預設名稱設置為 "${cloudinaryConfig.uploadPreset}" 或在代碼中更改預設名稱`);
                        console.error('5. 將 "Signing Mode" 設置為 "Unsigned"');
                        console.error('6. 保存設置並刷新網頁');
                        
                        // 嘗試使用 Cloudinary 的直接上傳頁面作為臨時解決方案
                        const uploadUrl = `https://upload-widget.cloudinary.com/global/all.js`;
                        
                        // 動態加載 Cloudinary Upload Widget
                        if (!window.cloudinary) {
                            const script = document.createElement('script');
                            script.src = uploadUrl;
                            script.onload = () => {
                                // 創建並打開 Upload Widget
                                const uploadWidget = window.cloudinary.createUploadWidget({
                                    cloudName: cloudinaryConfig.cloudName,
                                    uploadPreset: cloudinaryConfig.uploadPreset,
                                    sources: ['local', 'url', 'camera'],
                                    multiple: false
                                }, (error, result) => {
                                    if (!error && result && result.event === "success") {
                                        console.log('Cloudinary Widget 上傳成功:', result.info.secure_url);
                                        resolve({
                                            url: result.info.secure_url,
                                            publicId: result.info.public_id,
                                            name: file.name,
                                            size: result.info.bytes,
                                            format: result.info.format
                                        });
                                    } else if (error) {
                                        console.error('Cloudinary Widget 上傳錯誤:', error);
                                        reject(error);
                                    }
                                });
                                
                                uploadWidget.open();
                            };
                            
                            script.onerror = () => {
                                console.error('無法加載 Cloudinary Upload Widget');
                                reject(new Error('無法加載 Cloudinary Upload Widget'));
                            };
                            
                            document.body.appendChild(script);
                        } else {
                            // 如果已經加載了 Cloudinary Upload Widget，直接打開
                            const uploadWidget = window.cloudinary.createUploadWidget({
                                cloudName: cloudinaryConfig.cloudName,
                                uploadPreset: cloudinaryConfig.uploadPreset,
                                sources: ['local', 'url', 'camera'],
                                multiple: false
                            }, (error, result) => {
                                if (!error && result && result.event === "success") {
                                    console.log('Cloudinary Widget 上傳成功:', result.info.secure_url);
                                    resolve({
                                        url: result.info.secure_url,
                                        publicId: result.info.public_id,
                                        name: file.name,
                                        size: result.info.bytes,
                                        format: result.info.format
                                    });
                                } else if (error) {
                                    console.error('Cloudinary Widget 上傳錯誤:', error);
                                    reject(error);
                                }
                            });
                            
                            uploadWidget.open();
                        }
                    } else {
                        throw errorData;
                    }
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
                console.error('請按照以下步驟操作:');
                console.error('1. 登入 Cloudinary 控制台 (https://cloudinary.com/console)');
                console.error('2. 點擊 "Settings" -> "Upload" -> "Upload Presets"');
                console.error('3. 點擊 "Add upload preset" 或編輯現有預設');
                console.error(`4. 將預設名稱設置為 "${cloudinaryConfig.uploadPreset}" 或在代碼中更改預設名稱`);
                console.error('5. 將 "Signing Mode" 設置為 "Unsigned"');
                console.error('6. 保存設置並刷新網頁');
            }
            
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
