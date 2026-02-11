export default class NotificationHTMLElement extends HTMLElement {
    static observedAttributes = [
        'aria-message',
        'aria-timeout',
        'aria-success'
    ];
    constructor(success, message, timeout = 3000) {
        super();
        this.setAttribute('aria-success', success.toString());
        this.setAttribute('aria-message', message);
        this.setAttribute('aria-timeout', timeout.toString());
    }
    connectedCallback() {
        const try_success = this.getAttribute('aria-success');
        if (!try_success?.match("true|false")) {
            console.error("aria-success must be a boolean e.g: true or false !");
            this.remove();
            return;
        }
        if (!this.getAttribute('aria-timeout')) {
            this.setAttribute('aria-timeout', '3000');
        }
        const try_timeout = parseInt(this.getAttribute('aria-timeout'));
        if (isNaN(try_timeout)) {
            console.error("aria-timeout must be a number !");
            this.remove();
            return;
        }
        this.render();
        setTimeout(_ => {
            this.style.transition = 'all 0.3s ease';
            this.style.opacity = '0';
            this.style.transform = 'translateX(100%)';
            setTimeout(_ => {
                this.dispatchEvent(new Event('notification-removed'));
                this.remove();
            }, 300);
        }, try_timeout);
    }
    render() {
        this.classList.add('toast-notification');
        this.classList.add('position-fixed');
        this.classList.add('text-white');
        this.style.top = this.getBoundingClientRect().top + 20 + 'px';
        this.style.right = '20px';
        this.style.zIndex = '9999';
        this.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
        this.style.animation = "slideIn 0.3s ease";
        this.style.padding = '1rem 1.5rem';
        this.style.background = this.getAttribute('aria-success') === "true" ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #dc2626)";
        this.style.borderRadius = "0.75rem";
        this.textContent = this.getAttribute('aria-message');
    }
    rearrange(level = 1) {
        this.style.top = (this.getBoundingClientRect().height * level) + (10 * level) + 20 + 'px';
    }
}
customElements.define('notification-element', NotificationHTMLElement);
