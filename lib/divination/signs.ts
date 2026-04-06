/**
 * 每日一签签文库（融合观音灵签与关帝灵签精华）
 * 30 签，等级分布：上上3/上2/上中4/中5/中吉4/中下4/下中4/下2/下下2
 */

import type { FortuneLevel } from "./wheel-sectors";

export interface Sign {
  no: number;
  name: string; // 4-6 字签名
  text: string; // 四句签文
  level: FortuneLevel;
  category: "上" | "中" | "下";
  meaning: string; // 一句古意解说（送给 AI 作参考）
}

export const SIGNS: Sign[] = [
  { no: 1, name: "金榜题名", text: "锦上添花色更鲜，得心应手万事安。今朝凡事皆如意，春风得意马蹄欢。", level: "大吉", category: "上", meaning: "运势巅峰，所求必遂" },
  { no: 2, name: "紫气东来", text: "紫气东来万象新，祥云朵朵绕君身。吉星高照前程远，凡事逢凶化吉神。", level: "大吉", category: "上", meaning: "贵气临身，万事亨通" },
  { no: 3, name: "龙翔九天", text: "一朝飞腾上九霄，云开月朗显英豪。时来运转皆如意，鲤跃龙门步步高。", level: "大吉", category: "上", meaning: "才华显露，青云直上" },
  { no: 4, name: "喜鹊登枝", text: "喜鹊登枝叫声声，家门将有喜事临。婚姻财运皆通达，笑迎春风满堂情。", level: "中吉", category: "上", meaning: "喜讯将至，和合圆满" },
  { no: 5, name: "日照中天", text: "红日当空万里明，晴天白日万事成。求财求官皆得意，欢欢喜喜度光阴。", level: "中吉", category: "上", meaning: "阳气最盛，行动无虞" },
  { no: 6, name: "枯木逢春", text: "枯木逢春又一春，旧时愁绪一时新。困中得解云开日，苦尽甘来万事成。", level: "小吉", category: "上", meaning: "困境转机，柳暗花明" },
  { no: 7, name: "渔翁得利", text: "蚌鹬相争两不让，渔翁得利在其中。静观其变坐收益，不费吹灰万事通。", level: "小吉", category: "上", meaning: "坐收其利，静观为上" },
  { no: 8, name: "锦绣前程", text: "春风得意马蹄轻，青云直上步步升。前程似锦多光彩，名利双收喜盈盈。", level: "小吉", category: "上", meaning: "前路光明，稳步前行" },
  { no: 9, name: "宝鸭穿莲", text: "双鸭并游水中央，莲花相伴并头香。夫妻同心情谊重，家和万事定兴旺。", level: "小吉", category: "上", meaning: "情缘和美，家宅安宁" },
  { no: 10, name: "月明花开", text: "明月当空照如银，花开富贵满庭春。良宵美景常相伴，家人团聚共欢欣。", level: "平", category: "中", meaning: "安定和睦，守分可保" },
  { no: 11, name: "顺水行舟", text: "一帆风顺水东流，舟行稳当不用愁。凡事随缘心自定，无风无浪到渡头。", level: "平", category: "中", meaning: "顺势而为，随缘自安" },
  { no: 12, name: "明珠出土", text: "明珠埋土久无光，今日出尘放异彩。怀才有遇贵人助，守正养德自有方。", level: "平", category: "中", meaning: "有才有机，待时而发" },
  { no: 13, name: "渭水垂钓", text: "姜尚渭水垂钓时，耐性静守待时机。八十遇主终成业，功名富贵莫焦急。", level: "平", category: "中", meaning: "大器晚成，耐心致远" },
  { no: 14, name: "秋月朗照", text: "秋月如镜照人寒，凡事清明莫乱传。谋事需要细斟酌，莫让是非扰心田。", level: "平", category: "中", meaning: "冷静审慎，清明可保" },
  { no: 15, name: "落花流水", text: "落红片片随流水，好事难留转瞬空。不必悔恨徒叹息，无常方是世间风。", level: "小凶", category: "中", meaning: "事去难回，放下为宜" },
  { no: 16, name: "舟行逆水", text: "逆水行舟力难挡，此时退步最为良。三日不前三日后，春江水暖自扬帆。", level: "小凶", category: "中", meaning: "时机未至，退让三分" },
  { no: 17, name: "夜行无烛", text: "暗夜无光路难行，前方莫测费心惊。等待天明方可进，莫做莽夫逞英豪。", level: "小凶", category: "中", meaning: "昧不明动，候时而行" },
  { no: 18, name: "云遮月影", text: "云遮月影暂时昏，不必忧愁心自安。云散月明终有日，拨云见月待时间。", level: "小凶", category: "中", meaning: "一时阻隔，终会转圜" },
  { no: 19, name: "石中藏玉", text: "璞玉藏于顽石中，待人细琢现光辉。莫嫌本质暂埋没，自有知音遇伯乐。", level: "平", category: "中", meaning: "才具深埋，待贵人识" },
  { no: 20, name: "半月临窗", text: "半月临窗影半明，事犹未定难分清。再等几日风云变，阴晴圆缺自有定。", level: "平", category: "中", meaning: "事尚未明，再等几日" },
  { no: 21, name: "井底观天", text: "井底观天眼界窄，莫以偏见断是非。登高望远心胸阔，海纳百川万事宜。", level: "小凶", category: "下", meaning: "破除偏见，广纳雅言" },
  { no: 22, name: "风吹残烛", text: "残烛临风光欲灭，此刻护持最为要。躁动易折细心养，静待来日再生辉。", level: "中凶", category: "下", meaning: "岌岌可危，护己为先" },
  { no: 23, name: "瓦釜雷鸣", text: "瓦釜鸣若黄钟声，真假难分人易惑。凡事须当三思虑，莫让虚名迷本心。", level: "中凶", category: "下", meaning: "虚实难辨，察人须谨" },
  { no: 24, name: "飞蛾扑火", text: "飞蛾投火身自焚，贪欲执念招祸根。悬崖勒马犹未晚，及早回头保安宁。", level: "中凶", category: "下", meaning: "贪执招祸，回头是岸" },
  { no: 25, name: "寒江独钓", text: "寒江独钓雪纷飞，万事皆空心自归。此刻孤独非坏事，守得清净便是福。", level: "平", category: "下", meaning: "孤处自守，静而无咎" },
  { no: 26, name: "破釜沉舟", text: "背水一战破釜时，置之死地反得生。绝境方能激潜力，勇往直前莫回头。", level: "小凶", category: "下", meaning: "绝境奋起，破而后立" },
  { no: 27, name: "斩草除根", text: "斩草须要除其根，拔苗助长反成灾。遇事决断不姑息，方可永绝后患来。", level: "小凶", category: "下", meaning: "果决除患，斩断迟疑" },
  { no: 28, name: "狂风骤雨", text: "狂风骤雨急来袭，草木凋零事多艰。风雨总会有过时，守宅闭门避其锋。", level: "大凶", category: "下", meaning: "祸事连连，蛰伏避锋" },
  { no: 29, name: "凤凰涅槃", text: "浴火凤凰万苦中，重生一刻见真龙。大破大立方成器，风雨过后便见彩虹。", level: "小吉", category: "上", meaning: "破而后立，大难不死" },
  { no: 30, name: "夜来清风", text: "夜半清风吹书窗，思绪万千绕心房。莫贪功利平常过，粗茶淡饭亦安康。", level: "平", category: "中", meaning: "恬淡自守，清心自安" },
];

export function getSign(no: number): Sign {
  return SIGNS.find((s) => s.no === no) ?? SIGNS[0]!;
}
