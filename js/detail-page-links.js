/**
 * 詳情頁面連結處理
 * 
 * 此檔案包含將公告和作業列表連結到其詳情頁面的功能
 */

// 更新公告列表渲染函數，添加詳情頁面連結
function updateAnnouncementLinks() {
    // 獲取原始渲染函數
    const originalRenderAnnouncements = window.renderAnnouncements;
    
    // 如果原始函數存在，替換為新函數
    if (typeof originalRenderAnnouncements === 'function') {
        window.renderAnnouncements = function(announcements) {
            const container = document.getElementById('announcements-list');
            
            if (announcements.length === 0) {
                container.innerHTML = '<p class="no-data">目前沒有公告</p>';
                return;
            }
            
            let html = '';
            
            announcements.forEach(announcement => {
                // 格式化日期
                const createdDate = announcement.createdAt.toDate();
                const formattedDate = formatDate(createdDate);
                
                html += `
                    <div class="announcement-card ${announcement.important ? 'important' : ''}">
                        <div class="announcement-header">
                            <h3 class="announcement-title">
                                ${announcement.important ? '<i class="fas fa-star"></i> ' : ''}
                                <a href="announcement-detail.html?id=${announcement.id}">${announcement.title}</a>
                            </h3>
                            <div class="announcement-meta">
                                <span class="announcement-author">${announcement.authorName}</span>
                                <span class="announcement-date">${formattedDate}</span>
                            </div>
                        </div>
                        <div class="announcement-content">
                            <p>${truncateText(announcement.content, 150)}</p>
                        </div>
                        <div class="announcement-actions">
                            <a href="announcement-detail.html?id=${announcement.id}" class="btn btn-sm">查看詳情</a>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        };
    }
}

// 更新作業列表渲染函數，添加詳情頁面連結
function updateHomeworkLinks() {
    // 獲取原始渲染函數
    const originalRenderHomeworkList = window.renderHomeworkList;
    
    // 如果原始函數存在，替換為新函數
    if (typeof originalRenderHomeworkList === 'function') {
        window.renderHomeworkList = function(homeworkList) {
            const container = document.getElementById('homework-list');
            
            if (homeworkList.length === 0) {
                container.innerHTML = '<p class="no-data">目前沒有作業</p>';
                return;
            }
            
            let html = '';
            
            homeworkList.forEach(homework => {
                // 格式化日期
                const dueDate = homework.dueDate.toDate();
                const formattedDueDate = formatDate(dueDate);
                
                // 計算剩餘時間
                const now = new Date();
                const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                
                let statusClass = 'upcoming';
                let statusText = `還有 ${daysLeft} 天`;
                
                if (daysLeft < 0) {
                    statusClass = 'expired';
                    statusText = '已截止';
                } else if (daysLeft === 0) {
                    statusClass = 'due-today';
                    statusText = '今天截止';
                } else if (daysLeft <= 3) {
                    statusClass = 'due-soon';
                }
                
                html += `
                    <div class="homework-card">
                        <div class="homework-header">
                            <h3 class="homework-title">
                                <a href="homework-detail.html?id=${homework.id}">${homework.title}</a>
                            </h3>
                            <div class="homework-status ${statusClass}">
                                ${statusText}
                            </div>
                        </div>
                        <div class="homework-meta">
                            <span class="homework-subject">${homework.subject || '一般'}</span>
                            <span class="homework-due-date">截止日期: ${formattedDueDate}</span>
                        </div>
                        <div class="homework-content">
                            <p>${truncateText(homework.description, 150)}</p>
                        </div>
                        <div class="homework-actions">
                            <a href="homework-detail.html?id=${homework.id}" class="btn btn-sm">查看詳情</a>
                            <a href="homework-submission.html?homework=${homework.id}" class="btn btn-sm btn-primary">繳交作業</a>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        };
    }
}

// 更新學生作業提交列表渲染函數
function updateSubmissionLinks() {
    // 獲取原始渲染函數
    const originalRenderSubmissions = window.renderSubmissions;
    
    // 如果原始函數存在，替換為新函數
    if (typeof originalRenderSubmissions === 'function') {
        window.renderSubmissions = function(submissions, homeworkId) {
            const container = document.getElementById('submissions-list');
            
            if (submissions.length === 0) {
                container.innerHTML = '<p class="no-data">目前沒有學生繳交</p>';
                return;
            }
            
            let html = '';
            
            submissions.forEach(submission => {
                // 格式化日期
                const submittedDate = submission.submittedAt.toDate();
                const formattedDate = formatDate(submittedDate);
                
                // 確定狀態
                let statusClass = 'pending';
                let statusText = '待評分';
                
                if (submission.grade !== undefined && submission.grade !== null) {
                    statusClass = 'completed';
                    statusText = '已評分';
                }
                
                if (submission.isLate) {
                    statusClass = 'late';
                    statusText = '逾期繳交';
                }
                
                html += `
                    <div class="submission-item">
                        <div class="submission-info">
                            <div class="student-name">${submission.studentName}</div>
                            <div class="submission-date">${formattedDate}</div>
                            <div class="submission-status ${statusClass}">${statusText}</div>
                        </div>
                        <div class="submission-actions">
                            <a href="homework-submission.html?id=${submission.id}" class="btn btn-sm">查看詳情</a>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        };
    }
}

// 初始化函數
function initDetailPageLinks() {
    // 檢查當前頁面
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'announcements.html') {
        updateAnnouncementLinks();
    } else if (currentPage === 'homework.html') {
        updateHomeworkLinks();
        updateSubmissionLinks();
    }
}

// 當DOM加載完成後初始化
document.addEventListener('DOMContentLoaded', initDetailPageLinks);
