# АвтоПомощник - Мобильное приложение

Android-приложение для учёта автомобилей, сервисного обслуживания и расходов.

## Функциональность

- **Авторизация** — регистрация и вход
- **Гараж** — добавление и просмотр автомобилей
- **Детали авто** — пробег, статистика расходов, история ТО
- **Расходы** — учёт заправок и других трат
- **Сервисная книжка** — записи о ТО и ремонтах
- **Напоминания** — по дате и пробегу с push-уведомлениями

## Запуск

### 1. Установка зависимостей

```bash
cd mobile
npm install
```

### 2. Настройка API

Отредактируйте файл `config.js`:

```javascript
// Для эмулятора Android:
export const API_URL = 'http://10.0.2.2:3000/api';

// Для реального устройства (замените на IP вашего компьютера):
export const API_URL = 'http://192.168.x.x:3000/api';
```

Узнать IP компьютера: `ipconfig` (Windows) или `ifconfig` (Mac/Linux)

### 3. Запуск сервера

Убедитесь, что backend-сервер запущен:

```bash
cd ../server
npm run dev
```

### 4. Запуск приложения

```bash
# Expo Go (для быстрого тестирования)
npx expo start

# Только Android
npx expo start --android
```

### 5. Тестирование

**На эмуляторе:**
- Установите Android Studio с эмулятором
- Запустите эмулятор
- Нажмите `a` в терминале Expo

**На реальном устройстве:**
- Установите Expo Go из Google Play
- Отсканируйте QR-код из терминала
- Устройство должно быть в одной сети с компьютером

## Сборка APK

```bash
# Установка EAS CLI
npm install -g eas-cli

# Авторизация
eas login

# Сборка APK для тестирования
eas build --platform android --profile preview
```

## Структура проекта

```
mobile/
├── App.js                 # Главный компонент, навигация
├── config.js              # Настройки API
├── package.json
├── app.json               # Конфигурация Expo
├── assets/                # Иконки и изображения
├── screens/
│   ├── LoginScreen.js     # Экран входа
│   ├── RegisterScreen.js  # Экран регистрации
│   ├── HomeScreen.js      # Главный экран
│   ├── GarageScreen.js    # Список автомобилей
│   ├── CarDetailScreen.js # Детали автомобиля
│   ├── RemindersScreen.js # Напоминания
│   ├── AddCarScreen.js    # Добавление авто
│   ├── AddExpenseScreen.js    # Добавление расхода
│   ├── AddServiceScreen.js    # Добавление записи ТО
│   └── AddReminderScreen.js   # Создание напоминания
└── services/
    └── NotificationService.js # Push-уведомления
```

## Замена иконок

Замените placeholder-файлы в папке `assets/`:
- `icon.png` — иконка приложения (1024x1024)
- `adaptive-icon.png` — adaptive icon для Android (1024x1024)
- `splash.png` — экран загрузки (1242x2436)
- `notification-icon.png` — иконка уведомлений (96x96, белая на прозрачном)

## Отладка

```bash
# Просмотр логов
npx expo start --dev-client

# Сброс кэша
npx expo start --clear
```
