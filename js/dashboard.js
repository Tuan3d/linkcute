document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in, if not, redirect to login
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // References
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const totalLinksEl = document.getElementById('totalLinks');
    const totalClicksEl = document.getElementById('totalClicks');
    const totalEarningsEl = document.getElementById('totalEarnings');
    const recentLinksTableEl = document.getElementById('recentLinksTable');
    const userControlsEl = document.getElementById('userControls');

    // Update UI with user info
    function updateUserInfo() {
        if (user.name) {
            userNameEl.textContent = user.name;
        } else {
            userNameEl.textContent = 'Người dùng';
        }
        userEmailEl.textContent = user.email;

        // Update user controls in navbar
        userControlsEl.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user me-1"></i> ${user.email}
                </button>
                <ul class="dropdown-menu" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="dashboard.html"><i class="fas fa-tachometer-alt me-1"></i> Dashboard</a></li>
                    <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-1"></i> Cài đặt</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt me-1"></i> Đăng xuất</a></li>
                </ul>
            </div>
        `;

        // Add logout event listener
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }

    // Load and display user links
    function loadUserLinks() {
        const shortenedUrls = JSON.parse(localStorage.getItem('shortenedUrls')) || [];
        
        // Update stats
        totalLinksEl.textContent = shortenedUrls.length;
        
        let totalClicks = 0;
        shortenedUrls.forEach(url => {
            totalClicks += url.clicks || 0;
        });
        totalClicksEl.textContent = totalClicks;
        
        // Calculate estimated earnings ($0.005 per click)
        const earnings = totalClicks * 0.005;
        totalEarningsEl.textContent = '$' + earnings.toFixed(2);
        
        // Display recent links (most recent first)
        if (shortenedUrls.length > 0) {
            // Remove no links message
            const noLinksRow = recentLinksTableEl.querySelector('.no-links-row');
            if (noLinksRow) {
                noLinksRow.remove();
            }
            
            // Sort by date (newest first)
            shortenedUrls.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Display up to 5 most recent links
            const recentUrls = shortenedUrls.slice(0, 5);
            
            recentUrls.forEach(url => {
                const row = document.createElement('tr');
                
                // Format the date
                const date = new Date(url.date);
                const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                
                // Truncate long URLs
                const truncatedLongUrl = truncateUrl(url.long, 40);
                
                row.innerHTML = `
                    <td title="${url.long}">
                        <a href="${url.long}" target="_blank" class="text-truncate d-inline-block" style="max-width: 200px;">${truncatedLongUrl}</a>
                    </td>
                    <td>
                        <a href="${url.short}" target="_blank" class="badge bg-primary text-white text-decoration-none">
                            ${url.short.split('/').pop()}
                        </a>
                    </td>
                    <td>${url.clicks || 0}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <button class="action-btn copy-btn" data-url="${url.short}" title="Sao chép link">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn qr-btn" data-url="${url.short}" title="Tạo QR code">
                            <i class="fas fa-qrcode"></i>
                        </button>
                        <button class="action-btn delete-btn" data-url="${url.short}" title="Xóa">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                
                recentLinksTableEl.appendChild(row);
            });
            
            // Add event listeners to action buttons
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const url = this.getAttribute('data-url');
                    copyToClipboard(url);
                });
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const url = this.getAttribute('data-url');
                    deleteShortUrl(url);
                });
            });
        }
    }

    // Initialize chart
    function initChart() {
        const ctx = document.getElementById('clicksChart').getContext('2d');
        
        // Generate sample data for the past 7 days
        const labels = [];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
            
            // Random data for demo
            data.push(Math.floor(Math.random() * 50));
        }
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lượt click',
                    data: data,
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderColor: 'rgba(67, 97, 238, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgba(67, 97, 238, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: 10,
                        bodyFont: {
                            size: 14
                        },
                        titleFont: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Helper Functions
    function truncateUrl(url, maxLength) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    }
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showToast('Đã sao chép link vào clipboard!', 'success');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                showToast('Không thể sao chép link!', 'danger');
            });
    }
    
    function deleteShortUrl(shortUrl) {
        // Confirm before deleting
        if (confirm('Bạn có chắc chắn muốn xóa link này?')) {
            let urls = JSON.parse(localStorage.getItem('shortenedUrls')) || [];
            urls = urls.filter(item => item.short !== shortUrl);
            localStorage.setItem('shortenedUrls', JSON.stringify(urls));
            
            // Reload the page to refresh the data
            location.reload();
        }
    }
    
    function showToast(message, type) {
        // Create toast element
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Add to container
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '5';
        toastContainer.appendChild(toastEl);
        document.body.appendChild(toastContainer);
        
        // Initialize and show toast
        const toast = new bootstrap.Toast(toastEl, {
            autohide: true,
            delay: 3000
        });
        toast.show();
        
        // Remove from DOM after hiding
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastContainer.remove();
        });
    }

    // Initialize dashboard
    updateUserInfo();
    loadUserLinks();
    initChart();
}); 