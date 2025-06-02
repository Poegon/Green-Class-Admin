const sourceApi = 'https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/sourses';

function addSource() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const cost = parseFloat(document.getElementById('cost').value);
    const category = document.getElementById('category').value.trim();
    const thumbnail = document.getElementById('thumbnail').value.trim();

    if (!title || !description || isNaN(cost) || !category || !thumbnail) {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
    }

    const newSource = {
        title,
        description,
        cost,
        category,
        thumbnailSources: thumbnail
    };

    fetch(sourceApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource)
    })
        .then(res => res.json())
        .then(() => {
            document.getElementById('status').textContent = "✅ Đã thêm khóa học thành công.";
            window.location.href = "../sources.html";
        })
        .catch(err => {
            console.error("Lỗi:", err);
            document.getElementById('status').textContent = "❌ Có lỗi xảy ra khi thêm khóa học.";
        });
}
