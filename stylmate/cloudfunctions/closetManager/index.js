/**
 * 智能衣橱管理云函数
 * 独立于 baziFashion，不修改原逻辑
 */
const cloud = require('tcb-admin-node');

cloud.init({ env: process.env.TCBAUTH_ENV_KEY });
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

// ============ 五行配色库 (复用原 FASHION_DB) ============
const FASHION_DB = {
  "木": { colors: ["灰豆绿", "薄荷青", "深翠绿", "卡其绿", "橄榄色"], avoid: ["大红色", "橘黄色", "金色"] },
  "火": { colors: ["焦糖色", "勃艮第红", "暖橘色", "紫罗兰", "珊瑚红"], avoid: ["黑色", "深蓝色", "纯白色"] },
  "土": { colors: ["大地色", "奶咖色", "米杏色", "驼色", "焦糖"], avoid: ["绿色", "青色", "蓝色"] },
  "金": { colors: ["珍珠白", "香槟金", "银灰色", "冷调白", "钛金灰"], avoid: ["大红色", "橘色", "绿色"] },
  "水": { colors: ["克莱因蓝", "深渊黑", "雾霾蓝", "墨青色", "电光蓝"], avoid: ["土黄色", "棕色", "咖啡色"] }
};

const SEASON_COLORS = {
  spring: ["浅绿", "浅粉", "浅黄", "浅蓝", "淡紫"],
  summer: ["白色", "浅蓝", "浅黄", "淡粉", "薄荷绿"],
  autumn: ["驼色", "焦糖", "深绿", "酒红", "棕色"],
  winter: ["黑色", "深蓝", "酒红", "墨绿", "灰色"]
};

// 颜色相似度计算 (简化)
function colorMatch(color1, color2) {
  // 完全相同返回 1，完全不同返回 0
  if (color1 === color2) return 1;
  const neutral = ["白", "黑", "灰", "米", "驼"];
  if (neutral.includes(color1) || neutral.includes(color2)) return 0.7;
  return 0.3;
}

// ============ 核心函数 ============

/**
 * 上传服饰到衣橱
 */
async function uploadClothing(openId, clothingData) {
  const { category, imageUrl, color, season, style, tags } = clothingData;

  // 获取用户衣橱
  let closet = await db.collection('closet').where({ _openid: openId }).get();

  const newItem = {
    _id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    category, // top, bottom, outer, shoes
    imageUrl,
    color: color || '未知',
    season: season || 'all',
    style: style || 'casual',
    tags: tags || [],
    uploadedAt: db.serverDate()
  };

  if (closet.data.length > 0) {
    // 更新现有衣橱
    const items = closet.data[0].items || [];
    items.push(newItem);
    await db.collection('closet').doc(closet.data[0]._id).update({
      data: { items, updatedAt: db.serverDate() }
    });
  } else {
    // 创建新衣橱
    await db.collection('closet').add({
      data: {
        _openid: openId,
        items: [newItem],
        createdAt: db.serverDate()
      }
    });
  }

  return { success: true, item: newItem };
}

/**
 * 获取用户衣橱
 */
async function getCloset(openId) {
  const closet = await db.collection('closet').where({ _openid: openId }).get();
  if (closet.data.length === 0) {
    return { success: true, items: [], categories: { top: 0, bottom: 0, outer: 0, shoes: 0 } };
  }
  const items = closet.data[0].items || [];

  // 统计各分类数量
  const categories = {
    top: items.filter(i => i.category === 'top').length,
    bottom: items.filter(i => i.category === 'bottom').length,
    outer: items.filter(i => i.category === 'outer').length,
    shoes: items.filter(i => i.category === 'shoes').length
  };

  return { success: true, items, categories };
}

/**
 * 从衣橱删除服饰
 */
async function deleteClothing(openId, itemId) {
  const closet = await db.collection('closet').where({ _openid: openId }).get();
  if (closet.data.length === 0) {
    return { success: false, error: '衣橱为空' };
  }

  const items = closet.data[0].items.filter(i => i._id !== itemId);
  await db.collection('closet').doc(closet.data[0]._id).update({
    data: { items, updatedAt: db.serverDate() }
  });

  return { success: true };
}

/**
 * 生成穿搭方案 (核心算法)
 */
