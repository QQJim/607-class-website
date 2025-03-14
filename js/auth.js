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
        
        auth.createUserWithEmailAndPassword(randomEmail, password)
            .then(userCredential => {
                // 註冊成功，添加用戶資料到 Firestore
                const user = userCredential.user;
                return db.collection('users').doc(user.uid).set({
                    username: username,
                    role: role,
                    createdAt: timestamp(),
                    email: randomEmail
                }).then(() => {
                    resolve(user);
                });
            })
            .catch(error => {
                console.error('註冊錯誤:', error);
                reject(error);
            });
    });
}

// 用戶登入
function login(username, password) {
    return new Promise((resolve, reject) => {
        // 先查詢用戶名對應的電子郵件
        db.collection('users')
            .where('username', '==', username)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    reject(new Error('用戶名不存在'));
                    return;
                }
                
                const userDoc = querySnapshot.docs[0];
                const email = userDoc.data().email;
                
                // 使用電子郵件和密碼登入
                return auth.signInWithEmailAndPassword(email, password)
                    .then(userCredential => {
                        resolve(userCredential.user);
                    })
                    .catch(error => {
                        console.error('登入錯誤:', error);
                        reject(error);
                    });
            })
            .catch(error => {
                console.error('查詢用戶錯誤:', error);
                reject(error);
            });
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
