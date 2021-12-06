Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var path = require("path");
var minimatch = require("minimatch");

// var folders = {}, Explanation:
// This includes our info of the files
// Format is:
// folders[n] = [file1, file2, ..., fileZ]
// File format is:
// {name: name, path: filepath, document: document}
// Ex:
// folders["headerfiles"] = [{"stdafx.h", "./stdafx.h", document}, {"test.h", "./test.h", document}]
var folders = {};

class LogicalFolderProvider {
  // Constructor
  constructor(_context) {
    this._context = _context;

    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  /**
   * Get children function
   * Returns folder list to display(if element void) or the items of the logical folder(if non void)
   *  */
  getChildren(element) {
    // If element is non-existent
    console.log("getChildren called: ", element);
    if (!element) {
      if (folders !== undefined) {
        var folderList = [];

        // Iterate over logical folders data
        for (var folder in folders) {
          if (folders.hasOwnProperty(folder)) {
            // Push all logical folders into folderList
            folderList.push({ folderElement: folder });
          }
        }

        // Return folder list, where folderElement: logicalFolderName
        return folderList;
      }

      // If no logical folders
      return undefined;
    } else if (element.folderElement !== undefined) {
      // If existing element

      // Return the files(array) within the logical folder
      return folders[element.folderElement];
    }
  }

  /**  Get tree item function
   *   Returns a tree item for the custom tree.
   *   This tree item is actually the "file" itself,
   *   where we define a label, expandableState and command (when double clicked openFile function etc.. which gets the path from us).
   *
   */
  getTreeItem(element) {
    console.log("getTreeItem called: ", element);
    var item = new vscode.TreeItem();
    // If folderElement is existent
    if (element.folderElement !== undefined) {
      // Set directory label
      item.label = element.folderElement;
      // Expand
      item.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
    } else {
      // If folderElement is non-existent
      // Set file name
      item.label = element.name;
      // Set as can't collapse/expand
      item.collapsibleState = vscode.TreeItemCollapsibleState.None;
      // Register command to open file when clicked
      item.command = {
        command: "logical-folders.openFile",
        title: "",
        arguments: [element.document],
      };
    }

    // Return the item(file)
    return item;
  }

  /** Refresh function(void)
   *  Iterates over files and checks config
   *  If file extension defined in config puts the file into the folders array above.
   *  Also notives vscode that something changed. (after every call)
   */
  refresh() {
    // Set logical folders empty
    vscode.commands.executeCommand("setContext", "logicalfolders-empty", true);

    folders = [];

    // Get files and extension config
    var documents = vscode.workspace.textDocuments;
    var config = vscode.workspace.getConfiguration("logical-folders").folders;

    // Iterate over files
    documents.map(function (document, i) {
      if (!document.isUntitled) {
        // Set logical folders not empty
        vscode.commands.executeCommand(
          "setContext",
          "logical-folders-empty",
          false
        );

        // Get file path, name and extension
        var filepath = vscode.Uri.parse(document.uri.path).fsPath;
        var name = path.basename(filepath);
        var ext = path.extname(filepath);

        // Get relative path
        let filePath = vscode.workspace.asRelativePath(document.fileName);

        // If no config set, return files/folders normaly
        if (!config || config.length === 0) {
          if (folders[ext] === undefined) {
            folders[ext] = [];
          }
          folders[ext].push({ name: name, path: filepath, document: document });
        } else {
          // If config set, iterate over config (folders: [a,b,c], a: [*.txt, *.js]...)
          // Iterate over folders
          config.map(function (folder) {
            // Iterate over file types
            folder.files.map(function (glob) {
              // Compare extension
              if (minimatch(filePath, glob, { matchBase: true })) {
                //check if logical folder array is defined by that logical folder name, if not define array
                if (folders[folder.name] === undefined) {
                  folders[folder.name] = [];
                }
                // Push file into folder array
                folders[folder.name].push({
                  name: name,
                  path: filepath,
                  document: document,
                });
              }
            });
          });
        }
      }
    });

    // Update vscode saying something changed in tree data
    this._onDidChangeTreeData.fire();
  }
}

// Export
exports.LogicalFolderProvider = LogicalFolderProvider;
