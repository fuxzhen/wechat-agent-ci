/**
 * 智搭 StyleMate 云函数 - 八字穿搭分析
 * 安装依赖: npm install lunar-python
 *部署: tcb fn deploy baziFashion --force
 */
const cloud = require('tcb-admin-node');

// 初始化云开发
cloud.init({
  env: process.env.TCBAUTH_ENV_KEY
});

const db = cloud.database();

// ============ 配置 ============
const GAN_WUXING = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火',
  '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

const ZHI_WUXING = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

const GENERATION = {'木': '火', '火': '土', '土': '金', '金': '水', '水': '木'};
const DESTRUCTION = {'木': '土', '土': '水', '水': '火', '火': '金', '金': '木'};

// 五行时尚数据库
const FASHION_DB = {
  "木": {
    "colors": ["灰豆绿", "薄荷青", "深翠绿", "卡其绿", "橄榄色"],
    "avoid_colors": ["大红色", "橘黄色", "金色", "银色", "纯白色"],
    "materials": ["棉麻", "亚麻", "竹纤维", "灯芯绒"],
    "style": "fresh, organic, natural, minimalist",
    "vibe": "生机勃勃", "keywords": "森系, 文艺, 清新"
  },
  "火": {
    "colors": ["焦糖色", "勃艮第红", "暖橘色", "紫罗兰", "珊瑚红"],
    "avoid_colors": ["黑色", "深蓝色", "纯白色", "银色", "灰色"],
    "materials": ["丝绒", "皮革", "绸缎", "不对称剪裁"],
    "style": "vibrant, bold, energetic, warm",
    "vibe": "热情奔放", "keywords": "明艳, 御姐, 女王"
  },
  "土": {
    "colors": ["大地色", "奶咖色", "米杏色", "驼色", "焦糖"],
    "avoid_colors": ["绿色", "青色", "蓝色", "紫色", "黑色"],
    "materials": ["羊绒", "毛呢", "针织", "粗花呢"],
    "style": "classic, cozy, earthy, sophisticated",
    "vibe": "稳重端庄", "keywords": "温柔, 高级, 知性"
  },
  "金": {
    "colors": ["珍珠白", "香槟金", "银灰色", "冷调白", "钛金灰"],
    "avoid_colors": ["大红色", "橘色", "绿色", "青色", "紫色"],
    "materials": ["真丝", "缎面", "西装料", "金属配饰"],
    "style": "sleek, metallic, structured, elegant",
    "vibe": "锋芒毕露", "keywords": "精英, 干练, 极简"
  },
  "水": {
    "colors": ["克莱因蓝", "深渊黑", "雾霾蓝", "墨青色", "电光蓝"],
    "avoid_colors": ["土黄色", "棕色", "咖啡色", "橙色", "大红色"],
    "materials": ["雪纺", "蕾丝", "薄纱", "流苏"],
    "style": "fluid, mysterious, dark, sheer, wavy",
    "vibe": "灵动神秘", "keywords": "浪漫, 氛围感, 仙气"
  }
};

// ============ 农历计算 (简化版) ============
// 实际项目中建议使用 npm 包: npm install lunar-lite
const LUNAR_CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 简化：使用 JS Date 计算八字（仅供演示，生产环境用 lunar-python）
function getLunarDate(year, month, day) {
  // 这里使用简化算法
  // 实际项目中安装 lunar-lite 或调用外部 API
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  const dayGan = TIAN_GAN[ganIndex];
  const dayZhi = DI_ZHI[zhiIndex];
  return { gan: dayGan, zhi: dayZhi };
}

