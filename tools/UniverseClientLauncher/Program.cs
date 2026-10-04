using System.Diagnostics;

static string Root() => Path.GetFullPath(AppContext.BaseDirectory);

static void ShowError(string message) =>
    MessageBox.Show(message, "Universe Client", MessageBoxButtons.OK, MessageBoxIcon.Error);

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

var root = Root();
var package = Path.Combine(root, "package.json");

try
{
    if (!File.Exists(package))
    {
        ShowError($"package.json was not found.\n\nExpected:\n{package}\n\nPut UniverseClient.exe in the MMORPG project root.");
        return;
    }

    if (!CommandExists("node") || !CommandExists("npm"))
    {
        ShowError("Node.js and npm are required. Install Node.js 20-24, then start UniverseClient.exe again.");
        return;
    }

    var psi = new ProcessStartInfo
    {
        FileName = Environment.GetEnvironmentVariable("ComSpec") ?? "cmd.exe",
        Arguments = "/k npm install --no-audit --no-fund && npm run dev -- --host 0.0.0.0 --port 3000",
        WorkingDirectory = root,
        UseShellExecute = true
    };
    Process.Start(psi);
}
catch (Exception ex)
{
    ShowError($"Universe Client could not start.\n\n{ex.Message}");
}
