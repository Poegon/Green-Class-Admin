const params = new URLSearchParams(window.location.search);
const sourceId = params.get('id');

const sourcesApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/sourses';
let currentSource = null;

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function updateSourceOnServer(source) {
    return fetch(`${sourcesApi}/${sourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(source),
    }).then(res => {
        if (!res.ok) {
            throw new Error('Lỗi khi cập nhật khóa học');
        }
        return res.json();
    });
}

function setSourceForm(source) {
    document.getElementById('source-title').textContent = source.title || '';
    document.getElementById('source-thumbnail').src = source.thumbnailSources || '';
    document.getElementById('source-thumbnail').alt = source.title || 'Ảnh khóa học';
    document.getElementById('title-input').value = source.title || '';
    document.getElementById('category-input').value = source.category || '';
    document.getElementById('cost-input').value = source.cost || '';
    document.getElementById('description-input').value = source.description || '';
    document.getElementById('thumbnail-input').value = source.thumbnailSources || '';
    document.getElementById('active-input').checked = Boolean(source.active);
}

function renderLesson(lesson, index) {
    const lessonsContainer = document.getElementById('lessons-container');
    const div = document.createElement('div');
    div.classList.add('lesson-item');
    div.innerHTML = `
        <div class="lesson-view">
            <h4>Bài ${index + 1}: ${escapeHtml(lesson.title)}</h4>
            <p><strong>Video:</strong> <a href="${escapeHtml(lesson.youtube)}" target="_blank" rel="noopener noreferrer">${escapeHtml(lesson.youtube)}</a></p>
            <p><strong>Mô tả:</strong> ${escapeHtml(lesson.description)}</p>
            <p><strong>Bài tập:</strong> ${escapeHtml(lesson.exercise)}</p>
            <button class="edit-lesson">✏️ Chỉnh sửa</button>
        </div>
        <div class="lesson-edit" style="display: none; margin-top: 0.75rem;">
            <input type="text" class="edit-title" placeholder="Tiêu đề bài học" value="${escapeHtml(lesson.title)}" />
            <input type="text" class="edit-youtube" placeholder="Link YouTube" value="${escapeHtml(lesson.youtube)}" />
            <input type="text" class="edit-description" placeholder="Mô tả" value="${escapeHtml(lesson.description)}" />
            <input type="text" class="edit-exercise" placeholder="Bài tập" value="${escapeHtml(lesson.exercise)}" />
            <div style="margin-top: 0.5rem;">
                <button class="save-lesson">💾 Lưu bài học</button>
                <button class="cancel-lesson">Hủy</button>
            </div>
        </div>
    `;

    const lessonForm = document.getElementById('lesson-form');
    lessonsContainer.insertBefore(div, lessonForm);

    const viewSection = div.querySelector('.lesson-view');
    const editSection = div.querySelector('.lesson-edit');
    const editButton = div.querySelector('.edit-lesson');
    const saveButton = div.querySelector('.save-lesson');
    const cancelButton = div.querySelector('.cancel-lesson');

    editButton.addEventListener('click', () => {
        viewSection.style.display = 'none';
        editSection.style.display = 'block';
    });

    cancelButton.addEventListener('click', () => {
        editSection.style.display = 'none';
        viewSection.style.display = 'block';
    });

    saveButton.addEventListener('click', () => {
        const title = div.querySelector('.edit-title').value.trim();
        const youtube = div.querySelector('.edit-youtube').value.trim();
        const description = div.querySelector('.edit-description').value.trim();
        const exercise = div.querySelector('.edit-exercise').value.trim();

        if (!title || !youtube || !description || !exercise) {
            alert('Vui lòng điền đầy đủ thông tin bài học.');
            return;
        }

        currentSource.lessons[index] = { title, youtube, description, exercise };
        updateSourceOnServer(currentSource)
            .then(updated => {
                currentSource = updated;
                renderLessons();
                document.getElementById('source-status').textContent = '✅ Đã lưu chỉnh sửa bài học.';
            })
            .catch(err => {
                alert('Lỗi khi lưu bài học lên server.');
                console.error(err);
            });
    });
}

function renderLessons() {
    const lessonsContainer = document.getElementById('lessons-container');
    const existingLessons = lessonsContainer.querySelectorAll('.lesson-item');
    existingLessons.forEach(item => item.remove());

    if (Array.isArray(currentSource.lessons)) {
        currentSource.lessons.forEach((lesson, index) => {
            renderLesson(lesson, index);
        });
    }
}

fetch(`${sourcesApi}/${sourceId}`)
    .then(res => res.json())
    .then(source => {
        if (!source) throw new Error('No source found');
        currentSource = source;
        setSourceForm(currentSource);
        renderLessons();

        document.getElementById('add-lesson-btn').addEventListener('click', () => {
            const form = document.getElementById('lesson-form');
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });

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
            if (!Array.isArray(currentSource.lessons)) {
                currentSource.lessons = [];
            }
            currentSource.lessons.push(newLesson);

            updateSourceOnServer(currentSource)
                .then(updated => {
                    currentSource = updated;
                    renderLessons();
                    document.getElementById('new-title').value = '';
                    document.getElementById('new-youtube').value = '';
                    document.getElementById('new-description').value = '';
                    document.getElementById('new-exercise').value = '';
                    document.getElementById('lesson-form').style.display = 'none';
                    document.getElementById('source-status').textContent = '✅ Đã thêm bài học mới.';
                })
                .catch(err => {
                    alert('Lỗi khi lưu bài học mới lên server.');
                    console.error(err);
                });
        });

        document.getElementById('save-source-btn').addEventListener('click', () => {
            const title = document.getElementById('title-input').value.trim();
            const category = document.getElementById('category-input').value.trim();
            const cost = parseFloat(document.getElementById('cost-input').value);
            const description = document.getElementById('description-input').value.trim();
            const thumbnail = document.getElementById('thumbnail-input').value.trim();
            const active = document.getElementById('active-input').checked;

            if (!title || !category || isNaN(cost) || !description || !thumbnail) {
                alert('Vui lòng điền đầy đủ thông tin khóa học.');
                return;
            }

            currentSource.title = title;
            currentSource.category = category;
            currentSource.cost = cost;
            currentSource.description = description;
            currentSource.thumbnailSources = thumbnail;
            currentSource.active = active;

            updateSourceOnServer(currentSource)
                .then(updated => {
                    currentSource = updated;
                    setSourceForm(currentSource);
                    document.getElementById('source-status').textContent = '✅ Đã lưu chỉnh sửa khóa học.';
                })
                .catch(err => {
                    alert('Lỗi khi lưu thông tin khóa học lên server.');
                    console.error(err);
                });
        });
    })
    .catch(err => {
        console.error('Lỗi khi tải chi tiết khóa học:', err);
        const box = document.querySelector('.dashboard-box');
        box.innerHTML = '<p style="color: red;">Không thể tải chi tiết khóa học.</p>';
    });
