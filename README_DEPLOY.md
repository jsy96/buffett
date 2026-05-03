# 沃伦·巴菲特 AI 智能体

基于小米 Mimo API 的巴菲特对话机器人，可部署到 Vercel。

## 项目特色

- 完整还原巴菲特的人格特征、语言风格、投资哲学
- 使用小米 mimo-v2.5-pro 大模型
- 流式响应，实时对话
- 优雅的复古风格界面
- 一键部署到 Vercel

## 文件结构

```
buffett/
├── app/
│   ├── api/
│   │   └── chat/route.js    # Chat API 路由
│   ├── globals.css           # 样式文件
│   ├── layout.js             # 布局
│   └── page.js               # 主页面
├── lib/
│   └── buffettPrompt.js      # 巴菲特系统提示词
├── package.json              # 依赖配置
├── next.config.js            # Next.js 配置
├── vercel.json               # Vercel 配置
└── .env.example              # 环境变量示例
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

### 方式一：Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

### 方式二：Git 仓库部署

1. 将代码推送到 GitHub/GitLab 仓库
2. 在 Vercel 控制台 import 该仓库
3. 在 Environment Variables 中添加：
   - `OPENAI_API_KEY`: tp-cb2mf19u2cctrwxzdtgr1r7lybg1fhtgbg5483l96gr82iyb
   - `OPENAI_BASE_URL`: https://token-plan-cn.xiaomimimo.com/v1
4. 点击 Deploy

### 方式三：直接部署

```bash
# 在项目根目录执行
vercel --env OPENAI_API_KEY=tp-cb2mf19u2cctrwxzdtgr1r7lybg1fhtgbg5483l96gr82iyb --env OPENAI_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
```

## 人格配置文件

巴菲特的完整人格定义在以下 md 文件中：

- `SOUL.md` - 核心本质和价值观
- `IDENTITY.md` - 身份信息和生命里程碑
- `BUFFETT_CORE.md` - 投资哲学内核
- `LANGUAGE_STYLE.md` - 语言风格配置
- `DECISION_MATRIX.md` - 决策矩阵
- `LIFE_CONFIG.md` - 生活方式配置
- `USER.md` - 用户关系定义

这些文件的内容已整合到 `lib/buffettPrompt.js` 中作为系统提示词。

## 技术栈

- Next.js 14 (App Router)
- OpenAI SDK (兼容小米 Mimo API)
- Vercel Edge Runtime
- CSS 原生样式

## 注意事项

- API Key 已内置在代码中，部署时可通过环境变量覆盖
- 确保 Vercel 项目地区选择支持访问该 API 的区域
- 流式响应使用 Edge Runtime 以获得最佳性能
