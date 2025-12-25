export const paths = {
  '/health': {
    get: {
      tags: ['System'],
      summary: 'Проверка здоровья сервера',
      description: 'Возвращает статус работы сервера и базы данных',
      responses: {
        200: {
          description: 'Сервер работает',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/HealthResponse',
              },
            },
          },
        },
      },
    },
  },

  '/api/tokens': {
    get: {
      tags: ['Auth'],
      summary: 'Получение тестовых JWT токенов',
      description: 'Возвращает consumer и admin токены для тестирования API',
      responses: {
        200: {
          description: 'Токены успешно получены',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TokensResponse',
              },
            },
          },
        },
      },
    },
  },

  '/api/v1/chat/sessions': {
    post: {
      tags: ['Chat'],
      summary: 'Создание новой чат-сессии',
      description: 'Создает новую сессию для общения с AI-агентом',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateSessionRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Сессия успешно создана',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SessionResponse',
              },
            },
          },
        },
        400: {
          description: 'Неверные данные запроса',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        401: {
          description: 'Неавторизован',
        },
      },
    },
  },

  '/api/v1/chat/messages': {
    post: {
      tags: ['Chat'],
      summary: 'Отправка сообщения в чат',
      description: 'Отправляет сообщение пользователя AI-агенту для анализа',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateMessageRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Сообщение успешно отправлено и обработано',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MessageResponse',
              },
            },
          },
        },
        400: {
          description: 'Неверные данные запроса',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        401: {
          description: 'Неавторизован',
        },
      },
    },
  },

  '/api/v1/chat/sessions/{sessionId}': {
    get: {
      tags: ['Chat'],
      summary: 'Получение истории чат-сессии',
      description: 'Возвращает все сообщения указанной сессии',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'sessionId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID чат-сессии',
        },
      ],
      responses: {
        200: {
          description: 'История сессии получена',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  messages: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        role: { type: 'string', enum: ['user', 'agent', 'system'] },
                        message: { type: 'string' },
                        created_at: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        404: {
          description: 'Сессия не найдена',
        },
      },
    },
  },

  '/api/v1/admin/sessions': {
    get: {
      tags: ['Admin'],
      summary: 'Получение всех чат-сессий',
      description: 'Возвращает список всех сессий (требуется admin токен)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'status',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['open', 'closed'],
          },
          description: 'Фильтр по статусу сессии',
        },
        {
          name: 'source',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['widget', 'agent', 'admin'],
          },
          description: 'Фильтр по источнику',
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            default: 50,
            minimum: 1,
            maximum: 100,
          },
          description: 'Количество записей',
        },
        {
          name: 'offset',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            default: 0,
            minimum: 0,
          },
          description: 'Смещение',
        },
      ],
      responses: {
        200: {
          description: 'Список сессий получен',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/SessionResponse',
                    },
                  },
                  meta: {
                    type: 'object',
                    properties: {
                      count: { type: 'number' },
                      limit: { type: 'number' },
                      offset: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Неавторизован',
        },
        403: {
          description: 'Нет прав (требуется admin)',
        },
      },
    },
  },

  '/api/v1/admin/backlog': {
    get: {
      tags: ['Admin'],
      summary: 'Получение задач бэклога',
      description: 'Возвращает список всех задач (требуется admin токен)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Список задач получен',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        ticket_text: { type: 'string' },
                        ai_summary: { type: 'string' },
                        severity: { type: 'string' },
                        priority: { type: 'number' },
                        created_at: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/v1/admin/metrics': {
    get: {
      tags: ['Admin'],
      summary: 'Получение метрик системы',
      description: 'Возвращает статистику по работе системы',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Метрики получены',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  total_sessions: { type: 'number', example: 42 },
                  open_sessions: { type: 'number', example: 5 },
                  closed_sessions: { type: 'number', example: 37 },
                  total_tasks: { type: 'number', example: 28 },
                  avg_response_time_ms: { type: 'number', example: 450 },
                },
              },
            },
          },
        },
      },
    },
  },
};