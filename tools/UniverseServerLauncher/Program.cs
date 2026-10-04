using System.Diagnostics;

static string Root()
{
    var exeDir = AppContext.BaseDirectory;
    return Path.GetFullPath(exeDir);
}

var root = Root();
var bat = Path.Combine(root, "start-server.bat");

if (!File.Exists(bat))
{
    MessageBox.Show($"start-server.bat was not found.\n\nExpected:\n{bat}", "Universe Server", MessageBoxButtons.OK, MessageBoxIcon.Error);
    return;
}

var psi = new ProcessStartInfo
{
    FileName = Environment.GetEnvironmentVariable("ComSpec") ?? "cmd.exe",
    Arguments = $"/k \"{bat}\"",
    WorkingDirectory = root,
    UseShellExecute = true
};

try
{
    Process.Start(psi);
}
catch (Exception ex)
{
    MessageBox.Show(ex.Message, "Universe Server", MessageBoxButtons.OK, MessageBoxIcon.Error);
}
