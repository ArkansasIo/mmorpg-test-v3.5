using System.Diagnostics;

static string FindRoot()
{
    var dir=new DirectoryInfo(AppContext.BaseDirectory);
    for(var i=0;i<8 && dir!=null;i++,dir=dir.Parent)
        if(File.Exists(Path.Combine(dir.FullName,"package.json")) && Directory.Exists(Path.Combine(dir.FullName,"server")))
            return dir.FullName;
    return AppContext.BaseDirectory;
}
static void Error(string m)=>MessageBox.Show(m,"Universe Server",MessageBoxButtons.OK,MessageBoxIcon.Error);
static int Run(string file,string args,string root,bool visible=false)
{
    using var p=Process.Start(new ProcessStartInfo{FileName=file,Arguments=args,WorkingDirectory=root,UseShellExecute=true,CreateNoWindow=!visible});
    if(p==null)return -1; p.WaitForExit(); return p.ExitCode;
}
var root=FindRoot();
var node=Environment.GetEnvironmentVariable("ComSpec")??"cmd.exe";
try{
    if(!File.Exists(Path.Combine(root,"package.json"))||!Directory.Exists(Path.Combine(root,"server"))){
        Error($"Universe project root was not found.\n\nLauncher: {AppContext.BaseDirectory}");
        return;
    }
    var command=$"/c npm install --no-audit --no-fund && npm run server:build && npm run build && node dist-server/index.js";
    var p=Process.Start(new ProcessStartInfo{FileName=node,Arguments=command,WorkingDirectory=root,UseShellExecute=true});
    if(p==null)Error("Could not start the Universe server.");
}catch(Exception ex){Error($"Universe Server could not start.\n\n{ex.Message}");}
