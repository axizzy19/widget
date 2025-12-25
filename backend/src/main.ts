import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'Backlog API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      tokens: '/api/tokens',
      chat: '/api/v1/chat/',
      admin: '/api/v1/admin/'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Backlog API'
  });
});

app.get('/api/tokens', (req, res) => {
  const tokens = {
    consumer: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiY29uc3VtZXIiLCJ0eXBlIjoiYXBpX2NvbnN1bWVyIiwiaWF0IjoxNzA2MjQwMDAwLCJleHAiOjE3MDYzMjY0MDB9.mock-consumer-token',
    admin: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4iLCJ0eXBlIjoiYWRtaW5pc3RyYXRvciIsImlhdCI6MTcwNjI0MDAwMCwiZXhwIjoxNzA2MzI2NDAwfQ.mock-admin-token',
    note: 'For development only. In production, use proper authentication.',
  };
  res.json(tokens);
});

app.post('/api/v1/chat/sessions', (req, res) => {
  res.json({
    id: 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    source: req.body.source || 'widget',
    status: 'open',
    browser_session: req.body.browser_session || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
});

app.post('/api/v1/chat/messages', (req, res) => {
    if (!req.body || !req.body.session_id) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['session_id', 'message']
    });
  }
  
  const userMessage = req.body.message || '';
  
  let response;
  
  if (userMessage.includes('404') || userMessage.includes('не загружается')) {
    response = {
      type: 'analysis_result',
      problem_summary: 'Пользователь сообщает о проблеме загрузки сайта с ошибкой 404',
      category: 'bug',
      severity: 'high',
      priority_guess: 2,
      agent_notes: 'Ошибка 404 обычно указывает на отсутствующий ресурс или неправильный URL',
      metrics: {
        tokens_used: 180,
        latency_ms: 450,
        api2_docs_count: 3,
        api2_docs_ids: ['web-101', 'nginx-45', 'dns-22'],
        confidence: 0.85
      }
    };
  } else if (userMessage.includes('пароль') || userMessage.includes('сбросить')) {
    response = {
      type: 'analysis_result',
      problem_summary: 'Запрос о сбросе или восстановлении пароля',
      category: 'question',
      severity: 'medium',
      priority_guess: 3,
      agent_notes: 'Пользователю нужна инструкция по восстановлению доступа',
      metrics: {
        tokens_used: 120,
        latency_ms: 320,
        api2_docs_count: 2,
        api2_docs_ids: ['auth-33', 'security-12'],
        confidence: 0.9
      }
    };
  } else if (userMessage.includes('тормозит') || userMessage.includes('медленно')) {
    response = {
      type: 'analysis_result',
      problem_summary: 'Проблема с производительностью при загрузке файлов',
      category: 'bug',
      severity: 'medium',
      priority_guess: 3,
      agent_notes: 'Возможные причины: большие файлы, медленное соединение, оптимизация кода',
      metrics: {
        tokens_used: 200,
        latency_ms: 520,
        api2_docs_count: 4,
        api2_docs_ids: ['perf-88', 'storage-21', 'network-15', 'optimize-7'],
        confidence: 0.75
      }
    };
  } else if (userMessage.includes('темную тему') || userMessage.includes('улучшение')) {
    response = {
      type: 'analysis_result',
      problem_summary: 'Предложение по добавлению темной темы в интерфейс',
      category: 'improvement',
      severity: 'low',
      priority_guess: 4,
      agent_notes: 'Функциональное улучшение для повышения удобства пользования',
      metrics: {
        tokens_used: 140,
        latency_ms: 280,
        api2_docs_count: 1,
        api2_docs_ids: ['ui-55'],
        confidence: 0.95
      }
    };
  } else if (userMessage.includes('кнопка') || userMessage.includes('не работает')) {
    response = {
      type: 'analysis_result',
      problem_summary: 'Проблема с неработающей кнопкой отправки формы',
      category: 'bug',
      severity: 'high',
      priority_guess: 2,
      agent_notes: 'Требуется проверка JavaScript кода и валидации формы',
      metrics: {
        tokens_used: 160,
        latency_ms: 380,
        api2_docs_count: 3,
        api2_docs_ids: ['js-42', 'forms-18', 'validation-9'],
        confidence: 0.8
      }
    };
  } else {
    response = {
      type: 'analysis_result',
      problem_summary: 'Анализ проблемы: ' + userMessage,
      category: 'question',
      severity: 'medium',
      priority_guess: 3,
      agent_notes: 'Требуется дополнительный анализ проблемы',
      metrics: {
        tokens_used: 150,
        latency_ms: 400,
        api2_docs_count: 2,
        api2_docs_ids: ['general-1', 'docs-5'],
        confidence: 0.7
      }
    };
  }
  
  res.json({
    success: true,
    session_id: req.body.session_id,
    agent_response: response,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/chat/sessions/:sessionId', (req, res) => {
  res.json({
    id: req.params.sessionId,
    source: 'widget',
    status: 'open',
    messages: [
      {
        id: 'msg-' + Date.now(),
        role: 'user',
        message: 'Пример сообщения пользователя',
        created_at: new Date().toISOString()
      },
      {
        id: 'msg-' + (Date.now() + 1),
        role: 'agent',
        message: JSON.stringify({
          type: 'analysis_result',
          problem_summary: 'Пример анализа проблемы'
        }),
        created_at: new Date().toISOString()
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
});

app.get('/api/v1/admin/sessions', (req, res) => {
  res.json({
    data: [
      {
        id: 'test-session-1',
        source: 'widget',
        status: 'open',
        created_at: new Date().toISOString()
      }
    ],
    meta: {
      count: 1,
      limit: 50,
      offset: 0
    }
  });
});

app.get('/api/v1/admin/metrics', (req, res) => {
  res.json({
    total_sessions: 5,
    open_sessions: 2,
    closed_sessions: 3,
    total_tasks: 10,
    avg_response_time_ms: 450
  });
});

app.get('/api/v1/admin/backlog', (req, res) => {
  res.json({
    data: [
      {
        id: 'task-1',
        ticket_text: 'Ошибка 404 при загрузке сайта',
        ai_summary: 'Пользователь сообщает о проблеме загрузки сайта',
        severity: 'high',
        priority: 2,
        created_at: new Date().toISOString()
      }
    ],
    meta: {
      count: 1,
      limit: 50,
      offset: 0
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /api/tokens',
      'POST /api/v1/chat/sessions',
      'POST /api/v1/chat/messages',
      'GET /api/v1/chat/sessions/:id'
    ]
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log(`   Server running on http://0.0.0.0:${port}`);
  // console.log(`   API Documentation:`);
  // console.log(`   Health check: http://localhost:${port}/health`);
  // console.log(`   Get tokens: http://localhost:${port}/api/tokens`);
  // console.log(`   Root: http://localhost:${port}/`);
  // console.log(`   Chat API: http://localhost:${port}/api/v1/chat/`);
});
