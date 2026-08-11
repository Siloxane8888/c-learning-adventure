@echo off
REM MSVC 编译包装器 — 接收源文件路径和输出路径
REM 用法: compile-msvc.bat source.c output.exe

set SRC=%1
set OUT=%2

call "D:\vs\VC\Auxiliary\Build\vcvars64.bat" >nul 2>&1
cl.exe /nologo /W0 /O2 "%SRC%" /Fe:"%OUT%" /link /NODEFAULTLIB:libcmt.lib 2>&1
if %errorlevel% neq 0 exit /b 1
exit /b 0
