@echo off
chcp 65001 >nul
title Fazenda da Live
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js em https://nodejs.org e rode de novo.
  pause
  exit /b
)
if not exist node_modules (
  echo Instalando, so na primeira vez...
  call npm install
)
set USUARIO=
set /p USUARIO=Seu usuario do TikTok sem @, ou deixe vazio para o modo demonstracao:
if "%USUARIO%"=="" goto demo
start "" http://localhost:8787
node servidor.mjs %USUARIO%
pause
exit /b
:demo
start "" "http://localhost:8787/?sim=1"
node servidor.mjs --demo
pause
