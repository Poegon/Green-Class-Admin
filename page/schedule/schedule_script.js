document.addEventListener('DOMContentLoaded', () => {
    const scheduleApi = 'https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/schedule';
    const sourcesApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/sourses';
    const staffsApi = 'https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/staffs';

    Promise.all([
        fetch(scheduleApi).then(res => res.json()),
        fetch(sourcesApi).then(res => res.json()),
        fetch(staffsApi).then(res => res.json())
    ])
        .then(([scheduleData, sourcesData, staffsData]) => {
            const tbody = document.querySelector('#schedule-table tbody');
            if (!tbody) {
                console.error('Không tìm thấy tbody trong bảng!');
                return;
            }

            // Lấy phần tử đầu tiên (giả sử chỉ 1 schedule object)
            const schedule = scheduleData[0];

            // 👉 VẼ BIỂU ĐỒ CỘT
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const courseCounts = days.map(day => {
                const lessons = schedule[day] || [];
                return lessons.length;
            });

            // 👉 Tính max và tăng thêm 1 (hoặc 10%, tùy bạn)
            const maxValue = Math.max(...courseCounts);
            const suggestedMax = maxValue + 1;

            const ctx = document.getElementById('scheduleChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: days.map(d => d.charAt(0).toUpperCase() + d.slice(1)),
                    datasets: [{
                        label: 'Số tiết học trong ngày',
                        data: courseCounts,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        borderRadius: 5,
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: suggestedMax, // 💡 Thêm dòng này
                            ticks: {
                                precision: 0
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });

            // 👉 HIỂN THỊ BẢNG DỮ LIỆU
            const combined = {};

            for (const day in schedule) {
                if (day === 'id') continue;

                const lessons = schedule[day];
                lessons.forEach(item => {
                    const key = item.sourceId + '_' + item.staffId;
                    if (!combined[key]) {
                        combined[key] = {
                            sourceId: item.sourceId,
                            staffId: item.staffId,
                            days: [],
                            times: []
                        };
                    }
                    combined[key].days.push(day.charAt(0).toUpperCase() + day.slice(1));
                    combined[key].times.push(item.time);
                });
            }

            Object.values(combined).forEach(entry => {
                const row = document.createElement('tr');

                const source = sourcesData.find(src => src.id === entry.sourceId);
                const courseName = source?.title || 'Không rõ';

                const staff = staffsData.find(stf => stf.id === entry.staffId);
                const teacherName = staff?.name || 'Không rõ';

                const daysText = entry.days.join(', ');
                const timeText = entry.times[0] || 'Không rõ';

                const courseCell = document.createElement('td');
                courseCell.textContent = courseName;
                row.appendChild(courseCell);

                const teacherCell = document.createElement('td');
                teacherCell.textContent = teacherName;
                row.appendChild(teacherCell);

                const dayCell = document.createElement('td');
                dayCell.textContent = daysText;
                row.appendChild(dayCell);

                const timeCell = document.createElement('td');
                timeCell.textContent = timeText;
                row.appendChild(timeCell);

                tbody.appendChild(row);
            });
        })
        .catch(err => {
            console.error('Lỗi khi tải dữ liệu thời khóa biểu:', err);

            const tbody = document.querySelector('#schedule-table tbody');
            if (tbody) {
                const errorRow = document.createElement('tr');
                const errorCell = document.createElement('td');
                errorCell.colSpan = 4;
                errorCell.textContent = 'Không thể tải dữ liệu thời khóa biểu.';
                errorCell.style.color = 'red';
                errorRow.appendChild(errorCell);
                tbody.appendChild(errorRow);
            }
        });
});
