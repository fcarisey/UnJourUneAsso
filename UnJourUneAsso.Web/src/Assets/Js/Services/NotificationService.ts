import NotificationHTMLElement from "../Components/NotificationHTMLElement.js";

export default class NotificationService{
    private static notifications : NotificationHTMLElement[] = [];

    static notify (notification : NotificationHTMLElement) : void {
        NotificationService.notifications.push(notification);
        document.body.querySelector('main')?.insertAdjacentElement('afterbegin', notification);
        NotificationService.notificationLifeCycle(notification);
    }

    private static notificationLifeCycle (notification : NotificationHTMLElement) : void {
        NotificationService.rearrangeNotifications();
        notification.addEventListener('notification-removed', _ => {
            NotificationService.notifications = NotificationService.notifications.filter(
                n => n !== notification
            );
            NotificationService.rearrangeNotifications();
        });
    }

    private static rearrangeNotifications (): void {
        NotificationService.notifications.forEach((notification, index) => {
            notification.rearrange(index);
        });
    }
}
