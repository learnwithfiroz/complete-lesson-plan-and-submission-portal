# BSISC Lesson Plan & Submission Portal - 1-Click Live Server to Local Sync Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  BSISC Live Server -> Local Environment Synchronizer    " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$liveUrl = "https://lessonplan.firoz-ahmed.com"
$backupUrl = "$liveUrl/api/v1/system/backup-db?download=1"
$localBackupPath = "backend\database\live_backup.sql"
$localDatabasePath = "backend\database\database.sql"

Write-Host "1. Fetching complete database dump from $liveUrl ..." -ForegroundColor Yellow

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $backupUrl -OutFile $localBackupPath -TimeoutSec 60
    Copy-Item -Path $localBackupPath -Destination $localDatabasePath -Force
    
    $fileSize = (Get-Item $localBackupPath).Length
    Write-Host "   [SUCCESS] Saved live database backup ($fileSize bytes) to $localBackupPath" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Failed to fetch live backup: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Importing live data into local database via Artisan ..." -ForegroundColor Yellow
Set-Location -Path "backend"
php artisan db:sync-live
Set-Location -Path ".."

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  [DONE] Local environment is now 100% in sync with Live!  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan