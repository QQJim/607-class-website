# Firebase 安全規則設置指南

## Firestore 安全規則

當您將網站部署到 GitHub Pages 時，可能會遇到 Firestore 權限問題，出現 "Missing or insufficient permissions" 錯誤。這是因為默認的安全規則不允許未經身份驗證的用戶讀取或寫入數據。

請按照以下步驟更新您的 Firestore 安全規則：

1. 登錄到 [Firebase 控制台](https://console.firebase.google.com/)
2. 選擇您的項目 (web-5fccc)
3. 在左側導航欄中，點擊 **Firestore Database**
4. 點擊頂部的 **規則** 標籤
5. 將以下規則複製並粘貼到編輯器中：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許已登錄用戶讀取所有文檔
    match /{document=**} {
      allow read: if request.auth != null;
    }
    
    // 公告集合 - 允許所有人讀取，只允許教師創建和修改
    match /announcements/{announcementId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    // 用戶集合 - 用戶只能讀取和修改自己的文檔
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // 作業集合 - 允許所有人讀取，只允許教師創建和修改
    match /homeworks/{homeworkId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    // 作業提交集合 - 學生只能讀取和提交自己的作業，教師可以讀取所有提交並評分
    match /homework_submissions/{submissionId} {
      allow read: if request.auth != null && (
        resource.data.studentId == request.auth.uid || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher'
      );
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        (resource.data.studentId == request.auth.uid && resource.data.status != 'graded') || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher'
      );
      allow delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    // 留言板集合 - 允許所有人讀取，登錄用戶可以創建，只有作者和教師可以修改和刪除
    match /messages/{messageId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && (
        resource.data.userId == request.auth.uid || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher'
      );
    }
    
    // 相簿集合 - 允許所有人讀取，只允許教師上傳和管理
    match /photos/{photoId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
  }
}
```

6. 點擊 **發布** 按鈕保存規則

## 授權域名設置

為了讓您的網站能夠正常使用 Firebase Authentication，您需要將您的 GitHub Pages 網站 URL 添加到授權域名列表中：

1. 在 Firebase 控制台中，點擊左側導航欄中的 **Authentication**
2. 點擊 **Sign-in method** 標籤
3. 滾動到底部，找到 **授權域名** 部分
4. 點擊 **添加域名** 按鈕
5. 輸入您的 GitHub Pages 網站 URL，例如 `https://qqjim.github.io/607-class-website`
6. 點擊 **添加** 按鈕保存

## Cloudinary 設置

如果您使用 Cloudinary 進行照片上傳，請確保您的上傳預設已設置為允許未簽名上傳：

1. 登錄到 [Cloudinary 控制台](https://cloudinary.com/console)
2. 點擊 **Settings** (設置)
3. 點擊 **Upload** (上傳) 標籤
4. 滾動到 **Upload presets** (上傳預設) 部分
5. 找到您在代碼中使用的上傳預設名稱，或創建一個新的預設
6. 確保 **Signing Mode** (簽名模式) 設置為 **Unsigned** (未簽名)
7. 保存設置

完成以上設置後，您的網站應該能夠在 GitHub Pages 上正常運行，包括用戶認證、作業提交和照片上傳等功能。
