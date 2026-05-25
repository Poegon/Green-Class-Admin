const usersApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/users';
const sourcesApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/sourses';

Promise.all([
  fetch(usersApi).then(res => res.json()),
  fetch(sourcesApi).then(res => res.json())
]).then(([users, sources]) => {
  const stats = {};

  // Đếm số người đăng ký từng khóa học
  users.forEach(user => {
    user.sourcesId.forEach(sourceId => {
      if (!stats[sourceId]) stats[sourceId] = 0;
      stats[sourceId]++;
    });
  });

  // ==== VẼ BIỂU ĐỒ ====
  const labels = [];
  const data = [];

  sources.forEach(source => {
    const shortTitle = source.title.length > 12 ? source.title.slice(0, 10) + '…' : source.title;
    labels.push(shortTitle);
    data.push((stats[source.id] || 0) * 11); // ví dụ: mỗi lượt đăng ký mang lại $11
  });

  const ctx = document.getElementById('courseChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Số người đăng ký',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              return sources[index].title;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: Math.max(...data) + 20,
          title: {
            display: true,
            text: 'Số người đăng ký'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Khóa học'
          }
        }
      }
    }
  });

  // ==== TẠO BẢNG DANH SÁCH KHÓA HỌC ====
  const tbody = document.querySelector('#source-table tbody');
  sources.forEach(source => {
    const row = document.createElement('tr');

    // Cột ảnh thumbnail
    const thumbCell = document.createElement('td');
    const img = document.createElement('img');
    img.src = source.thumbnailSources;
    img.alt = source.title;
    img.style.width = '60px';
    img.style.height = '40px';
    img.style.objectFit = 'cover';
    thumbCell.appendChild(img);
    row.appendChild(thumbCell);

    // Cột tên khóa học có link
    const titleCell = document.createElement('td');
    const link = document.createElement('a');
    link.href = `detail/detail_sources.html?id=${source.id}`;
    link.textContent = source.title;
    link.style.textDecoration = 'none';
    link.style.color = '#007bff';
    titleCell.appendChild(link);
    row.appendChild(titleCell);

    // Cột mô tả
    const descCell = document.createElement('td');
    descCell.textContent = source.description;
    row.appendChild(descCell);

    // Cột trạng thái
    const activeCell = document.createElement('td');
    const activeBadge = document.createElement('span');
    activeBadge.className = `status-badge ${source.active ? 'active' : 'inactive'}`;
    activeBadge.textContent = source.active ? 'Hoạt động' : 'Tắt';
    activeCell.appendChild(activeBadge);
    row.appendChild(activeCell);

    // Cột chuyên mục
    const catCell = document.createElement('td');
    catCell.textContent = source.category;
    row.appendChild(catCell);

    // Cột học phí
    const costCell = document.createElement('td');
    costCell.textContent = `$${source.cost}`;
    row.appendChild(costCell);

    // Cột lượt đăng ký
    const regCell = document.createElement('td');
    regCell.textContent = stats[source.id] || 0;
    row.appendChild(regCell);

    tbody.appendChild(row);
  });

}).catch(err => {
  console.error("Lỗi khi tải dữ liệu:", err);
});
