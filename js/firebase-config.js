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
const storage = firebase.storage();

// 設定 Firestore 時間戳記
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

console.log("Firebase 已初始化");
