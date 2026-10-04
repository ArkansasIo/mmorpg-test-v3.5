$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..\..")
$publish = "tools/UniverseUpdater/bin/Release/net8.0-windows/win-x64/publish"
if (!(Test-Path "$publish/UniverseUpdater.exe")) {
  & dotnet publish tools/UniverseUpdater/UniverseUpdater.csproj -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true
}
New-Item -ItemType Directory -Force -Path "release/update-suite" | Out-Null
Copy-Item "$publish/UniverseUpdater.exe" "release/update-suite/UniverseUpdater.exe" -Force
Copy-Item "version.json" "release/update-suite/version.json" -Force
Copy-Item "update-manifest.json" "release/update-suite/update-manifest.json" -Force
Compress-Archive -Path "release/update-suite/*" -DestinationPath "release/UniverseUpdater-Windows-x64.zip" -Force
Write-Host "Created release/UniverseUpdater-Windows-x64.zip"
