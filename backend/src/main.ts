import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './config/database';
import { ChatSession } from './modules/chat/entities/chat-session.entity';
import { ChatMessage } from './modules/chat/entities/chat-message.entity';
import { BacklogTask } from './modules/backlog/entities/backlog-task.entity';
import { swaggerOptions } from './swagger';
import { AuthService } from './modules/auth/auth.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

// ========== SWAGGER DOCUMENTATION ==========
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// ========== DATABASE INITIALIZATION ==========
let isDatabaseInitialized = false;

async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');
    isDatabaseInitialized = true;

    if (process.env.NODE_ENV === 'development') {
      await AppDataSource.synchronize();
    }

    const queryRunner = AppDataSource.createQueryRunner();
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    for (const tableName of ['chat_sessions', 'chat_messages', 'backlog_tasks']) {
      const exists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);
      
      console.log(`${tableName} exists:`, exists[0]?.exists);
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
    isDatabaseInitialized = false;
  }
}

initializeDatabase();

// ========== PUBLIC ROUTES ==========
app.get('/', (req, res) => {
  res.json({
    name: 'Backlog API',
    version: '1.0.0',
    status: 'operational',
    database: isDatabaseInitialized ? 'connected' : 'mock',
    documentation: '/api-docs',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Backlog API',
    database: isDatabaseInitialized ? 'connected' : 'mock'
  });
});

app.get('/api/tokens', (req, res) => {
  const authService = new AuthService();
  
  const tokens = {
    consumer: authService.getConsumerToken(),
    admin: authService.getAdminToken(),
    agent: authService.generateToken('admin', { type: 'system' }),
    note: 'For development only'
  };

  res.json(tokens);
});

// ========== CHAT API ==========
app.post('/api/v1/chat/sessions', async (req, res) => {
  try {
    const { source, browser_session } = req.body;
    const sessionRepository = AppDataSource.getRepository(ChatSession);
    const session = sessionRepository.create({
      source: source || 'widget',
      status: 'open',
      browser_session: browser_session || {},
    });
    
    const savedSession = await sessionRepository.save(session);
    
    res.json({
      id: savedSession.id,
      source: savedSession.source,
      status: savedSession.status,
      browser_session: savedSession.browser_session,
      created_at: savedSession.created_at,
      updated_at: savedSession.updated_at
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ 
      error: 'Failed to create session',
    });
  }
});

