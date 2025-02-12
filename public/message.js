const Message = {
    container: null,
    
    init() {
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(this.container);
    },

    show(text, type = 'info') {
        if (!this.container) this.init();
        
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            padding: 10px 20px;
            margin-bottom: 10px;
            border-radius: 4px;
            color: white;
            background: rgba(0, 0, 0, 0.7);
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
        `;
        messageEl.textContent = text;
        
        this.container.appendChild(messageEl);
        
        // 触发动画
        setTimeout(() => messageEl.style.transform = 'translateX(0)', 10);
        
        // 2秒后消失
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => messageEl.remove(), 300);
        }, 2000);
    }
}; 