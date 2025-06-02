document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const apiURL = 'https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/staffs';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const gmailInput = document.getElementById('gmail').value.trim();
        const passwordInput = document.getElementById('password').value;

        if (!gmailInput || !passwordInput) {
            alert('Vui lòng nhập đủ thông tin');
            return;
        }

        try {
            const response = await fetch(apiURL);
            const staffs = await response.json();

            const matchedUser = staffs.find(
                (staff) => staff.gmail === gmailInput && passwordInput === '123'
            );

            if (matchedUser) {
                alert(`Chào ${matchedUser.name}! Đăng nhập thành công.`);
                localStorage.setItem('user', JSON.stringify(matchedUser));
                window.location.href = "../schedule/schedule.html";
            } else {
                alert('Gmail hoặc mật khẩu không đúng.');
            }
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    });
});
