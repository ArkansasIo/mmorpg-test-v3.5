using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Windows.Forms;

namespace UniverseAdminTerminal;

internal static class Program
{
    [STAThread]
    static void Main() { ApplicationConfiguration.Initialize(); Application.Run(new AdminForm()); }
}

internal sealed class AdminForm : Form
{
    readonly TextBox server = new() { Text = "http://localhost:5001", Width = 260 };
    readonly TextBox username = new() { Width = 160 };
    readonly TextBox password = new() { Width = 160, UseSystemPasswordChar = true };
    readonly Button login = new() { Text = "AUTHENTICATE", AutoSize = true };
    readonly Label session = new() { Text = "NOT AUTHENTICATED", AutoSize = true };
    readonly ComboBox commands = new() { Width = 220, DropDownStyle = ComboBoxStyle.DropDownList };
    readonly Button execute = new() { Text = "EXECUTE", AutoSize = true, Enabled = false };
    readonly TextBox query = new() { PlaceholderText = "Search query / user ID / config key", Width = 300 };
    readonly TextBox output = new() { Multiline = true, ReadOnly = true, ScrollBars = ScrollBars.Both, Dock = DockStyle.Fill, Font = new Font("Consolas", 10) };
    readonly HttpClient http;
    string baseUrl = "";

    public AdminForm()
    {
        Text = "Universe Civilization — Admin Systems";
        Width = 1100; Height = 720; MinimumSize = new Size(900, 600);
        BackColor = Color.FromArgb(7, 20, 32); ForeColor = Color.White;
        http = new HttpClient(new HttpClientHandler { CookieContainer = new CookieContainer(), UseCookies = true });

        var auth = new FlowLayoutPanel { Dock = DockStyle.Top, Height = 78, Padding = new Padding(10), BackColor = Color.FromArgb(10, 32, 48), WrapContents = false };
        auth.Controls.Add(new Label { Text = "SERVER", AutoSize = true, Padding = new Padding(0, 7, 4, 0) });
        auth.Controls.Add(server);
        auth.Controls.Add(new Label { Text = "USERNAME", AutoSize = true, Padding = new Padding(8, 7, 4, 0) });
        auth.Controls.Add(username);
        auth.Controls.Add(new Label { Text = "PASSWORD", AutoSize = true, Padding = new Padding(8, 7, 4, 0) });
        auth.Controls.Add(password); auth.Controls.Add(login); auth.Controls.Add(session);

        var toolbar = new FlowLayoutPanel { Dock = DockStyle.Top, Height = 62, Padding = new Padding(10), BackColor = Color.FromArgb(4, 14, 24), WrapContents = false };
        toolbar.Controls.Add(new Label { Text = "COMMAND", AutoSize = true, Padding = new Padding(0, 7, 5, 0) });
        toolbar.Controls.Add(commands); toolbar.Controls.Add(execute); toolbar.Controls.Add(query);

        var split = new SplitContainer { Dock = DockStyle.Fill, SplitterDistance = 300 };
        var menu = new ListBox { Dock = DockStyle.Fill, BackColor = Color.FromArgb(5, 18, 30), ForeColor = Color.Cyan, BorderStyle = BorderStyle.None };
        menu.SelectedIndexChanged += (_, _) => { if (menu.SelectedItem is string s) { foreach (var item in commands.Items) if (item.ToString()!.Equals(s, StringComparison.OrdinalIgnoreCase)) commands.SelectedItem = item; } };
        split.Panel1.Controls.Add(menu); split.Panel2.Controls.Add(output);
        Controls.Add(split); Controls.Add(toolbar); Controls.Add(auth);

        commands.Items.AddRange(new object[] { "status", "help", "users search", "user ban", "user unban", "config get", "config set", "audit recent", "queues", "db health" });
        commands.SelectedIndex = 0;
        login.Click += async (_, _) => await LoginAsync(menu);
        execute.Click += async (_, _) => await ExecuteAsync();
    }

    async Task LoginAsync(ListBox menu)
    {
        try {
            baseUrl = server.Text.Trim().TrimEnd('/');
            if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out _)) throw new InvalidOperationException("Invalid server URL.");
            var response = await http.PostAsJsonAsync(baseUrl + "/api/auth/login", new { username = username.Text.Trim(), password = password.Text });
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode) throw new InvalidOperationException(body);
            var admin = await http.GetFromJsonAsync<JsonElement>(baseUrl + "/api/admin/dashboard");
            var role = admin.GetProperty("role").GetString() ?? "admin";
            menu.Items.Clear();
            foreach (var node in admin.GetProperty("menu").EnumerateArray()) {
                foreach (var cmd in node.GetProperty("commands").EnumerateArray()) menu.Items.Add(cmd.GetString() ?? "");
            }
            session.Text = "AUTHENTICATED: " + role.ToUpperInvariant(); session.ForeColor = Color.Lime; execute.Enabled = true;
            output.Text = JsonSerializer.Serialize(admin, new JsonSerializerOptions { WriteIndented = true });
        } catch (Exception ex) { output.Text = "AUTHENTICATION ERROR\r\n" + ex.Message; }
    }

    async Task ExecuteAsync()
    {
        try {
            var command = commands.Text;
            object args = command switch {
                "users search" => new { query = query.Text.Trim() },
                "user ban" or "user unban" => new { userId = query.Text.Trim() },
                "config get" => new { key = query.Text.Trim() },
                _ => new { }
            };
            var response = await http.PostAsJsonAsync(baseUrl + "/api/admin/terminal/execute", new { command, args });
            var body = await response.Content.ReadAsStringAsync();
            output.Text = JsonSerializer.Serialize(JsonSerializer.Deserialize<JsonElement>(body), new JsonSerializerOptions { WriteIndented = true });
        } catch (Exception ex) { output.Text = "COMMAND ERROR\r\n" + ex.Message; }
    }

    protected override void Dispose(bool disposing) { if (disposing) http.Dispose(); base.Dispose(disposing); }
}
