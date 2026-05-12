document.addEventListener('DOMContentLoaded', async () => {
    // Lấy sourceId từ URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sourceId = urlParams.get('id');

    if (!sourceId) {
        alert('Không tìm thấy ID khóa học!');
        window.location.href = '../sources.html';
        return;
    }

    const sourcesApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/sourses';
    const usersApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/users';

    try {
        // Lấy dữ liệu sources và users
        const [sourcesRes, usersRes] = await Promise.all([
            fetch(sourcesApi),
            fetch(usersApi)
        ]);

        const sources = await sourcesRes.json();
        const users = await usersRes.json();

        // Tìm source theo ID
        const source = sources.find(s => s.id === sourceId);
        if (!source) {
            alert('Không tìm thấy khóa học!');
            window.location.href = '../sources.html';
            return;
        }

        // Hiển thị thông tin khóa học
        displayCourseInfo(source);

        // Hiển thị học viên đã đăng ký
        displayRegisteredStudents(source, users);

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu!');
    }
});

function displayCourseInfo(source) {
    const courseInfoDiv = document.getElementById('courseInfo');
    const courseActionsDiv = document.getElementById('courseActions');
    const chatUrl = `./chat/index.html?room=${encodeURIComponent(source.id)}&roomName=${encodeURIComponent(source.title)}`;

    courseInfoDiv.innerHTML = `
        <div class="course-info-item">
            <span class="course-info-label">ID:</span>
            <span class="course-info-value">${source.id}</span>
        </div>
        <div class="course-info-item">
            <span class="course-info-label">Tên khóa học:</span>
            <span class="course-info-value">${source.title}</span>
        </div>
        <div class="course-info-item">
            <span class="course-info-label">Mô tả:</span>
            <span class="course-info-value">${source.description || 'Không có mô tả'}</span>
        </div>
        <div class="course-info-item">
            <span class="course-info-label">Chuyên mục:</span>
            <span class="course-info-value">${source.category || 'Không có'}</span>
        </div>
        <div class="course-info-item">
            <span class="course-info-label">Học phí:</span>
            <span class="course-info-value">$${source.cost || 0}</span>
        </div>
    `;

    courseActionsDiv.innerHTML = `
        <a href="${chatUrl}" class="btn btn-green">Vào nhóm chat khóa học</a>
    `;
}

function displayRegisteredStudents(source, users) {
    const studentsDiv = document.getElementById('registeredStudents');

    // Lọc users đã đăng ký khóa học này
    const registeredUsers = users.filter(user => user.sourcesId.includes(source.id));

    if (registeredUsers.length === 0) {
        studentsDiv.innerHTML = '<p class="no-students">Chưa có học viên nào đăng ký khóa học này.</p>';
        return;
    }

    // Hiển thị danh sách học viên
    const studentsHtml = registeredUsers.map(user => `
        <div class="student-item">
            <div>
                <div class="student-name"><a href="./detail_student/detail_student.html?id=${user.id}&sourceId=${source.id}">${user.userName}</a></div>
            </div>
        </div>
    `).join('');

    studentsDiv.innerHTML = studentsHtml;
}