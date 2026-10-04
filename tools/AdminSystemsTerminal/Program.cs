using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace UniverseAdminTerminal;

internal static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new AdminForm());
    }
}

internal sealed class AdminForm : Form
{
    readonly TextBox server = new() { Text = "http://localhost:5001", Width = 280 };
    readonly TextBox username = new() { Width = 150 };
    readonly TextBox password = new() { Width = 150, UseSystemPasswordChar = true };
    readonly Button login = new() { Text = "AUTHENTICATE", AutoSize = true };
    readonly Label session = new() { Text = "NOT AUTHENTICATED", AutoSize = true };
    readonly ComboBox commands = new() { Width = 230, DropDownStyle = ComboBoxStyle.DropDownList };
    readonly Button execute = new() { Text = "EXECUTE", AutoSize = true, Enabled = false };
    readonly TextBox query = new() { PlaceholderText = "User ID / search / config key", Width = 280 };
    readonly TextBox output = new() { Multiline = true, ReadOnly = true, ScrollBars = ScrollBars.Both, Dock = DockStyle.Fill, Font = new Font("Consolas", 10) };
    readonly ListView activity = new() { Dock = DockStyle.Fill, View = View.Details, FullRowSelect = true, GridLines = true };
    readonly HttpClient http;
    string baseUrl = "";
    string role = "";
    readonly Dictionary<string, string> commandDescriptions = new(StringComparer.OrdinalIgnoreCase)
    {
        ["status"] = "Server and admin API status",
        ["help"] = "Show available administrative commands",
        ["users search"] = "Search player accounts",
        ["user ban"] = "Ban a user by ID",
        ["user unban"] = "Remove a user ban",
        ["config get"] = "Read a server configuration key",
        ["config set"] = "Change a server configuration key",
        ["audit recent"] = "View recent administrative audit events",
        ["queues"] = "Inspect server queues",
        ["db health"] = "Check database connectivity"
    };

    public AdminForm()
    {
        Text = "Universe Civilization — Admin Systems Terminal";
        Width = 1200;
        Height = 780;
        MinimumSize = new Size(980, 620);
        BackColor = Color.FromArgb(5, 14, 24);
        ForeColor = Color.White;
        StartPosition = FormStartPosition.CenterScreen;

        http = new HttpClient(new HttpClientHandler
        {
            CookieContainer = new CookieContainer(),
            UseCookies = true
        }) { Timeout = TimeSpan.FromSeconds(30) };

        BuildUi();
    }

    void BuildUi()
    {
        var header = new Panel { Dock = DockStyle.Top, Height = 92, BackColor = Color.FromArgb(8, 31, 48), Padding = new Padding(14) };
        var title = new Label { Text = "UNIVERSE ADMIN SYSTEMS", AutoSize = true, Font = new Font("Segoe UI", 18, FontStyle.Bold), ForeColor = Color.Cyan, Location = new Point(14, 8) };
        var subtitle = new Label { Text = "Secure server administration • RBAC • audit-aware command terminal", AutoSize = true, ForeColor = Color.LightGray, Location = new Point(16, 43) };
        session.Location = new Point(780, 22);
        session.ForeColor = Color.Gold;
        header.Controls.Add(title);
        header.Controls.Add(subtitle);
        header.Controls.Add(session);

        var auth = new FlowLayoutPanel { Dock = DockStyle.Top, Height = 64, Padding = new Padding(12), BackColor = Color.FromArgb(3, 10, 18), WrapContents = false };
        auth.Controls.Add(new Label { Text = "SERVER", AutoSize = true, Padding = new Padding(0, 8, 4, 0) });
        auth.Controls.Add(server);
        auth.Controls.Add(new Label { Text = "USER", AutoSize = true, Padding = new Padding(10, 8, 4, 0) });
        auth.Controls.Add(username);
        auth.Controls.Add(new Label { Text = "PASSWORD", AutoSize = true, Padding = new Padding(10, 8, 4, 0) });
        auth.Controls.Add(password);
        auth.Controls.Add(login);

        var toolbar = new FlowLayoutPanel { Dock = DockStyle.Top, Height = 64, Padding = new Padding(12), BackColor = Color.FromArgb(6, 23, 36), WrapContents = false };
        toolbar.Controls.Add(new Label { Text = "COMMAND", AutoSize = true, Padding = new Padding(0, 8, 5, 0) });
        toolbar.Controls.Add(commands);
        toolbar.Controls.Add(execute);
        toolbar.Controls.Add(query);

        var menu = new ListBox { Dock = DockStyle.Fill, BackColor = Color.FromArgb(4, 18, 30), ForeColor = Color.Cyan, BorderStyle = BorderStyle.None, Font = new Font("Segoe UI", 10) };
        foreach (var command in commandDescriptions.Keys) menu.Items.Add(command);
        commands.Items.AddRange(commandDescriptions.Keys.Cast<object>().ToArray());
        commands.SelectedIndex = 0;
        menu.SelectedIndex = 0;

        var menuPanel = new Panel { Dock = DockStyle.Left, Width = 260, Padding = new Padding(10), BackColor = Color.FromArgb(4, 18, 30) };
        var menuTitle = new Label { Text = "ADMIN COMMANDS", Dock = DockStyle.Top, Height = 34, ForeColor = Color.LightGray, Font = new Font("Segoe UI", 9, FontStyle.Bold) };
        menuPanel.Controls.Add(menu);
        menuPanel.Controls.Add(menuTitle);

        var terminalTabs = new TabControl { Dock = DockStyle.Fill };
        var consolePage = new TabPage("COMMAND OUTPUT") { BackColor = Color.FromArgb(2, 10, 17) };
        var auditPage = new TabPage("ACTIVITY / AUDIT") { BackColor = Color.FromArgb(2, 10, 17) };

        activity.Columns.Add("Time", 150);
        activity.Columns.Add("Action", 180);
        activity.Columns.Add("Result", 100);
        activity.Columns.Add("Details", 500);

        consolePage.Controls.Add(output);
        auditPage.Controls.Add(activity);
        terminalTabs.TabPages.Add(consolePage);
        terminalTabs.TabPages.Add(auditPage);

        menu.SelectedIndexChanged += (_, _) =>
        {
            if (menu.SelectedItem is string command)
                commands.SelectedItem = command;
        };

        login.Click += async (_, _) => await LoginAsync(menu);
        execute.Click += async (_, _) => await ExecuteAsync();

        var body = new Panel { Dock = DockStyle.Fill };
        body.Controls.Add(terminalTabs);
        body.Controls.Add(menuPanel);

        Controls.Add(body);
        Controls.Add(toolbar);
        Controls.Add(auth);
        Controls.Add(header);
    }

