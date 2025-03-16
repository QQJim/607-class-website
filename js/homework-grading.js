// 作業評分系統 JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // 初始化導航欄
    initNavigation();
    
    // 檢查是否為老師
    checkTeacherAccess();
    
    // 載入作業列表
    loadHomeworkList();
    
    // 添加事件監聽器
    document.getElementById('homework-select').addEventListener('change', function() {
        const homeworkId = this.value;
        if (homeworkId) {
            loadStudentSubmissions(homeworkId);
        } else {
            resetStudentList();
            resetSubmissionContent();
        }
    });
    
    document.getElementById('student-search').addEventListener('input', function() {
        filterStudentList();
    });
});

// 檢查是否為老師
function checkTeacherAccess() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // 獲取用戶資料
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        const userData = doc.data();
                        
                        // 如果不是老師，重定向到首頁
                        if (userData.role !== 'teacher') {
                            showAlert('只有老師可以訪問此頁面', 'danger');
                            setTimeout(() => {
                                window.location.href = '../index.html';
                            }, 2000);
                        }
                    } else {
                        // 用戶資料不存在，重定向到首頁
                        showAlert('用戶資料不存在', 'danger');
                        setTimeout(() => {
                            window.location.href = '../index.html';
                        }, 2000);
                    }
                })
                .catch(error => {
                    console.error('獲取用戶資料錯誤:', error);
                    showAlert('獲取用戶資料時發生錯誤', 'danger');
                });
        } else {
            // 未登入，重定向到登入頁面
            showAlert('請先登入', 'danger');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    });
}

// 載入作業列表
function loadHomeworkList() {
    const homeworkSelect = document.getElementById('homework-select');
    
    // 從 Firestore 獲取作業列表
    db.collection('homeworks')
        .orderBy('dueDate', 'desc')
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                homeworkSelect.innerHTML = '<option value="">-- 目前沒有作業 --</option>';
                return;
            }
            
            let options = '<option value="">-- 請選擇作業 --</option>';
            
            snapshot.forEach(doc => {
                const homework = doc.data();
                homework.id = doc.id;
                
                // 格式化截止日期
                const dueDate = homework.dueDate.toDate();
                const formattedDate = `${dueDate.getFullYear()}/${(dueDate.getMonth() + 1).toString().padStart(2, '0')}/${dueDate.getDate().toString().padStart(2, '0')}`;
                
                options += `<option value="${homework.id}">${homework.title} (截止日期: ${formattedDate})</option>`;
            });
            
            homeworkSelect.innerHTML = options;
        })
        .catch(error => {
            console.error('獲取作業列表錯誤:', error);
            showAlert('獲取作業列表時發生錯誤', 'danger');
        });
}

// 載入學生繳交情況
function loadStudentSubmissions(homeworkId) {
    const studentList = document.getElementById('student-list');
    
    // 顯示載入中
    studentList.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>載入中...</p></div>';
    
    // 重置提交內容區域
    resetSubmissionContent();
    
    // 獲取作業信息
    db.collection('homeworks').doc(homeworkId).get()
        .then(doc => {
            if (!doc.exists) {
                studentList.innerHTML = '<div class="no-submission"><i class="fas fa-exclamation-circle"></i><p>作業不存在</p></div>';
                return;
            }
            
            const homework = doc.data();
            homework.id = doc.id;
            homework.dueDate = homework.dueDate.toDate();
            
            // 獲取所有學生
            db.collection('users')
                .where('role', '==', 'student')
                .get()
                .then(studentsSnapshot => {
                    const students = [];
                    studentsSnapshot.forEach(doc => {
                        const student = doc.data();
                        student.id = doc.id;
                        students.push(student);
                    });
                    
                    // 獲取所有繳交記錄
                    db.collection('homework_submissions')
                        .where('homeworkId', '==', homeworkId)
                        .get()
                        .then(submissionsSnapshot => {
                            const submissions = {};
                            submissionsSnapshot.forEach(doc => {
                                const submission = doc.data();
                                submission.id = doc.id;
                                submission.submittedAt = submission.submittedAt.toDate();
                                if (submission.gradedAt) {
                                    submission.gradedAt = submission.gradedAt.toDate();
                                }
                                submissions[submission.studentId] = submission;
                            });
                            
                            // 更新統計數據
                            updateStats(students.length, submissions);
                            
                            // 渲染學生列表
                            renderStudentList(homework, students, submissions);
                            
                            // 保存作業和提交數據到全局變量，以便在學生選擇時使用
                            window.currentHomework = homework;
                            window.currentSubmissions = submissions;
                            window.currentStudents = students;
                        })
                        .catch(error => {
                            console.error('獲取繳交記錄錯誤:', error);
                            studentList.innerHTML = '<div class="no-submission"><i class="fas fa-exclamation-circle"></i><p>獲取繳交記錄時發生錯誤</p></div>';
                        });
                })
                .catch(error => {
                    console.error('獲取學生列表錯誤:', error);
                    studentList.innerHTML = '<div class="no-submission"><i class="fas fa-exclamation-circle"></i><p>獲取學生列表時發生錯誤</p></div>';
                });
        })
        .catch(error => {
            console.error('獲取作業信息錯誤:', error);
            studentList.innerHTML = '<div class="no-submission"><i class="fas fa-exclamation-circle"></i><p>獲取作業信息時發生錯誤</p></div>';
        });
}

