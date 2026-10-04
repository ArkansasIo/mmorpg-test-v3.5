using System.Diagnostics;
using System.IO.Compression;

namespace UniverseUpdater;

internal static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new UpdaterForm(args.FirstOrDefault()));
    }
}

internal sealed class UpdaterForm : Form
{
    const string RepoZip = "https://github.com/ArkansasIo/mmorpg-test-v3.5/archive/refs/heads/main.zip";
    readonly TextBox install = new() { Width = 560 };
    readonly Button update = new() { Text = "DOWNLOAD + UPDATE", AutoSize = true };
    readonly Button rollback = new() { Text = "ROLLBACK LAST UPDATE", AutoSize = true };
    readonly ProgressBar progress = new() { Width = 560 };
    readonly TextBox log = new() { Multiline = true, ReadOnly = true, ScrollBars = ScrollBars.Vertical, Width = 760, Height = 380 };
    readonly HttpClient http = new() { Timeout = TimeSpan.FromMinutes(10) };
    readonly string? targetArg;

    public UpdaterForm(string? target)
    {
        targetArg = target;
        BuildUi();
    }

    void BuildUi()
    {
        Text = "Universe Civilization — Update & Patch Manager";
        Width = 820;
        Height = 600;
        BackColor = Color.FromArgb(7, 20, 32);
        ForeColor = Color.White;

        var root = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(18),
            FlowDirection = FlowDirection.TopDown,
            WrapContents = false
        };

        root.Controls.Add(new Label
        {
            Text = "UNIVERSE UPDATE / PATCH SYSTEM",
            AutoSize = true,
            Font = new Font("Segoe UI", 18, FontStyle.Bold),
            ForeColor = Color.Cyan
        });
        root.Controls.Add(new Label
        {
            Text = "Downloads the GitHub main ZIP, stages it, validates it, stops running game processes, backs up the installation, then updates all files.",
            AutoSize = true
        });

