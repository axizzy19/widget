import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ChatMessage } from "./chat-message.entity";

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  source: 'widget' | 'agent' | 'admin';

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: 'open' | 'closed';

  @Column({ type: 'jsonb', nullable: true })
  browser_session: {
    user_agent?: string;
    ip_address?: string;
    screen_resolution?: string;
    timezone?: string;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ChatMessage, (message) => message.session)
  messages: ChatMessage[];
}