async function generateOutfit(openId, options) {
  const { occasion, season, baziElement, weather } = options;

  // 获取用户衣橱
  const closetResult = await getCloset(openId);
  const items = closetResult.items;

  if (items.length < 2) {
    return { success: false, error: '衣橱服饰不足，至少需要上衣和下装' };
  }

  // 按分类筛选
  const tops = items.filter(i => i.category === 'top');
  const bottoms = items.filter(i => i.category === 'bottom');
  const outers = items.filter(i => i.category === 'outer');
  const shoesList = items.filter(i => i.category === 'shoes');

  if (tops.length === 0 || bottoms.length === 0) {
    return { success: false, error: '衣橱缺少上衣或下装' };
  }

  // 五行配色建议
  const luckyColors = baziElement && FASHION_DB[baziElement]
    ? FASHION_DB[baziElement].colors
    : [];
  const avoidColors = baziElement && FASHION_DB[baziElement]
    ? FASHION_DB[baziElement].avoid
    : [];

  // 场合风格映射
  const styleMap = {
    '工作': 'formal',
    '商务': 'formal',
    '约会': 'elegant',
    '聚会': 'elegant',
    '日常': 'casual',
    '休闲': 'casual',
    '运动': 'sporty'
  };
  const targetStyle = styleMap[occasion] || 'casual';

  // 季节筛选
  const currentMonth = new Date().getMonth();
  const currentSeason = currentMonth >= 2 && currentMonth <= 4 ? 'spring'
    : currentMonth >= 5 && currentMonth <= 7 ? 'summer'
    : currentMonth >= 8 && currentMonth <= 10 ? 'autumn'
    : 'winter';

  // 生成搭配方案
  const outfits = [];

  // 方案 1: 最佳配色搭配
  for (const top of tops) {
    for (const bottom of bottoms) {
      // 颜色协调性计算
      let colorScore = 0;
      if (baziElement) {
        const topLucky = luckyColors.some(c => top.color.includes(c));
        const bottomLucky = luckyColors.some(c => bottom.color.includes(c));
        const topAvoid = avoidColors.some(c => top.color.includes(c));
        const bottomAvoid = avoidColors.some(c => bottom.color.includes(c));

        if (topLucky && bottomLucky) colorScore += 30;
        else if (!topAvoid && !bottomAvoid) colorScore += 10;
        if (topAvoid || bottomAvoid) colorScore -= 20;
      } else {
        // 默认莫兰迪同色系
        colorScore += 10;
      }

      // 风格匹配
      const styleScore = (top.style === targetStyle || bottom.style === targetStyle) ? 20 : 0;

      // 季节适配
      const seasonScore = (top.season === currentSeason || top.season === 'all') ? 10 : -5;

      const totalScore = Math.min(100, Math.max(0, 50 + colorScore + styleScore + seasonScore));

      if (totalScore >= 60) {
        const outfit = {
          items: [top, bottom],
          score: totalScore,
          style: top.style || bottom.style,
          reason: baziElement
            ? `五行${baziElement}配色，${totalScore >= 80 ? '完美搭配' : '推荐搭配'}`
            : '莫兰迪色系，氛围感穿搭'
        };
        outfits.push(outfit);
      }
    }
  }

  // 方案 2-3: 基础搭配 (如果不五行)
  if (!baziElement && outfits.length < 3) {
    for (const top of tops.slice(0, 2)) {
      for (const bottom of bottoms.slice(0, 2)) {
        if (!outfits.some(o => o.items[0]._id === top._id && o.items[1]._id === bottom._id)) {
          outfits.push({
            items: [top, bottom],
            score: 65,
            style: 'casual',
            reason: '经典搭配，适合日常'
          });
        }
      }
    }
  }

  // 按分数排序，取前 3
  outfits.sort((a, b) => b.score - a.score);
  const result = outfits.slice(0, 3);

  // 如果有外套和鞋子，尝试添加
  if (outers.length > 0 && result.length > 0) {
    result[0].items.push(outers[0]);
    result[0].reason += ' + 外套';
  }
  if (shoesList.length > 0 && result.length > 0) {
    result[0].items.push(shoesList[0]);
    result[0].reason += ' + 鞋子';
  }

  // 保存穿搭历史
  await db.collection('outfits').add({
    data: {
      _openid: openId,
      occasion: occasion || '日常',
      baziElement: baziElement || '',
      outfits: result,
      createdAt: db.serverDate()
    }
  });

  return { success: true, outfits: result, meta: { season: currentSeason, targetStyle } };
}

/**
 * 获取穿搭历史
 */
async function getOutfitHistory(openId, limit = 10) {
  const history = await db.collection('outfits')
    .where({ _openid: openId })
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return { success: true, history: history.data };
}

// ============ 云函数入口 ============
exports.main = async (event, context) => {
  const { action, data } = event;

  try {
    const openId = event.userInfo ? event.userInfo.openId : data.openId;
    if (!openId) {
      return { success: false, error: '用户未登录' };
    }

    switch (action) {
      case 'uploadClothing':
        return await uploadClothing(openId, data);

      case 'getCloset':
        return await getCloset(openId);

      case 'deleteClothing':
        return await deleteClothing(openId, data.itemId);

      case 'generateOutfit':
        return await generateOutfit(openId, data);

      case 'getOutfitHistory':
        return await getOutfitHistory(openId, data.limit);

      default:
        return { success: false, error: '未知操作: ' + action };
    }
  } catch (error) {
    return { success: false, error: error.message, stack: error.stack };
  }
};