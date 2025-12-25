import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatSession } from "./chat-session.entity";

@Entity('chat-message') 
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // связь многие к одному
  @ManyToOne(() => ChatSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: ChatSession;

  @Column()
  session_id: string;

  @Column({ type: 'varchar', length: 20 })
  role: 'user' | 'agent' | 'system';

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    tokens_used?: number;
    latency_ms?: number;
    api2_docs_ids?: string[];
    confidence_score?: number;
    error_type?: string;
    retry_count?: number;
    [key: string]: any;
  };

  @CreateDateColumn()
  created_at: Date;
}