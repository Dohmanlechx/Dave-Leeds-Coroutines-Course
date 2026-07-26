@echo off
REM Double-click launcher for the notes CMS + docs preview.
REM Starts BOTH the CMS (localhost:4000) and the Docusaurus docs site (localhost:3000),
REM and opens the CMS in your browser. Use the CMS's "Preview" button to jump to the docs.
REM Close this window (or press Ctrl+C) to stop both.
REM
REM The docs site is served as a real build so the search box works - Docusaurus
REM only generates its search index at build time. That means the first start
REM takes a few seconds longer, and a saved note appears in the docs after a
REM short rebuild (watch this window for "ready") instead of instantly.

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
call npm run dev:search

REM If the servers exit on their own, keep the window up so any error is readable.
echo.
echo The CMS/docs servers have stopped.
pause
