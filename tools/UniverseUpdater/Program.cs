using System.Diagnostics;
using System.IO.Compression;

namespace UniverseUpdater;

internal static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        var target = args.FirstOrDefault(a => !string.IsNullOrWhiteSpace(a) && !a.StartsWith("--", StringComparison.Ordinal));
        if (!string.IsNullOrWhiteSpace(target) && IsInside(AppContext.BaseDirectory, Path.GetFullPath(target)))
        {
            SelfRelocateAndRun(Path.GetFullPath(target));
            return;
        }

        ApplicationConfiguration.Initialize();
        Application.Run(new UpdaterForm(target));
    }

    static bool IsInside(string path, string target)
    {
        try
        {
            var p=Path.GetFullPath(path).TrimEnd(Path.DirectorySeparatorChar)+Path.DirectorySeparatorChar;
            var t=Path.GetFullPath(target).TrimEnd(Path.DirectorySeparatorChar)+Path.DirectorySeparatorChar;
            return p.StartsWith(t,StringComparison.OrdinalIgnoreCase);
        } catch { return false; }
    }

    static void SelfRelocateAndRun(string target)
    {
        var dir=Path.Combine(Path.GetTempPath(),"UniverseUpdater",Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(dir);
        var copy=Path.Combine(dir,"UniverseUpdater.exe");
        File.Copy(Environment.ProcessPath!,copy,true);
        var psi=new ProcessStartInfo(copy, $"\\"{target}\\"") { UseShellExecute=true, WorkingDirectory=target };
        Process.Start(psi);
    }
}

internal sealed class UpdaterForm : Form
{
    const string RepoZip="https://github.com/ArkansasIo/mmorpg-test-v3.5/archive/refs/heads/main.zip";
    readonly TextBox install=new(){Width=560};
    readonly Button update=new(){Text="DOWNLOAD + UPDATE",AutoSize=true};
    readonly Button rollback=new(){Text="ROLLBACK LAST UPDATE",AutoSize=true};
    readonly ProgressBar progress=new(){Width=560};
    readonly TextBox log=new(){Multiline=true,ReadOnly=true,ScrollBars=ScrollBars.Vertical,Width=760,Height=380};
    readonly HttpClient http=new(){Timeout=TimeSpan.FromMinutes(10)};
    readonly string? targetArg;

