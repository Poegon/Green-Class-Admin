const params = new URLSearchParams(window.location.search);
const sourceId = params.get('id');

const sourcesApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/sourses';

fetch(`${sourcesApi}/${sourceId}`)
    .then(res => res.json())
    .then(source => {
        if (!source) throw new Error('No source found');

        // Cập nhật thông tin khóa học vào HTML
        document.getElementById('source-title').textContent = source.title || '';
        document.getElementById('source-thumbnail').src = source.thumbnailSources || '';
        document.getElementById('source-thumbnail').alt = source.title || 'Ảnh khóa học';
        document.getElementById('source-code').textContent = source.sourceId || '';
        document.getElementById('source-category').textContent = source.category || '';
        document.getElementById('source-cost').textContent = source.cost || '';
        document.getElementById('source-description').textContent = source.description || '';

        const lessonsContainer = document.getElementById('lessons-container');

        // Hàm render 1 bài học
        function renderLesson(lesson, index, isNew = false) {
            const div = document.createElement('div');
            div.classList.add('lesson-item');
            div.innerHTML = `
        <h4>${isNew ? 'Bài mới' : `Bài ${index + 1}`}: ${lesson.title}</h4>
        <p><strong>Video:</strong> <a href="${lesson.youtube}" target="_blank" rel="noopener noreferrer">${lesson.youtube}</a></p>
        <p><strong>Mô tả:</strong> ${lesson.description}</p>
        <p><strong>Bài tập:</strong> ${lesson.exercise}</p>
      `;
            lessonsContainer.insertBefore(div, document.getElementById('lesson-form'));
        }

        // Hiển thị các bài học hiện có
        if (Array.isArray(source.lessons)) {
            source.lessons.forEach((lesson, index) => {
                renderLesson(lesson, index);
            });
        }

        // Nút mở form thêm bài học
        document.getElementById('add-lesson-btn').addEventListener('click', () => {
            const form = document.getElementById('lesson-form');
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });

        // Nút lưu bài học mới
        document.getElementById('submit-lesson').addEventListener('click', () => {
            const title = document.getElementById('new-title').value.trim();
            const youtube = document.getElementById('new-youtube').value.trim();
            const description = document.getElementById('new-description').value.trim();
            const exercise = document.getElementById('new-exercise').value.trim();

            if (!title || !youtube || !description || !exercise) {
                alert('Vui lòng điền đầy đủ thông tin.');
                return;
            }

            const newLesson = { title, youtube, description, exercise };

            // Thêm bài học mới vào mảng source.lessons
            if (!Array.isArray(source.lessons)) {
                source.lessons = [];
            }
            source.lessons.push(newLesson);

            // Hiển thị bài học mới ngay trên UI
            renderLesson(newLesson, source.lessons.length - 1, true);

            // Xoá nội dung input
            document.getElementById('new-title').value = '';
            document.getElementById('new-youtube').value = '';
            document.getElementById('new-description').value = '';
            document.getElementById('new-exercise').value = '';
            document.getElementById('lesson-form').style.display = 'none';

            // Cập nhật lên API
            fetch(`${sourcesApi}/${sourceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(source),
            }).catch(err => {
                alert('Lỗi khi lưu bài học mới lên server.');
                console.error(err);
            });
        });

    })
    .catch(err => {
        console.error('Lỗi khi tải chi tiết khóa học:', err);
        const box = document.querySelector('.dashboard-box');
        box.innerHTML = '<p style="color: red;">Không thể tải chi tiết khóa học.</p>';
    });
