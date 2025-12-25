import { Request, Response } from 'express';
import { ChatService } from './chat.service';
import { CreateChatSessionDto, CreateMessageDto } from './dto/create-chat.dto';
import { validate } from 'class-validator';

export class ChatController {
  private chatService = new ChatService();

  async createSession(req: Request, res: Response) {
    try {
      const dto = new CreateChatSessionDto();
      Object.assign(dto, req.body);

      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const session = await this.chatService.createSession(dto);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addMessage(req: Request, res: Response) {
    try {
      const dto = new CreateMessageDto();
      Object.assign(dto, req.body);

      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const result = await this.chatService.addMessage(dto);
      res.status(201).json(result);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = await this.chatService.getSession(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}