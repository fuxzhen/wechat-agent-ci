#!/usr/bin/env python3
"""
智搭 StyleMate - 八字五行穿搭分析引擎 v2.1
- 今日宜穿 + 不宜穿
- 配置文件支持
- 定时运行模式
"""
import os
import sys
import json
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from lunar_python import Solar, Lunar

# ============ 配置 ============
CONFIG_FILE = Path(__file__).parent / "config.json"
GAN_WUXING = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火',
    '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
}
ZHI_WUXING = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
}
GENERATION = {'木': '火', '火': '土', '土': '金', '金': '水', '水': '木'}
DESTRUCTION = {'木': '土', '土': '水', '水': '火', '火': '金', '金': '木'}

# 五行时尚数据库 (包含不宜穿)
FASHION_DB = {
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
}


def load_config():
    """加载配置文件"""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None


def save_config(birth, name="User"):
    """保存配置文件"""
    config = {
        "name": name,
        "birth": birth  # {"year": 1995, "month": 5, "day": 20, "hour": 8}
    }
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
    print(f"✅ 配置已保存到 {CONFIG_FILE}")


class BaziEngine:
    def __init__(self, year, month, day, hour):
        self.solar = Solar.fromYmdHms(year, month, day, hour, 0, 0)
        self.lunar = self.solar.getLunar()
        self.bazi = self.lunar.getBaZi()
        self.year_ganzhi = self.bazi[0]
        self.month_ganzhi = self.bazi[1]
        self.day_ganzhi = self.bazi[2]
        self.time_ganzhi = self.bazi[3]
    
    @property
    def day_gan(self):
        return self.lunar.getDayGan()
    
    @property
    def day_zhi(self):
        return self.lunar.getDayZhi()
    
    @property
    def user_element(self):
        return GAN_WUXING.get(self.day_gan, '土')
    
    def analyze_daily(self, target_date=None):
        if target_date is None:
            target_date = datetime.now()
        
        today_solar = Solar.fromYmdHms(target_date.year, target_date.month, target_date.day, 12, 0, 0)
        today_lunar = today_solar.getLunar()
        today_gan = today_lunar.getDayGan()
        today_element = GAN_WUXING.get(today_gan, '土')
        
        user_elem = self.user_element
        
        # 算法逻辑
        if user_elem == today_element:
            lucky = GENERATION[user_elem]
            reason = f"今日{today_element}气与你日主相同，能量充沛。建议穿【{lucky}】系泄秀，展现才华"
            logic = "同气相求 → 泄秀"
        elif GENERATION.get(today_element) == user_elem:
            lucky = GENERATION[user_elem]
            reason = f"今日{today_element}气滋养你，贵人运旺！穿【{lucky}】系能展现魅力"
            logic = "印星当令 → 泄秀"
        elif user_elem == GENERATION.get(today_element):
            lucky = [k for k, v in GENERATION.items() if v == user_elem][0]
            reason = f"今日{today_element}耗你心神，易感疲惫。穿【{lucky}】系补充能量"
            logic = "食伤泄气 → 补印"
        elif DESTRUCTION.get(today_element) == user_elem:
            lucky = [k for k, v in GENERATION.items() if v == user_elem][0]
            reason = f"今日{today_element}克你，压力有点大。穿【{lucky}】系获得支持"
            logic = "官杀攻身 → 补印"
        else:
            lucky = [k for k, v in GENERATION.items() if v == user_elem][0]
            reason = f"今日{today_element}为你所克，付出较多。穿【{lucky}】系补充能量"
            logic = "财多身弱 → 补印"
        
        # 获取时尚数据
        fashion = FASHION_DB.get(lucky, FASHION_DB["土"])
        
        # 计算不宜穿（五行相克）
        avoid_element = DESTRUCTION.get(user_elem)  # 克我者为官杀，不宜
        avoid_fashion = FASHION_DB.get(avoid_element, {})
        
        return {
            "date": target_date.strftime("%Y-%m-%d"),
            "weekday": target_date.strftime("%A"),
            "user": {
                "birth": f"{self.year_ganzhi} {self.month_ganzhi} {self.day_ganzhi} {self.time_ganzhi}",
                "day_master": self.day_gan,
                "element": user_elem
            },
            "today": {
                "ganzhi": today_lunar.getDayInGanZhi(),
                "element": today_element
            },
            "recommendation": {
                "lucky_element": lucky,
                "colors": fashion["colors"],
                "avoid_colors": avoid_fashion.get("colors", []),
                "materials": fashion["materials"],
                "style": fashion["style"],
                "vibe": fashion["vibe"],
                "keywords": fashion["keywords"]
            },
            "analysis": {
                "logic": logic,
                "reason": reason
            }
        }
    
    def generate_image_prompt(self, daily_data):
        rec = daily_data["recommendation"]
        prompt = f"""Fashion photography, {', '.join(rec['colors'][:2])} color palette, 
{', '.join(rec['materials'][:2])} fabric texture, {rec['style']}, 
model wearing {rec['keywords']} outfit, {rec['vibe']} atmosphere, 
studio lighting, fashion magazine style, 8k, detailed, elegant"""
        return prompt


