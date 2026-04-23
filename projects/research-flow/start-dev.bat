@echo off
setlocal enabledelayedexpansion

chcp 65001 > nul
cd /d "%~dp0"

set "PROJECT_ROOT=%~dp0.."
echo ========================================
echo   ResearchFlow 启动脚本 (SQLite版)
echo ========================================

:: ── 检查 Docker 并启动 Postgres（如果需要） ──
echo.
echo [1/6] 检查 PostgreSQL 服务...
docker inspect --format='{{.State.Running}}' researchflow-db >nul 2>&1 || docker-compose -f "%PROJECT_ROOT%\docker-compose.yml" up -d postgres
timeout /t 5 >nul

:: ── 后端：npm install（仅首次检查依赖） ──
echo.
echo [2/6] 确保后端依赖已安装...
if not exist "%PROJECT_ROOT%\backend\node_modules\.git" (
    echo 缺少后端依赖，正在安装...
    powershell -Command "Start-Process cmd -ArgumentList '/c npm install' -WorkingDirectory '%PROJECT_ROOT%\backend' -NoNewWindow -Wait" >nul
)

:: ── 后端：迁移 + 种子 ──
echo.
echo [3/6] 数据库迁移与种子数据...
powershell -Command "Start-Process cmd -ArgumentList '/c npm run db:setup' -WorkingDirectory '%PROJECT_ROOT%\backend' -NoNewWindow -Wait" >nul

:: ── 后端：编译 + 启动 ──
echo.
echo [4/6] 后端编译...
powershell -Command "Start-Process cmd -ArgumentList '/c npm run build' -WorkingDirectory '%PROJECT_ROOT%\backend' -NoNewWindow -Wait" >nul

echo.
echo [5/6] 启动后端服务...
start /b cmd /c "cd /d %PROJECT_ROOT%\backend && npm run dev > backend.log 2>&1"
timeout /t 4 >nul

:: ── 前端：npm install（仅首次检查依赖） ──
echo.
echo [6/6] 确保前端依赖已安装...
if not exist "%PROJECT_ROOT%\feishu-app\node_modules\.git" (
    echo 缺少前端依赖，正在安装...
    powershell -Command "Start-Process cmd -ArgumentList '/c npm install' -WorkingDirectory '%PROJECT_ROOT%\feishu-app' -NoNewWindow -Wait" >nul
)

echo.
echo [Done] 环境已准备就绪！
echo.
echo 启动步骤：
set /p choice="是否在浏览器打开前端？(y/n): "
if /i "!choice!"=="y" (
    start http://localhost:5173
)

echo.
echo 后端日志：%PROJECT_ROOT%\backend\backend.log
echo.