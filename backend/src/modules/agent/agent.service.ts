import { createAgent, SYSTEM_PROMPT } from '../../config/langchain';
import { Api2Service } from './api2.service';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

interface AgentResult {
  type: string;
  problem_summary: string;
  category: 'bug' | 'question' | 'improvement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority_guess: number;
  agent_notes: string;
  metrics: {
    tokens_used: number;
    latency_ms: number;
    api2_docs_count: number;
    api2_docs_ids: string[];
    confidence: number;
    api2_processing_time?: number;
  };
}

export class AgentService {
  private agent = createAgent();
  private api2Service = new Api2Service();

  async processMessage(userMessage: string, session: any) {
    const startTime = Date.now();

    try {
      const api2Result = await this.api2Service.searchDocuments(userMessage);

      const context = {
        user_message: userMessage,
        api2_docs: api2Result.docs,
        browser_session: session.browser_session || {},
        session_source: session.source,
        timestamp: new Date().toISOString(),
      };

      const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(JSON.stringify(context, null, 2)),
      ];

      const response = await this.agent.invoke(messages);
      const endTime = Date.now();

      let parsedResult: AgentResult;
      try {
        parsedResult = JSON.parse(response.content.toString());
      } catch (parseError) {
        const jsonMatch = response.content.toString().match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Agent response is not valid JSON');
        }
      }

      if (!parsedResult.type || !parsedResult.problem_summary) {
        throw new Error('Agent response missing required fields');
      }

      const metrics = {
        ...parsedResult.metrics,
        latency_ms: endTime - startTime,
        api2_docs_count: api2Result.docs.length,
        api2_docs_ids: api2Result.docs.map((doc: any) => doc.id),
        api2_processing_time: api2Result.metrics.processing_time_ms,
        tokens_used: response.usage_metadata?.total_tokens || 0,
        confidence: parsedResult.metrics?.confidence || 0.5,
      };

      return {
        ...parsedResult,
        metrics,
        raw_response: response.content.toString(),
        session_id: session.id,
      };
    } catch (error) {
      console.error('Agent processing error:', error);
      throw new Error(`Agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createBacklogTask(
    analysisResult: AgentResult,
    originalMessage: string,
    sessionId: string,
  ) {
    return {
      ticket_text: originalMessage,
      ai_summary: analysisResult.problem_summary,
      severity: analysisResult.severity,
      priority: analysisResult.priority_guess,
      metrics: {
        total_tokens: analysisResult.metrics.tokens_used,
        total_latency_ms: analysisResult.metrics.latency_ms,
        api2_calls: 1,
        agent_confidence: analysisResult.metrics.confidence,
        created_from_session_id: sessionId,
      },
    };
  }

  async testMessage(message: string) {
    const testSession = {
      id: 'test-session',
      source: 'widget',
      browser_session: {},
    };

    return await this.processMessage(message, testSession);
  }
}