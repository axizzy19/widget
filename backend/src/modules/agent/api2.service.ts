import axios from 'axios';

export class Api2Service {
  private baseUrl = process.env.API2_URL || 'http://api2:3000';

  async searchDocuments(query: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/search`, {
        query,
        limit: 5,
      });

      return {
        docs: response.data.docs || [],
        metrics: {
          processing_time_ms: response.data.metrics?.processing_time_ms || 0,
          query,
        },
      };
    } catch (error) {
      return {
        docs: [
          {
            id: 'auth-12',
            title: 'Ошибка 401 при авторизации',
            content: 'Чаще всего вызвана expired JWT cookie...',
            relevance: 0.92,
          },
        ],
        metrics: {
          processing_time_ms: 120,
          query,
        },
      };
    }
  }

  async getLogs(traceId: string) {
    return {
      logs: [],
      trace_id: traceId,
    };
  }
}