// 身份驗證相關功能

// 檢查用戶登入狀態
auth.onAuthStateChanged(user => {
    const userStatusElement = document.getElementById('user-status');
    
    if (user) {
        // 用戶已登入
        console.log('用戶已登入:', user.uid);
        
        // 獲取用戶資料
        db.collection('users').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    const role = userData.role;
                    const username = userData.username;
                    
                    // 更新導航欄顯示
                    if (userStatusElement) {
                        // 判斷當前頁面是否在子目錄中
                        const isInSubdirectory = window.location.pathname.includes('/pages/');
                        const profilePath = isInSubdirectory ? 'profile.html' : 'pages/profile.html';
                        const studentsListPath = isInSubdirectory ? 'students-list.html' : 'pages/students-list.html';
                        const indexPath = isInSubdirectory ? '../index.html' : 'index.html';
                        
                        userStatusElement.innerHTML = `
                            <a href="#" class="user-dropdown-toggle">
                                ${username} <i class="fas fa-chevron-down"></i>
                            </a>
                            <div class="user-dropdown">
                                <a href="${profilePath}">個人資料</a>
                                ${role === 'teacher' ? `<a href="${studentsListPath}">學生名單</a>` : ''}
                                <a href="#" id="logout-btn">登出</a>
                            </div>
                        `;
                        
                        // 添加登出按鈕事件監聽器
                        document.getElementById('logout-btn')?.addEventListener('click', e => {
                            e.preventDefault();
                            logout();
                        });
                        
                        // 添加下拉選單切換
                        document.querySelector('.user-dropdown-toggle')?.addEventListener('click', e => {
                            e.preventDefault();
                            document.querySelector('.user-dropdown')?.classList.toggle('active');
                        });
                    }
                    
                    // 如果在作業頁面且用戶是老師，顯示作業管理選項
                    const homeworkAdminSection = document.getElementById('homework-admin');
                    if (homeworkAdminSection && role === 'teacher') {
                        homeworkAdminSection.style.display = 'block';
                    }
                    
                    // 如果在學生名單頁面且用戶不是老師，重定向到首頁
                    if (window.location.pathname.includes('students-list.html') && role !== 'teacher') {
                        const indexPath = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
                        window.location.href = indexPath;
                    }
                }
            })
            .catch(error => {
                console.error('獲取用戶資料錯誤:', error);
            });
    } else {
        // 用戶未登入
        console.log('用戶未登入');
        
        // 更新導航欄顯示
        if (userStatusElement) {
            // 判斷當前頁面是否在子目錄中
            const isInSubdirectory = window.location.pathname.includes('/pages/');
            const loginPath = isInSubdirectory ? 'login.html' : 'pages/login.html';
            
            userStatusElement.innerHTML = `<a href="${loginPath}">登入/註冊</a>`;
        }
        
        // 如果在需要登入的頁面，重定向到登入頁面
        const restrictedPages = ['profile.html', 'students-list.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (restrictedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
});

// 註冊新用戶
function register(username, password, role) {
    return new Promise((resolve, reject) => {
        // 使用隨機生成的電子郵件格式 (username + 隨機數字 + @example.com)
        const randomEmail = `${username}${Math.floor(Math.random() * 10000)}@example.com`;
        
        console.log('開始註冊流程，使用電子郵件:', randomEmail);
        
        auth.createUserWithEmailAndPassword(randomEmail, password)
            .then(userCredential => {
                // 註冊成功，添加用戶資料到 Firestore
                console.log('Firebase 身份驗證成功，用戶ID:', userCredential.user.uid);
                const user = userCredential.user;
                
                // 創建用戶數據對象
                const userData = {
                    username: username,
                    role: role,
                    createdAt: timestamp(),
                    email: randomEmail
                };
                
                console.log('嘗試寫入用戶數據到 Firestore:', userData);
                
                // 嘗試使用 set 方法寫入數據
                db.collection('users').doc(user.uid).set(userData)
                    .then(() => {
                        console.log('用戶資料已成功添加到 Firestore (使用 set 方法)');
                        resolve(user);
                    })
                    .catch(firestoreError => {
                        console.error('Firestore set 方法錯誤:', firestoreError);
                        
                        // 如果 set 方法失敗，嘗試使用 add 方法
                        console.log('嘗試使用 add 方法寫入用戶數據...');
                        db.collection('users').add({
                            ...userData,
                            uid: user.uid  // 添加 uid 字段，因為 add 方法不會使用 uid 作為文檔 ID
                        })
                        .then(() => {
                            console.log('用戶資料已成功添加到 Firestore (使用 add 方法)');
                            resolve(user);
                        })
                        .catch(addError => {
                            console.error('Firestore add 方法錯誤:', addError);
                            
                            // 顯示詳細的 Firestore 錯誤信息
                            let errorMessage = '保存用戶資料時發生錯誤，但您的帳戶已創建。';
                            if (addError.code === 'permission-denied') {
                                errorMessage = 'Firestore 權限錯誤：請確保您已更新 Firestore 安全規則。';
                                console.error('Firestore 權限被拒絕。請檢查安全規則是否已更新。');
                            }
                            
                            // 顯示錯誤代碼和消息，以便更好地診斷問題
                            console.error('錯誤代碼:', addError.code);
                            console.error('錯誤消息:', addError.message);
                            
                            alert(errorMessage);
                            resolve(user);
                        });
                    });
            })
            .catch(error => {
                console.error('註冊錯誤:', error.code, error.message);
                
                // 提供更具體的錯誤信息
                let errorMessage = '註冊失敗，請稍後再試。';
                
                switch(error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = '此電子郵件已被使用，請嘗試其他用戶名。';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = '電子郵件格式無效。';
                        break;
                    case 'auth/operation-not-allowed':
                        errorMessage = '電子郵件/密碼身份驗證未啟用，請聯繫管理員。';
                        break;
                    case 'auth/weak-password':
                        errorMessage = '密碼強度不足，請使用更強的密碼。';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = '網絡連接失敗，請檢查您的網絡連接。';
                        break;
                }
                
                // 將錯誤對象擴展，包含更友好的錯誤信息
                error.friendlyMessage = errorMessage;
                reject(error);
            });
    });
}

