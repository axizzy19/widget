import { AppDataSource } from '../../config/database';
import { ChatSession } from '../chat/entities/chat-session.entity';
import { ChatMessage } from '../chat/entities/chat-message.entity';
import { BacklogTask } from '../backlog/entities/backlog-task.entity';

export class AdminService {
  private chatSessionRepository = AppDataSource.getRepository(ChatSession);
  private chatMessageRepository = AppDataSource.getRepository(ChatMessage);
  private backlogRepository = AppDataSource.getRepository(BacklogTask);

  async getSessions(filters?: {
    status?: 'open' | 'closed';
    source?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const query = this.chatSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.messages', 'messages')
      .orderBy('session.created_at', 'DESC');

    if (filters?.status) {
      query.andWhere('session.status = :status', { status: filters.status });
    }

    if (filters?.source) {
      query.andWhere('session.source = :source', { source: filters.source });
    }

    if (filters?.dateFrom) {
      query.andWhere('session.created_at >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters?.dateTo) {
      query.andWhere('session.created_at <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    return query.getMany();
  }

  async getMessages(sessionId: string) {
    return this.chatMessageRepository.find({
      where: { session_id: sessionId },
      order: { created_at: 'ASC' },
    });
  }

  async getBacklogTasks(filters?: {
    severity?: string;
    priority?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const query = this.backlogRepository
      .createQueryBuilder('task')
      .orderBy('task.created_at', 'DESC');

    if (filters?.severity) {
      query.andWhere('task.severity = :severity', {
        severity: filters.severity,
      });
    }

    if (filters?.priority) {
      query.andWhere('task.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters?.dateFrom) {
      query.andWhere('task.created_at >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters?.dateTo) {
      query.andWhere('task.created_at <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    return query.getMany();
  }

  async getMetrics() {
    const totalSessions = await this.chatSessionRepository.count();
    const openSessions = await this.chatSessionRepository.count({
      where: { status: 'open' },
    });
    const totalTasks = await this.backlogRepository.count();
    const avgResponseTime = await this.chatMessageRepository
      .createQueryBuilder('message')
      .select('AVG(CAST(message.metadata->>\'latency_ms\' AS FLOAT))', 'avg')
      .where("message.role = 'agent'")
      .getRawOne();

    return {
      total_sessions: totalSessions,
      open_sessions: openSessions,
      closed_sessions: totalSessions - openSessions,
      total_tasks: totalTasks,
      avg_response_time_ms: avgResponseTime?.avg || 0,
    };
  }
}