document.addEventListener('DOMContentLoaded', async () => {
    const loggedInStaff = JSON.parse(localStorage.getItem('user'));
    const scheduleApi = 'https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/schedule';
    const sourceApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/sourses';
    const tableBody = document.getElementById('scheduleBody');

    if (!loggedInStaff) {
        alert('Vui lòng đăng nhập trước!');
        window.location.href = '../login/login.html';
        return;
    }

    const staffId = loggedInStaff.id;
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    try {
        const [scheduleRes, sourceRes] = await Promise.all([
            fetch(scheduleApi),
            fetch(sourceApi)
        ]);

        const schedules = await scheduleRes.json();
        const sources = await sourceRes.json();

        // Map sourceId -> sourceTitle, sourceLink (linkGgMeet có thể lưu trong source hoặc từ lịch)
        const sourceTitleMap = new Map();
        const sourceLinkMap = new Map();

        sources.forEach(source => {
            sourceTitleMap.set(source.id, source.title);
            // Nếu linkGgMeet lưu trong nguồn nguồn (nếu có), ví dụ source.linkGgMeet
            if (source.linkGgMeet) {
                sourceLinkMap.set(source.id, source.linkGgMeet);
            }
        });

        // Map sourceId -> { day: time }
        const sourceScheduleMap = new Map();

        schedules.forEach(schedule => {
            daysOfWeek.forEach(day => {
                if (Array.isArray(schedule[day])) {
                    schedule[day].forEach(entry => {
                        if (entry.staffId === staffId) {
                            if (!sourceScheduleMap.has(entry.sourceId)) {
                                sourceScheduleMap.set(entry.sourceId, {});
                            }
                            sourceScheduleMap.get(entry.sourceId)[day] = entry.time;

                            // Nếu linkGgMeet lưu trong entry, ưu tiên lấy link ở đây
                            if (entry.linkGgMeet) {
                                sourceLinkMap.set(entry.sourceId, entry.linkGgMeet);
                            }
                        }
                    });
                }
            });
        });

        // Tạo bảng
        sourceScheduleMap.forEach((dayData, sourceId) => {
            const row = document.createElement('tr');

            // Tên course
            const sourceCell = document.createElement('td');
            sourceCell.className = 'border px-4 py-2 font-semibold';
            sourceCell.textContent = sourceTitleMap.get(sourceId) || `Source ${sourceId}`;
            row.appendChild(sourceCell);

            // Các cột ngày trong tuần hiển thị thời gian hoặc "-"
            daysOfWeek.forEach(day => {
                const cell = document.createElement('td');
                cell.className = 'border px-4 py-2 text-center';
                cell.textContent = dayData[day] || '- : -';
                row.appendChild(cell);
            });

            // Cột link GgMeet cuối cùng
            const linkCell = document.createElement('td');
            linkCell.className = 'border px-4 py-2 text-center';
            const link = sourceLinkMap.get(sourceId);
            if (link) {
                linkCell.innerHTML = `<a href="${link}" target="_blank" class="text-blue-600 underline">Google Meet</a>`;
            } else {
                linkCell.textContent = '-';
            }
            row.appendChild(linkCell);

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu lịch học hoặc nguồn khóa học:', error);
        alert('Không thể tải dữ liệu. Vui lòng thử lại.');
    }
});
