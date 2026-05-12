// script.js - Chat Room using profile user API account

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onValue, query, orderByChild, equalTo, serverTimestamp as dbServerTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDc7Lh68UgbmcQOsWLaLQ4FRZG0Et1-qSk",
    authDomain: "chatdemo-ae083.firebaseapp.com",
    databaseURL: "https://chatdemo-ae083-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chatdemo-ae083",
    storageBucket: "chatdemo-ae083.firebasestorage.app",
    messagingSenderId: "550205690893",
    appId: "1:550205690893:web:ccb8e2e5c14f73d2637144",
    measurementId: "G-L35BSNJG02"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const staffApi = 'https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/staffs';
const urlParams = new URLSearchParams(window.location.search);
const roomFromUrl = urlParams.get('room');
const roomNameFromUrl = urlParams.get('roomName');

let currentStaff = null;
let uid = null;
let roomID = roomFromUrl || null;
let roomDisplayName = roomNameFromUrl || roomFromUrl || null;
let messages = [];
let unsubscribeMessages = null;

const appDiv = document.getElementById('app');

function serialize(params) {
    return Object.entries(params)
        .filter(([, value]) => value !== '' && value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}

function buildAvatarUrl(params) {
    const query = serialize(params);
    return `https://avataaars.io/?${query}`;
}

function getAvatarUrl(user) {
    if (!user || !user.avatar) return '';
    try {
        return buildAvatarUrl(JSON.parse(user.avatar));
    } catch (error) {
        return user.avatar || '';
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

function renderAuth() {
    appDiv.innerHTML = `
        <div class="auth-container">
            <h1>Bạn chưa đăng nhập tài khoản Giảng viên</h1>
            <p>Vui lòng đăng nhập bằng tài khoản giảng viên để truy cập chat khóa học.</p>
            <button class="btn" id="loginBtn">Đi tới đăng nhập</button>
        </div>
    `;
    document.getElementById('loginBtn').addEventListener('click', () => {
        window.location.href = '../../../login/login.html';
    });
}

function renderJoin() {
    const name = currentStaff?.name || currentStaff?.userName || currentStaff?.fullName || 'Giảng viên';
    const email = currentStaff?.gmail || currentStaff?.email || currentStaff?.userName || '';
    appDiv.innerHTML = `
        <div class="join-container">
            <div>
                <h1>Hello! ${name}</h1>
                <div class="divider">${email}</div>
                <input id="roomInput" placeholder="Nhập tên khóa học..." class="input" type="text" />
                <div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn btn-red" id="logoutBtn">
                        <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                            <g stroke="#ffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                                <path d="m7.02331 5.5c-2.42505 1.61238-4.02331 4.36954-4.02331 7.5 0 4.9706 4.02944 9 9 9 4.9706 0 9-4.0294 9-9 0-3.13046-1.5983-5.88762-4.0233-7.5"/>
                                <path d="m12 2v8"/>
                            </g>
                        </svg>
                        Logout
                    </button>
                    <button class="btn btn-green" id="joinRoomBtn">
                        Join Room
                        <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                            <g stroke="#ffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                                <path d="m8 12h8"/>
                                <path d="m12 16v-8"/>
                                <path d="m9 22h6c5 0 7-2 7-7v-6c0-5-2-7-7-7h-6c-5 0-7 2-7 7v6c0 5 2 7 7 7z"/>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('joinRoomBtn').addEventListener('click', handleJoinRoom);
}

function handleJoinRoom() {
    const roomInput = document.getElementById('roomInput');
    roomID = roomInput.value.trim();
    if (roomID) {
        renderChat();
    }
}

function handleLogout() {
    currentStaff = null;
    uid = null;
    roomID = null;
    if (unsubscribeMessages) {
        unsubscribeMessages();
        unsubscribeMessages = null;
    }
    messages = [];
    localStorage.removeItem('user');
    renderAuth();
}

function renderChat() {
    const name = currentStaff?.name || currentStaff?.userName || currentStaff?.fullName || 'Giảng viên';
    const email = currentStaff?.gmail || currentStaff?.email || currentStaff?.userName || '';
    const roomLabel = roomDisplayName || roomID;
    appDiv.innerHTML = `
        <div class="chat-container">
            <div class="divider" style="max-width: 80%; margin: 0.5rem auto 1rem; color: #4a90e2; font-weight: 700;">Khoá học: ${roomLabel}</div>
            <div class="chat-messages" id="messagesContainer">
                ${messages.map(msg => renderMessage(msg)).join('')}
            </div>
            <div class="message-form">
                <form id="messageForm">
                    <input id="messageInput" placeholder="Your messages..." type="text" />
                    <button type="submit">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L2 8.66667L11.5833 12.4167M22 2L15.3333 22L11.5833 12.4167M22 2L11.5833 12.4167" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    `;
    document.getElementById('messageForm').addEventListener('submit', handleSendMessage);
    scrollToBottom();
    setupMessageListener();
}

function renderMessage(msg) {
    const isOwn = msg.user === (currentStaff?.name || currentStaff?.userName || currentStaff?.fullName || 'Giảng viên');
    const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : '';
    const avatarUrl = msg.photoURL || getAvatarUrl(currentStaff) || 'https://via.placeholder.com/100?text=U';
    const alignmentStyle = isOwn ? 'margin-left: auto;' : 'margin-right: auto;';
    const avatarHtml = isOwn ? '' : `
        <div class="chat-image avatar">
            <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; overflow: hidden;">
                <img alt="User Avatar" src="${avatarUrl}" style="width: 100%; height: 100%;" />
            </div>
        </div>`;
    const headerHtml = isOwn ? `<time style="font-size: 0.75rem; opacity: 0.5;">${time}</time>` : `
        <div class="chat-header">
            ${msg.user}
            <time style="font-size: 0.75rem; opacity: 0.5;">${time}</time>
        </div>`;
    return `
        <div class="chat ${isOwn ? 'chat-end' : 'chat-start'}" style="${alignmentStyle}">
            ${avatarHtml}
            ${headerHtml}
            <div class="chat-bubble">${msg.chat}</div>
        </div>
    `;
}

function setupMessageListener() {
    const messagesRef = ref(database, 'messages');
    const roomQuery = query(messagesRef, orderByChild('room'), equalTo(roomID));

    unsubscribeMessages = onValue(roomQuery, (snapshot) => {
        messages = [];
        snapshot.forEach((childSnapshot) => {
            const msg = childSnapshot.val();
            msg.id = childSnapshot.key;
            messages.push(msg);
        });
        messages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        updateMessages();
    });
}

function updateMessages() {
    const container = document.getElementById('messagesContainer');
    if (container) {
        container.innerHTML = messages.map(msg => renderMessage(msg)).join('');
        scrollToBottom();
    }
}

function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

async function handleSendMessage(event) {
    event.preventDefault();
    const input = document.getElementById('messageInput');
    const newMessage = input.value.trim();
    if (!newMessage) return;

    try {
        const messagesRef = ref(database, 'messages');
        await push(messagesRef, {
            room: roomID,
            chat: newMessage,
            createdAt: dbServerTimestamp(),
            user: currentStaff?.name || currentStaff?.userName || currentStaff?.fullName || 'Giảng viên',
            roomCreator: currentStaff?.name || currentStaff?.gmail || currentStaff?.email || 'unknown',
            photoURL: getAvatarUrl(currentStaff) || '',
            uid: uid,
        });
        input.value = '';
    } catch (error) {
        console.log('Error sending message: ' + error);
    }
}

function joinAnotherRoom() {
    roomID = null;
    if (unsubscribeMessages) {
        unsubscribeMessages();
        unsubscribeMessages = null;
    }
    messages = [];
    showToast('Current room was logout', 'success');
    renderJoin();
}

window.onload = function() {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        renderAuth();
        return;
    }

    try {
        currentStaff = JSON.parse(storedUser);
        uid = currentStaff?.id || null;
        if (roomID) {
            renderChat();
        } else {
            renderJoin();
        }
    } catch (error) {
        console.error('Error loading staff account:', error);
        renderAuth();
    }
};