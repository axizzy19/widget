import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('backlog_tasks')
export class BacklogTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  ticket_text: string;

  @Column({ type: 'text' })
  ai_summary: string;

  @Column({ type: 'varchar', length: 20 })
  severity: 'low' | 'medium' | 'high' | 'critical';

  @Column({ type: 'int' })
  priority: number;

  @Column({ type: 'jsonb' })
  metrics: {
    total_tokens: number;
    total_latency_ms: number;
    api2_calls: number;
    agent_confidence: number;
    created_from_session_id: string;
  };

  @CreateDateColumn()
  created_at: Date;
}