def main():
    parser = argparse.ArgumentParser(description="智搭 StyleMate - 八字穿搭分析 v2.1")
    parser.add_argument("--birth", "-b", nargs=6, metavar=("Y", "M", "D", "H", "M", "S"),
                        help="生日: 年 月 日 时 分 秒")
    parser.add_argument("--date", "-d", help="目标日期 (YYYY-MM-DD), 默认今天")
    parser.add_argument("--image", "-i", action="store_true", help="生成 AI 穿搭图")
    parser.add_argument("--json", "-j", action="store_true", help="输出 JSON 格式")
    parser.add_argument("--save", "-s", action="store_true", help="保存配置")
    parser.add_argument("--fal-key", help="Fal.ai API Key")
    parser.add_argument("--cron", action="store_true", help="定时模式（不打印，直接返回JSON）")
    
    args = parser.parse_args()
    
    # 加载配置或使用默认
    config = load_config()
    
    if args.birth:
        year, month, day, hour, minute, second = map(int, args.birth)
        if args.save:
            save_config({"year": year, "month": month, "day": day, "hour": hour})
    elif config and "birth" in config:
        b = config["birth"]
        year, month, day, hour = b["year"], b["month"], b["day"], b.get("hour", 8)
    else:
        # 默认
        year, month, day, hour = 1995, 5, 20, 8
    
    engine = BaziEngine(year, month, day, hour)
    
    # 目标日期
    if args.date:
        target = datetime.strptime(args.date, "%Y-%m-%d")
    else:
        target = datetime.now()
    
    report = engine.analyze_daily(target)
    
    if args.json or args.cron:
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return
    
    # 打印报告
    name = config.get("name", "") if config else ""
    print("\n" + "="*55)
    print(f"🌿 智搭 StyleMate 每日穿搭运势 {f'- {name}' if name else ''}")
    print("="*55)
    print(f"📅 {report['date']} {report['weekday']}")
    print(f"👤 你的八字: {report['user']['birth']}")
    print(f"🔮 日主: {report['user']['day_master']} ({report['user']['element']}性)")
    print("-"*55)
    print(f"🗓️ 今日: {report['today']['ganzhi']} ({report['today']['element']}气)")
    print(f"💡 算法: {report['analysis']['logic']}")
    print("-"*55)
    print(f"✅ 宜穿【{report['recommendation']['lucky_element']}】({report['recommendation']['vibe']})")
    print(f"   🎨 {', '.join(report['recommendation']['colors'])}")
    print(f"   🧵 {', '.join(report['recommendation']['materials'])}")
    print("-"*55)
    print(f"❌ 不宜穿【{DESTRUCTION.get(report['user']['element'])}】系")
    print(f"   🚫 {', '.join(report['recommendation']['avoid_colors'])}")
    print("-"*55)
    print(f"💬 {report['analysis']['reason']}")
    print("="*55)
    
    if args.image:
        prompt = engine.generate_image_prompt(report)
        print(f"\n🎨 AI 提示词: {prompt[:100]}...")


if __name__ == "__main__":
    main()
