export default class NotificationService {
    static notifications = [];
    static notify(notification) {
        NotificationService.notifications.push(notification);
        document.body.querySelector('main')?.insertAdjacentElement('afterbegin', notification);
        NotificationService.notificationLifeCycle(notification);
    }
    static notificationLifeCycle(notification) {
        NotificationService.rearrangeNotifications();
        notification.addEventListener('notification-removed', _ => {
            NotificationService.notifications = NotificationService.notifications.filter(n => n !== notification);
            NotificationService.rearrangeNotifications();
        });
    }
    static rearrangeNotifications() {
        NotificationService.notifications.forEach((notification, index) => {
            notification.rearrange(index);
        });
    }
}
