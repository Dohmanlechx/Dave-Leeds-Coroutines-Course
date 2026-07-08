@echo off
REM Double-click launcher for the notes CMS + docs preview.
REM Starts BOTH the CMS (localhost:4000) and the Docusaurus docs site (localhost:3000),
REM and opens the CMS in your browser. Use the CMS's "Preview" button to jump to the docs.
REM Close this window (or press Ctrl+C) to stop both.

title Coroutines Notes CMS
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on your PATH. Install it from https://nodejs.org
  echo then double-click this file again.
  pause
  exit /b 1
)

set CMS_OPEN=1
call npm run dev

REM If the servers exit on their own, keep the window up so any error is readable.
echo.
echo The CMS/docs servers have stopped.
pause
