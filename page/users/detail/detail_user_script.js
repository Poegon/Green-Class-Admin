document.addEventListener('DOMContentLoaded', async () => {
    // Lấy userId từ URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
        alert('Không tìm thấy ID người dùng!');
        window.location.href = '../user.html';
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
            alert('Không tìm thấy người dùng!');
            window.location.href = '../user.html';
            return;
        }

        // Hiển thị thông tin user
        displayUserInfo(user);

        // Hiển thị các khóa học đã đăng ký
        displayRegisteredCourses(user, sources);

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu!');
    }
});

function displayUserInfo(user) {
    const userInfoDiv = document.getElementById('userInfo');

    userInfoDiv.innerHTML = `
        <div class="user-info-item">
            <span class="user-info-label">ID:</span>
            <span class="user-info-value">${user.id}</span>
        </div>
        <div class="user-info-item">
            <span class="user-info-label">Tên người dùng:</span>
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

function displayRegisteredCourses(user, sources) {
    const coursesDiv = document.getElementById('registeredCourses');

    if (user.sourcesId.length === 0) {
        coursesDiv.innerHTML = '<p class="no-courses">Người dùng chưa đăng ký khóa học nào.</p>';
        return;
    }

    // Tạo map của sources để dễ tra cứu
    const sourcesMap = new Map();
    sources.forEach(source => {
        sourcesMap.set(source.id, source);
    });

    // Hiển thị các khóa học đã đăng ký
    const coursesHtml = user.sourcesId.map(sourceId => {
        const source = sourcesMap.get(sourceId);
        if (!source) return '';

        return `
            <div class="course-item">
                <div class="course-title">${source.title}</div>
                <div class="course-description">${source.description || 'Không có mô tả'}</div>
            </div>
        `;
    }).join('');

    coursesDiv.innerHTML = coursesHtml;
}