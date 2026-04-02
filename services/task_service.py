import traceback
from services.bazi_service import BaziService
from services.llm_service import LLMService
from services.image_service import ImageService

tasks_db = {}

class TaskService:
 @staticmethod
 def process_ai_task(task_id: str, req):
 try:
 print(f"[{task_id}] 1. 开始算八字")
 ctx = BaziService.calculate_bazi_context(req.user_info)
 u_gan = ctx.get("u_day_gan") or ctx.get("day_master") or ctx.get("u_elem")
 today_gan = ctx.get("today_gan") or ctx.get("today_context")
 u_rel = BaziService.calculate_personal_elements(u_gan, today_gan, user_id=task_id)
 
 pet_type = getattr(req, 'pet_type', None)
 pet_image_url = getattr(req, 'pet_image_url', None)
 
 print(f"[{task_id}] 2. 极速生成首页基础文案")
 basic_data = LLMService.generate_basic(ctx, u_rel, pet_type=pet_type)
 
 # 🚀 2.5 核心拦截：如果上传了宠物，让千问先看图写出详细特征
 pet_vision_desc = None
 if pet_image_url and pet_type:
 print(f"[{task_id}] 2.5 启动千问视觉引擎提取宠物特征...")
 pet_vision_desc = LLMService.analyze_pet_features(pet_image_url, pet_type)
 
 print(f"[{task_id}] 3. 请求生图大片")
 # 提取风格信息传递给图片服务
 style_info = None
 if basic_data:
     style_info = {
         "style_category": basic_data.get("style_category"),
         "style_item": basic_data.get("style_item")
     }
 final_image_url = ImageService.generate_image(
 ctx.get("gender", "女"),
 basic_data["lucky_color_name"],
 basic_data["style_desc"],
 req.image_url,
 pet_vision_desc=pet_vision_desc, # 传入降维后的文字特征
 style_info=style_info
 )
 
 print(f"[{task_id}] 4. 第一阶段完成，通知前端展开大片")
 tasks_db[task_id] = {
 "status": "basic_done", "final_image": final_image_url, "bazi_header": ctx.get("bazi_header", "今日运势"),
 "day_master": ctx.get("day_master", "命理推演"), "basic_data": basic_data, "report_data": None
 }
 
 print(f"[{task_id}] 5. 后台继续推演十二维度报告")
 detail_data = LLMService.generate_details(ctx, u_rel)
 tasks_db[task_id]["report_data"] = {**basic_data, **detail_data}
 tasks_db[task_id]["status"] = "full_done"

 except Exception as e:
 print(f"❌ 任务 {task_id} 崩溃:\n{traceback.format_exc()}")
 tasks_db[task_id] = {"status": "error", "error": str(e)}
