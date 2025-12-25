import { tags } from './tags';
import { schemas } from './schemas';
import { paths } from './paths';

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backlog API',
      version: '1.0.0',
      description: `
# 🚀 Backlog API Documentation

Система для сбора и анализа проблем пользователей с помощью AI-агента.

## Основные возможности:
- **Чат с AI-агентом** - автоматический анализ проблем пользователей
- **Интеллектуальная классификация** - баги, вопросы, улучшения
- **Автоматический бэклог** - создание задач на основе анализа
- **Админ-панель** - управление сессиями и задачами

## Авторизация
Используйте JWT Bearer токены. Получите тестовые токены: \`GET /api/tokens\`

### Тестовые токены:
- **Consumer** - для чат-функционала
- **Admin** - для админ-панели

## Быстрый старт:
1. **Получите токены:** \`GET /api/tokens\`
2. **Создайте сессию:** \`POST /api/v1/chat/sessions\`
3. **Отправьте сообщение:** \`POST /api/v1/chat/messages\`
4. **Проверьте историю:** \`GET /api/v1/chat/sessions/{id}\`

## Для администраторов:
- Просмотр всех сессий: \`GET /api/v1/admin/sessions\`
- Просмотр задач бэклога: \`GET /api/v1/admin/backlog\`
- Системные метрики: \`GET /api/v1/admin/metrics\`
      `,
      contact: {
        name: 'Backlog Team',
      },
      license: {
        name: 'MIT',
      },
    },
    externalDocs: {
      description: 'GitHub Repository',
      url: 'https://github.com/axizzy19/widget',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.yourdomain.com',
        description: 'Production server',
      },
    ],
    tags: tags,
    paths: paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Введите JWT токен с префиксом "Bearer "',
        },
      },
      schemas: schemas,
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [], 
};