    public UpdaterForm(string? target){targetArg=target;BuildUi();}
    void BuildUi()
    {
        Text="Universe Civilization — Update & Patch Manager";Width=820;Height=600;
        BackColor=Color.FromArgb(7,20,32);ForeColor=Color.White;
        var root=new FlowLayoutPanel{Dock=DockStyle.Fill,Padding=new Padding(18),FlowDirection=FlowDirection.TopDown,WrapContents=false};
        root.Controls.Add(new Label{Text="UNIVERSE UPDATE / PATCH SYSTEM",AutoSize=true,Font=new Font("Segoe UI",18,FontStyle.Bold),ForeColor=Color.Cyan});
        root.Controls.Add(new Label{Text="Safe self-relocating updater: downloads, stages, validates, stops game processes, backs up, replaces and can rollback.",AutoSize=true});
        var row=new FlowLayoutPanel{Width=760,Height=42,WrapContents=false};
        row.Controls.Add(new Label{Text="INSTALL FOLDER:",AutoSize=true,Padding=new Padding(0,8,8,0)});
        install.Text=targetArg??Directory.GetParent(AppContext.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar))?.FullName??AppContext.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar);
        row.Controls.Add(install);root.Controls.Add(row);root.Controls.Add(progress);root.Controls.Add(update);root.Controls.Add(rollback);root.Controls.Add(log);Controls.Add(root);
        update.Click+=async(_,_)=>await UpdateAsync();rollback.Click+=async(_,_)=>await RollbackAsync();
    }
    void Write(string s)=>log.AppendText($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {s}\r\n");
    static bool IsProcessInside(string? executable,string target)
    {
        if(string.IsNullOrWhiteSpace(executable))return false;
        try{return Path.GetFullPath(executable).StartsWith(Path.GetFullPath(target).TrimEnd(Path.DirectorySeparatorChar)+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase);}catch{return false;}
    }
    void StopProcessesUsingTarget(string target)
    {
        var current=Environment.ProcessId;
        foreach(var p in Process.GetProcesses())
        {
            try
            {
                if(p.Id==current)continue;
                var path=p.MainModule?.FileName;
                if(string.Equals(p.ProcessName,"UniverseServer",StringComparison.OrdinalIgnoreCase)||
                   string.Equals(p.ProcessName,"UniverseClient",StringComparison.OrdinalIgnoreCase)||
                   IsProcessInside(path,target))
                {
                    Write($"Stopping process {p.ProcessName} PID={p.Id}");
                    if(!p.HasExited){p.CloseMainWindow();if(!p.WaitForExit(3000)&&!p.HasExited)p.Kill(true);p.WaitForExit(3000);}
                }
            }catch(Exception ex){Write("Warning: "+ex.Message);}finally{p.Dispose();}
        }
    }
    static void MoveWithRetry(string source,string destination,int attempts=15)
    {
        Exception? last=null;
        for(var i=1;i<=attempts;i++)
        {
            try{Directory.Move(source,destination);return;}catch(Exception ex){last=ex;if(i<attempts)Thread.Sleep(Math.Min(3000,500*i));}
        }
        throw new IOException($"Unable to move installation after {attempts} attempts. A process or antivirus scanner may still hold a file.",last);
    }
    static void ValidatePackage(string root)
    {
        if(!File.Exists(Path.Combine(root,"package.json")))throw new InvalidDataException("package.json is missing.");
        if(!Directory.Exists(Path.Combine(root,"server")))throw new InvalidDataException("server directory is missing.");
        if(!Directory.Exists(Path.Combine(root,"src")))throw new InvalidDataException("src directory is missing.");
    }

    async Task UpdateAsync()
    {
        update.Enabled=rollback.Enabled=false;
        var target=Path.GetFullPath(install.Text.Trim());
        var parent=Directory.GetParent(target)?.FullName??target;
        var updaterRoot=Path.Combine(parent,".universe-updater");
        var stage=Path.Combine(updaterRoot,"stage");
        var backup=Path.Combine(updaterRoot,"backup-"+DateTime.Now.ToString("yyyyMMdd-HHmmss"));
        var zip=Path.Combine(updaterRoot,"update.zip");
        try
        {
            Directory.CreateDirectory(updaterRoot);
            if(Directory.Exists(stage))Directory.Delete(stage,true);
            Directory.CreateDirectory(stage);
            Write("Downloading GitHub repository ZIP...");
            using(var response=await http.GetAsync(RepoZip,HttpCompletionOption.ResponseHeadersRead))
            {
                response.EnsureSuccessStatusCode();
                var total=response.Content.Headers.ContentLength??-1;
                await using var input=await response.Content.ReadAsStreamAsync();
                await using var output=new FileStream(zip,FileMode.Create,FileAccess.Write,FileShare.None,131072,true);
                var buffer=new byte[131072];long done=0;int n;
                while((n=await input.ReadAsync(buffer))>0){await output.WriteAsync(buffer.AsMemory(0,n));done+=n;if(total>0)progress.Value=(int)Math.Min(100,done*100/total);}
            }
            Write("ZIP downloaded. Extracting...");
            ZipFile.ExtractToDirectory(zip,stage,true);
            var extracted=Directory.GetDirectories(stage).SingleOrDefault()??stage;
            ValidatePackage(extracted);
            Write("Package validation passed.");
            Write("Stopping game processes...");
            StopProcessesUsingTarget(target);
            if(Directory.Exists(target)){Write("Creating backup...");MoveWithRetry(target,backup);Write("Backup: "+backup);}
            try{MoveWithRetry(extracted,target);}catch
            {
                if(!Directory.Exists(target)&&Directory.Exists(backup)){Write("Restoring backup...");MoveWithRetry(backup,target);}
                throw;
            }
            try{if(File.Exists(zip))File.Delete(zip);}catch{}
            progress.Value=100;
            Write("UPDATE COMPLETE.");
            MessageBox.Show("Update completed successfully.\r\n\r\nBackup retained for rollback.","Universe Updater",MessageBoxButtons.OK,MessageBoxIcon.Information);
        }
        catch(Exception ex)
        {
            Write("UPDATE FAILED: "+ex);
            try{if(!Directory.Exists(target)&&Directory.Exists(backup))MoveWithRetry(backup,target);}catch(Exception e){Write("RESTORE FAILED: "+e.Message);}
            MessageBox.Show("Update failed.\r\n\r\n"+ex.Message,"Universe Updater",MessageBoxButtons.OK,MessageBoxIcon.Error);
        }
        finally{update.Enabled=rollback.Enabled=true;}
    }

    async Task RollbackAsync()
    {
        await Task.Yield();
        try
        {
            var target=Path.GetFullPath(install.Text.Trim());
            var root=Path.Combine(Directory.GetParent(target)?.FullName??target,".universe-updater");
            if(!Directory.Exists(root)){MessageBox.Show("No updater backup found.");return;}
            var backup=Directory.GetDirectories(root,"backup-*").OrderByDescending(x=>x).FirstOrDefault();
            if(backup==null){MessageBox.Show("No backup found.");return;}
            StopProcessesUsingTarget(target);
            var failed=target+"-rollback-"+DateTime.Now.ToString("yyyyMMdd-HHmmss");
            if(Directory.Exists(target))MoveWithRetry(target,failed);
            MoveWithRetry(backup,target);
            Write("ROLLBACK COMPLETE.");
            MessageBox.Show("Rollback completed successfully.");
        }
        catch(Exception ex){Write("ROLLBACK FAILED: "+ex);MessageBox.Show(ex.Message,"Rollback failed",MessageBoxButtons.OK,MessageBoxIcon.Error);}
    }
}
