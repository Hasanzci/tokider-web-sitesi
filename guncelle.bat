@echo off
chcp 65001 >nul
cd /d "%~dp0"
python guncelle.py || py guncelle.py
pause
