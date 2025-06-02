const staffsApi = 'https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/staffs';

function addStaff() {
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

    const randomNum = Math.floor(100 + Math.random() * 900);
    const gmail = `${firstname.toLowerCase()}_${lastname.toLowerCase()}_${randomNum}@outlook.com`;

    const newStaff = {
        name: `${firstname} ${lastname}`,
        gmail: gmail,
        description: description,
        gender: gender,
        sourcesId: [],
        subject: subject,
        isActive: true
    };

    fetch(staffsApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
    })
        .then(res => res.json())
        .then(() => {
            document.getElementById('status').textContent = "✅ Đã thêm nhân sự thành công.";
            window.location.href = "../staffs.html";
        })
        .catch(err => {
            console.error("Lỗi:", err);
            document.getElementById('status').textContent = "❌ Có lỗi xảy ra khi thêm nhân sự.";
        });
}
