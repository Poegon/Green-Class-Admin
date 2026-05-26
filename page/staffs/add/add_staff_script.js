const staffsApi = 'https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/staffs';

function removeVietnameseTones(str) {
    return str.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
}

const avatarThumbnails = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=4",
    "https://i.pravatar.cc/150?img=5",
    "https://i.pravatar.cc/150?img=7",
    "https://i.pravatar.cc/150?img=8",
    "https://i.pravatar.cc/150?img=9",
    "https://i.pravatar.cc/150?img=10",
    "https://i.pravatar.cc/150?img=11",
    "https://i.pravatar.cc/150?img=12",
    "https://i.pravatar.cc/150?img=13",
    "https://i.pravatar.cc/150?img=14",
    "https://i.pravatar.cc/150?img=15",
    "https://i.pravatar.cc/150?img=16",
    "https://i.pravatar.cc/150?img=17",
    "https://i.pravatar.cc/150?img=18",
    "https://i.pravatar.cc/150?img=19",
    "https://i.pravatar.cc/150?img=20",
    "https://i.pravatar.cc/150?img=21",
    "https://i.pravatar.cc/150?img=22",
    "https://i.pravatar.cc/150?img=23",
    "https://i.pravatar.cc/150?img=24",

    "https://cdn.24h.com.vn/upload/1-2022/images/2022-03-16/baukrysie_275278910_3174792849424333_1380029197326773703_n-1647427653-670-width1440height1800.jpg",
    "https://shinemd.com/wp-content/uploads/2022/05/Treatments-For-Men-1.jpg",
    "https://www.shutterstock.com/image-photo/beautiful-asian-girl-long-shiny-600nw-2251863081.jpg",
];

let selectedAvatar = "";
let avatarMode = 'existing';

function setAvatarButtons(mode) {
    document.getElementById('avatar-button-existing').classList.toggle('active', mode === 'existing');
    document.getElementById('avatar-button-url').classList.toggle('active', mode === 'url');
}

function openAvatarPanel() {
    avatarMode = 'existing';
    setAvatarButtons(avatarMode);
    document.getElementById('avatar-panel').classList.remove('hidden');
    document.getElementById('avatar-url-section').classList.add('hidden');
    document.getElementById('avatar-url').value = '';
    renderAvatarList();
}

function hideAvatarPanel() {
    document.getElementById('avatar-panel').classList.add('hidden');
}

function showAvatarUrlInput() {
    avatarMode = 'url';
    setAvatarButtons(avatarMode);
    hideAvatarPanel();
    document.getElementById('avatar-url-section').classList.remove('hidden');
    document.getElementById('avatar-url').focus();
    if (selectedAvatar) {
        document.getElementById('avatar-url').value = selectedAvatar;
    }
}

function updateAvatarUrl() {
    const avatarUrlInput = document.getElementById('avatar-url');
    const url = avatarUrlInput.value.trim();
    if (url) {
        selectedAvatar = url;
        document.getElementById('selected-avatar').src = url;
    }
}

function renderAvatarList() {
    const avatarList = document.getElementById('avatar-list');
    avatarList.innerHTML = '';

    avatarThumbnails.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = "Avatar";
        img.className = url === selectedAvatar ? 'selected' : '';
        img.onclick = () => {
            selectedAvatar = url;
            document.getElementById('selected-avatar').src = url;
            document.querySelectorAll('#avatar-list img').forEach(item => {
                item.classList.toggle('selected', item.src === url);
            });
            hideAvatarPanel();
        };
        avatarList.appendChild(img);
    });
}

// Thêm hoặc cập nhật nhân sự
function addOrUpdateStaff() {
    const firstname = document.getElementById('firstname').value.trim();
    const lastname = document.getElementById('lastname').value.trim();
    const description = document.getElementById('description').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const genderInput = document.querySelector('input[name="gender"]:checked');
    const gender = genderInput ? (genderInput.value === 'male' ? false : true) : false;

    if (!firstname || !lastname || !description || !subject) {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
    }

    const avatarInput = document.getElementById('avatar-url').value.trim();
    const avatarUrl = avatarMode === 'url'
        ? (avatarInput || "https://i.pravatar.cc/150?img=1")
        : (selectedAvatar || "https://i.pravatar.cc/150?img=1");

    const cleanFirst = removeVietnameseTones(firstname);
    const cleanLast = removeVietnameseTones(lastname);
    const randomNum = Math.floor(100 + Math.random() * 900);
    const gmail = `${cleanFirst}_${cleanLast}_${randomNum}@outlook.com`;

    const staffData = {
        name: `${firstname} ${lastname}`,
        gmail,
        description,
        gender,
        avatar: avatarUrl,
        sourcesId: [],
        subject,
        isActive: true
    };

    const urlParams = new URLSearchParams(window.location.search);
    const staffId = urlParams.get('id');
    const url = staffId ? `${staffsApi}/${staffId}` : staffsApi;
    const method = staffId ? 'PUT' : 'POST';

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData)
    })
        .then(res => res.json())
        .then(() => {
            document.getElementById('status').textContent = staffId
                ? "✅ Đã cập nhật nhân sự thành công."
                : "✅ Đã thêm nhân sự thành công.";
            window.location.href = "../staffs.html";
        })
        .catch(err => {
            console.error("Lỗi:", err);
            document.getElementById('status').textContent = "❌ Có lỗi xảy ra khi lưu nhân sự.";
        });
}

// Tải dữ liệu nhân sự nếu có ID
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const staffId = urlParams.get('id');

    if (staffId) {
        fetch(`${staffsApi}/${staffId}`)
            .then(res => res.json())
            .then(staff => {
                const [first, ...rest] = staff.name.split(' ');
                document.getElementById('firstname').value = first || '';
                document.getElementById('lastname').value = rest.join(' ') || '';
                document.getElementById('description').value = staff.description || '';
                document.getElementById('subject').value = staff.subject || '';
                if (staff.gender === false) {
                    document.querySelector('input[value="male"]').checked = true;
                } else {
                    document.querySelector('input[value="female"]').checked = true;
                }

                // Load avatar nếu có
                selectedAvatar = staff.avatar || avatarThumbnails[0];
                document.getElementById('selected-avatar').src = selectedAvatar;
                document.getElementById('avatar-url').value = selectedAvatar;
                if (avatarThumbnails.includes(selectedAvatar)) {
                    avatarMode = 'existing';
                    setAvatarButtons('existing');
                    hideAvatarPanel();
                    document.getElementById('avatar-url-section').classList.add('hidden');
                } else {
                    showAvatarUrlInput();
                }
            })
            .catch(err => {
                console.error("Lỗi khi lấy thông tin nhân sự:", err);
            });
    } else {
        // Nếu thêm mới thì dùng avatar mặc định
        selectedAvatar = avatarThumbnails[0];
        document.getElementById('selected-avatar').src = selectedAvatar;
        document.getElementById('avatar-url').value = selectedAvatar;
        avatarMode = 'existing';
        setAvatarButtons('existing');
        hideAvatarPanel();
        document.getElementById('avatar-url-section').classList.add('hidden');
    }
});