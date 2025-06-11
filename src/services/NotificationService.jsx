import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

class NotificationService {
  static async requestPermissions() {
    try {
      if (Capacitor.isNativePlatform()) {
        // Mobile device logic
        const pushResult = await PushNotifications.requestPermissions();
        if (pushResult.receive === 'granted') {
          await PushNotifications.register();
          await LocalNotifications.requestPermissions();
          return true;
        }
      } else {
        // Web browser logic
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async showRideRequestNotification(request) {
    try {
      if (Capacitor.isNativePlatform()) {
        // Mobile device notification
        await LocalNotifications.schedule({
          notifications: [{
            title: request.isCarpool ? 'New Carpool Request!' : 'New Ride Request!',
            body: `${request.isCarpool ? 'Carpool' : 'Ride'} request from ${request.passengers[0].name}`,
            id: Date.now(),
            schedule: { at: new Date(Date.now()) },
            sound: 'notification.wav',
            extra: {
              requestId: Date.now().toString()
            }
          }]
        });
      } else {
        // Web browser notification
        const notification = new Notification(
          request.isCarpool ? 'New Carpool Request!' : 'New Ride Request!',
          {
            body: `${request.isCarpool ? 'Carpool' : 'Ride'} request from ${request.passengers[0].name}`,
            icon: '/path-to-your-icon.png', // Add an icon for your notifications
            tag: Date.now().toString()
          }
        );

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
}

export default NotificationService;