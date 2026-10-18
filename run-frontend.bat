@echo off
cd /d "%~dp0frontend"
call npm.cmd install
npm.cmd run dev
