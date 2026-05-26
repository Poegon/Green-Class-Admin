const staffApi = 'https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/staffs';

fetch(staffApi)
    .then(res => res.json())
    .then(data => {
        const tbody = document.querySelector('#staff-table tbody');
        let countMale = 0;
        let countFemale = 0;
        const subjectCount = {};

        data.forEach(staff => {
            const row = document.createElement('tr');

            // Avatar
            const avatarCell = document.createElement('td');
            const img = document.createElement('img');
            img.src = staff.avatar;
            img.alt = staff.name;
            img.className = 'avatar';
            avatarCell.appendChild(img);
            row.appendChild(avatarCell);

            // Name
            const nameCell = document.createElement('td');
            nameCell.textContent = staff.name;
            row.appendChild(nameCell);

            // Gmail
            const gmailCell = document.createElement('td');
            gmailCell.textContent = staff.gmail;
            row.appendChild(gmailCell);

            // Description
            const descCell = document.createElement('td');
            descCell.className = 'description-cell';
            const descWrapper = document.createElement('div');
            descWrapper.className = 'description-text';
            descWrapper.textContent = staff.description;
            descCell.appendChild(descWrapper);
            row.appendChild(descCell);

            // Subject
            const subjectCell = document.createElement('td');
            subjectCell.textContent = staff.subject;
            row.appendChild(subjectCell);

            // Gender
            const genderCell = document.createElement('td');
            const genderText = staff.gender ? 'Nữ' : 'Nam';
            genderCell.textContent = genderText;
            row.appendChild(genderCell);

            // Action
            const actionCell = document.createElement('td');
            const editLink = document.createElement('a');
            editLink.href = `add/add_staff.html?id=${staff.id}`;
            editLink.textContent = 'Chỉnh sửa';
            editLink.className = 'edit-link';
            actionCell.appendChild(editLink);
            row.appendChild(actionCell);

            // Đếm giới tính
            staff.gender ? countFemale++ : countMale++;

            // Đếm môn học
            const subject = staff.subject?.trim() || 'Không rõ';
            if (subjectCount[subject]) {
                subjectCount[subject]++;
            } else {
                subjectCount[subject] = 1;
            }

            tbody.appendChild(row);
        });

        // Biểu đồ giới tính
        const genderCtx = document.getElementById('genderChart').getContext('2d');
        new Chart(genderCtx, {
            type: 'doughnut',
            data: {
                labels: ['Nam', 'Nữ'],
                datasets: [{
                    data: [countMale, countFemale],
                    backgroundColor: ['#36A2EB', '#FF6384']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Biểu đồ giới tính nhân sự' }
                }
            }
        });

        // Biểu đồ môn học
        const subjectLabels = Object.keys(subjectCount);
        const subjectValues = Object.values(subjectCount);
        const subjectColors = subjectLabels.map((_, i) =>
            `hsl(${(i * 360) / subjectLabels.length}, 70%, 60%)`
        );

        const subjectCtx = document.getElementById('subjectChart').getContext('2d');
        new Chart(subjectCtx, {
            type: 'doughnut',
            data: {
                labels: subjectLabels,
                datasets: [{
                    data: subjectValues,
                    backgroundColor: subjectColors
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Biểu đồ tỷ lệ môn học giảng dạy' }
                }
            }
        });

    })
    .catch(err => {
        console.error('Lỗi khi tải danh sách nhân viên:', err);
        const tbody = document.querySelector('#staff-table tbody');
        const errorRow = document.createElement('tr');
        const errorCell = document.createElement('td');
        errorCell.colSpan = 6;
        errorCell.textContent = 'Không thể tải dữ liệu.';
        errorRow.appendChild(errorCell);
        tbody.appendChild(errorRow);
    });