// ============ 核心分析 ============
function analyzeBazi(year, month, day, hour) {
  // 获取日主五行
  const dayGan = TIAN_GAN[(year - 4) % 10]; // 简化
  const userElement = GAN_WUXING[dayGan] || '土';
  
  // 今日五行 (简化：每60天一循环)
  const today = new Date();
  const daysSince2000 = Math.floor((today - new Date(2000, 0, 1)) / 86400000);
  const todayGan = TIAN_GAN[daysSince2000 % 10];
  const todayElement = GAN_WUXING[todayGan] || '土';
  
  // 算法逻辑
  let lucky, reason, logic;
  
  if (userElement === todayElement) {
    lucky = GENERATION[userElement];
    reason = `今日${todayElement}气与你日主相同，能量充沛。建议穿【${lucky}】系泄秀，展现才华`;
    logic = "同气相求 → 泄秀";
  } else if (GENERATION[todayElement] === userElement) {
    lucky = GENERATION[userElement];
    reason = `今日${todayElement}气滋养你，贵人运旺！穿【${lucky}】系能展现魅力`;
    logic = "印星当令 → 泄秀";
  } else if (userElement === GENERATION[todayElement]) {
    lucky = Object.keys(GENERATION).find(k => GENERATION[k] === userElement);
    reason = `今日${todayElement}耗你心神，易感疲惫。穿【${lucky}】系补充能量`;
    logic = "食伤泄气 → 补印";
  } else if (DESTRUCTION[todayElement] === userElement) {
    lucky = Object.keys(GENERATION).find(k => GENERATION[k] === userElement);
    reason = `今日${todayElement}克你，压力有点大。穿【${lucky}】系获得支持`;
    logic = "官杀攻身 → 补印";
  } else {
    lucky = Object.keys(GENERATION).find(k => GENERATION[k] === userElement);
    reason = `今日${todayElement}为你所克，付出较多。穿【${lucky}】系补充能量`;
    logic = "财多身弱 → 补印";
  }
  
  const fashion = FASHION_DB[lucky] || FASHION_DB["土"];
  const avoidElement = DESTRUCTION[userElement];
  const avoidFashion = FASHION_DB[avoidElement] || {};
  
  return {
    date: today.toISOString().split('T')[0],
    user: {
      birth: `${year}-${month}-${day} ${hour}:00`,
      day_master: dayGan,
      element: userElement
    },
    today: {
      ganzhi: `${todayGan}${DI_ZHI[daysSince2000 % 12]}`,
      element: todayElement
    },
    recommendation: {
      lucky_element: lucky,
      colors: fashion.colors,
      avoid_colors: avoidFashion.colors || [],
      materials: fashion.materials,
      style: fashion.style,
      vibe: fashion.vibe,
      keywords: fashion.keywords
    },
    analysis: {
      logic,
      reason
    }
  };
}

// ============ 云函数入口 ============
exports.main = async (event, context) => {
  const { action, data } = event;
  
  try {
    switch (action) {
      case 'analyze':
        // 每日穿搭分析
        const { year, month, day, hour, openId } = data;
        
        const result = analyzeBazi(year, month, day, hour);
        
        // 保存到历史记录
        if (openId) {
          await db.collection('daily_reports').add({
            data: {
              _openid: openId,
              ...result,
              created_at: db.serverDate()
            }
          });
        }
        
        return { success: true, data: result };
      
      case 'getHistory':
        // 获取历史记录
        const { limit = 10 } = data;
        const history = await db.collection('daily_reports')
          .orderBy('date', 'desc')
          .limit(limit)
          .get();
        return { success: true, data: history.data };
      
      case 'saveProfile':
        // 保存用户配置
        const { birth, name } = data;
        const profileResult = await db.collection('profiles').where({
          _openid: data.openId
        }).get();
        
        if (profileResult.data.length > 0) {
          // 更新
          await db.collection('profiles').doc(profileResult.data[0]._id).update({
            data: { birth, name, updated_at: db.serverDate() }
          });
        } else {
          // 新增
          await db.collection('profiles').add({
            data: {
              _openid: data.openId,
              birth,
              name: name || '',
              created_at: db.serverDate()
            }
          });
        }
        return { success: true, message: '保存成功' };
      
      case 'getProfile':
        // 获取用户配置
        const profile = await db.collection('profiles').where({
          _openid: data.openId
        }).get();
        return { 
          success: true, 
          data: profile.data[0] || null 
        };
      
      default:
        return { success: false, error: '未知操作' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};
