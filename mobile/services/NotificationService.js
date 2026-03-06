import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Конфигурация обработки уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  // Запрос разрешений на уведомления
  async requestPermissions() {
    if (!Device.isDevice) {
      console.log('Уведомления работают только на реальном устройстве');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Разрешение на уведомления не получено');
      return false;
    }

    return true;
  }

  // Получение push-токена для Expo Push Service
  async getPushToken() {
    try {
      if (!Device.isDevice) {
        return null;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Заменить на реальный projectId из app.json
      });

      return token.data;
    } catch (error) {
      console.error('Ошибка получения push token:', error);
      return null;
    }
  }

  // Настройка канала уведомлений для Android
  async setupNotificationChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Напоминания',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563eb',
        sound: 'default',
      });
    }
  }

  // Планирование локального уведомления
  async scheduleReminder(reminder) {
    if (reminder.is_completed || reminder.reminder_type !== 'date' || !reminder.due_date) {
      return null;
    }

    const dueDate = new Date(reminder.due_date);
    const now = new Date();

    // Устанавливаем время уведомления на 9:00 утра дня напоминания
    dueDate.setHours(9, 0, 0, 0);

    // Не планируем уведомления для прошедших дат
    if (dueDate <= now) {
      return null;
    }

    try {
      // Сначала отменяем старое уведомление для этого напоминания
      await this.cancelReminder(reminder.id);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚗 Напоминание',
          body: `${reminder.title}${reminder.brand_name ? ` - ${reminder.brand_name} ${reminder.model_name || ''}` : ''}`,
          data: { reminderId: reminder.id, type: 'reminder' },
          sound: 'default',
        },
        trigger: {
          date: dueDate,
          channelId: 'reminders',
        },
      });

      console.log(`Уведомление запланировано: ${notificationId} на ${dueDate}`);
      return notificationId;
    } catch (error) {
      console.error('Ошибка планирования уведомления:', error);
      return null;
    }
  }

  // Планирование напоминания за N дней до события
  async scheduleAdvanceReminder(reminder, daysBefore = 3) {
    if (reminder.is_completed || reminder.reminder_type !== 'date' || !reminder.due_date) {
      return null;
    }

    const dueDate = new Date(reminder.due_date);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);
    reminderDate.setHours(9, 0, 0, 0);

    const now = new Date();

    if (reminderDate <= now) {
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Скоро напоминание',
          body: `Через ${daysBefore} дн.: ${reminder.title}`,
          data: { reminderId: reminder.id, type: 'advance_reminder' },
          sound: 'default',
        },
        trigger: {
          date: reminderDate,
          channelId: 'reminders',
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Ошибка планирования предварительного уведомления:', error);
      return null;
    }
  }

  // Отмена уведомления по ID напоминания
  async cancelReminder(reminderId) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.reminderId === reminderId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Ошибка отмены уведомления:', error);
    }
  }

  // Отмена всех запланированных уведомлений
  async cancelAllReminders() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Ошибка отмены всех уведомлений:', error);
    }
  }

  // Синхронизация уведомлений с актуальными напоминаниями
  async syncReminders(reminders) {
    // Отменяем все старые уведомления
    await this.cancelAllReminders();

    // Планируем новые уведомления для активных напоминаний
    for (const reminder of reminders) {
      if (!reminder.is_completed && reminder.reminder_type === 'date') {
        await this.scheduleReminder(reminder);
        await this.scheduleAdvanceReminder(reminder, 3); // За 3 дня
      }
    }
  }

  // Получение списка запланированных уведомлений (для отладки)
  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Отправка тестового уведомления
  async sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Тест',
        body: 'Уведомления работают!',
        sound: 'default',
      },
      trigger: null, // Немедленно
    });
  }
}

export default new NotificationService();
