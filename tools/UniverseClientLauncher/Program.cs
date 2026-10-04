using System.Diagnostics;

static string Root() => Path.GetFullPath(AppContext.BaseDirectory);

var root = Root();
var package = Path.Combine(root, "package.json");

if (!File.Exists(package))
{
    MessageBox.Show($"package.json was not found.\n\nExpected:\n{package}", "Universe Client", MessageBoxButtons.OK, MessageBoxIcon.Error);
    return;
}

var psi = new ProcessStartInfo
{
    FileName = Environment.GetEnvironmentVariable("ComSpec") ?? "cmd.exe",
    Arguments = "/k npm run dev -- --host 0.0.0.0 --port 3000",
    WorkingDirectory = root,
    UseShellExecute = true
};

try
{
    Process.Start(psi);
}
catch (Exception ex)
{
    MessageBox.Show(ex.Message, "Universe Client", MessageBoxButtons.OK, MessageBoxIcon.Error);
}
