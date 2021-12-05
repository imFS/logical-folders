var vscode = require("vscode");
var logicalFolders = require("./logicalProvider");

function activate(context) {
  // init logic folder
  var provider = new logicalFolders.LogicalFolderProvider(context);
  vscode.window.registerTreeDataProvider("logical-folders", provider);

  // Refresh function for module
  function refresh() {
    provider.refresh();
  }

  // Register open file function
  context.subscriptions.push(
    vscode.commands.registerCommand("logical-folders.openFile", (document) => {
      vscode.window.showTextDocument(document);
    })
  );

  // Register refresh function
  context.subscriptions.push(
    vscode.commands.registerCommand("logical-folders.refresh", refresh)
  );

  // Register refresh on editor change
  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors(function () {
      refresh();
    })
  );

  // Refresh
  refresh();
}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;
