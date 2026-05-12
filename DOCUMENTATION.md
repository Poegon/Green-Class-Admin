# Green Class Admin - Documentation Kỹ Thuật

## 📋 Tổng Quan

**Green Class Admin** là hệ thống quản lý học tập trực tuyến được xây dựng với kiến trúc:
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: MockAPI (REST API)
- **UI Framework**: Custom CSS với responsive design
- **Data Visualization**: Chart.js

---

## 🏗️ Kiến Trúc Project

```
Green-Class-Admin/
├── index.html                 # Dashboard chính
├── style/                     # Global styles
│   └── style.css
├── page/                      # Các trang quản lý
│   ├── users/               # Quản lý người dùng
│   ├── sources/             # Quản lý khóa học
│   ├── schedule/            # Quản lý lịch học
│   ├── staffs/              # Quản lý giảng viên
│   └── word/                # Flashcard System
└── staff_page/              # Giao diện giảng viên
```

---

## 🔐 Authentication & Authorization

### MockAPI Endpoints
- **Users API**: `https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/users`
- **Sources API**: `https://681eeb44c1c291fa66357959.mockapi.io/api/v2/greenclass/sourses`
- **Staff API**: `https://65bf081adcfcce42a6f31afe.mockapi.io/api/v1/greenclass/staffs`
- **Words API**: `https://682dcaf54fae1889475791ed.mockapi.io/api/v2/speaklearn/word`

### Data Models

#### User Model
```javascript
{
  id: string,
  userName: string,
  password: string,
  sourcesId: string[]  // Array of course IDs
}
```

#### Source/Course Model
```javascript
{
  id: string,
  title: string,
  description: string,
  category: string,
  cost: number,
  image: string,
  createdAt: string
}
```

#### Staff Model
```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  specialization: string
}
```

#### Flashcard Model
```javascript
{
  id: string,
  title: string,
  front: string,        // Câu hỏi/từ vựng
  back: string,         // Đáp án/giải thích
  tags: string[],       // Tags để phân loại
  createdAt: string
}
```

---

## 📊 Dashboard (index.html)

### Chức Năng Chính

#### 1. Thống Kê Tổng Quan
- **Tổng khóa học**: Đếm số lượng courses từ API
- **Tổng giảng viên**: Đếm số lượng staff từ API  
- **Tổng người dùng**: Đếm số lượng users từ API
- **Doanh thu ước tính**: Tính tổng cost của các courses user đã đăng ký

#### 2. Top 10 Khóa Học Phổ Biến
```javascript
// Logic thống kê
const courseCountMap = new Map();
users.forEach(user => {
    user.sourcesId?.forEach(sourceId => {
        courseCountMap.set(sourceId, (courseCountMap.get(sourceId) || 0) + 1);
    });
});

// Sắp xếp và lấy top 10
const topCourses = [...courseCountMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
```

#### 3. Biểu Đồ Tròn Doughnut
- **Chart.js**: Vẽ biểu đồ thống kê theo category
- **Categories**: Phân loại khóa học (Programming, Design, Business...)
- **Responsive**: Tự động điều chỉnh kích thước

---

## 👥 User Management (page/users/)

### Features
- **Danh sách users**: Hiển thị tất cả người dùng
- **Thông tin chi tiết**: ID, Tên, Password, Courses đã đăng ký
- **Link chi tiết**: Click vào username để xem detail
- **Pagination**: Tự động phân trang khi nhiều users

### Data Flow
```javascript
// Fetch users từ API
fetch(usersApi)
    .then(res => res.json())
    .then(users => {
        // Render table
        users.forEach(user => {
            // Tạo row cho mỗi user
            // Hiển thị sourcesId.join(', ')
        });
    });
```

---

## 📚 Source Management (page/sources/)

### Features
- **Thống kê khóa học**: List view với statistics
- **Biểu đồ cột**: Visualize số lượng đăng ký theo course
- **CRUD Operations**: Thêm, sửa, xóa khóa học
- **Category filter**: Lọc theo chuyên mục
- **Image upload**: Hỗ trợ ảnh course

