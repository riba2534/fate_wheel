/**
 * 中国省份首府经度表（简化版，34 省级行政区）。
 * 用户选省级即可，足够让真太阳时偏移精度进入 ±15 分钟范围。
 * V2 可扩充到地级市。
 */

export interface Province {
  code: string;
  name: string;
  /** 省会/首府 */
  capital: string;
  /** 经度（东经，十进制） */
  longitude: number;
}

export const PROVINCES: Province[] = [
  { code: "BJ", name: "北京", capital: "北京", longitude: 116.41 },
  { code: "TJ", name: "天津", capital: "天津", longitude: 117.20 },
  { code: "HE", name: "河北", capital: "石家庄", longitude: 114.51 },
  { code: "SX", name: "山西", capital: "太原", longitude: 112.55 },
  { code: "NM", name: "内蒙古", capital: "呼和浩特", longitude: 111.75 },
  { code: "LN", name: "辽宁", capital: "沈阳", longitude: 123.43 },
  { code: "JL", name: "吉林", capital: "长春", longitude: 125.32 },
  { code: "HL", name: "黑龙江", capital: "哈尔滨", longitude: 126.63 },
  { code: "SH", name: "上海", capital: "上海", longitude: 121.47 },
  { code: "JS", name: "江苏", capital: "南京", longitude: 118.77 },
  { code: "ZJ", name: "浙江", capital: "杭州", longitude: 120.15 },
  { code: "AH", name: "安徽", capital: "合肥", longitude: 117.28 },
  { code: "FJ", name: "福建", capital: "福州", longitude: 119.30 },
  { code: "JX", name: "江西", capital: "南昌", longitude: 115.89 },
  { code: "SD", name: "山东", capital: "济南", longitude: 117.00 },
  { code: "HA", name: "河南", capital: "郑州", longitude: 113.65 },
  { code: "HB", name: "湖北", capital: "武汉", longitude: 114.30 },
  { code: "HN", name: "湖南", capital: "长沙", longitude: 112.98 },
  { code: "GD", name: "广东", capital: "广州", longitude: 113.23 },
  { code: "GX", name: "广西", capital: "南宁", longitude: 108.37 },
  { code: "HI", name: "海南", capital: "海口", longitude: 110.33 },
  { code: "CQ", name: "重庆", capital: "重庆", longitude: 106.55 },
  { code: "SC", name: "四川", capital: "成都", longitude: 104.07 },
  { code: "GZ", name: "贵州", capital: "贵阳", longitude: 106.63 },
  { code: "YN", name: "云南", capital: "昆明", longitude: 102.72 },
  { code: "XZ", name: "西藏", capital: "拉萨", longitude: 91.13 },
  { code: "SN", name: "陕西", capital: "西安", longitude: 108.94 },
  { code: "GS", name: "甘肃", capital: "兰州", longitude: 103.83 },
  { code: "QH", name: "青海", capital: "西宁", longitude: 101.78 },
  { code: "NX", name: "宁夏", capital: "银川", longitude: 106.28 },
  { code: "XJ", name: "新疆", capital: "乌鲁木齐", longitude: 87.62 },
  { code: "HK", name: "香港", capital: "香港", longitude: 114.17 },
  { code: "MO", name: "澳门", capital: "澳门", longitude: 113.55 },
  { code: "TW", name: "台湾", capital: "台北", longitude: 121.52 },
];

export function getProvinceByCode(code: string): Province | undefined {
  return PROVINCES.find((p) => p.code === code);
}
