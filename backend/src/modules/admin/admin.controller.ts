import { Request, Response } from 'express';
import { AdminService } from './admin.service';

export class AdminController {
  private adminService = new AdminService();

  async getSessions(req: Request, res: Response) {
    try {
      const {
        status,
        source,
        dateFrom,
        dateTo,
        limit = 50,
        offset = 0,
      } = req.query;

      const filters: any = {};

      if (status && ['open', 'closed'].includes(status as string)) {
        filters.status = status;
      }

      if (source && ['widget', 'agent', 'admin'].includes(source as string)) {
        filters.source = source;
      }

      if (dateFrom) {
        filters.dateFrom = new Date(dateFrom as string);
      }

      if (dateTo) {
        filters.dateTo = new Date(dateTo as string);
      }

      const sessions = await this.adminService.getSessions(filters);
      res.json({
        data: sessions,
        meta: {
          count: sessions.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMetrics(req: Request, res: Response) {
    try {
      const metrics = await this.adminService.getMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Get metrics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getBacklogTasks(req: Request, res: Response) {
    try {
      const {
        severity,
        priority,
        dateFrom,
        dateTo,
        limit = 50,
        offset = 0,
      } = req.query;

      const filters: any = {};

      if (severity && ['low', 'medium', 'high', 'critical'].includes(severity as string)) {
        filters.severity = severity;
      }

      if (priority) {
        filters.priority = parseInt(priority as string);
      }

      if (dateFrom) {
        filters.dateFrom = new Date(dateFrom as string);
      }

      if (dateTo) {
        filters.dateTo = new Date(dateTo as string);
      }

      filters.limit = parseInt(limit as string);
      filters.offset = parseInt(offset as string);

      const tasks = await this.adminService.getBacklogTasks(filters);
      res.json({
        data: tasks,
        meta: {
          count: tasks.length,
          limit: filters.limit,
          offset: filters.offset,
        },
      });
    } catch (error) {
      console.error('Get backlog tasks error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSessionMessages(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const messages = await this.adminService.getMessages(sessionId);

      if (!messages || messages.length === 0) {
        return res.status(404).json({ error: 'Messages not found for this session' });
      }

      res.json({
        session_id: sessionId,
        messages,
        count: messages.length,
      });
    } catch (error) {
      console.error('Get session messages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}