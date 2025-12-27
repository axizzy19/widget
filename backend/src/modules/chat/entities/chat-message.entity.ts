import 'reflect-metadata';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ChatSession } from "./chat-session.entity";

@Entity('chat_messages') 
export class ChatMessage {
  @PrimaryColumn('varchar', { length: 255 })
  id: string;

  @Column('varchar', { length: 255 })
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

  @ManyToOne(() => ChatSession, (session) => session.messages)
  session: ChatSession;
}