@echo off
setlocal
cd /d "%~dp0"
py -3.10 -m venv .venv
if errorlevel 1 goto fail
".venv\Scripts\python.exe" -m pip install --no-index --only-binary=:all: --find-links="%~dp0." bila-g2p==1.0.0
if errorlevel 1 goto fail
".venv\Scripts\python.exe" -m bila_g2p doctor
if errorlevel 1 goto fail
echo Installation OK. Run start-studio.bat.
pause
exit /b 0
:fail
echo Installation failed. Python 3.10 x64 is required.
pause
exit /b 1
