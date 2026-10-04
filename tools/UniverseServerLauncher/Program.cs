using System.Diagnostics;
using System.Text;

static string Root() => Path.GetFullPath(AppContext.BaseDirectory);

static void ShowError(string message) =>
    MessageBox.Show(message, "Universe Server", MessageBoxButtons.OK, MessageBoxIcon.Error);

static bool CommandExists(string command)
{
    try
    {
        using var p = Process.Start(new ProcessStartInfo
        {
            FileName = Environment.GetEnvironmentVariable("ComSpec") ?? "cmd.exe",
            Arguments = $"/c where {command}",
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true
        });
        p?.WaitForExit(5000);
        return p?.ExitCode == 0;
    }
    catch { return false; }
}

static int RunCommand(string file, string args, string root)
{
    using var p = Process.Start(new ProcessStartInfo
    {
        FileName = file,
        Arguments = args,
        WorkingDirectory = root,
        UseShellExecute = false,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        CreateNoWindow = true
    });
    if (p is null) return -1;
    p.WaitForExit();
    return p.ExitCode;
}

var root = Root();
var bat = Path.Combine(root, "start-server.bat");
var log = Path.Combine(root, "universe-server-launcher.log");

try
{
    File.AppendAllText(log, $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Server launcher started. Root={root}{Environment.NewLine}");
    if (!File.Exists(bat))
    {
        ShowError($"start-server.bat was not found.\n\nExpected:\n{bat}\n\nPut UniverseServer.exe in the MMORPG project root.");
        return;
    }

    if (!CommandExists("node") || !CommandExists("npm"))
    {
        ShowError("Node.js and npm are required. Install Node.js 20-24, then start UniverseServer.exe again.");
        return;
    }

    var psi = new ProcessStartInfo
    {
        FileName = Environment.GetEnvironmentVariable("ComSpec") ?? "cmd.exe",
        Arguments = $"/k \"{bat}\"",
        WorkingDirectory = root,
        UseShellExecute = true
    };
    Process.Start(psi);
}
catch (Exception ex)
{
    File.AppendAllText(log, ex + Environment.NewLine);
    ShowError($"Universe Server could not start.\n\n{ex.Message}\n\nLog:\n{log}");
}
