require('dotenv').config({ path: '../.env' });
const ci = require('miniprogram-ci'); 
const path = require('path');

const appId = process.env.WX_APP_ID; 
const keyFileName = process.env.WX_PRIVATE_KEY_PATH;

if (!appId || !keyFileName) { 
  console.error('❌ 未找到配置，请检查 .env'); 
  process.exit(1); 
}

(async () => {
  const project = new ci.Project({ 
    appid: appId, 
    type: 'miniProgram', 
    projectPath: __dirname, 
    privateKeyPath: path.join(__dirname, keyFileName), 
    ignores: ['node_modules/**/*'] 
  });
  
  console.log(`⏳ 拉起微信引擎 (AppID: ${appId})，生成预览二维码...`);
  
  try {
    await ci.preview({ 
      project, 
      desc: 'OpenClaw 编译', 
      setting: { es6: true, minify: true }, 
      qrcodeFormat: 'image', 
      qrcodeOutputDest: path.join(__dirname, 'preview.jpg') 
    });
    console.log('✅ 预览码生成成功！请扫码 preview.jpg');
  } catch (error) { 
    console.error('❌ 生成失败:', error); 
  }
})();
