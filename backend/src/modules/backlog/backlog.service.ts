import { AppDataSource } from '../../config/database';
import { BacklogTask } from './entities/backlog-task.entity';

export interface CreateBacklogTaskDto {
  ticket_text: string;
  ai_summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: number;
  metrics: {
    total_tokens: number;
    total_latency_ms: number;
    api2_calls: number;
    agent_confidence: number;
    created_from_session_id: string;
  };
}

export class BacklogService {
  private backlogRepository = AppDataSource.getRepository(BacklogTask);

  async createTask(dto: CreateBacklogTaskDto) {
    const task = this.backlogRepository.create(dto);
    return await this.backlogRepository.save(task);
  }

  async getTasks(filters?: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    priority?: number;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
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

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    if (filters?.offset) {
      query.offset(filters.offset);
    }

    return query.getMany();
  }

  async getTaskById(id: string) {
    return this.backlogRepository.findOne({ where: { id } });
  }

  async getTaskStats() {
    const stats = await this.backlogRepository
      .createQueryBuilder('task')
      .select('task.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(task.priority)', 'avg_priority')
      .groupBy('task.severity')
      .getRawMany();

    const total = await this.backlogRepository.count();

    return {
      total,
      by_severity: stats,
    };
  }
}