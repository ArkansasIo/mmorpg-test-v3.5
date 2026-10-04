using System.Diagnostics;

static string Root() => Path.GetFullPath(AppContext.BaseDirectory);

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
    MessageBox.Show(message, "Universe Client", MessageBoxButtons.OK, MessageBoxIcon.Error);

var root = Root();
var package = Path.Combine(root, "package.json");

if (!File.Exists(package))
{
    ShowError($"package.json was not found.\n\nExpected:\n{package}\n\nCopy UniverseClient.exe into the root of the MMORPG project.");
    return;
}

if (!CommandExists("node") || !CommandExists("npm"))
{
    ShowError("Node.js/npm was not found in PATH.\n\nInstall Node.js 20+ and restart Windows before launching UniverseClient.exe.");
    return;
}

var nodeModules = Path.Combine(root, "node_modules");
var npmCommand = Environment.GetEnvironmentVariable("ComSpec") ?? "cmd.exe";

try
{
    if (!Directory.Exists(nodeModules))
    {
        var install = Process.Start(new ProcessStartInfo
        {
            FileName = npmCommand,
            Arguments = "/c npm install",
            WorkingDirectory = root,
            UseShellExecute = true,
        });
        install?.WaitForExit();
        if (install is null || install.ExitCode != 0)
        {
            ShowError("npm install failed. Check the command window for the dependency error and try again.");
            return;
        }
    }

    var psi = new ProcessStartInfo
    {
        FileName = npmCommand,
        Arguments = "/k npm run dev -- --host 0.0.0.0 --port 3000",
        WorkingDirectory = root,
        UseShellExecute = true,
    };

    Process.Start(psi);
}
catch (Exception ex)
{
    ShowError($"Unable to start the Universe client.\n\n{ex.Message}");
}
