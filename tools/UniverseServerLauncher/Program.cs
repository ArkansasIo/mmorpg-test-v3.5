using System.Diagnostics;

static string Root()
{
    // The published EXE is copied beside the game project files.
    // Keep the launcher deterministic even when started from a shortcut.
    return Path.GetFullPath(AppContext.BaseDirectory);
}

static bool CommandExists(string command)
{
    try
    {
        using var process = Process.Start(new ProcessStartInfo
        {
            FileName = Environment.GetEnvironmentVariable("ComSpec") ?? "cmd.exe",
            Arguments = $"/c where {command}",
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
        });
        process?.WaitForExit(5000);
        return process?.ExitCode == 0;
    }
    catch
    {
        return false;
    }
}

static void ShowError(string message) =>
    MessageBox.Show(message, "Universe Server", MessageBoxButtons.OK, MessageBoxIcon.Error);

var root = Root();
var bat = Path.Combine(root, "start-server.bat");

if (!File.Exists(bat))
{
    ShowError($"start-server.bat was not found.\n\nExpected:\n{bat}\n\nCopy UniverseServer.exe into the root of the MMORPG project.");
    return;
}

if (!CommandExists("node"))
{
    ShowError("Node.js was not found in PATH.\n\nInstall Node.js 20+ and restart Windows before launching UniverseServer.exe.");
    return;
}

if (!CommandExists("npm"))
{
    ShowError("npm was not found in PATH.\n\nInstall Node.js 20+ (npm is included) and restart Windows before launching UniverseServer.exe.");
    return;
}

var psi = new ProcessStartInfo
{
    FileName = Environment.GetEnvironmentVariable("ComSpec") ?? "cmd.exe",
    Arguments = $"/k \"{bat}\"",
    WorkingDirectory = root,
    UseShellExecute = true,
};

try
{
    Process.Start(psi);
}
catch (Exception ex)
{
    ShowError($"Unable to start the Universe server.\n\n{ex.Message}");
}
