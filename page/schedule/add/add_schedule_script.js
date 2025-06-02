const scheduleApi = 'https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/schedule';
const sourcesApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/sourses';
const staffsApi = 'https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/staffs';

let allSources = [];
let allStaffs = [];

// Lấy danh sách khóa học
fetch(sourcesApi)
    .then(res => res.json())
    .then(data => {
        allSources = data;
        const courseSelect = document.getElementById('course');
        data.forEach(source => {
            const option = document.createElement('option');
            option.value = source.id;
            option.textContent = source.title;
            courseSelect.appendChild(option);
        });
    })
    .catch(err => {
        console.error("Lỗi khi tải danh sách khóa học:", err);
    });

// Lấy danh sách staffs
fetch(staffsApi)
    .then(res => res.json())
    .then(data => {
        allStaffs = data;
        const staffSelect = document.getElementById('staff');
        data.forEach(staff => {
            const option = document.createElement('option');
            option.value = staff.id;
            option.textContent = staff.name;
            staffSelect.appendChild(option);
        });
    })
    .catch(err => {
        console.error("Lỗi khi tải danh sách nhân sự:", err);
    });

function addSchedule() {
    const sourceId = document.getElementById('course').value;
    const staffId = document.getElementById('staff').value;
    const time = document.getElementById('time').value;
    const linkGgMeet = document.getElementById('linkGgMeet').value.trim();

    const checkedDays = Array.from(document.querySelectorAll('#day-checkboxes input[type="checkbox"]:checked')).map(cb => cb.value);

    if (checkedDays.length === 0 || !sourceId || !staffId || !time || !linkGgMeet) {
        alert("Vui lòng chọn ít nhất một ngày và nhập đầy đủ thông tin.");
        return;
    }

    fetch(scheduleApi)
        .then(res => res.json())
        .then(schedule => {
            if (!schedule.length) {
                alert("Không tìm thấy dữ liệu thời khóa biểu.");
                return;
            }

            const currentSchedule = schedule[0];

            const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            allDays.forEach(d => {
                if (!currentSchedule[d]) currentSchedule[d] = [];
            });

            checkedDays.forEach(day => {
                currentSchedule[day].push({ sourceId, staffId, time, linkGgMeet });
            });

            return fetch(`${scheduleApi}/${currentSchedule.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentSchedule)
            });
        })
        .then(res => res.json())
        .then(() => {
            document.getElementById('status').textContent = "✅ Đã thêm khóa học vào các ngày đã chọn.";
            window.location.href = "../schedule.html";
        })
        .catch(err => {
            console.error("Lỗi khi cập nhật thời khóa biểu:", err);
            document.getElementById('status').textContent = "❌ Có lỗi xảy ra khi cập nhật thời khóa biểu.";
        });
}
