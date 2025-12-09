@echo off
set PORT=3000
set WORKDIR=F:\Coding\humAInity\humainity

echo [1] 结束占用 %PORT% 的进程...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
  echo    Kill PID %%p
  taskkill /PID %%p /F >nul 2>nul
)

echo [2] 清理 .next 锁文件...
del /f /q "%WORKDIR%\.next\dev\lock" 2>nul

echo [3] 启动开发服务器...
cd /d "%WORKDIR%"
:: 当前窗口启动
npm run dev
:: 如需新窗口保持运行，注释上面一行，启用下面一行：
:: start "humainity-dev" cmd /k "cd /d %WORKDIR% && npm run dev"

