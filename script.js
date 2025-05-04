document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // Xử lý gửi tin nhắn
    function handleSend() {
        const message = userInput.value.trim();
        if (message === '') return;

        // Hiển thị tin nhắn người dùng
        addMessage(message, 'user');
        userInput.value = '';

        // Tìm kiếm thông tin
        searchAndGetBestResult(message);
    }

    // Tìm kiếm thông tin và lấy kết quả tốt nhất
    async function searchAndGetBestResult(query) {
        try {
            // Sử dụng DuckDuckGo thông qua CORS proxy
            const searchUrl = `https://corsproxy.io/?https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
            
            const response = await fetch(searchUrl);
            const html = await response.text();
            
            // Parse HTML kết quả
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Lấy kết quả đầu tiên
            const firstResult = doc.querySelector('.result');
            
            if (!firstResult) {
                addMessage('Tôi không tìm thấy thông tin phù hợp cho câu hỏi của bạn.', 'bot');
                return;
            }
            
            // Lấy URL của kết quả đầu tiên
            const urlElement = firstResult.querySelector('.result__url');
            const titleElement = firstResult.querySelector('.result__title');
            const snippetElement = firstResult.querySelector('.result__snippet');
            
            if (!urlElement) {
                addMessage('Tôi không thể trích xuất thông tin từ kết quả tìm kiếm.', 'bot');
                return;
            }
            
            const url = urlElement.textContent.trim();
            const title = titleElement ? titleElement.textContent.trim() : '';
            const snippet = snippetElement ? snippetElement.textContent.trim() : '';
            
            // Truy cập nội dung của trang web đầu tiên
            const contentUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            
            try {
                const contentResponse = await fetch(contentUrl);
                const contentText = await contentResponse.text();
                
                // Parse HTML nội dung
                const contentDoc = parser.parseFromString(contentText, 'text/html');
                
                // Loại bỏ script, style, header, footer
                contentDoc.querySelectorAll('script, style, header, footer, nav, .nav, .header, .footer, .ad').forEach(el => {
                    el.remove();
                });
                
                // Lấy nội dung chính
                const mainContent = extractMainContent(contentDoc, query);
                
                if (mainContent) {
                    // Trả về nội dung đã trích xuất
                    addMessage(mainContent, 'bot');
                } else {
                    // Nếu không trích xuất được nội dung, trả về snippet
                    addMessage(snippet, 'bot');
                }
            } catch (error) {
                // Nếu không thể truy cập URL, trả về snippet
                addMessage(snippet, 'bot');
            }
        } catch (error) {
            console.error('Lỗi tìm kiếm:', error);
            addMessage('Tôi gặp lỗi khi tìm kiếm thông tin. Vui lòng thử lại sau.', 'bot');
        }
    }

    // Trích xuất nội dung chính từ trang web
    function extractMainContent(doc, query) {
        // Danh sách các thẻ có thể chứa nội dung chính
        const contentSelectors = [
            'article', '.article', '.post', '.content', 'main', '#main', '.main', 
            '.entry-content', '.post-content', '.article-content', '.page-content'
        ];
        
        // Tìm thẻ chứa nội dung chính
        let mainElement = null;
        
        for (const selector of contentSelectors) {
            const element = doc.querySelector(selector);
            if (element && element.textContent.trim().length > 100) {
                mainElement = element;
                break;
            }
        }
        
        // Nếu không tìm thấy thẻ đặc biệt, tìm trong body
        if (!mainElement) {
            mainElement = doc.body;
        }
        
        // Lấy tất cả các đoạn văn trong phần nội dung chính
        const paragraphs = mainElement.querySelectorAll('p');
        const relevantParagraphs = [];
        
        // Kiểm tra độ liên quan của từng đoạn
        const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
        
        paragraphs.forEach(p => {
            const text = p.textContent.trim();
            if (text.length < 20) return; // Bỏ qua đoạn quá ngắn
            
            let relevance = 0;
            const lowerText = text.toLowerCase();
            
            // Tính điểm liên quan dựa trên số từ khóa xuất hiện
            keywords.forEach(keyword => {
                if (lowerText.includes(keyword)) {
                    relevance += 1;
                }
            });
            
            if (relevance > 0 || text.length > 100) {
                relevantParagraphs.push({
                    text: text,
                    relevance: relevance
                });
            }
        });
        
        // Sắp xếp đoạn văn theo độ liên quan
        relevantParagraphs.sort((a, b) => b.relevance - a.relevance);
        
        // Lấy tối đa 3 đoạn văn liên quan nhất
        const bestParagraphs = relevantParagraphs.slice(0, 3);
        
        if (bestParagraphs.length === 0) return null;
        
        return bestParagraphs.map(p => p.text).join('\n\n');
    }

    // Thêm tin nhắn vào khung chat
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const messageText = document.createElement('p');
        messageText.textContent = content;
        
        messageContent.appendChild(messageText);
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Cuộn xuống tin nhắn cuối cùng
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Event listeners
    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
    
    // Focus vào input khi trang load
    userInput.focus();
}); 