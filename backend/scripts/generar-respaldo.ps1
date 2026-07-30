param(
    [string]$DbHost = $(if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }),
    [int]$DbPort = $(if ($env:DB_PORT) { [int]$env:DB_PORT } else { 3306 }),
    [string]$DbName = $(if ($env:DB_NAME) { $env:DB_NAME } else { "manos_oaxaca_final" }),
    [string]$DbUser = $(if ($env:DB_USER) { $env:DB_USER } else { "root" }),
    [string]$DbPassword = $(if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "" })
)

$mysqldump = Get-Command mysqldump -ErrorAction SilentlyContinue
if (-not $mysqldump) {
    throw "mysqldump no está instalado o no está agregado al PATH."
}

$backupDir = Join-Path $PSScriptRoot "..\backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$output = Join-Path $backupDir "${DbName}_${timestamp}.sql"

$previousMysqlPwd = $env:MYSQL_PWD
try {
    if ($DbPassword) {
        $env:MYSQL_PWD = $DbPassword
    }

    & $mysqldump.Source `
        --host=$DbHost `
        --port=$DbPort `
        --user=$DbUser `
        --single-transaction `
        --routines `
        --triggers `
        --events `
        --no-tablespaces `
        --default-character-set=utf8mb4 `
        "--result-file=$output" `
        $DbName

    if ($LASTEXITCODE -ne 0) {
        Remove-Item $output -ErrorAction SilentlyContinue
        throw "mysqldump terminó con código $LASTEXITCODE."
    }

    Write-Host "Respaldo generado: $output"
}
finally {
    $env:MYSQL_PWD = $previousMysqlPwd
}
