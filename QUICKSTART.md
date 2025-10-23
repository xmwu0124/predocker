# PreDocker Quick Start Guide 🚀

欢迎使用PreDocker！这个指南会帮你在**10分钟内**启动项目。

## 前置要求

确保你的Mac上已安装：
- ✅ Node.js (v18+) - 运行 `node -v` 检查
- ✅ Python 3.8+ - 运行 `python3 --version` 检查
- ✅ Git

如果没有安装Node.js，访问 https://nodejs.org 下载安装。

## 第一步：克隆项目

```bash
# 1. 在GitHub上创建仓库后，克隆到本地
git clone https://github.com/你的用户名/predocker.git
cd predocker
```

如果还没创建GitHub仓库：
```bash
# 1. 把我给你的文件放到一个文件夹
cd predocker

# 2. 初始化git
git init
git add .
git commit -m "Initial commit: PreDocker MVP"

# 3. 在GitHub创建新仓库，然后：
git remote add origin https://github.com/你的用户名/predocker.git
git push -u origin main
```

## 第二步：设置前端

```bash
# 进入frontend目录
cd frontend

# 安装依赖（第一次会比较慢，3-5分钟）
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问 **http://localhost:3000** - 你应该能看到PreDocker界面了！🎉

## 第三步：设置Python爬虫

打开新的终端窗口：

```bash
# 回到项目根目录
cd predocker

# 进入scraper目录
cd scraper

# 创建Python虚拟环境（推荐）
python3 -m venv venv
source venv/bin/activate  # Mac/Linux

# 安装依赖
pip install -r requirements.txt

# 运行爬虫（第一次运行会创建数据库）
python scraper.py
```

**注意**：默认爬虫需要你根据predoc.org的实际HTML结构调整代码中的CSS选择器。

## 项目结构说明

```
predocker/
├── frontend/           # Next.js前端应用
│   ├── app/           # 页面和路由
│   ├── lib/           # 工具函数（包括数据库）
│   └── components/    # React组件（后续添加）
├── scraper/           # Python爬虫
│   ├── scraper.py    # 主爬虫脚本
│   └── jobs.json     # 导出的职位数据
├── database/          # SQLite数据库
│   ├── schema.md     # 数据库设计文档
│   └── predocker.db  # 数据库文件（运行后生成）
└── README.md
```

## 常见问题

### Q: 端口3000已被占用？
```bash
# 使用其他端口
npm run dev -- -p 3001
```

### Q: Python依赖安装失败？
```bash
# 尝试升级pip
pip install --upgrade pip
# 然后重新安装
pip install -r requirements.txt
```

### Q: npm install很慢？
```bash
# 使用国内镜像
npm install --registry=https://registry.npmmirror.com
```

## 下一步做什么？

### 立即可做：
1. **调试爬虫** - 修改`scraper/scraper.py`中的CSS选择器以匹配predoc.org实际结构
2. **添加真实数据** - 运行爬虫后，刷新前端页面看真实职位
3. **自定义界面** - 修改`frontend/app/page.tsx`改变UI

### 本周目标：
- [ ] 完善爬虫，能正确抓取10+职位
- [ ] 添加"添加职位"按钮的实际功能
- [ ] 实现申请状态切换功能
- [ ] 添加搜索和过滤

### 长期规划：
- [ ] 用户认证系统
- [ ] 文件上传功能
- [ ] 邮件提醒
- [ ] 数据可视化图表
- [ ] 移动端适配

## 需要帮助？

- 📖 查看完整README: `README.md`
- 💾 数据库设计: `database/schema.md`
- 🐛 遇到bug？在GitHub提issue

---

**提示**：建议每完成一个小功能就commit一次，这样可以随时回退：
```bash
git add .
git commit -m "Add feature: xxx"
git push
```

祝开发顺利！🎓
