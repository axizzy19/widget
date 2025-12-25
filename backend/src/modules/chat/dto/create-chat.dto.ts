import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

export class CreateChatSessionDto {
  @IsEnum(['widget', 'agent', 'admin'])
  source: 'widget' | 'agent' | 'admin';

  @IsOptional()
  @IsObject()
  browser_session?: {
    user_agent?: string;
    ip_address?: string;
    screen_resolution?: string;
    timezone?: string;
  };
}

export class CreateMessageDto {
  @IsString()
  session_id: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}