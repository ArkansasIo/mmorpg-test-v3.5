using System.Diagnostics;

static string FindRoot()
{
    var dir=new DirectoryInfo(AppContext.BaseDirectory);
    for(var i=0;i<8 && dir!=null;i++,dir=dir.Parent)
        if(File.Exists(Path.Combine(dir.FullName,"package.json")) && Directory.Exists(Path.Combine(dir.FullName,"src")))
            return dir.FullName;
    return AppContext.BaseDirectory;
}
static void Error(string m)=>MessageBox.Show(m,"Universe Client",MessageBoxButtons.OK,MessageBoxIcon.Error);
var root=FindRoot();
try{
    if(!File.Exists(Path.Combine(root,"package.json"))||!Directory.Exists(Path.Combine(root,"src"))){
        Error($"Universe project root was not found.\n\nLauncher: {AppContext.BaseDirectory}");
        return;
    }
    var cmd=Environment.GetEnvironmentVariable("ComSpec")??"cmd.exe";
    var p=Process.Start(new ProcessStartInfo{
        FileName=cmd,
        Arguments="/c npm install --no-audit --no-fund && npm run dev -- --host 0.0.0.0 --port 3000",
        WorkingDirectory=root,
        UseShellExecute=true
    });
    if(p==null)Error("Could not start the Universe client.");
}catch(Exception ex){Error($"Universe Client could not start.\n\n{ex.Message}");}
