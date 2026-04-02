require('dotenv').config({ path: '../.env' });
const ci = require('miniprogram-ci'); 
const path = require('path');

const version = `1.3.${new Date().getMonth() + 1}${new Date().getDate()}`;

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
  
  console.log(`🚀 准备上传版本 ${version} ...`);
  
  try {
    await ci.upload({ 
      project, 
      version, 
      desc: 'OpenClaw 自动部署', 
      setting: { es6: true, minify: true } 
    });
    console.log('✅ 上传成功！请在微信后台提交审核。');
  } catch (error) { 
    console.error('❌ 上传失败:', error); 
  }
})();
