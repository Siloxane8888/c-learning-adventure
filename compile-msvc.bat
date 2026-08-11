@echo off
REM MSVC compile wrapper — receives source file and output path
REM Usage: compile-msvc.bat source.c output.exe

set SRC=%1
set OUT=%2

REM Auto-detect vcvars64.bat from common VS installation paths
set VCVARS=

REM Check environment variable first
if defined VCINSTALLDIR (
    if exist "%VCINSTALLDIR%\Auxiliary\Build\vcvars64.bat" set VCVARS=%VCINSTALLDIR%\Auxiliary\Build\vcvars64.bat
)

REM Search VS 2022 standard locations
if "%VCVARS%"=="" (
    for /d %%d in ("C:\Program Files\Microsoft Visual Studio\2022\*") do (
        if exist "%%d\VC\Auxiliary\Build\vcvars64.bat" (
            set VCVARS=%%d\VC\Auxiliary\Build\vcvars64.bat
            goto :found
        )
    )
)

REM Search VS 2019
if "%VCVARS%"=="" (
    for /d %%d in ("C:\Program Files (x86)\Microsoft Visual Studio\2019\*") do (
        if exist "%%d\VC\Auxiliary\Build\vcvars64.bat" (
            set VCVARS=%%d\VC\Auxiliary\Build\vcvars64.bat
            goto :found
        )
    )
)

:found
if "%VCVARS%"=="" (
    echo [ERROR] Visual Studio not found. Please install VS 2022/2019 with C++ desktop development.
    exit /b 1
)

call "%VCVARS%" >nul 2>&1
cl.exe /nologo /W0 /O2 "%SRC%" /Fe:"%OUT%" /link 2>&1
if %errorlevel% neq 0 exit /b 1
exit /b 0
