export const schemas = {
  HealthResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'healthy' },
      timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
      uptime: { type: 'number', example: 1234.56 },
      service: { type: 'string', example: 'Backlog API' },
    },
  },

  TokensResponse: {
    type: 'object',
    properties: {
      consumer: { 
        type: 'string', 
        example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...' 
      },
      admin: { 
        type: 'string', 
        example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...' 
      },
      note: { 
        type: 'string', 
        example: 'For development only. In production, use proper authentication.' 
      },
    },
  },

  CreateSessionRequest: {
    type: 'object',
    required: ['source'],
    properties: {
      source: {
        type: 'string',
        enum: ['widget', 'agent', 'admin'],
        example: 'widget',
      },
      browser_session: {
        type: 'object',
        properties: {
          user_agent: { type: 'string', example: 'Mozilla/5.0' },
          ip_address: { type: 'string', example: '192.168.1.100' },
          screen_resolution: { type: 'string', example: '1920x1080' },
          timezone: { type: 'string', example: 'Europe/Moscow' },
        },
      },
    },
  },

  SessionResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'session-123456789' },
      source: { type: 'string', example: 'widget' },
      status: { type: 'string', example: 'open' },
      browser_session: { type: 'object' },
      created_at: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
      updated_at: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
    },
  },

  CreateMessageRequest: {
    type: 'object',
    required: ['session_id', 'message'],
    properties: {
      session_id: { 
        type: 'string', 
        example: 'session-123456789' 
      },
      message: { 
        type: 'string', 
        example: 'Не могу войти в систему, ошибка 401' 
      },
      metadata: {
        type: 'object',
        additionalProperties: true,
      },
    },
  },

  AgentResponse: {
    type: 'object',
    properties: {
      type: { type: 'string', example: 'analysis_result' },
      problem_summary: { 
        type: 'string', 
        example: 'Пользователь не может пройти авторизацию' 
      },
      category: { 
        type: 'string', 
        enum: ['bug', 'question', 'improvement'],
        example: 'bug',
      },
      severity: { 
        type: 'string', 
        enum: ['low', 'medium', 'high', 'critical'],
        example: 'high',
      },
      priority_guess: { 
        type: 'integer', 
        minimum: 1, 
        maximum: 5,
        example: 2,
      },
      agent_notes: { 
        type: 'string', 
        example: 'Похоже на проблему с refresh токеном' 
      },
      metrics: {
        type: 'object',
        properties: {
          tokens_used: { type: 'number', example: 1423 },
          latency_ms: { type: 'number', example: 893 },
          api2_docs_count: { type: 'number', example: 3 },
          api2_docs_ids: { 
            type: 'array', 
            items: { type: 'string' },
            example: ['auth-12', 'auth-19'],
          },
          confidence: { type: 'number', example: 0.83 },
        },
      },
    },
  },

  MessageResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      session_id: { type: 'string', example: 'session-123456789' },
      agent_response: { $ref: '#/components/schemas/AgentResponse' },
      timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
    },
  },

  ErrorResponse: {
    type: 'object',
    properties: {
      error: { type: 'string', example: 'Validation failed' },
      message: { type: 'string', example: 'session_id is required' },
      statusCode: { type: 'number', example: 400 },
    },
  },
};