document.addEventListener('DOMContentLoaded', async () => {
    // Lấy userId từ URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    const sourceId = urlParams.get('sourceId');


    if (!userId) {
        alert('Không tìm thấy ID học viên!');
        window.location.href = '../detail_sources.html';
        return;
    }

    if (!sourceId) {
        alert('Không tìm thấy ID khóa học!');
        window.location.href = '../detail_sources.html';
        return;
    }


    const usersApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/users';
    const sourcesApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/sourses';


    try {
        // Lấy dữ liệu user và sources
        const [usersRes, sourcesRes] = await Promise.all([
            fetch(usersApi),
            fetch(sourcesApi)
        ]);


        const users = await usersRes.json();
        const sources = await sourcesRes.json();


        // Tìm user theo ID
        const user = users.find(u => u.id === userId);
        if (!user) {
            alert('Không tìm thấy học viên!');
            window.location.href = '../detail_sources.html';
            return;
        }


        // Hiển thị thông tin user
        displayUserInfo(user);


        // Hiển thị các khóa học đã đăng ký
        displayRegisteredCourses(user, sources, sourceId);


        // Hiển thị tiến độ học tập
        displayLearningProgress(user, sources, sourceId);


        // Tạo biểu đồ tiến độ
        createProgressChart(user, sourceId);


    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu!');
    }
});


function displayUserInfo(user) {
    const userInfoDiv = document.getElementById('userInfo');


    const avatarHtml = user.avatar ? `<img src="${user.avatar}" alt="Avatar" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px;">` : '';


    userInfoDiv.innerHTML = `
        ${avatarHtml}
        <div class="user-info-item">
            <span class="user-info-label">ID:</span>
            <span class="user-info-value">${user.id}</span>
        </div>
        <div class="user-info-item">
            <span class="user-info-label">Tên học viên:</span>
            <span class="user-info-value">${user.userName}</span>
        </div>
        <div class="user-info-item">
            <span class="user-info-label">Mật khẩu:</span>
            <span class="user-info-value">${user.password}</span>
        </div>
        <div class="user-info-item">
            <span class="user-info-label">Số khóa học đã đăng ký:</span>
            <span class="user-info-value">${user.sourcesId.length}</span>
        </div>
    `;
}


function displayRegisteredCourses(user, sources, sourceId) {
    const coursesDiv = document.getElementById('registeredCourses');

    // Tạo map của sources để dễ tra cứu
    const sourcesMap = new Map();
    sources.forEach(source => {
        sourcesMap.set(source.id, source);
    });

    // Chỉ hiển thị khóa học hiện tại
    const currentSource = sourcesMap.get(sourceId);
    if (!currentSource) {
        coursesDiv.innerHTML = '<p class="no-courses">Không tìm thấy thông tin khóa học.</p>';
        return;
    }

    const coursesHtml = `
        <div class="course-item">
            <div class="course-title">${currentSource.title}</div>
            <div class="course-description">${currentSource.description || 'Không có mô tả'}</div>
        </div>
    `;

    coursesDiv.innerHTML = coursesHtml;
}


function displayLearningProgress(user, sources, sourceId) {
    const progressDiv = document.getElementById('learningProgress');

    if (!user.sourcesProgress || user.sourcesProgress.length === 0) {
        progressDiv.innerHTML = '<p class="no-courses">Chưa có dữ liệu tiến độ học tập.</p>';
        return;
    }

    // Tạo map của sources để dễ tra cứu
    const sourcesMap = new Map();
    sources.forEach(source => {
        sourcesMap.set(source.id, source);
    });

    // Chỉ hiển thị progress của khóa học hiện tại
    const currentProgress = user.sourcesProgress.find(progress => progress.id === sourceId);

    if (!currentProgress) {
        progressDiv.innerHTML = '<p class="no-courses">Chưa có dữ liệu tiến độ cho khóa học này.</p>';
        return;
    }

    const source = sourcesMap.get(sourceId);
    const sourceTitle = source ? source.title : `Khóa học ${sourceId}`;

    const percentage = currentProgress.max > 0 ? Math.round((currentProgress.complete / currentProgress.max) * 100) : 0;
    const totalSeconds = currentProgress.totalSeconds || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    const progressHtml = `
        <div class="progress-item">
            <div class="progress-title">${sourceTitle}</div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentage}%"></div>
            </div>
            <div class="progress-text">${currentProgress.complete}/${currentProgress.max} bài học (${percentage}%)</div>
            <div class="progress-stats">
                <span>Thời gian học: ${timeString}</span>
                <span>Hoàn thành: ${currentProgress.completeAt ? new Date(currentProgress.completeAt).toLocaleDateString('vi-VN') : 'Chưa hoàn thành'}</span>
            </div>
        </div>
    `;

    progressDiv.innerHTML = progressHtml;
}


function createProgressChart(user, sourceId) {
    if (!user.sourcesProgress || user.sourcesProgress.length === 0) {
        return;
    }

    // Chỉ lấy progress của khóa học hiện tại
    const currentProgress = user.sourcesProgress.find(progress => progress.id === sourceId);

    if (!currentProgress || !currentProgress.completeAt) {
        return;
    }

    // Thu thập dữ liệu theo ngày (chỉ cho khóa học hiện tại)
    const dailyProgress = new Map();

    // Trong trường hợp này, chỉ có 1 progress item cho source hiện tại
    const date = new Date(currentProgress.completeAt).toISOString().split('T')[0]; // YYYY-MM-DD
    dailyProgress.set(date, currentProgress.complete);

    // Sắp xếp theo ngày
    const sortedDates = Array.from(dailyProgress.keys()).sort();

    // Tạo dữ liệu cho biểu đồ
    const labels = sortedDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    });

    const data = sortedDates.map(date => dailyProgress.get(date));


    // Tạo biểu đồ
    const ctx = document.getElementById('progressChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số bài học hoàn thành',
                data: data,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return `Ngày: ${context[0].label}`;
                        },
                        label: function(context) {
                            return `Hoàn thành: ${context.parsed.y} bài`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    title: {
                        display: true,
                        text: 'Số bài học hoàn thành'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Ngày'
                    }
                }
            }
        }
    });
}
