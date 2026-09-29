@echo off
chcp 65001 > nul
echo ===================================================
echo   Đang đóng gói Universal Video Controller thành ZIP...
echo ===================================================

set OUTPUT_ZIP=universal-video-controller.zip

if exist "%OUTPUT_ZIP%" del "%OUTPUT_ZIP%"

powershell -NoProfile -Command "Compress-Archive -Path 'manifest.json', 'content.js', 'content.css', 'popup.html', 'popup.js', 'popup.css', 'icons' -DestinationPath '%OUTPUT_ZIP%'"

if exist "%OUTPUT_ZIP%" (
    echo.
    echo [THÀNH CÔNG] Đã tạo file: %OUTPUT_ZIP%
    echo Bạn có thể gửi file này cho người khác hoặc tải lên mục Releases trên GitHub!
) else (
    echo.
    echo [LỖI] Không thể tạo file ZIP.
)

echo.
pause
