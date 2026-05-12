document.addEventListener('DOMContentLoaded', async () => {
    const loggedInStaff = JSON.parse(localStorage.getItem('user'));

    if (!loggedInStaff) {
        alert('Vui lòng đăng nhập trước!');
        window.location.href = '../login/login.html';
        return;
    }

    const staffId = loggedInStaff.id;
    const scheduleApi = 'https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/schedule';
    const sourcesApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/sourses';
    const usersApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/users';

    try {
        const [scheduleRes, sourcesRes, usersRes] = await Promise.all([
            fetch(scheduleApi),
            fetch(sourcesApi),
            fetch(usersApi)
        ]);

        const schedules = await scheduleRes.json();
        const sources = await sourcesRes.json();
        const users = await usersRes.json();

        // Tạo map đếm số học viên cho mỗi khóa học
        const studentCountMap = new Map();
        users.forEach(user => {
            user.sourcesId.forEach(sourceId => {
                studentCountMap.set(sourceId, (studentCountMap.get(sourceId) || 0) + 1);
            });
        });

        // Tìm các sourceId mà staff này phụ trách
        const staffSourceIds = new Set();
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        schedules.forEach(schedule => {
            daysOfWeek.forEach(day => {
                if (Array.isArray(schedule[day])) {
                    schedule[day].forEach(entry => {
                        if (entry.staffId === staffId) {
                            staffSourceIds.add(entry.sourceId);
                        }
                    });
                }
            });
        });

        // Lọc sources mà staff phụ trách
        const staffSources = sources.filter(source => staffSourceIds.has(source.id));

        // Hiển thị bảng
        displayStaffSources(staffSources, studentCountMap);

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu!');
    }
});

function displayStaffSources(sources, studentCountMap) {
    const tbody = document.querySelector('#staff-sources-table tbody');

    if (sources.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Bạn chưa được phân công khóa học nào.</td></tr>';
        return;
    }

    sources.forEach(source => {
        const row = document.createElement('tr');

        // Cột hình ảnh
        const imgCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = source.thumbnailSources || '';
        img.alt = source.title;
        imgCell.appendChild(img);
        row.appendChild(imgCell);

        // Cột tên khóa học có link
        const titleCell = document.createElement('td');
        const link = document.createElement('a');
        link.href = `detail/detail_sources.html?id=${source.id}`;
        link.textContent = source.title;
        link.className = 'source-link';
        titleCell.appendChild(link);
        row.appendChild(titleCell);

        // Cột mô tả
        const descCell = document.createElement('td');
        descCell.textContent = source.description || '';
        row.appendChild(descCell);

        // Cột chuyên mục
        const catCell = document.createElement('td');
        catCell.textContent = source.category || '';
        row.appendChild(catCell);

        // Cột học phí
        const costCell = document.createElement('td');
        costCell.textContent = `$${source.cost || 0}`;
        row.appendChild(costCell);

        // Cột số học viên
        const countCell = document.createElement('td');
        countCell.textContent = studentCountMap.get(source.id) || 0;
        row.appendChild(countCell);

        tbody.appendChild(row);
    });
}