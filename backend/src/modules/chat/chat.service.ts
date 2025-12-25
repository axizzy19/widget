import { AppDataSource } from '../../config/database';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { AgentService } from '../agent/agent.service';
import { BacklogService } from '../backlog/backlog.service';
import { CreateChatSessionDto, CreateMessageDto } from './dto/create-chat.dto';

export class ChatService {
  private chatSessionRepository = AppDataSource.getRepository(ChatSession);
  private chatMessageRepository = AppDataSource.getRepository(ChatMessage);
  private agentService = new AgentService();
  private backlogService = new BacklogService();

  async createSession(dto: CreateChatSessionDto) {
    const session = this.chatSessionRepository.create({
      source: dto.source,
      status: 'open',
      browser_session: dto.browser_session,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.chatSessionRepository.save(session);
  }

  async addMessage(dto: CreateMessageDto) {
    const { session_id, message, metadata = {} } = dto;

    // 1. Проверяем существование сессии
    const session = await this.chatSessionRepository.findOne({
      where: { id: session_id },
    });

    if (!session) {
      throw new Error(`Session with id ${session_id} not found`);
    }

    if (session.status === 'closed') {
      throw new Error(`Session ${session_id} is closed`);
    }

    // 2. Сохраняем сообщение пользователя
    const userMessage = this.chatMessageRepository.create({
      session_id,
      role: 'user',
      message,
      metadata,
      created_at: new Date(),
    });

    await this.chatMessageRepository.save(userMessage);

    // 3. Обновляем время сессии
    session.updated_at = new Date();
    await this.chatSessionRepository.save(session);

    try {
      // 4. Обрабатываем через агента
      const agentResult = await this.agentService.processMessage(
        message,
        session,
      );

      // 5. Сохраняем ответ агента
      const agentMessage = this.chatMessageRepository.create({
        session_id,
        role: 'agent',
        message: JSON.stringify(agentResult),
        metadata: agentResult.metrics || {},
        created_at: new Date(),
      });

      await this.chatMessageRepository.save(agentMessage);

      // 6. Создаем задачу в беклоге (если это анализ проблемы)
      if (agentResult.type === 'analysis_result') {
        const taskData = await this.agentService.createBacklogTask(
          agentResult,
          message,
          session_id,
        );

        await this.backlogService.createTask(taskData);
      }

      return {
        success: true,
        session_id,
        user_message_id: userMessage.id,
        agent_message_id: agentMessage.id,
        agent_response: agentResult,
        timestamp: new Date().toISOString(),
      };
    } catch (agentError) {
      // 7. Если агент ошибся, сохраняем системное сообщение об ошибке
      const errorMessage = this.chatMessageRepository.create({
        session_id,
        role: 'system',
        message: `Agent error: ${agentError instanceof Error ? agentError.message : 'Unknown error'}`,
        metadata: { error: true },
        created_at: new Date(),
      });

      await this.chatMessageRepository.save(errorMessage);

      throw new Error(`Agent processing failed: ${agentError}`);
    }
  }

  async getSession(sessionId: string) {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['messages'],
    });

    if (!session) {
      return null;
    }

    // Сортируем сообщения по времени
    if (session.messages) {
      session.messages.sort(
        (a, b) => a.created_at.getTime() - b.created_at.getTime(),
      );
    }

    return session;
  }

  async closeSession(sessionId: string) {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = 'closed';
    session.updated_at = new Date();

    return await this.chatSessionRepository.save(session);
  }

  async getActiveSessions(limit = 100) {
    return await this.chatSessionRepository.find({
      where: { status: 'open' },
      order: { updated_at: 'DESC' },
      take: limit,
      relations: ['messages'],
    });
  }
}