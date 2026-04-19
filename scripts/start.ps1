# Loads .env into the current process environment, then launches Claude Code.

$envPath = Join-Path $PSScriptRoot "..\.env"

if (-not (Test-Path $envPath)) {
    Write-Error ".env not found at $envPath"
    exit 1
}

Get-Content $envPath | ForEach-Object {
    if ($_ -match '^\s*([^#=]+?)\s*=\s*(.*)\s*$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
        Write-Host "Loaded $key"
    }
}

Write-Host ""
Write-Host "Launching Claude Code..." -ForegroundColor Cyan
claude