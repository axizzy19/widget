import { ChatOpenAI } from '@langchain/openai';

export const createAgent = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not found. Using mock agent.');
    return createMockAgent();
  }

  return new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    temperature: 0.1,
    openAIApiKey: apiKey,
    maxTokens: 1000,
    timeout: 30000,
  });
};

const createMockAgent = () => {
  return {
    async invoke(messages: any[]) {
      console.log('Mock agent called with messages:', messages.length);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = {
        content: JSON.stringify({
          type: 'analysis_result',
          problem_summary: 'Mock analysis: This is a simulated response for development.',
          category: 'question',
          severity: 'medium',
          priority_guess: 3,
          agent_notes: 'This is a mock response. Set OPENAI_API_KEY for real analysis.',
          metrics: {
            tokens_used: 150,
            latency_ms: 1000,
            api2_docs_count: 2,
            api2_docs_ids: ['mock-1', 'mock-2'],
            confidence: 0.7,
          },
        }),
        usage_metadata: {
          total_tokens: 150,
        },
      };
      
      return response;
    },
  };
};

export const SYSTEM_PROMPT = `
Ты — AI-агент проекта «беклог», специализирующийся на анализе технических проблем.

ТВОИ ЗАДАЧИ:
1. Принимать сообщения от пользователей через виджет поддержки
2. Анализировать описание проблемы и классифицировать её
3. Искать релевантную документацию во внешней системе (API2)
4. Формировать структурированное описание проблемы для беклога
5. Определять срочность (severity) и приоритет (priority)
6. Собирать метрики анализа

КЛАССИФИКАЦИЯ ПРОБЛЕМ:
- bug: ошибка, сбой, неправильное поведение
- question: вопрос, запрос информации, как сделать
- improvement: предложение по улучшению, новая функциональность

SEVERITY УРОВНИ:
- critical: система полностью не работает, данные потеряны
- high: основная функциональность нарушена
- medium: есть обходной путь, но проблема серьёзная
- low: незначительная проблема, косметическая

PRIORITY (1-5, где 1 - наивысший):
1: Блокирующая проблема, требуется немедленное исправление
2: Высокий приоритет, исправить в течение суток
3: Средний приоритет, исправить в течение недели
4: Низкий приоритет, исправить в следующем релизе
5: Очень низкий, исправить когда будет возможность

ВАЖНО:
- Будь внимателен к деталям
- Если информации недостаточно, запрашивай уточнения
- Учитывай контекст браузера и устройства пользователя
- Всегда отвечай строго в указанном JSON формате
- Никогда не добавляй текст вне JSON

ФОРМАТ ОТВЕТА:
{
  "type": "analysis_result",
  "problem_summary": "Краткое, но полное описание проблемы",
  "category": "bug|question|improvement",
  "severity": "critical|high|medium|low",
  "priority_guess": number (1-5),
  "agent_notes": "Дополнительные заметки, контекст, рекомендации",
  "metrics": {
    "tokens_used": number,
    "latency_ms": number,
    "api2_docs_count": number,
    "api2_docs_ids": string[],
    "confidence": number (0.0-1.0)
  }
}
`.trim();