@echo off
chcp 65001 > nul
title App Inventor Code Breaker Local Server
echo ========================================================
echo   App Inventor: The Code Breaker Mission v3.0
echo   กำลังเริ่มต้นเซิร์ฟเวอร์จำลองในเครื่อง...
echo ========================================================

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    node server.js
    goto end
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo พบ Python กำลังเริ่มเซิร์ฟเวอร์ที่พอร์ต 3000...
    start http://localhost:3000
    python -m http.server 3000
    goto end
)

echo [ข้อผิดพลาด] ไม่พบ Node.js หรือ Python ในระบบ
echo กรุณาเปิดโปรเจกต์ผ่าน VS Code Live Server แทนครับ
pause

:end