### Chart Integration
```javascript
// Cấu hình Chart.js cho biểu đồ cột
const barChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: courseNames,
        datasets: [{
            label: 'Số lượt đăng ký',
            data: registrationCounts,
            backgroundColor: '#36A2EB'
        }]
    }
});
```

---

## 📅 Schedule Management (page/schedule/)

### Features
- **Lịch học theo tuần**: Grid view 7 ngày
- **Time slots**: Theo khung giờ (8:00-20:00)
- **Staff assignment**: Phân công giảng viên
- **Course mapping**: Liên kết với khóa học
- **Conflict detection**: Cảnh báo trùng lịch

### Data Structure
```javascript
{
  id: string,
  dayOfWeek: number,     // 0-6 (Chủ Nhật -> Thứ Bảy)
  timeSlot: string,      // "8:00-9:00", "9:00-10:00"...
  courseId: string,      // ID khóa học
  staffId: string,       // ID giảng viên
  room: string          // Phòng học
}
```

---

## 🧑‍🏫 Staff Management (page/staffs/)

### Features
- **Danh sách giảng viên**: Table view với thông tin chi tiết
- **Profile management**: Thêm, sửa, xóa giảng viên
- **Specialization**: Phân loại theo chuyên môn
- **Contact info**: Email, phone, address
- **Schedule integration**: Liên kết với lịch dạy

---

## 📇 Flashcard System (page/word/)

### Architecture
- **Modern UI**: Responsive design với animations
- **Study Mode**: Full-screen flashcard learning
- **Tag System**: Phân loại theo chủ đề
- **Search & Filter**: Tìm kiếm và lọc nhanh
- **Import/Export**: JSON format backup

### Core Components

#### 1. Flashcard Creation
```javascript
// Form validation
function saveFlashcard() {
    const title = document.getElementById('flashcardTitle').value.trim();
    const front = document.getElementById('flashcardFront').value.trim();
    const back = document.getElementById('flashcardBack').value.trim();
    
    if (!title || !front || !back) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // POST to API
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, front, back, tags })
    });
}
```

#### 2. Study Mode
- **3D Flip Animation**: CSS transform rotateY
- **Keyboard Navigation**: Arrow keys, spacebar
- **Progress Tracking**: Hiển thị X/Y cards
- **Shuffle Mode**: Random order cho learning

#### 3. Search & Filter System
```javascript
// Multi-criteria search
function searchFlashcards() {
    const searchTerm = currentSearchTerm.toLowerCase();
    return flashcards.filter(card => 
        card.title.toLowerCase().includes(searchTerm) || 
        card.front.toLowerCase().includes(searchTerm) || 
        card.back.toLowerCase().includes(searchTerm) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
}
```

---

## 🎨 UI/UX Design System

### CSS Architecture
```css
/* Global variables */
:root {
    --primary: #2c5282;
    --secondary: #2d3748;
    --success: #48bb78;
    --danger: #f56565;
    --warning: #ed8936;
    --border-radius: 8px;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive breakpoints */
@media (max-width: 768px) { /* Mobile */ }
@media (max-width: 1024px) { /* Tablet */ }
@media (min-width: 1025px) { /* Desktop */ }
```

### Components
- **Sidebar**: Fixed navigation (220px width)
- **Dashboard Box**: White container with shadow
- **Buttons**: Multiple variants (primary, outline, danger)
- **Forms**: Consistent styling & validation
- **Tables**: Responsive với hover effects
- **Modals**: Overlay với backdrop blur

---

## 🔧 Technical Implementation

### JavaScript Patterns
- **ES6+ Features**: Arrow functions, async/await, destructuring
- **DOM Manipulation**: Vanilla JS (no jQuery dependency)
- **API Integration**: Fetch API với error handling
- **Event Delegation**: Efficient event listeners
- **Local Storage**: Cache cho performance

