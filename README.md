# Інформаційно-пошукова система центру НТІ та патентів

Сучасна веб-система для управління науково-технічною інформацією та патентами.

## Технології

### Backend
- Node.js + Express.js
- Sequelize ORM + SQLite
- REST API

### Frontend
- React 18
- React Router v6
- Axios
- Chart.js
- Tailwind CSS

## Встановлення

```bash
# Встановлення залежностей сервера
npm install

# Встановлення залежностей клієнта
cd client && npm install

# Ініціалізація бази даних
npm run seed

# Запуск у режимі розробки
npm run dev
```

## API Endpoints

### Патенти
- `GET /api/patents` - Список патентів
- `GET /api/patents/:id` - Деталі патенту
- `POST /api/patents` - Створення патенту
- `PUT /api/patents/:id` - Оновлення патенту
- `DELETE /api/patents/:id` - Видалення патенту

### Документи
- `GET /api/documents` - Список документів
- `GET /api/documents/:id` - Деталі документа
- `POST /api/documents` - Створення документа
- `PUT /api/documents/:id` - Оновлення документа
- `DELETE /api/documents/:id` - Видалення документа

### Автори
- `GET /api/authors` - Список авторів
- `GET /api/authors/:id` - Деталі автора
- `POST /api/authors` - Створення автора
- `PUT /api/authors/:id` - Оновлення автора
- `DELETE /api/authors/:id` - Видалення автора

### Категорії
- `GET /api/categories` - Список категорій
- `POST /api/categories` - Створення категорії

### Пошук
- `GET /api/search` - Глобальний пошук
- `GET /api/search/advanced` - Розширений пошук

### Статистика
- `GET /api/stats` - Загальна статистика
- `GET /api/stats/trends` - Тренди
- `GET /api/stats/analytics` - Аналітика

## Структура проекту

```
nti-patents-system/
├── server/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── seeders/
│   └── index.js
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.js
│   └── package.json
└── package.json
```
