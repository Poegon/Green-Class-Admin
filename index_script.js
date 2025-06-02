const usersApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/users';
const sourcesApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/sourses';
const staffApi = 'https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/staffs';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [usersRes, sourcesRes, staffRes] = await Promise.all([
            fetch(usersApi),
            fetch(sourcesApi),
            fetch(staffApi)
        ]);

        const users = await usersRes.json();
        const sources = await sourcesRes.json();
        const staffs = await staffRes.json();

        const totalCourses = sources.length;
        const totalStaff = staffs.length;
        const totalUsers = users.length;
        let totalRevenue = 0;
        const sourceCostMap = new Map();
        sources.forEach(source => {
            sourceCostMap.set(source.id, source.cost);
        });

        users.forEach(user => {
            user.sourcesId?.forEach(sourceId => {
                if (sourceCostMap.has(sourceId)) {
                    totalRevenue += sourceCostMap.get(sourceId);
                }
            });
        });

        document.getElementById('totalCourses').textContent = totalCourses * 100 + " khóa học";
        document.getElementById('totalStaff').textContent = totalStaff * 100 + " giảng viên";
        document.getElementById('totalUsers').textContent = totalUsers * 1000 + " người dùng";
        document.getElementById('totalRevenue').textContent = `$${totalRevenue * 1000} Dollar`;

        const courseCountMap = new Map();
        users.forEach(user => {
            user.sourcesId?.forEach(sourceId => {
                courseCountMap.set(sourceId, (courseCountMap.get(sourceId) || 0) + 1);
            });
        });

        const topCourses = [...courseCountMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const topCourseData = topCourses.map(([sourceId, count]) => {
            const source = sources.find(src => src.id === sourceId);
            return {
                title: source?.title || 'Không rõ',
                count
            };
        });

        const tableBody = document.querySelector('#topCoursesTable tbody');
        tableBody.innerHTML = '';
        topCourseData.forEach((course, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${course.title}</td>
                <td>${course.count}</td>
            `;
            tableBody.appendChild(row);
        });

        const categoryCount = {};
        sources.forEach(source => {
            const cat = source.category || 'Không rõ';
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });

        const donutCtx = document.getElementById('categoryChart').getContext('2d');
        const donutChart = new Chart(donutCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryCount),
                datasets: [{
                    label: 'Số lượng khóa học',
                    data: Object.values(categoryCount),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#C9CBCF'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

    } catch (error) {
        console.error('❌ Lỗi khi thống kê:', error);
    }
});
