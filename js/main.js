// 主要網站功能

document.addEventListener('DOMContentLoaded', () => {
    // 初始化導航欄
    initNavigation();
    
    // 初始化倒數計時器
    initCountdowns();
    
    // 載入首頁公告
    if (document.getElementById('announcements-list')) {
        loadLatestAnnouncements();
    }
    
    // 載入首頁留言
    if (document.getElementById('messages-list')) {
        loadLatestMessages();
    }
});

// 初始化導航欄
function initNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
    
    // 設定當前頁面的導航項目為活動狀態
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('#main-nav a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (currentPage === linkPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 初始化倒數計時器
function initCountdowns() {
    // 獲取重要日期資料
    db.collection('important_dates').get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('沒有找到重要日期資料');
                return;
            }
            
            snapshot.forEach(doc => {
                const dateData = doc.data();
                if (dateData.type === 'exam') {
                    startCountdown('exam', new Date(dateData.date.toDate()));
                } else if (dateData.type === 'event') {
                    startCountdown('event', new Date(dateData.date.toDate()));
                }
            });
        })
        .catch(error => {
            console.error('獲取重要日期錯誤:', error);
        });
}

// 開始倒數計時
function startCountdown(type, targetDate) {
    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
        
        // 計算天、時、分、秒
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // 更新倒數計時顯示
        document.getElementById(`${type}-days`).textContent = days.toString().padStart(2, '0');
        document.getElementById(`${type}-hours`).textContent = hours.toString().padStart(2, '0');
        document.getElementById(`${type}-minutes`).textContent = minutes.toString().padStart(2, '0');
        document.getElementById(`${type}-seconds`).textContent = seconds.toString().padStart(2, '0');
        
        // 如果倒數結束，清除計時器
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById(`${type}-days`).textContent = '00';
            document.getElementById(`${type}-hours`).textContent = '00';
            document.getElementById(`${type}-minutes`).textContent = '00';
            document.getElementById(`${type}-seconds`).textContent = '00';
        }
    }, 1000);
}

// 載入最新公告
function loadLatestAnnouncements() {
    const announcementsContainer = document.getElementById('announcements-list');
    
    // 從 Firestore 獲取最新公告
    db.collection('announcements')
        .orderBy('createdAt', 'desc')
        .limit(3)
        .get()
        .then(snapshot => {
            // 清除載入中的骨架屏
            announcementsContainer.innerHTML = '';
            
            if (snapshot.empty) {
                announcementsContainer.innerHTML = '<p class="no-data">目前沒有公告</p>';
                return;
            }
            
            snapshot.forEach(doc => {
                const announcement = doc.data();
                const date = announcement.createdAt ? announcement.createdAt.toDate() : new Date();
                const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
                
                const announcementCard = document.createElement('div');
                announcementCard.className = 'announcement-card';
                announcementCard.innerHTML = `
                    <h3>${announcement.title}</h3>
                    <p>${announcement.content.length > 100 ? announcement.content.substring(0, 100) + '...' : announcement.content}</p>
                    <div class="date"><i class="far fa-calendar-alt"></i> ${formattedDate}</div>
                `;
                
                // 添加點擊事件，導航到公告詳情頁面
                announcementCard.addEventListener('click', () => {
                    window.location.href = `pages/announcement-detail.html?id=${doc.id}`;
                });
                
                announcementsContainer.appendChild(announcementCard);
            });
        })
        .catch(error => {
            console.error('獲取公告錯誤:', error);
            announcementsContainer.innerHTML = '<p class="error">載入公告時發生錯誤</p>';
        });
}

// 載入最新留言
function loadLatestMessages() {
    const messagesContainer = document.getElementById('messages-list');
    
    // 從 Firestore 獲取最新留言
    db.collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(2)
        .get()
        .then(snapshot => {
            // 清除載入中的骨架屏
            messagesContainer.innerHTML = '';
            
            if (snapshot.empty) {
                messagesContainer.innerHTML = '<p class="no-data">目前沒有留言</p>';
                return;
            }
            
            snapshot.forEach(doc => {
                const message = doc.data();
                const date = message.createdAt ? message.createdAt.toDate() : new Date();
                const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
                
                const messageCard = document.createElement('div');
                messageCard.className = 'message-card';
                messageCard.innerHTML = `
                    <h3>${message.title}</h3>
                    <p>${message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content}</p>
                    <div class="author">
                        <i class="far fa-user"></i> ${message.author} · ${formattedDate}
                    </div>
                `;
                
                // 添加點擊事件，導航到留言詳情頁面
                messageCard.addEventListener('click', () => {
                    window.location.href = `pages/message-detail.html?id=${doc.id}`;
                });
                
                messagesContainer.appendChild(messageCard);
            });
        })
        .catch(error => {
            console.error('獲取留言錯誤:', error);
            messagesContainer.innerHTML = '<p class="error">載入留言時發生錯誤</p>';
        });
}

// 顯示提示訊息
function showAlert(message, type = 'success') {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type}`;
    alertContainer.textContent = message;
    
    // 添加到頁面
    document.body.appendChild(alertContainer);
    
    // 設定自動消失
    setTimeout(() => {
        alertContainer.style.opacity = '0';
        setTimeout(() => {
            alertContainer.remove();
        }, 300);
    }, 3000);
}

// 格式化日期
function formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
}

// 顯示模態框
function showModal(title, content, confirmCallback = null) {
    // 創建模態框元素
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    modalOverlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary modal-cancel">取消</button>
                <button class="btn modal-confirm">確認</button>
            </div>
        </div>
    `;
    
    // 添加到頁面
    document.body.appendChild(modalOverlay);
    
    // 顯示模態框
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
    
    // 關閉按鈕事件
    modalOverlay.querySelector('.modal-close').addEventListener('click', () => {
        closeModal(modalOverlay);
    });
    
    // 取消按鈕事件
    modalOverlay.querySelector('.modal-cancel').addEventListener('click', () => {
        closeModal(modalOverlay);
    });
    
    // 確認按鈕事件
    if (confirmCallback) {
        modalOverlay.querySelector('.modal-confirm').addEventListener('click', () => {
            confirmCallback();
            closeModal(modalOverlay);
        });
    } else {
        modalOverlay.querySelector('.modal-confirm').addEventListener('click', () => {
            closeModal(modalOverlay);
        });
    }
}

// 關閉模態框
function closeModal(modalOverlay) {
    modalOverlay.classList.remove('active');
    setTimeout(() => {
        modalOverlay.remove();
    }, 300);
}