// 用戶登入
function login(username, password) {
    return new Promise((resolve, reject) => {
        console.log('開始登入流程，用戶名:', username);
        
        // 先查詢用戶名對應的電子郵件
        db.collection('users')
            .where('username', '==', username)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    console.log('用戶名不存在於 Firestore，嘗試使用模擬電子郵件登入');
                    // 如果在 Firestore 中找不到用戶，嘗試使用模擬電子郵件格式
                    const possibleEmails = [];
                    
                    // 生成幾個可能的電子郵件格式
                    for (let i = 0; i < 10; i++) {
                        possibleEmails.push(`${username}${i}@example.com`);
                    }
                    
                    // 嘗試使用這些電子郵件登入
                    tryLoginWithEmails(possibleEmails, 0, password, resolve, reject);
                } else {
                    const userDoc = querySnapshot.docs[0];
                    const email = userDoc.data().email;
                    
                    console.log('找到用戶電子郵件:', email);
                    
                    // 使用電子郵件和密碼登入
                    auth.signInWithEmailAndPassword(email, password)
                        .then(userCredential => {
                            console.log('登入成功');
                            resolve(userCredential.user);
                        })
                        .catch(error => {
                            console.error('登入錯誤:', error);
                            reject(error);
                        });
                }
            })
            .catch(error => {
                console.error('查詢用戶錯誤:', error);
                reject(error);
            });
    });
}

// 嘗試使用多個可能的電子郵件登入
function tryLoginWithEmails(emails, index, password, resolve, reject) {
    if (index >= emails.length) {
        // 所有電子郵件都嘗試過了，登入失敗
        reject(new Error('用戶名或密碼錯誤'));
        return;
    }
    
    const email = emails[index];
    console.log(`嘗試使用電子郵件登入 (${index + 1}/${emails.length}):`, email);
    
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('使用模擬電子郵件登入成功');
            
            // 登入成功，檢查用戶數據是否存在於 Firestore
            const user = userCredential.user;
            
            // 嘗試將用戶數據寫入 Firestore（如果不存在）
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (!doc.exists) {
                        console.log('用戶數據不存在於 Firestore，嘗試創建');
                        
                        // 從電子郵件中提取用戶名
                        const extractedUsername = email.split('@')[0].replace(/\d+$/, '');
                        
                        // 創建用戶數據
                        db.collection('users').doc(user.uid).set({
                            username: extractedUsername,
                            role: 'student', // 默認角色
                            createdAt: timestamp(),
                            email: email
                        })
                        .then(() => {
                            console.log('用戶數據已成功添加到 Firestore');
                        })
                        .catch(error => {
                            console.error('創建用戶數據錯誤:', error);
                        });
                    }
                })
                .catch(error => {
                    console.error('檢查用戶數據錯誤:', error);
                });
            
            resolve(user);
        })
        .catch(error => {
            console.log(`電子郵件 ${email} 登入失敗:`, error.code);
            
            // 嘗試下一個電子郵件
            tryLoginWithEmails(emails, index + 1, password, resolve, reject);
        });
}

// 用戶登出
function logout() {
    auth.signOut()
        .then(() => {
            console.log('用戶已登出');
            window.location.href = '../index.html';
        })
        .catch(error => {
            console.error('登出錯誤:', error);
        });
}

// 檢查用戶名是否已存在
function checkUsernameExists(username) {
    return db.collection('users')
        .where('username', '==', username)
        .get()
        .then(querySnapshot => {
            return !querySnapshot.empty;
        })
        .catch(error => {
            console.error('檢查用戶名錯誤:', error);
            return false;
        });
}

// 獲取當前用戶角色
function getCurrentUserRole() {
    return new Promise((resolve, reject) => {
        const user = auth.currentUser;
        
        if (!user) {
            resolve(null);
            return;
        }
        
        db.collection('users').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    resolve(doc.data().role);
                } else {
                    resolve(null);
                }
            })
            .catch(error => {
                console.error('獲取用戶角色錯誤:', error);
                reject(error);
            });
    });
}

// 獲取當前用戶資料
function getCurrentUserData() {
    return new Promise((resolve, reject) => {
        const user = auth.currentUser;
        
        if (!user) {
            resolve(null);
            return;
        }
        
        db.collection('users').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    resolve(doc.data());
                } else {
                    resolve(null);
                }
            })
            .catch(error => {
                console.error('獲取用戶資料錯誤:', error);
                reject(error);
            });
    });
}
