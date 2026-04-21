# Ejecutar este script UNA VEZ como Administrador
# Click derecho en PowerShell → "Ejecutar como administrador"
# Luego: cd "C:\Aplicacion compras" && .\crear-tarea-inicio.ps1

$action  = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"C:\Aplicacion compras\iniciar-aubasa.bat`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 5) -RestartCount 3
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -RunLevel Highest

Register-ScheduledTask -TaskName "AUBASA-Backend-Startup" `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Force

Write-Host "Tarea creada. El servidor arrancara automaticamente al iniciar sesion." -ForegroundColor Green
