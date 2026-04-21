@echo off
cd /d "C:\Aplicacion compras"
pm2 resurrect
pm2 start ecosystem.config.js
pm2 save
