import os
import random
import fal_client
import traceback

class ImageService:
    # ============ 扩展的风格词库 ============
    FABRIC_TERMS = [
        "silk fabric", "cotton linen", "velvet texture", "cashmere wool",
        "satin finish", "denim material", "leather texture", "chiffon flow",
        "wool blend", "organic cotton", "stretch fabric", "breathable mesh"
    ]
    
    ACCESSORY_TERMS = [
        "designer handbag", "elegant watch", "statement necklace", 
        "silk scarf", "designer sunglasses", "minimalist jewelry",
        "leather belt", "subtle earrings", "fashion brooch"
    ]
    
    LIGHTING_WORDS = [
        "soft natural light", "studio spotlight", "golden hour lighting",
        "dramatic chiaroscuro", " diffused daylight", "neon accent light"
    ]
    
    @staticmethod
    def get_fabric_variation():
        return random.choice(ImageService.FABRIC_TERMS)
    
    @staticmethod
    def get_accessory_variation():
        return random.choice(ImageService.ACCESSORY_TERMS)
    
    @staticmethod
    def get_lighting_variation():
        return random.choice(ImageService.LIGHTING_WORDS)

    @staticmethod
    def generate_image(gender: str, color: str, desc: str, reference_image_url: str, pet_vision_desc=None, style_info=None):
        """调用 Fal.ai 生成穿搭大片（结合千问视觉，确保 API 单图安全）"""
        os.environ["FAL_KEY"] = os.environ.get("FAL_KEY", "")
        has_pet = pet_vision_desc is not None and str(pet_vision_desc).strip() != ""
        
        # 获取随机变体
        fabric = ImageService.get_fabric_variation()
        lighting = ImageService.get_lighting_variation()
        
        # 如果传入了风格信息，使用它；否则使用默认值
        if style_info and isinstance(style_info, dict):
            style_item = style_info.get("style_item", "elegant fashion")
            style_category = style_info.get("style_category", "elegant")
        else:
            style_item = "elegant fashion attire"
            style_category = "elegant"
        
        try:
            if has_pet:
                # 把千问提取的宠物花色直接塞入描述
                prompt = f"Professional fashion photography of an Asian {gender} wearing {color} clothes, {desc}, {fabric} texture, {lighting}, {style_item}. The pet is exactly like this: {pet_vision_desc}. Emotional connection, warm atmosphere, extremely high detail, 8k, fashion magazine cover, high-end editorial style"
                handler = fal_client.submit(
                    "fal-ai/flux-pulid",
                    arguments={
                        "prompt": prompt,
                        "reference_image_url": reference_image_url, # 绝对稳定，只传人脸
                        "image_size": "portrait_16_9"
                    }
                )
            else:
                prompt = f"Professional fashion photography of an Asian {gender}, wearing {color} clothes, {desc}, {fabric} texture, {lighting}, {style_item}, extremely high detail, 8k, fashion editorial, detailed fabric folds, sharp focus, professional photography"
                handler = fal_client.submit(
                    "fal-ai/flux-pulid",
                    arguments={
                        "prompt": prompt,
                        "reference_image_url": reference_image_url, 
                        "image_size": "portrait_16_9"
                    }
                )
            
            result = handler.get()
            return result['images'][0]['url']
            
        except Exception as e:
            print(f"❌ [ImageService] 生图调用异常:\n{traceback.format_exc()}")
            raise Exception(f"AI 生图失败: {str(e)}")