    void LogActivity(string action, string result, string details)
    {
        var item = new ListViewItem(DateTime.Now.ToString("HH:mm:ss"));
        item.SubItems.Add(action);
        item.SubItems.Add(result);
        item.SubItems.Add(details.Replace(Environment.NewLine, " "));
        activity.Items.Insert(0, item);
    }

    void SetOutput(string text)
    {
        output.Text = text;
        output.SelectionStart = 0;
        output.SelectionLength = 0;
    }

    async Task LoginAsync(ListBox menu)
    {
        login.Enabled = false;

        try
        {
            baseUrl = server.Text.Trim().TrimEnd('/');
            if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out var uri) ||
                (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
                throw new InvalidOperationException("Enter a valid HTTP or HTTPS server URL.");

            var response = await http.PostAsJsonAsync(
                baseUrl + "/api/auth/login",
                new { username = username.Text.Trim(), password = password.Text });

            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"HTTP {(int)response.StatusCode}: {body}");

            var admin = await http.GetFromJsonAsync<JsonElement>(baseUrl + "/api/admin/dashboard");
            role = admin.TryGetProperty("role", out var roleValue)
                ? roleValue.GetString() ?? "admin"
                : "admin";

            commands.Items.Clear();
            menu.Items.Clear();

            if (admin.TryGetProperty("menu", out var menuValue) && menuValue.ValueKind == JsonValueKind.Array)
            {
                foreach (var node in menuValue.EnumerateArray())
                {
                    if (!node.TryGetProperty("commands", out var commandList)) continue;
                    foreach (var cmd in commandList.EnumerateArray())
                    {
                        var name = cmd.GetString();
                        if (!string.IsNullOrWhiteSpace(name))
                        {
                            menu.Items.Add(name);
                            commands.Items.Add(name);
                        }
                    }
                }
            }

            if (commands.Items.Count == 0)
                foreach (var command in commandDescriptions.Keys)
                {
                    commands.Items.Add(command);
                    menu.Items.Add(command);
                }

            commands.SelectedIndex = 0;
            menu.SelectedIndex = 0;
            session.Text = "AUTHENTICATED • " + role.ToUpperInvariant();
            session.ForeColor = Color.Lime;
            execute.Enabled = true;

            SetOutput(JsonSerializer.Serialize(admin, new JsonSerializerOptions { WriteIndented = true }));
            LogActivity("AUTHENTICATE", "SUCCESS", $"Role: {role}");
        }
        catch (Exception ex)
        {
            session.Text = "AUTHENTICATION FAILED";
            session.ForeColor = Color.OrangeRed;
            SetOutput("AUTHENTICATION ERROR\r\n\r\n" + ex);
            LogActivity("AUTHENTICATE", "FAILED", ex.Message);
        }
        finally
        {
            login.Enabled = true;
        }
    }

    async Task ExecuteAsync()
    {
        execute.Enabled = false;

        try
        {
            var command = commands.Text.Trim();
            if (string.IsNullOrWhiteSpace(command))
                throw new InvalidOperationException("Select an administrative command.");

            object args = command switch
            {
                "users search" => new { query = query.Text.Trim() },
                "user ban" or "user unban" => new { userId = query.Text.Trim() },
                "config get" => new { key = query.Text.Trim() },
                "config set" => new { key = query.Text.Trim() },
                _ => new { }
            };

            var response = await http.PostAsJsonAsync(
                baseUrl + "/api/admin/terminal/execute",
                new { command, args });

            var body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"HTTP {(int)response.StatusCode}: {body}");

            if (string.IsNullOrWhiteSpace(body))
            {
                SetOutput("COMMAND COMPLETED\r\n\r\nNo response body returned.");
            }
            else
            {
                try
                {
                    var json = JsonSerializer.Deserialize<JsonElement>(body);
                    SetOutput(JsonSerializer.Serialize(json, new JsonSerializerOptions { WriteIndented = true }));
                }
                catch
                {
                    SetOutput(body);
                }
            }

            LogActivity(command, "SUCCESS", query.Text.Trim());
        }
        catch (Exception ex)
        {
            SetOutput("COMMAND ERROR\r\n\r\n" + ex);
            LogActivity(commands.Text, "FAILED", ex.Message);
        }
        finally
        {
            execute.Enabled = session.Text.StartsWith("AUTHENTICATED", StringComparison.OrdinalIgnoreCase);
        }
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing) http.Dispose();
        base.Dispose(disposing);
    }
}
