@echo off
echo Adding files to git...
git init .
git add .
git commit -m "Fix WebSocket timing and remove backup file"
git push origin main
echo Done!
