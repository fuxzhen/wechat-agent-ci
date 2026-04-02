import os
import json
import random
from openai import OpenAI

class LLMService:
 # ============ 风格多样性数据库 ============
 STYLE_TEMPLATES = {
    # 按场景分类的穿搭风格
    "formal": [
        "business suit", "tailored blazer", "elegant formal dress", 
        "designer office wear", "power dressing", "executive attire"
    ],
    "casual": [
        "streetwear", "casual denim", "weekend relaxed fit",
        "athleisure", "smart casual", "lifestyle casual"
    ],
    "elegant": [
        "luxury evening gown", "designer cocktail dress", 
        "high-fashion editorial", "couture outfit", "red carpet look"
    ],
    "street": [
        "urban street style", "youth culture", "hip-hop fashion",
        "skater aesthetic", "vintage streetwear", "korean street fashion"
    ],
    "romantic": [
        "flowing maxi dress", "soft feminine silhouette", 
        "floral summer dress", "bohemian romantic", "lace details"
    ],
    "modern": [
        "contemporary minimalist", "japanese avant-garde", 
        "scandinavian design", "architectural fashion", "geometric cuts"
    ],
    "traditional": [
        "modern hanfu", "contemporary chinese traditional",
        "east-meets-west fusion", "cultural heritage wear"
    ]
 }

 # 场景词库 - 用于增加多样性
 SCENE_WORDS = [
    "studio lighting, professional fashion photography",
    "natural daylight, outdoor garden setting",
    "urban rooftop, city background",
    "minimalist white studio, clean background",
    "luxury interior backdrop, elegant setting",
    "art gallery atmosphere, creative environment"
 ]

 POSE_WORDS = [
    "confident standing pose, looking at camera",
    "walking pose, dynamic movement",
    "sitting pose, relaxed attitude",
    "side profile, artistic composition",
    "full body shot, fashion editorial style",
    "close-up portrait, emotional expression"
 ]

 @staticmethod
 def get_random_style_variation():
    """获取随机风格变体，增加生成多样性"""
    style = random.choice(list(LLMService.STYLE_TEMPLATES.keys()))
    style_item = random.choice(LLMService.STYLE_TEMPLATES[style])
    scene = random.choice(LLMService.SCENE_WORDS)
    pose = random.choice(LLMService.POSE_WORDS)
    return style_item, scene, pose, style

 @staticmethod
 def get_client():
 return OpenAI(
 api_key=os.environ.get("DEEPSEEK_API_KEY"), 
 base_url="https://api.deepseek.com",
 timeout=20.0
 )
 
 # 🚀 新增：阿里云千问视觉模型客户端
 @staticmethod
 def get_qwen_vl_client():
 return OpenAI(
 # ⚠️ 请确保在云托管的环境变量中配置了 DASHSCOPE_API_KEY
 api_key=os.environ.get("DASHSCOPE_API_KEY"), 
 base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
 timeout=25.0
 )

 # 🚀 新增：宠物特征视觉提取功能
 @staticmethod
 def analyze_pet_features(pet_image_url, pet_type):
 """让千问视觉模型精准提取宠物特征，转换为英文咒语"""
 client = LLMService.get_qwen_vl_client()
 prompt = f"Please describe the physical features of this {pet_type} in high detail in English. Focus on the breed, fur color, coat pattern, eye color, and any unique distinguishing marks. Keep it concise, under 40 words, suitable for a text-to-image prompt. Output ONLY the English description, with no introductory text."
 
 try:
 res = client.chat.completions.create(
 model="qwen-vl-max", # 极高精度的视觉模型
 messages=[
 {
 "role": "user",
 "content": [
 {"type": "text", "text": prompt},
 {"type": "image_url", "image_url": {"url": pet_image_url}}
 ]
 }
 ]
 )
 return res.choices[0].message.content.strip()
 except Exception as e:
 print(f"⚠️ [LLMService] 千问视觉提取失败，降级为普通描述: {e}")
 return f"a cute {pet_type}"

 @staticmethod
 def generate_basic(bazi_ctx, p_colors, pet_type=None):
 """【第一步】极速生成文案"""
 client = LLMService.get_client()
 has_pet = pet_type is not None and pet_type != ""
 
 # ============ 获取随机风格变体 ============
 style_item, scene, pose, style_category = LLMService.get_random_style_variation()
 
 if has_pet:
 scene_desc = f"一位神秘优雅的[性别]，穿着指定颜色[{p_colors['lucky_color_name']}]的服装，正在与一只独特、真实的[{pet_type}]幸福地互动（拥抱、抚摸、漫步）。"
 action_prompt = f"interaction with their {pet_type}, emotional, joyful,"
 else:
 scene_desc = f"一位神秘优雅的[性别]，穿着指定颜色[{p_colors['lucky_color_name']}]的{style_item}，{scene}。"
 action_prompt = f"{pose}, {style_item},"
 
 prompt = f"""
 基于本命[{bazi_ctx.get('u_day_gan', '')}{bazi_ctx.get('u_elem', '')}]与今日[{bazi_ctx.get('today_context', '')}]。
 【⚠️ 最高指令：旺运颜色已锁定】：
 - 今日专属旺运色（人类主体穿戴）：{p_colors['lucky_color_name']}
 【场景描述】：{scene_desc}
 【你的任务】：不许改变颜色，只负责围绕给定颜色与场景撰写文案。
 返回JSON: {{
 "fortune_proverb": "10字氛围感箴言(提及该颜色)",
 "style_desc": "将 '{p_colors['lucky_color_name']}' 翻译为英文, 结合 {action_prompt} {scene}, no text, 8k, extremely detailed, fashion photography"
 }}
 """
 try:
 res = client.chat.completions.create(model="deepseek-chat", messages=[{"role": "system", "content": prompt}], response_format={'type': 'json_object'})
 data = json.loads(res.choices[0].message.content)
 return {
 "fortune_proverb": data.get("fortune_proverb", "顺应天时，调和气场。"), "style_desc": data.get("style_desc", f"elegant {style_item}, {pose}, {scene}, no text"),
 "lucky_color_name": p_colors['lucky_color_name'], "lucky_color_hex": p_colors['lucky_hex_1'], "lucky_color_hex_2": p_colors['lucky_hex_2'],
 "style_category": style_category, "style_item": style_item
 }
 except:
 return {
 "fortune_proverb": "顺应天时，调和气场。", "lucky_color_name": p_colors['lucky_color_name'], "lucky_color_hex": p_colors['lucky_hex_1'], "lucky_color_hex_2": p_colors['lucky_hex_2'], 
 "style_desc": f"elegant {style_item}, {pose}, {scene}, no text",
 "style_category": style_category, "style_item": style_item
 }

 @staticmethod
 def generate_details(bazi_ctx, p_colors):
 """【第二步】推演十二维度运势"""
 client = LLMService.get_client()
 prompt = f"""
 基于本命[{bazi_ctx.get('u_day_gan', '')}{bazi_ctx.get('u_elem', '')}]与今日[{bazi_ctx.get('today_context', '')}]。
 【⚠️ 最高指令：系统已硬性规定今日色彩】：
 - 旺运色为：{p_colors['lucky_color_name']} (属{p_colors['lucky_elem']})
 - 禁忌色为：{p_colors['taboo_color_name']} (属{p_colors['taboo_elem']})
 你的任务是解释为什么选用旺运色、避开禁忌色，并补全运势。
 返回JSON: {{
 "aura_overview": "气场总览(30字)", "lucky_color_reason": "选色原因(20字，基于生克)", "taboo_color_reason": "避开原因(20字，基于生克)",
 "wealth": "财富(10字)", "career": "事业(10字)", "love": "感情(10字)", "health": "健康(10字)",
 "directions": "如: 财神正南", "auspicious_time": "如: 09:00-11:00", "warning_note": "神煞提醒", "mantra_keyword": "2字词", "mantra_quote": "调侯箴言"
 }}
 """
 try:
 res = client.chat.completions.create(model="deepseek-chat", messages=[{"role": "system", "content": prompt}], response_format={'type': 'json_object'})
 data = json.loads(res.choices[0].message.content)
 data['taboo_color_name'] = p_colors['taboo_color_name']
 data['taboo_color_hex'] = p_colors['taboo_hex_1']
 data['taboo_color_hex_2'] = p_colors['taboo_hex_2']
 return data
 except:
 return {
 "aura_overview": "气场平稳，顺应自然即可。", "lucky_color_reason": "顺应五行，调和气场。", "taboo_color_name": p_colors['taboo_color_name'], "taboo_color_hex": p_colors['taboo_hex_1'], "taboo_color_hex_2": p_colors['taboo_hex_2'], "taboo_color_reason": "此色泄耗元气，易引波澜。",
 "wealth": "平稳宜守", "career": "低调行事", "love": "多加沟通", "health": "注意情绪", "directions": "财神正南", "auspicious_time": "09:00 - 11:00", "warning_note": "宜静不宜动", "mantra_keyword": "顺应", "mantra_quote": "天地有常，顺其自然。"
 }
