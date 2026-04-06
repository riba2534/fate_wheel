import OpenAI from "openai";

const apiKey = process.env.DEEPSEEK_API_KEY;

if (!apiKey) {
  console.warn("[deepseek] DEEPSEEK_API_KEY not set in environment");
}

export const deepseek = new OpenAI({
  apiKey: apiKey ?? "missing",
  baseURL: "https://api.deepseek.com/v1",
  timeout: 25_000,
  maxRetries: 0, // 自己控制重试
});

export const DEEPSEEK_MODEL = "deepseek-chat";

/**
 * 调用 DeepSeek，强制 JSON 模式，最多重试 1 次（检测到违禁词或解析失败时）
 */
export async function deepseekJson<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  validate: (parsed: unknown) => T;
}): Promise<T> {
  const { systemPrompt, userPrompt, maxTokens = 800, temperature = 0.9, validate } = params;

  const call = async () => {
    const resp = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature,
      max_tokens: maxTokens,
    });
    const content = resp.choices[0]?.message?.content;
    if (!content) throw new Error("empty response");
    return content;
  };

  const FORBIDDEN = /作为\s*(AI|人工智能|语言模型)|抱歉，我|I'm sorry|I am an AI/i;

  // 第一次尝试
  try {
    const content = await call();
    if (FORBIDDEN.test(content)) throw new Error("forbidden phrase detected");
    const parsed = JSON.parse(content);
    return validate(parsed);
  } catch (err) {
    console.warn("[deepseek] retry due to:", (err as Error).message);
    // 重试一次
    const content = await call();
    const parsed = JSON.parse(content);
    return validate(parsed);
  }
}
