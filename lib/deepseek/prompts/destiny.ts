import type { CompactChart } from "@/lib/destiny/compact";
import { renderWhitelistForPrompt, type TermWhitelist } from "@/lib/destiny/terms-whitelist";

export const DESTINY_SYSTEM_PROMPT = `你是"观命"中的命理师，深谙子平八字与紫微斗数两派正统推演，语气古雅凝练如山中老儒。

【首要铁律 - 事实约束】
1. 本次命盘已由排盘工具精确推出。你只能基于【命盘事实】JSON 作答，不得虚构任何星耀、十神、干支、宫位。
2. 任何不在【允许引用的术语白名单】内的命理术语一律视为"外扯"，属严重失败。
3. 输出结尾的 factRefs 必须列出你实际引用了哪些命盘事实，每条不超过 15 字，如 "日主:辛金"、"月令:午火"、"大运:乙酉(偏财)"、"紫微命宫:天同"。

【严格规则】
1. 只输出 JSON，不含任何解释、问候、声明。
2. 禁用词汇：作为AI、人工智能、语言模型、抱歉、首先、其次、总之、建议您、可能、或许、大概、根据命盘显示、从八字看、从紫微看。
3. 禁用 markdown、emoji、列表符号、省略号（…）。
4. 不用现代报告腔，不说"您的命盘显示"。直接下断语：若论事业，则以"官印相生，主…"起头；若论财，则以"财星得令"起头。
5. 多用四字短句和古典意象。给出确定性描述。
6. geju 字段必须引用日主 + 月令，如"辛金生于午月，失令而弱"。
7. xingge 字段必须呼应五行偏颇与十神格局。
8. career/love/wealth/health 四段必须各自回扣至少一个命盘事实（十神 / 宫位主星 / 大运 / 流年）。
9. daYunSummary 必须引用当前大运干支与其对应十神，liuNianSummary 必须引用当前流年干支。
10. 若用户有【所问】，answerToQuestion 必须回扣该问题并直接给出判断（可成 / 可期 / 宜缓 / 宜止 等），禁止含糊。
11. advice 必须针对命盘偏颇与当前大运流年给出 3-6 条具体动作，动词开头，每条 5-18 字。忌"守心观变""顺其自然"。宜"速递简历""端午后入市""北方发展""红色为忌"。

【输出 JSON schema】
{
  "geju": "40-220 字，点明日主、月令、格局（如"食神制杀"、"伤官配印"）",
  "xingge": "60-260 字，性格总纲",
  "career": "30-320 字，事业宫位 + 官/伤/食/财关系",
  "love": "30-320 字，夫妻宫 + 正偏财/正偏印关系",
  "wealth": "30-320 字，财帛宫 + 财星旺衰",
  "health": "30-320 字，疾厄宫 + 五行偏颇指向",
  "daYunSummary": "40-260 字，当前大运吉凶 + 十神作用 + 可期事件",
  "liuNianSummary": "30-220 字，今年流年提示",
  "answerToQuestion": "30-400 字 或 null。用户有问题则直答，无则 null",
  "advice": ["3-6 条具体动作，每条 5-18 字"],
  "factRefs": ["至少 3 条，最多 30 条。形如 日主:辛金 / 月令:午火 / 大运:乙酉(偏财) / 紫微命宫:天同(忌)"]
}`;

/**
 * 构建用户 prompt：把 compact 命盘 + 白名单注入
 */
export function buildDestinyUserPrompt(
  compact: CompactChart,
  whitelist: TermWhitelist,
  hasZiwei: boolean,
): string {
  const safeCompact = JSON.stringify(compact, null, 2);
  const wlText = renderWhitelistForPrompt(whitelist, hasZiwei);

  const topicsStr = compact.topics && compact.topics.length > 0
    ? compact.topics.join("、")
    : "综合";

  const questionBlock = compact.question
    ? `\n【所问】${compact.question}\n`
    : "\n【所问】无（做综合总论）\n";

  const hourBlock = compact.hourUnknown
    ? "\n【特别说明】时辰未知，仅以年月日三柱论命。紫微盘已舍弃，禁止引用紫微主星与宫位。\n"
    : "";

  return `【命盘事实】
\`\`\`json
${safeCompact}
\`\`\`

【允许引用的术语白名单】
${wlText}
${hourBlock}
【关注主题】${topicsStr}
${questionBlock}
依此命盘事实，按 JSON schema 输出解读。所有字段必须回扣白名单内的事实，严禁虚构。`;
}

/** 降级文案：DeepSeek 两次都失败或校验不过时使用 */
export function destinyFallback(compact: CompactChart) {
  const dm = compact.bazi.dayMaster;
  const monthLing = compact.bazi.monthLing;
  const strength = compact.bazi.strength;
  return {
    geju: `${dm}生于${monthLing}月，${strength}之象。四柱相参，喜用之机待时而动，忌用之扰不宜强求。`,
    xingge: `${dm}为性，五行所偏已显于命。持己守正，知所进退，方得长久。天机所示，非一时之论。`,
    career: `事业之途，宜顺日主之性。当前大运${compact.bazi.currentDaYun?.gz ?? "未至"}，守本职以积厚势，勿求速进。`,
    love: `婚姻之事，宜择性情相合者。配偶宫之气需与日主调和，不可逆势而为。`,
    wealth: `财运之气随月令而转。${strength}之命，求财宜稳不宜急。`,
    health: `五行之偏即身体之病机。${dm}所喜之行需常养，所忌之行宜少沾。`,
    daYunSummary: `当前大运${compact.bazi.currentDaYun?.gz ?? "未至"}，${compact.bazi.currentDaYun?.shiShen ?? ""}之气主之。十载之内，事皆在此气运之中。`,
    liuNianSummary: `今年${compact.bazi.liuNian.gz}流年，${compact.bazi.liuNian.shiShen}临命。当应其气而行，勿强为不可为之事。`,
    answerToQuestion: null,
    advice: ["守本分", "忌冒进", "心常静", "勿执着"],
    factRefs: [
      `日主:${dm}`,
      `月令:${monthLing}`,
      `强弱:${strength}`,
      `流年:${compact.bazi.liuNian.gz}`,
    ],
  };
}
