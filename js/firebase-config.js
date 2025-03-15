// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyC13AVCmImNnVlkI0vMjMALfz6CTvU46cI",
    authDomain: "web-5fccc.firebaseapp.com",
    projectId: "web-5fccc",
    storageBucket: "web-5fccc.firebasestorage.app",
    messagingSenderId: "470768090875",
    appId: "1:470768090875:web:97bf7b02b8e15de5b9fa5e",
    measurementId: "G-6FW25GLBS3"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 取得 Firebase 服務
const auth = firebase.auth();
const db = firebase.firestore();
let storage;

// 延遲初始化 Firebase Storage，確保 SDK 已完全加載
setTimeout(() => {
    try {
        if (typeof firebase.storage === 'function') {
            storage = firebase.storage();
            console.log("Firebase Storage 已成功初始化");
        } else {
            console.warn("Firebase Storage SDK 未加載，某些功能可能不可用");
            // 創建一個模擬對象，以避免錯誤
            storage = {
                ref: function(path) {
                    console.warn("Firebase Storage 未初始化，無法使用 ref 功能");
                    return {
                        put: function() { return Promise.reject(new Error("Firebase Storage 未初始化")); },
                        getDownloadURL: function() { return Promise.reject(new Error("Firebase Storage 未初始化")); },
                        child: function() { return this; }
                    };
                }
            };
        }
    } catch (error) {
        console.error("初始化 Firebase Storage 時發生錯誤:", error);
        // 創建一個模擬對象，以避免錯誤
        storage = {
            ref: function(path) {
                console.warn("Firebase Storage 未初始化，無法使用 ref 功能");
                return {
                    put: function() { return Promise.reject(new Error("Firebase Storage 未初始化")); },
                    getDownloadURL: function() { return Promise.reject(new Error("Firebase Storage 未初始化")); },
                    child: function() { return this; }
                };
            }
        };
    }
}, 500); // 延遲 500 毫秒，確保 SDK 已加載

// 設定 Firestore 時間戳記
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

// 注意：如果您將此網站部署到 GitHub Pages，請確保在 Firebase 控制台中
// 將 "https://qqjim.github.io/607-class-website" 添加到授權域名列表中
// 路徑：Firebase 控制台 > Authentication > Sign-in method > Authorized domains

console.log("Firebase 已初始化");
