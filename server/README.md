# 舔了么 - NestJS 后端

## 技术栈

- **框架**: NestJS 10
- **数据库**: PostgreSQL（通过 TypeORM）
- **认证**: 微信登录 + JWT
- **安全**: Helmet、CORS 白名单、速率限制（Throttler）
- **文档**: Swagger / OpenAPI（仅开发环境）

## 快速开始

### 1. 安装依赖

```bash
cd server
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入真实值：

```bash
cp .env.example .env
```

| 变量 | 说明 |
|------|------|
| `WX_APPID` | 微信小程序 AppID |
| `WX_SECRET` | 微信小程序 AppSecret |
| `JWT_SECRET` | JWT 签名密钥（生产环境请使用 `openssl rand -base64 32` 生成） |
| `JWT_EXPIRES_IN` | Token 有效期，默认 `30d` |
| `DB_HOST` | PostgreSQL 主机 |
| `DB_PORT` | PostgreSQL 端口，默认 `5432` |
| `DB_DATABASE` | 数据库名称 |
| `DB_USERNAME` | 数据库用户名 |
| `DB_PASSWORD` | 数据库密码 |
| `PORT` | 服务端口，默认 `3000` |
| `NODE_ENV` | 环境：`development` / `production` |
| `CORS_ORIGINS` | CORS 允许的域名（逗号分隔） |

### 3. 启动服务

```bash
# 开发模式（热重载）
pnpm run start:dev

# 生产模式
pnpm run build
NODE_ENV=production pnpm run start:prod
```

### 4. 查看 API 文档

开发环境启动后访问：`http://localhost:3000/api`（生产环境自动关闭）

### 5. 健康检查

`GET /health` — 返回 `{ status: "ok", timestamp: "..." }`

## API 概览

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 微信登录，返回 JWT token |
| GET | `/auth/profile` | 获取当前用户资料 |
| PUT | `/auth/profile` | 更新昵称/头像 |

### 舔狗记录

> 需要 `Authorization: Bearer <token>` 请求头

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/records` | 获取所有记录 |
| POST | `/records` | 新增记录 |
| DELETE | `/records/:id` | 删除记录 |
| POST | `/records/sync` | 批量同步本地记录 |

### 社区

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/community/posts?page=1&limit=20` | 获取帖子列表（支持分页） |
| POST | `/community/posts` | 发布帖子 |
| POST | `/community/posts/:id/like` | 点赞/取消点赞 |
| GET | `/community/ranking` | 获取排行榜 |

### 树洞

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/treehole` | 获取树洞列表 |
| POST | `/treehole` | 匿名发布故事（需认证） |
| PUT | `/treehole/:id/vote` | 投票（需认证，每人限投一次） |

### 统计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/stats` | 获取当前用户统计数据 |

## 生产部署注意事项

1. `NODE_ENV` 必须设为 `production`（关闭 `synchronize` 和 Swagger）
2. 使用 TypeORM migration 管理数据库 schema 变更
3. `JWT_SECRET` 必须使用高强度随机字符串
4. `CORS_ORIGINS` 限制为真实业务域名
5. `.env` 文件不要提交到 Git

## 项目结构

```
server/
├── src/
│   ├── auth/           # 微信登录 + JWT 认证
│   ├── records/        # 舔狗记录 CRUD
│   ├── community/      # 社区帖子 + 点赞（事务保护）
│   ├── treehole/       # 树洞（防重复投票）
│   ├── stats/          # 统计数据
│   ├── common/
│   │   ├── guards/     # AuthGuard
│   │   └── decorators/ # @CurrentUser()
│   ├── health.controller.ts
│   ├── app.module.ts
│   └── main.ts
├── .env.example
└── package.json
```
