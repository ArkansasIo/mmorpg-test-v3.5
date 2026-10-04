using System.Diagnostics;
using System.IO.Compression;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text.Json;

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

    public UpdaterForm(string? target) { targetArg=target; BuildUi(); }

    void BuildUi()
    {
        Text="Universe Civilization — Update & Patch Manager"; Width=820; Height=600;
        BackColor=Color.FromArgb(7,20,32); ForeColor=Color.White;
        var root=new FlowLayoutPanel{Dock=DockStyle.Fill,Padding=new Padding(18),FlowDirection=FlowDirection.TopDown,WrapContents=false};
        root.Controls.Add(new Label{Text="UNIVERSE UPDATE / PATCH SYSTEM",AutoSize=true,Font=new Font("Segoe UI",18,FontStyle.Bold),ForeColor=Color.Cyan});
        root.Controls.Add(new Label{Text="Downloads the GitHub main ZIP, stages it, validates it, backs up the installation, then updates all files.",AutoSize=true});
        var row=new FlowLayoutPanel{Width=760,Height=42,WrapContents=false}; row.Controls.Add(new Label{Text="INSTALL FOLDER:",AutoSize=true,Padding=new Padding(0,8,8,0)});
        install.Text=targetArg ?? AppContext.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar); row.Controls.Add(install);
        root.Controls.Add(row); root.Controls.Add(progress); root.Controls.Add(update); root.Controls.Add(rollback); root.Controls.Add(log); Controls.Add(root);
        update.Click+=async(_,_)=>await UpdateAsync(); rollback.Click+=async(_,_)=>await RollbackAsync();
    }

    void Write(string s){log.AppendText($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {s}\r\n");}

    async Task UpdateAsync()
    {
        update.Enabled=rollback.Enabled=false;
        var target=Path.GetFullPath(install.Text.Trim()); var parent=Directory.GetParent(target)?.FullName ?? target;
        var root=Path.Combine(parent,".universe-updater"); var stage=Path.Combine(root,"stage"); var backup=Path.Combine(root,"backup-"+DateTime.Now.ToString("yyyyMMdd-HHmmss"));
        try {
            Directory.CreateDirectory(root); if(Directory.Exists(stage)) Directory.Delete(stage,true); Directory.CreateDirectory(stage);
            Write("Downloading GitHub repository ZIP...");
            var zip=Path.Combine(root,"update.zip");
            using(var response=await http.GetAsync(RepoZip,HttpCompletionOption.ResponseHeadersRead)){response.EnsureSuccessStatusCode();var total=response.Content.Headers.ContentLength??-1;using var input=await response.Content.ReadAsStreamAsync();using var output=File.Create(zip);var buf=new byte[1024*128];long done=0;int n;while((n=await input.ReadAsync(buf))>0){await output.WriteAsync(buf.AsMemory(0,n));done+=n;if(total>0)progress.Value=(int)Math.Min(100,done*100/total);}}
            Write("ZIP downloaded. Extracting...");
            ZipFile.ExtractToDirectory(zip,stage,true);
            var extracted=Directory.GetDirectories(stage).SingleOrDefault() ?? stage;
            if(!File.Exists(Path.Combine(extracted,"package.json"))) throw new InvalidDataException("Update validation failed: package.json is missing.");
            if(!File.Exists(Path.Combine(extracted,"version.json"))) Write("Warning: version.json missing; continuing with repository update.");
            if(Directory.Exists(target)){Directory.Move(target,backup);Write($"Backup created: {backup}");}
            Directory.Move(extracted,target); Write("All repository files updated.");
            File.Delete(zip); progress.Value=100; MessageBox.Show("Update completed successfully. Backup retained for rollback.","Universe Updater",MessageBoxButtons.OK,MessageBoxIcon.Information);
        } catch(Exception ex) { Write("UPDATE FAILED: "+ex.Message); try { if(!Directory.Exists(target)&&Directory.Exists(backup)) Directory.Move(backup,target); }catch{} MessageBox.Show("Update failed. The previous installation was preserved/restored.\r\n\r\n"+ex.Message,"Universe Updater",MessageBoxButtons.OK,MessageBoxIcon.Error); }
        finally { update.Enabled=rollback.Enabled=true; }
    }

    async Task RollbackAsync()
    {
        await Task.Yield(); try {
            var target=Path.GetFullPath(install.Text.Trim()); var updater=Path.Combine(Directory.GetParent(target)?.FullName??target,".universe-updater");
            var backup=Directory.GetDirectories(updater,"backup-*").OrderByDescending(x=>x).FirstOrDefault();
            if(backup==null){MessageBox.Show("No backup found.");return;}
            var failed=target+"-rollback-"+DateTime.Now.ToString("yyyyMMdd-HHmmss"); if(Directory.Exists(target)) Directory.Move(target,failed); Directory.Move(backup,target);
            Write("Rollback completed. Previous installation restored."); MessageBox.Show("Rollback completed.","Universe Updater",MessageBoxButtons.OK,MessageBoxIcon.Information);
        } catch(Exception ex){MessageBox.Show(ex.Message,"Rollback failed",MessageBoxButtons.OK,MessageBoxIcon.Error);}
    }
}
