import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ChatSession } from '../modules/chat/entities/chat-session.entity';
import { ChatMessage } from '../modules/chat/entities/chat-message.entity';
import { BacklogTask } from '../modules/backlog/entities/backlog-task.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'backlog_db',
  synchronize: false,  
  logging: true, 
  entities: [ChatSession, ChatMessage, BacklogTask],
  migrations: [],
  subscribers: [],
});