// 更新統計數據
function updateStats(totalStudents, submissions) {
    const submittedCount = document.getElementById('submitted-count');
    const gradedCount = document.getElementById('graded-count');
    
    const submitted = Object.values(submissions).length;
    const graded = Object.values(submissions).filter(sub => sub.status === 'graded').length;
    
    submittedCount.textContent = submitted;
    gradedCount.textContent = graded;
}

// 渲染學生列表
function renderStudentList(homework, students, submissions) {
    const studentList = document.getElementById('student-list');
    
    if (students.length === 0) {
        studentList.innerHTML = '<div class="no-submission"><i class="fas fa-users"></i><p>目前沒有學生</p></div>';
        return;
    }
    
    let html = '';
    
    // 先顯示已繳交但未評分的學生
    const pendingStudents = students.filter(student => 
        submissions[student.id] && submissions[student.id].status !== 'graded'
    );
    
    // 然後顯示已評分的學生
    const gradedStudents = students.filter(student => 
        submissions[student.id] && submissions[student.id].status === 'graded'
    );
    
    // 最後顯示未繳交的學生
    const missingStudents = students.filter(student => 
        !submissions[student.id]
    );
    
    // 合併排序後的學生列表
    const sortedStudents = [...pendingStudents, ...gradedStudents, ...missingStudents];
    
    sortedStudents.forEach(student => {
        const submission = submissions[student.id];
        let status = '';
        let statusClass = '';
        
        if (submission) {
            if (submission.status === 'graded') {
                status = '已評分';
                statusClass = 'status-graded';
            } else {
                status = '已繳交';
                statusClass = 'status-submitted';
            }
            
            if (submission.submittedAt > homework.dueDate) {
                status += ' (逾期)';
                statusClass = 'status-late';
            }
        } else {
            status = '未繳交';
            statusClass = 'status-missing';
        }
        
        html += `
            <div class="student-item" data-student-id="${student.id}" data-status="${statusClass.replace('status-', '')}">
                <div class="student-name">${student.realName || student.username}</div>
                <span class="status-badge ${statusClass}">${status}</span>
            </div>
        `;
    });
    
    studentList.innerHTML = html;
    
    // 添加學生選擇事件
    const studentItems = document.querySelectorAll('.student-item');
    studentItems.forEach(item => {
        item.addEventListener('click', function() {
            const studentId = this.dataset.studentId;
            
            // 移除其他學生的活躍狀態
            studentItems.forEach(i => i.classList.remove('active'));
            
            // 添加當前學生的活躍狀態
            this.classList.add('active');
            
            // 顯示學生提交內容
            const student = window.currentStudents.find(s => s.id === studentId);
            const submission = window.currentSubmissions[studentId];
            
            showSubmissionContent(window.currentHomework, student, submission);
        });
    });
}

