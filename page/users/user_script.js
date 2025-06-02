const usersApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/users';

fetch(usersApi)
    .then(res => res.json())
    .then(users => {
        const tbody = document.querySelector('#userTable tbody');
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.userName}</td>
            <td>${user.password}</td>
            <td>${user.sourcesId.join(', ') || 'Không có'}</td>
          `;
            tbody.appendChild(tr);
        });
    })
    .catch(err => {
        console.error('Lỗi khi tải user:', err);
    });