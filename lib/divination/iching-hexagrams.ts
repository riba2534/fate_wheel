/**
 * 周易六十四卦数据
 * symbol 字段使用 Unicode 六爻卦象字符 U+4DC0-U+4DFF
 */

export interface Hexagram {
  index: number; // 0-63
  name: string; // 卦名，如"乾为天"
  short: string; // 简称，如"乾"
  symbol: string; // Unicode 卦象字符
  lines: [number, number, number, number, number, number]; // 下到上，阳=1，阴=0
  text: string; // 卦辞（简短）
  essence: string; // 核心意象（喂给 AI）
}

// 按序卦传顺序（1 乾 - 64 未济）
export const HEXAGRAMS: Hexagram[] = [
  { index: 0, name: "乾为天", short: "乾", symbol: "䷀", lines: [1,1,1,1,1,1], text: "元亨利贞。天行健，君子以自强不息。", essence: "刚健进取，自强不息" },
  { index: 1, name: "坤为地", short: "坤", symbol: "䷁", lines: [0,0,0,0,0,0], text: "元亨，利牝马之贞。地势坤，君子以厚德载物。", essence: "柔顺包容，厚德载物" },
  { index: 2, name: "水雷屯", short: "屯", symbol: "䷂", lines: [1,0,0,0,1,0], text: "元亨利贞，勿用有攸往。始生艰难。", essence: "初创艰难，蓄势待发" },
  { index: 3, name: "山水蒙", short: "蒙", symbol: "䷃", lines: [0,1,0,0,0,1], text: "亨。匪我求童蒙，童蒙求我。启蒙教化。", essence: "启蒙求知，虚心受教" },
  { index: 4, name: "水天需", short: "需", symbol: "䷄", lines: [1,1,1,0,1,0], text: "有孚，光亨贞吉，利涉大川。等待时机。", essence: "守正待时，终涉大川" },
  { index: 5, name: "天水讼", short: "讼", symbol: "䷅", lines: [0,1,0,1,1,1], text: "有孚，窒惕中吉，终凶。争讼不宜。", essence: "争讼不祥，和为贵" },
  { index: 6, name: "地水师", short: "师", symbol: "䷆", lines: [0,1,0,0,0,0], text: "贞，丈人吉无咎。师出以律。", essence: "纪律严明，众志成城" },
  { index: 7, name: "水地比", short: "比", symbol: "䷇", lines: [0,0,0,0,1,0], text: "吉。原筮元永贞，无咎。亲比和同。", essence: "亲比团结，和睦共进" },
  { index: 8, name: "风天小畜", short: "小畜", symbol: "䷈", lines: [1,1,1,1,1,0], text: "亨。密云不雨，自我西郊。以小畜大。", essence: "小蓄渐进，等待成势" },
  { index: 9, name: "天泽履", short: "履", symbol: "䷉", lines: [1,1,0,1,1,1], text: "履虎尾，不咥人，亨。履险如夷。", essence: "如履薄冰，谨慎前行" },
  { index: 10, name: "地天泰", short: "泰", symbol: "䷊", lines: [1,1,1,0,0,0], text: "小往大来，吉亨。天地交通。", essence: "天地交泰，万事通达" },
  { index: 11, name: "天地否", short: "否", symbol: "䷋", lines: [0,0,0,1,1,1], text: "之匪人，不利君子贞，大往小来。闭塞不通。", essence: "天地不交，闭塞待变" },
  { index: 12, name: "天火同人", short: "同人", symbol: "䷌", lines: [1,0,1,1,1,1], text: "同人于野，亨。利涉大川，利君子贞。", essence: "志同道合，和而不同" },
  { index: 13, name: "火天大有", short: "大有", symbol: "䷍", lines: [1,1,1,1,0,1], text: "元亨。盛大丰收。", essence: "大有所获，持盈保泰" },
  { index: 14, name: "地山谦", short: "谦", symbol: "䷎", lines: [0,0,1,0,0,0], text: "亨，君子有终。谦德。", essence: "谦虚自牧，终有善果" },
  { index: 15, name: "雷地豫", short: "豫", symbol: "䷏", lines: [0,0,0,1,0,0], text: "利建侯行师。豫乐而动。", essence: "顺动和乐，喜庆有期" },
  { index: 16, name: "泽雷随", short: "随", symbol: "䷐", lines: [1,0,0,0,1,1], text: "元亨利贞，无咎。随顺时宜。", essence: "顺时而动，择善而从" },
  { index: 17, name: "山风蛊", short: "蛊", symbol: "䷑", lines: [1,1,0,0,0,1], text: "元亨，利涉大川。治乱兴利。", essence: "积弊待治，整饬革新" },
  { index: 18, name: "地泽临", short: "临", symbol: "䷒", lines: [1,1,0,0,0,0], text: "元亨利贞，至于八月有凶。渐进督临。", essence: "渐进督临，盛极防衰" },
  { index: 19, name: "风地观", short: "观", symbol: "䷓", lines: [0,0,0,0,1,1], text: "盥而不荐，有孚颙若。观察审视。", essence: "静观其变，深察世情" },
  { index: 20, name: "火雷噬嗑", short: "噬嗑", symbol: "䷔", lines: [1,0,0,1,0,1], text: "亨。利用狱。决断除障。", essence: "果断除障，明刑弼教" },
  { index: 21, name: "山火贲", short: "贲", symbol: "䷕", lines: [1,0,1,0,0,1], text: "亨。小利有攸往。文饰华美。", essence: "文质彬彬，内外兼修" },
  { index: 22, name: "山地剥", short: "剥", symbol: "䷖", lines: [0,0,0,0,0,1], text: "不利有攸往。阴剥阳消。", essence: "阴盛剥阳，蛰伏避害" },
  { index: 23, name: "地雷复", short: "复", symbol: "䷗", lines: [1,0,0,0,0,0], text: "亨。出入无疾。一阳来复。", essence: "一阳来复，循环往新" },
  { index: 24, name: "天雷无妄", short: "无妄", symbol: "䷘", lines: [1,0,0,1,1,1], text: "元亨利贞。顺天不妄。", essence: "顺其自然，不妄为" },
  { index: 25, name: "山天大畜", short: "大畜", symbol: "䷙", lines: [1,1,1,0,0,1], text: "利贞，不家食吉。大蓄其德。", essence: "大蓄以养，待时而发" },
  { index: 26, name: "山雷颐", short: "颐", symbol: "䷚", lines: [1,0,0,0,0,1], text: "贞吉。观颐，自求口实。修身养性。", essence: "养身养德，慎言慎食" },
  { index: 27, name: "泽风大过", short: "大过", symbol: "䷛", lines: [0,1,1,1,1,0], text: "栋桡，利有攸往，亨。非常之举。", essence: "非常之事，须慎而行" },
  { index: 28, name: "坎为水", short: "坎", symbol: "䷜", lines: [0,1,0,0,1,0], text: "习坎，有孚，维心亨。险难重重。", essence: "重险当前，以心为渡" },
  { index: 29, name: "离为火", short: "离", symbol: "䷝", lines: [1,0,1,1,0,1], text: "利贞，亨。畜牝牛，吉。依附光明。", essence: "附丽于明，文德昭著" },
  { index: 30, name: "泽山咸", short: "咸", symbol: "䷞", lines: [0,0,1,1,1,0], text: "亨，利贞，取女吉。感应交合。", essence: "阴阳感应，真情互通" },
  { index: 31, name: "雷风恒", short: "恒", symbol: "䷟", lines: [0,1,1,1,0,0], text: "亨，无咎，利贞。恒常不变。", essence: "恒久守正，持之以恒" },
  { index: 32, name: "天山遁", short: "遁", symbol: "䷠", lines: [0,0,1,1,1,1], text: "亨，小利贞。急流勇退。", essence: "知时而退，全身远害" },
  { index: 33, name: "雷天大壮", short: "大壮", symbol: "䷡", lines: [1,1,1,1,0,0], text: "利贞。壮盛强大。", essence: "阳气盛壮，动而健行" },
  { index: 34, name: "火地晋", short: "晋", symbol: "䷢", lines: [0,0,0,1,0,1], text: "康侯用锡马蕃庶。日出地上。", essence: "光明渐进，升腾显达" },
  { index: 35, name: "地火明夷", short: "明夷", symbol: "䷣", lines: [1,0,1,0,0,0], text: "利艰贞。光明受损。", essence: "韬光养晦，外晦内明" },
  { index: 36, name: "风火家人", short: "家人", symbol: "䷤", lines: [1,0,1,0,1,1], text: "利女贞。家道正和。", essence: "家齐道正，内外有序" },
  { index: 37, name: "火泽睽", short: "睽", symbol: "䷥", lines: [1,1,0,1,0,1], text: "小事吉。乖离不合。", essence: "同中存异，求同存异" },
  { index: 38, name: "水山蹇", short: "蹇", symbol: "䷦", lines: [0,0,1,0,1,0], text: "利西南，不利东北。进退维艰。", essence: "艰难险阻，待援而行" },
  { index: 39, name: "雷水解", short: "解", symbol: "䷧", lines: [0,1,0,1,0,0], text: "利西南。纾解脱困。", essence: "险阻既解，化难为安" },
  { index: 40, name: "山泽损", short: "损", symbol: "䷨", lines: [1,1,0,0,0,1], text: "有孚，元吉，无咎。减损自养。", essence: "损己益人，损之有益" },
  { index: 41, name: "风雷益", short: "益", symbol: "䷩", lines: [1,0,0,0,1,1], text: "利有攸往。增益广利。", essence: "损上益下，众人受益" },
  { index: 42, name: "泽天夬", short: "夬", symbol: "䷪", lines: [1,1,1,1,1,0], text: "扬于王庭。果决行事。", essence: "果敢决断，一鼓作气" },
  { index: 43, name: "天风姤", short: "姤", symbol: "䷫", lines: [0,1,1,1,1,1], text: "女壮，勿用取女。不期而遇。", essence: "邂逅相遇，防微杜渐" },
  { index: 44, name: "泽地萃", short: "萃", symbol: "䷬", lines: [0,0,0,0,1,1], text: "亨，王假有庙。聚合团结。", essence: "汇聚人心，共成大业" },
  { index: 45, name: "地风升", short: "升", symbol: "䷭", lines: [1,1,0,0,0,0], text: "元亨，用见大人。升进显达。", essence: "渐进上升，时运相济" },
  { index: 46, name: "泽水困", short: "困", symbol: "䷮", lines: [0,1,0,0,1,1], text: "亨，贞大人吉，无咎。困顿穷通。", essence: "身困志坚，守正待机" },
  { index: 47, name: "水风井", short: "井", symbol: "䷯", lines: [1,1,0,0,1,0], text: "改邑不改井。井养不穷。", essence: "井养不穷，润泽众生" },
  { index: 48, name: "泽火革", short: "革", symbol: "䷰", lines: [1,0,1,0,1,1], text: "已日乃孚，元亨利贞。顺时变革。", essence: "除旧布新，顺时而变" },
  { index: 49, name: "火风鼎", short: "鼎", symbol: "䷱", lines: [1,1,0,1,0,1], text: "元吉，亨。鼎新革故。", essence: "革故鼎新，开创新局" },
  { index: 50, name: "震为雷", short: "震", symbol: "䷲", lines: [1,0,0,1,0,0], text: "亨。震惊百里。震动觉醒。", essence: "震而后惧，惧而后安" },
  { index: 51, name: "艮为山", short: "艮", symbol: "䷳", lines: [0,0,1,0,0,1], text: "艮其背，不获其身。静止以时。", essence: "适时而止，止而后定" },
  { index: 52, name: "风山渐", short: "渐", symbol: "䷴", lines: [0,0,1,0,1,1], text: "女归吉，利贞。渐进有序。", essence: "循序渐进，不疾而速" },
  { index: 53, name: "雷泽归妹", short: "归妹", symbol: "䷵", lines: [1,1,0,1,0,0], text: "征凶，无攸利。嫁娶归宿。", essence: "姻缘归宿，顺时有常" },
  { index: 54, name: "雷火丰", short: "丰", symbol: "䷶", lines: [1,0,1,1,0,0], text: "亨，王假之。丰盛到极。", essence: "丰大之时，宜保亦防" },
  { index: 55, name: "火山旅", short: "旅", symbol: "䷷", lines: [0,0,1,1,0,1], text: "小亨，旅贞吉。羁旅行役。", essence: "旅途之中，安分谨守" },
  { index: 56, name: "巽为风", short: "巽", symbol: "䷸", lines: [0,1,1,0,1,1], text: "小亨，利有攸往。谦逊顺从。", essence: "顺势渐入，潜移默化" },
  { index: 57, name: "兑为泽", short: "兑", symbol: "䷹", lines: [1,1,0,1,1,0], text: "亨，利贞。和悦相说。", essence: "和悦待人，以柔致胜" },
  { index: 58, name: "风水涣", short: "涣", symbol: "䷺", lines: [0,1,0,0,1,1], text: "亨。王假有庙。涣散转机。", essence: "涣散重聚，疏通隔阂" },
  { index: 59, name: "水泽节", short: "节", symbol: "䷻", lines: [1,1,0,0,1,0], text: "亨，苦节不可贞。节制有度。", essence: "节制守度，过犹不及" },
  { index: 60, name: "风泽中孚", short: "中孚", symbol: "䷼", lines: [1,1,0,0,1,1], text: "豚鱼吉，利涉大川。诚信中道。", essence: "诚信居中，以信通达" },
  { index: 61, name: "雷山小过", short: "小过", symbol: "䷽", lines: [0,0,1,1,0,0], text: "亨，利贞。小有过越。", essence: "略有过越，守小可安" },
  { index: 62, name: "水火既济", short: "既济", symbol: "䷾", lines: [1,0,1,0,1,0], text: "亨小，利贞。既成之时。", essence: "功成之时，慎终如始" },
  { index: 63, name: "火水未济", short: "未济", symbol: "䷿", lines: [0,1,0,1,0,1], text: "亨。未成之时。", essence: "功未圆满，终始有待" },
];

export function getHexagram(idx: number): Hexagram {
  return HEXAGRAMS[idx] ?? HEXAGRAMS[0]!;
}

/** 根据六爻数组（下到上）查找匹配的卦 */
export function findHexagramByLines(lines: number[]): Hexagram | undefined {
  return HEXAGRAMS.find((h) => h.lines.every((v, i) => v === lines[i]));
}