// 顯示提交內容
function showSubmissionContent(homework, student, submission) {
    const submissionContent = document.getElementById('submission-content');
    
    // 格式化截止日期
    const dueDate = homework.dueDate;
    const formattedDueDate = `${dueDate.getFullYear()}/${(dueDate.getMonth() + 1).toString().padStart(2, '0')}/${dueDate.getDate().toString().padStart(2, '0')} ${dueDate.getHours().toString().padStart(2, '0')}:${dueDate.getMinutes().toString().padStart(2, '0')}`;
    
    // 基本作業信息
    let html = `
        <div class="homework-info">
            <h3>${homework.title}</h3>
            <div class="homework-meta">
                <div><i class="far fa-calendar-alt"></i> 截止日期: ${formattedDueDate}</div>
                <div><i class="fas fa-star"></i> 滿分: ${homework.maxScore}</div>
            </div>
            <p>${homework.description}</p>
        </div>
        
        <div class="student-info">
            <div class="student-details">
                <h3>${student.realName || student.username}</h3>
                <p>學號: ${student.studentId || '未設置'}</p>
            </div>
    `;
    
    // 如果學生已繳交
    if (submission) {
        // 格式化繳交時間
        const submittedAt = submission.submittedAt;
        const formattedSubmittedAt = `${submittedAt.getFullYear()}/${(submittedAt.getMonth() + 1).toString().padStart(2, '0')}/${submittedAt.getDate().toString().padStart(2, '0')} ${submittedAt.getHours().toString().padStart(2, '0')}:${submittedAt.getMinutes().toString().padStart(2, '0')}`;
        
        // 判斷是否逾期
        const isLate = submittedAt > homework.dueDate;
        
        html += `
            <div class="submission-status">
                <span class="status-badge ${isLate ? 'status-late' : 'status-submitted'}">${isLate ? '逾期繳交' : '已繳交'}</span>
                <p>繳交時間: ${formattedSubmittedAt}</p>
            </div>
        </div>
        
        <div class="submission-content">
            <h4>繳交內容</h4>
            <div class="answer-box">
                ${submission.answer || '(無文字內容)'}
            </div>
            
            ${submission.fileURL ? `
                <div class="file-attachment">
                    <i class="fas fa-file"></i>
                    <a href="${submission.fileURL}" target="_blank">${submission.fileName}</a>
                </div>
            ` : ''}
        </div>
        
        <div class="grading-section">
            <h4>${submission.status === 'graded' ? '修改評分' : '評分'}</h4>
            <div class="form-group">
                <label for="score-input">分數 (最高 ${homework.maxScore} 分)</label>
                <input type="number" id="score-input" min="0" max="${homework.maxScore}" value="${submission.status === 'graded' ? submission.score : ''}" placeholder="輸入分數">
            </div>
            <div class="form-group">
                <label for="feedback-input">評語</label>
                <textarea id="feedback-input" placeholder="輸入評語">${submission.status === 'graded' ? submission.feedback || '' : ''}</textarea>
            </div>
            <button class="action-btn" id="save-grade-btn" data-submission-id="${submission.id}" data-student-id="${student.id}" data-homework-id="${homework.id}">
                儲存評分
            </button>
        </div>
        `;
    } else {
        // 學生未繳交
        html += `
            <div class="submission-status">
                <span class="status-badge status-missing">未繳交</span>
            </div>
        </div>
        
        <div class="no-submission">
            <i class="fas fa-file-alt"></i>
            <p>學生尚未繳交作業</p>
        </div>
        `;
    }
    
    submissionContent.innerHTML = html;
    
    // 如果學生已繳交，添加儲存評分按鈕事件
    if (submission) {
        document.getElementById('save-grade-btn').addEventListener('click', saveGrade);
    }
}

// 儲存評分
function saveGrade() {
    const submissionId = this.dataset.submissionId;
    const studentId = this.dataset.studentId;
    const homeworkId = this.dataset.homeworkId;
    const score = parseInt(document.getElementById('score-input').value);
    const feedback = document.getElementById('feedback-input').value;
    
    // 驗證分數
    if (isNaN(score) || score < 0) {
        showAlert('請輸入有效的分數', 'danger');
        return;
    }
    
    const maxScore = parseInt(window.currentHomework.maxScore);
    if (score > maxScore) {
        showAlert(`分數不能超過 ${maxScore}`, 'danger');
        return;
    }
    
    // 更新繳交記錄
    db.collection('homework_submissions').doc(submissionId).update({
        status: 'graded',
        score: score,
        feedback: feedback,
        gradedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        showAlert('評分已儲存', 'success');
        
        // 更新本地數據
        window.currentSubmissions[studentId].status = 'graded';
        window.currentSubmissions[studentId].score = score;
        window.currentSubmissions[studentId].feedback = feedback;
        window.currentSubmissions[studentId].gradedAt = new Date();
        
        // 更新統計數據
        updateStats(window.currentStudents.length, window.currentSubmissions);
        
        // 更新學生列表
        renderStudentList(window.currentHomework, window.currentStudents, window.currentSubmissions);
        
        // 重新顯示提交內容
        const student = window.currentStudents.find(s => s.id === studentId);
        showSubmissionContent(window.currentHomework, student, window.currentSubmissions[studentId]);
        
        // 選中當前學生
        const studentItem = document.querySelector(`.student-item[data-student-id="${studentId}"]`);
        if (studentItem) {
            studentItem.classList.add('active');
        }
    })
    .catch(error => {
        console.error('儲存評分錯誤:', error);
        showAlert('儲存評分時發生錯誤', 'danger');
    });
}

// 篩選學生列表
function filterStudentList() {
    const searchText = document.getElementById('student-search').value.toLowerCase();
    const studentItems = document.querySelectorAll('.student-item');
    
    studentItems.forEach(item => {
        const studentName = item.querySelector('.student-name').textContent.toLowerCase();
        
        if (studentName.includes(searchText)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// 重置學生列表
function resetStudentList() {
    const studentList = document.getElementById('student-list');
    studentList.innerHTML = `
        <div class="no-submission">
            <i class="fas fa-book"></i>
            <p>請選擇一個作業</p>
        </div>
    `;
    
    // 重置統計數據
    document.getElementById('submitted-count').textContent = '0';
    document.getElementById('graded-count').textContent = '0';
}

// 重置提交內容
function resetSubmissionContent() {
    const submissionContent = document.getElementById('submission-content');
    submissionContent.innerHTML = `
        <div class="no-submission">
            <i class="fas fa-file-alt"></i>
            <p>請選擇一個學生查看作業繳交情況</p>
        </div>
    `;
}