        var row = new FlowLayoutPanel { Width = 760, Height = 42, WrapContents = false };
        row.Controls.Add(new Label { Text = "INSTALL FOLDER:", AutoSize = true, Padding = new Padding(0, 8, 8, 0) });
        install.Text = targetArg
            ?? Directory.GetParent(AppContext.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar))?.FullName
            ?? AppContext.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar);
        row.Controls.Add(install);

        root.Controls.Add(row);
        root.Controls.Add(progress);
        root.Controls.Add(update);
        root.Controls.Add(rollback);
        root.Controls.Add(log);
        Controls.Add(root);

        update.Click += async (_, _) => await UpdateAsync();
        rollback.Click += async (_, _) => await RollbackAsync();
    }

    void Write(string s) =>
        log.AppendText($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {s}\r\n");

    static bool IsProcessInside(string? executable, string target)
    {
        if (string.IsNullOrWhiteSpace(executable)) return false;
        try
        {
            var full = Path.GetFullPath(executable);
            var root = Path.GetFullPath(target).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            return full.StartsWith(root, StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    void StopProcessesUsingTarget(string target)
    {
        var currentPid = Environment.ProcessId;
        var names = new[] { "UniverseServer", "UniverseClient" };

        foreach (var process in Process.GetProcesses())
        {
            try
            {
                if (process.Id == currentPid) continue;

                var name = process.ProcessName;
                var path = process.MainModule?.FileName;

                if (names.Any(n => string.Equals(n, name, StringComparison.OrdinalIgnoreCase)) ||
                    IsProcessInside(path, target))
                {
                    Write($"Stopping running process: {name} (PID {process.Id})");
                    if (!process.HasExited)
                    {
                        process.CloseMainWindow();
                        if (!process.WaitForExit(3000) && !process.HasExited)
                            process.Kill(true);
                        process.WaitForExit(3000);
                    }
                }
            }
            catch (Exception ex)
            {
                Write($"Warning: could not stop process: {ex.Message}");
            }
            finally
            {
                process.Dispose();
            }
        }
    }

    static void MoveWithRetry(string source, string destination, int attempts = 8)
    {
        Exception? last = null;

        for (var i = 1; i <= attempts; i++)
        {
            try
            {
                Directory.Move(source, destination);
                return;
            }
            catch (Exception ex)
            {
                last = ex;
                if (i == attempts) break;
                Thread.Sleep(750 * i);
            }
        }

        throw new IOException(
            $"Unable to move '{source}' to '{destination}' after {attempts} attempts. " +
            "A running process, antivirus scanner, or another application may still be using the installation.",
            last);
    }

    async Task UpdateAsync()
    {
        update.Enabled = rollback.Enabled = false;

        var target = Path.GetFullPath(install.Text.Trim());
        var parent = Directory.GetParent(target)?.FullName ?? target;
        var updaterRoot = Path.Combine(parent, ".universe-updater");
        var stage = Path.Combine(updaterRoot, "stage");
        var backup = Path.Combine(updaterRoot, "backup-" + DateTime.Now.ToString("yyyyMMdd-HHmmss"));
        var zip = Path.Combine(updaterRoot, "update.zip");

        try
        {
            Directory.CreateDirectory(updaterRoot);

            if (Directory.Exists(stage))
                Directory.Delete(stage, true);

            Directory.CreateDirectory(stage);

            Write("Downloading GitHub repository ZIP...");

            using (var response = await http.GetAsync(RepoZip, HttpCompletionOption.ResponseHeadersRead))
            {
                response.EnsureSuccessStatusCode();
                var total = response.Content.Headers.ContentLength ?? -1;

                await using var input = await response.Content.ReadAsStreamAsync();
                await using var output = new FileStream(zip, FileMode.Create, FileAccess.Write, FileShare.None, 128 * 1024, true);

                var buffer = new byte[128 * 1024];
                long done = 0;
                int n;

                while ((n = await input.ReadAsync(buffer)) > 0)
                {
                    await output.WriteAsync(buffer.AsMemory(0, n));
                    done += n;

                    if (total > 0)
                        progress.Value = (int)Math.Min(100, done * 100 / total);
                }
            }

            Write("ZIP downloaded. Extracting...");
            ZipFile.ExtractToDirectory(zip, stage, true);

            var extracted = Directory.GetDirectories(stage).SingleOrDefault() ?? stage;

            if (!File.Exists(Path.Combine(extracted, "package.json")))
                throw new InvalidDataException("Update validation failed: package.json is missing.");

            if (!File.Exists(Path.Combine(extracted, "version.json")))
                Write("Warning: version.json missing; continuing with repository update.");

            Write("Stopping Universe server/client processes before replacing files...");
            StopProcessesUsingTarget(target);

            if (Directory.Exists(target))
            {
                Write("Creating installation backup...");
                MoveWithRetry(target, backup);
                Write($"Backup created: {backup}");
            }

            try
            {
                MoveWithRetry(extracted, target);
            }
            catch
            {
                // If the target move failed after the backup was created, restore it.
                if (!Directory.Exists(target) && Directory.Exists(backup))
                {
                    Write("Update move failed. Restoring previous installation...");
                    MoveWithRetry(backup, target);
                }

                throw;
            }

            if (File.Exists(zip))
                File.Delete(zip);

            progress.Value = 100;
            Write("All repository files updated successfully.");
            MessageBox.Show(
                "Update completed successfully.\r\n\r\nThe previous installation was retained as a backup for rollback.",
                "Universe Updater",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information);
        }
        catch (Exception ex)
        {
            Write("UPDATE FAILED: " + ex);

            try
            {
                if (!Directory.Exists(target) && Directory.Exists(backup))
                    MoveWithRetry(backup, target);
            }
            catch (Exception restoreEx)
            {
                Write("RESTORE FAILED: " + restoreEx.Message);
            }

            MessageBox.Show(
                "Update failed. The previous installation was preserved/restored.\r\n\r\n" + ex.Message,
                "Universe Updater",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
        finally
        {
            update.Enabled = rollback.Enabled = true;
        }
    }

    async Task RollbackAsync()
    {
        await Task.Yield();

        try
        {
            var target = Path.GetFullPath(install.Text.Trim());
            var updaterRoot = Path.Combine(
                Directory.GetParent(target)?.FullName ?? target,
                ".universe-updater");

            var backup = Directory.GetDirectories(updaterRoot, "backup-*")
                .OrderByDescending(x => x)
                .FirstOrDefault();

            if (backup == null)
            {
                MessageBox.Show("No backup found.", "Universe Updater", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            StopProcessesUsingTarget(target);

            var failed = target + "-rollback-" + DateTime.Now.ToString("yyyyMMdd-HHmmss");

            if (Directory.Exists(target))
                MoveWithRetry(target, failed);

            MoveWithRetry(backup, target);

            Write("Rollback completed. Previous installation restored.");
            MessageBox.Show("Rollback completed.", "Universe Updater", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        catch (Exception ex)
        {
            Write("ROLLBACK FAILED: " + ex);
            MessageBox.Show(ex.Message, "Rollback failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
