@echo off
setlocal
cd /d "%~dp0..\.."
where dotnet >nul 2>nul || (echo .NET 8 SDK is required.& exit /b 1)
dotnet publish tools\UniverseUpdater\UniverseUpdater.csproj -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true
if errorlevel 1 exit /b %errorlevel%
echo.
echo Built: tools\UniverseUpdater\bin\Release\net8.0-windows\win-x64\publish\UniverseUpdater.exe