### Performance Optimizations
```javascript
// Debounce search
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

// Lazy loading images
const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
        if (img.getBoundingClientRect().top < window.innerHeight) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    });
};
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (Single column, stacked layout)
- **Tablet**: 768px - 1024px (Adjusted grid)
- **Desktop**: > 1024px (Full multi-column layout)

### Mobile Optimizations
- **Touch-friendly**: Larger tap targets (44px minimum)
- **Hamburger menu**: Collapsible sidebar on mobile
- **Swipe gestures**: Touch navigation cho flashcards
- **Viewport meta**: Proper scaling on devices

---

## 🔒 Security Considerations

### Current Implementation
- **Input Validation**: Client-side validation
- **XSS Prevention**: Text content escaping
- **API Security**: HTTPS endpoints
- **Data Sanitization**: Clean user inputs

### Recommendations
- **Authentication**: JWT token-based auth
- **Role-based Access**: Admin/Staff/Student roles
- **Rate Limiting**: API request throttling
- **CORS Configuration**: Proper cross-origin setup

---

## 🚀 Deployment & DevOps

### File Structure
```
Production/
├── index.html              # Entry point
├── static/                 # Static assets
│   ├── css/
│   ├── js/
│   └── images/
└── api/                   # Backend endpoints
```

### Environment Variables
```javascript
const config = {
    development: {
        apiBaseUrl: 'https://mockapi.io/...',
        enableDebug: true
    },
    production: {
        apiBaseUrl: 'https://api.greenclass.com/',
        enableDebug: false
    }
};
```

---

## 🔄 Data Flow Architecture

### Request Flow
1. **User Action** → JavaScript Event Handler
2. **Validation** → Form validation & sanitization
3. **API Call** → Fetch request với proper headers
4. **Response Handling** → Success/error states
5. **UI Update** → DOM manipulation & user feedback

### State Management
- **Global State**: Window object cho shared data
- **Local State**: Component-level state management
- **Persistent State**: LocalStorage cho user preferences
- **API State**: Cached responses cho performance

---

## 🐛 Debugging & Testing

### Console Logging
```javascript
// Structured logging
const logger = {
    info: (message, data) => console.log(`ℹ️ ${message}`, data),
    error: (message, error) => console.error(`❌ ${message}`, error),
    warn: (message, data) => console.warn(`⚠️ ${message}`, data)
};
```

### Error Handling
- **Try-Catch Blocks**: Wrap API calls
- **User Feedback**: Toast notifications cho errors
- **Fallback States**: Default values khi data missing
- **Network Error**: Retry mechanism với exponential backoff

---

## 📈 Future Enhancements

### Phase 1: Authentication
- Login/logout system
- Role-based permissions
- Session management
- Password reset

### Phase 2: Advanced Features
- Real-time notifications
- File upload system
- Advanced reporting
- Email integration

### Phase 3: Performance
- Progressive Web App
- Service worker caching
- Image optimization
- Bundle size reduction

---

## 📞 Support & Maintenance

### Common Issues & Solutions
1. **API Timeout**: Increase timeout duration
2. **CORS Errors**: Check server headers
3. **Mobile Layout**: Test on real devices
4. **Browser Compatibility**: Polyfills cho older browsers

### Monitoring
- **Error Tracking**: Console error logging
- **Performance Metrics**: Load time monitoring
- **User Analytics**: Feature usage tracking
- **API Health**: Endpoint monitoring

---

## 👥 Team Development Guidelines

### Code Standards
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Git Flow**: Feature branch workflow
- **Code Review**: Pull request process

### File Naming
- **HTML**: kebab-case.html
- **CSS**: kebab-case.css  
- **JS**: kebab-case.js
- **Components**: PascalCase cho component names

---

*Documentation last updated: May 2026*
*Version: 1.0.0*
*Author: Green Class Development Team*
