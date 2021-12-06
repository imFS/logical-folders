var vscode = require("vscode");
var logicalFolders = require("./logicalProvider");

function activate(context) {
  console.log("Loading ..");

  // init logic folder
  var provider = new logicalFolders.LogicalFolderProvider(context);
  vscode.window.registerTreeDataProvider("logical-folders", provider);

  // Refresh function for module
  async function refresh() {
    provider.refresh();
  }

  // Register open file function
  context.subscriptions.push(
    vscode.commands.registerCommand("logical-folders.openFile", (element) => {
      vscode.window.showTextDocument(vscode.Uri.file(element.path));
    })
  );

  // Register refresh function
  context.subscriptions.push(
    vscode.commands.registerCommand("logical-folders.refresh", refresh)
  );

  // Register refresh on editor change
  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors(async function () {
      await refresh();
    })
  );

  // Refresh
  refresh();

  console.log("Loaded.");
}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;
