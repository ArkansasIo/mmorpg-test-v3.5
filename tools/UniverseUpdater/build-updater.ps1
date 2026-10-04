$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..\..")
dotnet publish tools/UniverseUpdater/UniverseUpdater.csproj -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true
Write-Host "Built: tools/UniverseUpdater/bin/Release/net8.0-windows/win-x64/publish/UniverseUpdater.exe"
