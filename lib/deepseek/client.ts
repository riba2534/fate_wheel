export const DEEPSEEK_MODEL = "deepseek-chat";
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export async function deepseekJson<T>(params: {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  validate: (parsed: unknown) => T;
}): Promise<T> {
  const {
    apiKey,
    systemPrompt,
    userPrompt,
    maxTokens = 800,
    temperature = 0.9,
    validate,
  } = params;

  const call = async (): Promise<string> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);
    try {
      const resp = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });
      if (!resp.ok) {
        throw new Error(`deepseek http ${resp.status}: ${await resp.text()}`);
      }
      const data = (await resp.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("empty response");
      return content;
    } finally {
      clearTimeout(timer);
    }
  };

  const FORBIDDEN = /作为\s*(AI|人工智能|语言模型)|抱歉，我|I'm sorry|I am an AI/i;

  try {
    const content = await call();
    if (FORBIDDEN.test(content)) throw new Error("forbidden phrase detected");
    return validate(JSON.parse(content));
  } catch (err) {
    console.warn("[deepseek] retry due to:", (err as Error).message);
    const content = await call();
    return validate(JSON.parse(content));
  }
}