app.post('/api/v1/chat/messages', async (req, res) => {
  try {
    const { session_id, message, metadata = {} } = req.body;
    
    if (!session_id || !message) {
      return res.status(400).json({ error: 'session_id and message are required' });
    }
    
    let userMessageId: string;
    
    if (isDatabaseInitialized) {
      const messageRepository = AppDataSource.getRepository(ChatMessage);
      
      const userMessage = messageRepository.create({
        id: 'msg-' + Date.now() + '-user',
        session_id: session_id,
        role: 'user',
        message: message,
        metadata: metadata,
      });
      
      const savedUserMessage = await messageRepository.save(userMessage);
      userMessageId = savedUserMessage.id;
      console.log('User message saved to DB:', userMessageId);
    }

    const userMessage = message || '';
    let agentResponse;
    
    if (userMessage.includes('404') || userMessage.includes('не загружается')) {
      agentResponse = {
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
    } else {
      agentResponse = {
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

    let agentMessageId: string;
    
    if (isDatabaseInitialized) {
      const messageRepository = AppDataSource.getRepository(ChatMessage);
      
      const agentMessage = messageRepository.create({
        id: 'msg-' + Date.now() + '-agent',
        session_id: session_id,
        role: 'agent',
        message: JSON.stringify(agentResponse),
        metadata: agentResponse.metrics,
      });
      
      const savedAgentMessage = await messageRepository.save(agentMessage);
      agentMessageId = savedAgentMessage.id;
      console.log('Agent message saved to DB:', agentMessageId);
    }
    
    if (isDatabaseInitialized) {
      const backlogRepository = AppDataSource.getRepository(BacklogTask);
      
      const backlogTask = backlogRepository.create({
  id: 'task-' + Date.now(),
  ticket_text: message,
  ai_summary: agentResponse.problem_summary,

  severity: agentResponse.severity as 'low' | 'medium' | 'high' | 'critical',
  
  priority: agentResponse.priority_guess,

  metrics: {
    total_tokens: agentResponse.metrics.tokens_used || 0,
    total_latency_ms: agentResponse.metrics.latency_ms || 0,
    api2_calls: 1,
    agent_confidence: agentResponse.metrics.confidence || 0.5,
    created_from_session_id: session_id,
  } as { 
    total_tokens: number;
    total_latency_ms: number;
    api2_calls: number;
    agent_confidence: number;
    created_from_session_id: string;
  },
});
      
      const savedTask = await backlogRepository.save(backlogTask);
      console.log('Backlog task saved to DB:', savedTask.id);
    }
    
    res.json({
      success: true,
      session_id: session_id,
      user_message_id: 'mock-user-msg',
      agent_message_id: 'mock-agent-msg',
      agent_response: agentResponse,
      timestamp: new Date().toISOString(),
      saved_to_db: isDatabaseInitialized
    });
    
  } catch (error) {
    console.error('Error processing message:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: errorMessage
    });
  }
});

app.get('/api/v1/chat/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!isDatabaseInitialized) {
      return res.json({
        id: sessionId,
        source: 'widget',
        status: 'open',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            message: 'Пример сообщения',
            created_at: new Date().toISOString()
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    const sessionRepository = AppDataSource.getRepository(ChatSession);
    const messageRepository = AppDataSource.getRepository(ChatMessage);
    
    const session = await sessionRepository.findOne({
      where: { id: sessionId }
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const messages = await messageRepository.find({
      where: { session_id: sessionId },
      order: { created_at: 'ASC' }
    });
    
    res.json({
      id: session.id,
      source: session.source,
      status: session.status,
      browser_session: session.browser_session,
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        message: msg.message,
        metadata: msg.metadata,
        created_at: msg.created_at
      })),
      created_at: session.created_at,
      updated_at: session.updated_at
    });
    
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// ========== ADMIN API ==========
app.get('/api/v1/admin/sessions', async (req, res) => {
  try {
    if (!isDatabaseInitialized) {
      return res.json({
        data: [],
        meta: { count: 0, limit: 50, offset: 0 }
      });
    }
    
    const sessionRepository = AppDataSource.getRepository(ChatSession);
    const sessions = await sessionRepository.find({
      order: { created_at: 'DESC' },
      take: 50
    });
    
    res.json({
      data: sessions.map(session => ({
        id: session.id,
        source: session.source,
        status: session.status,
        created_at: session.created_at,
        updated_at: session.updated_at
      })),
      meta: {
        count: sessions.length,
        limit: 50,
        offset: 0
      }
    });
    
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

app.get('/api/v1/admin/metrics', async (req, res) => {
  try {
    if (!isDatabaseInitialized) {
      return res.json({
        total_sessions: 0,
        open_sessions: 0,
        closed_sessions: 0,
        total_tasks: 0,
        avg_response_time_ms: 0
      });
    }
    
    const sessionRepository = AppDataSource.getRepository(ChatSession);
    const backlogRepository = AppDataSource.getRepository(BacklogTask);
    
    const totalSessions = await sessionRepository.count();
    const openSessions = await sessionRepository.count({ where: { status: 'open' } });
    const totalTasks = await backlogRepository.count();
    
    res.json({
      total_sessions: totalSessions,
      open_sessions: openSessions,
      closed_sessions: totalSessions - openSessions,
      total_tasks: totalTasks,
      avg_response_time_ms: 450
    });
    
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

app.get('/api/v1/admin/backlog', async (req, res) => {
  try {
    if (!isDatabaseInitialized) {
      return res.json({
        data: [],
        meta: { count: 0, limit: 50, offset: 0 }
      });
    }
    
    const backlogRepository = AppDataSource.getRepository(BacklogTask);
    const tasks = await backlogRepository.find({
      order: { created_at: 'DESC' },
      take: 50
    });
    
    res.json({
      data: tasks.map(task => ({
        id: task.id,
        ticket_text: task.ticket_text,
        ai_summary: task.ai_summary,
        severity: task.severity,
        priority: task.priority,
        metrics: task.metrics,
        created_at: task.created_at
      })),
      meta: {
        count: tasks.length,
        limit: 50,
        offset: 0
      }
    });
    
  } catch (error) {
    console.error('Error getting backlog:', error);
    res.status(500).json({ error: 'Failed to get backlog' });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/api-docs`);
  console.log(`📊 Database mode: ${isDatabaseInitialized ? 'REAL' : 'MOCK'}`);
});