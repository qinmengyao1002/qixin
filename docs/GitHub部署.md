完整版运行在 Cloudflare Workers，访客、账号和房间状态存储在 D1。在目标 Cloudflare 账户创建名为 qixin-sanctuary 的空 D1 数据库，记录其 UUID。GitHub 仓库的 Settings → Secrets and variables → Actions 中，添加变量 CLOUDFLARE_ACCOUNT_ID 和 QIXIN_D1_ID，添加机密 CLOUDFLARE_API_TOKEN（目标账户的 Workers Scripts Edit 与 D1 Edit 权限）。
将 docs/deploy-workflow.yml 复制到 .github/workflows/deploy.yml 并提交后，从 Actions 手动运行 Deploy Qixin Sanctuary。该任务安装锁定的依赖、构建、应用 drizzle 数据库迁移，并发布游戏与静态资源。以 Wrangler 输出的实际访问地址为准。首次发布后用两个独立浏览器进入同一院落检查彼此可见，并验证邮箱注册、退出和再次登录。

