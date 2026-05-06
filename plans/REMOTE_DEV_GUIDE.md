# NEMT 远程开发环境配置指南

## 服务器信息

| 项目 | 详情 |
|---|---|
| IP | `<server-ip>` |
| 端口 | 22 |
| 用户 | `<ssh-user>` |
| 系统 | Ubuntu 22.04.5 LTS |
| Node | v20.20.2 |
| Docker | 29.4.2 |
| 项目目录 | /opt/nemt-platform |

---

## 一、WebStorm Gateway 远程连接

### 1.1 打开 Gateway

启动 WebStorm → 欢迎界面 → **Remote Development** → **New Connection**

或者：`File → Remote Development → Connect to SSH`

### 1.2 填写连接信息

```text
SSH Configuration:
  Host:     <server-ip>
  Port:     22
  Username: <ssh-user>
  Authentication: SSH key or secret from local credential manager

Project Directory:
  /opt/nemt-platform
```

建议优先使用 **SSH key**，不要在仓库文档中保存明文密码。

### 1.3 等待 IDE 后端安装

Gateway 会自动在服务器上安装 JetBrains IDE Backend（约 5-10 分钟，仅首次需要）。

安装完成后会自动打开 WebStorm 窗口，此时：
- 代码存于远程 `/opt/nemt-platform`
- 终端打开的 shell 就是远程服务器的 shell
- `npm run` / `npx` / `docker` 全部跑在服务器上

### 1.4 首次连接后的操作

在 WebStorm 内嵌终端中：

```bash
# 克隆项目
cd /opt/nemt-platform
git clone <YOUR_REPO_URL> .

# 安装依赖
npm install

# 验证编译
npx tsc --noEmit
```

---

## 二、JetBrains 工具栏 — 快捷重连

连接过一次后，WebStorm 欢迎界面会显示历史连接记录。

也可以通过 `File → Recent Projects` 直接下拉选择远程项目。

---

## 三、CI/CD 持续集成环境

### 3.1 脚本位置

服务器 `/opt/nemt-platform/scripts/` 下已有自动化脚本：

```bash
cd /opt/nemt-platform/scripts
ls -la
# build.sh     - 完整构建（typecheck + lint + vite build）
# deploy.sh    - 构建 + Docker 打包
# auto-pull.sh - 定时拉取 + 构建 + 通知
```

### 3.2 手动触发构建

```bash
# 仅编译检查
bash /opt/nemt-platform/scripts/build.sh

# 构建 + Docker 镜像打包
bash /opt/nemt-platform/scripts/deploy.sh
```

### 3.3 定时自动同步（每 10 分钟拉取一次）

当前已配置 cron：

```bash
# 查看 cron 配置
crontab -l
# */10 * * * * cd /opt/nemt-platform && bash scripts/auto-pull.sh >> /opt/nemt-platform/logs/auto-pull.log 2>&1
```

### 3.4 手动同步

```bash
cd /opt/nemt-platform
git pull origin main
npm install
npx tsc --noEmit
```

---

## 四、远程服务器快速操作

| 操作 | 命令 |
|---|---|
| 登录服务器 | `ssh <ssh-user>@<server-ip>` |
| 查看构建日志 | `tail -f /opt/nemt-platform/logs/auto-pull.log` |
| 手动构建 | `bash /opt/nemt-platform/scripts/build.sh` |
| Docker 镜像列表 | `docker images \| grep nemt` |
| 容器运行状态 | `docker ps -a` |
| 重启 Docker 服务 | `systemctl restart docker` |
```
