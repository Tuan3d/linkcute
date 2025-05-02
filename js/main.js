document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const domain = 'linkcute.net';
    const apiPrefix = 'lc-';

    // DOM Elements
    const longUrlInput = document.getElementById('longUrl');
    const shortenBtn = document.getElementById('shortenBtn');
    const shortenedUrlBox = document.getElementById('shortenedUrlBox');
    const shortenedUrlSpan = document.getElementById('shortenedUrl');
    const copyBtn = document.getElementById('copyBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Event listeners
    if (shortenBtn) {
        shortenBtn.addEventListener('click', shortenUrl);
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', copyToClipboard);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Functions
    function shortenUrl() {
        const longUrl = longUrlInput.value.trim();
        
        if (!longUrl) {
            showAlert('Vui lòng nhập URL cần rút gọn', 'danger');
            return;
        }
        
        if (!isValidUrl(longUrl)) {
            showAlert('URL không hợp lệ. Vui lòng kiểm tra lại', 'danger');
            return;
        }
        
        // Simulation: In a real app, this would be an API call
        // Here we're just generating a random short code
        const shortCode = generateShortCode();
        const shortenedUrl = `https://${domain}/${apiPrefix}${shortCode}`;
        
        // Display the shortened URL
        shortenedUrlSpan.textContent = shortenedUrl;
        shortenedUrlBox.classList.remove('d-none');
        
        // Save to localStorage for demo purposes
        saveShortUrl(longUrl, shortenedUrl);
    }
    
    function copyToClipboard() {
        const shortenedUrl = shortenedUrlSpan.textContent;
        
        navigator.clipboard.writeText(shortenedUrl)
            .then(() => {
                // Change button text temporarily
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Đã sao chép!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                showAlert('Không thể sao chép liên kết. Vui lòng thử lại.', 'danger');
            });
    }
    
    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Basic validation
        if (!email || !password) {
            showAlert('Vui lòng điền đầy đủ thông tin đăng nhập', 'danger');
            return;
        }
        
        // Simulating login - in real app this would be an API call
        setTimeout(() => {
            // Store user information in localStorage for demo
            localStorage.setItem('user', JSON.stringify({ email }));
            
            // Close modal
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
            
            // Show success message
            showAlert('Đăng nhập thành công!', 'success');
            
            // Update UI based on logged-in state
            updateUIForLoggedInUser(email);
        }, 1000);
    }
    
    function handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            showAlert('Vui lòng điền đầy đủ thông tin đăng ký', 'danger');
            return;
        }
        
        if (password !== confirmPassword) {
            showAlert('Mật khẩu xác nhận không khớp', 'danger');
            return;
        }
        
        // Simulating registration - in real app this would be an API call
        setTimeout(() => {
            // Store user in localStorage for demo
            localStorage.setItem('user', JSON.stringify({ name, email }));
            
            // Close modal
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            registerModal.hide();
            
            // Show success message
            showAlert('Đăng ký thành công! Chào mừng bạn đến với LinkCute.', 'success');
            
            // Update UI based on logged-in state
            updateUIForLoggedInUser(email);
        }, 1000);
    }
    
    // Helper functions
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    function generateShortCode(length = 6) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    function saveShortUrl(longUrl, shortUrl) {
        let urls = JSON.parse(localStorage.getItem('shortenedUrls')) || [];
        urls.push({
            long: longUrl,
            short: shortUrl,
            date: new Date().toISOString(),
            clicks: 0
        });
        localStorage.setItem('shortenedUrls', JSON.stringify(urls));
    }
    
    function showAlert(message, type) {
        // Create alert element
        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${type} alert-dismissible fade show`;
        alertEl.setAttribute('role', 'alert');
        alertEl.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Find place to display the alert
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alertEl, container.firstChild);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                alertEl.remove();
            }, 5000);
        }
    }
    
    function updateUIForLoggedInUser(email) {
        // In a real app, you'd update the UI to show user's logged-in state
        console.log(`UI updated for logged-in user: ${email}`);
        
        // For example, you might update the navbar buttons
        const navbarButtons = document.querySelector('.navbar .d-flex');
        if (navbarButtons) {
            navbarButtons.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-user me-1"></i> ${email}
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="userDropdown">
                        <li><a class="dropdown-item" href="#"><i class="fas fa-tachometer-alt me-1"></i> Dashboard</a></li>
                        <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-1"></i> Cài đặt</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt me-1"></i> Đăng xuất</a></li>
                    </ul>
                </div>
            `;
            
            // Add logout event listener
            document.getElementById('logoutBtn').addEventListener('click', function() {
                localStorage.removeItem('user');
                location.reload();
            });
        }
    }

    // Check if user is already logged in (demo only)
    function initializeApp() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.email) {
            updateUIForLoggedInUser(user.email);
        }
    }
    
    // Initialize the app
    initializeApp();
}); 