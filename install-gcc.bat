@echo off
chcp 65001 >nul
echo.
echo   🔧 C 编译器安装工具
echo   ════════════════════
echo.

REM 检查是否已有 gcc
where gcc >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ gcc 已安装在 PATH 中
    gcc --version | findstr /C:"gcc"
    goto :done
)

REM 检查 winget 安装的 WinLibs
for /d %%i in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\BrechtSanders.WinLibs*") do (
    if exist "%%i\bin\gcc.exe" (
        echo   ✅ 找到 gcc: %%i\bin\gcc.exe
        setx PATH "%PATH%;%%i\bin" >nul
        set PATH=%PATH%;%%i\bin
        goto :done
    )
    for /d %%j in ("%%i\*") do (
        if exist "%%j\bin\gcc.exe" (
            echo   ✅ 找到 gcc: %%j\bin\gcc.exe
            setx PATH "%PATH%;%%j\bin" >nul
            set PATH=%PATH%;%%j\bin
            goto :done
        )
    )
)

echo   📥 正在通过 winget 安装 MinGW-w64...
echo   这可能需要几分钟，请耐心等待...
echo.

winget install BrechtSanders.WinLibs.POSIX.UCRT --accept-package-agreements --accept-source-agreements

if %errorlevel% equ 0 (
    echo   ✅ 安装完成！请重启终端后生效。
) else (
    echo   ❌ 安装失败。请手动下载：
    echo   https://winlibs.com/
    echo   或
    echo   https://github.com/brechtsanders/winlibs_mingw/releases
    echo.
    echo   下载后解压，将 bin 目录添加到系统 PATH 即可。
)

:done
echo.
echo   安装完成后重新启动 C语言学习平台:
echo   cd /d %~dp0 ^&^& node server.js
echo.
pause
