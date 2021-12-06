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

async function getFiles(config) {
  var files = [];
  var promises = [];
  promises = config.map(
    async function (folder) {
      ////////////////////////////////////////////////////////////////////////////////////////////
      //   console.log("Logical Folder: ", folder);
      //  if (files[folder.name] === undefined) {
      //    files[folder.name] = [];
      //   }
      if (folder.files != undefined) {
        for (var i = 0; i < folder.files.length; i++) {
          var glob = folder.files[i];
          //console.log("Searching filter:", glob);
          var uris = await vscode.workspace.findFiles(glob);
          // console.log("Search result: ", uris);
          for (var b = 0; b < uris.length; b++) {
            var uri = uris[b];
            // console.log("File path: ", uri);
            if (!files.find((o) => o === uri.path)) {
              //console.log("Added");
              files.push(uri.path);
            }
          }
        }
      }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////
  );
  // console.log("Waiting for ", promises.length, " Promises..");
  await Promise.all(promises).catch((err) => {
    console.log(err);
  });
  // console.log("Promises finished");
  return files;
}

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
   * TL;DR Gets called with the custom 'tree'/'branch' as parameter when an custom tree is opened/expanded to get files
   *  */
  getChildren(element) {
    // element: {folderElement: $logicalFolderName}

    // If element is non-existent
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
   *   TL;DR Gets called with the file info as parameter, Returns the item for the file (which is the element basically)
   */
  getTreeItem(element) {
    // element: {name: 'test.js', path: '...', document: {...}

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
        arguments: [element], //will use element instead of element.document and change extension.js to use "element.path" instead of "document"
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
  async refresh() {
    // Set logical folders empty
    vscode.commands.executeCommand("setContext", "logicalfolders-empty", true);

    //folders = [];
    let promises = [];

    // Get files and extension config
    // OLD: var documents = vscode.workspace.findFiles();
    var config = vscode.workspace.getConfiguration("logical-folders").folders;
    var documents = await getFiles(config);
    //console.log("Documents len: " + documents.length);
    // Iterate over files
    for (var i = 0; i < documents.length; i++) {
      var document = documents[i];
      //console.log("Document: " + document);
      // if (!document.isUntitled) {
      // Set logical folders not empty
      vscode.commands.executeCommand(
        "setContext",
        "logical-folders-empty",
        false
      );

      // Get file path, name and extension
      //var filepath = vscode.Uri.parse(document.uri.path).fsPath;
      var filepath = vscode.Uri.parse(document).fsPath;
      var name = path.basename(filepath);
      var ext = path.extname(filepath);

      // Get relative path
      let filePath = vscode.workspace.asRelativePath(filepath);

      // If no config set, return files/folders normaly
      if (!config || config.length === 0) {
        if (folders[ext] === undefined) {
          folders[ext] = [];
        }
        folders[ext].push({
          name: name,
          path: filepath,
          document: document,
        });
      } else {
        // If config set, iterate over config (folders: [a,b,c], a: [*.txt, *.js]...)
        // Iterate over folders
        for (var b = 0; b < config.length; b++) {
          var folder = config[b];
          // Iterate over file types
          for (var c = 0; c < folder.files.length; c++) {
            var glob = folder.files[c];
            // Compare extension
            if (minimatch(filePath, glob, { matchBase: true })) {
              //check if logical folder array is defined by that logical folder name, if not define array
              if (folders[folder.name] === undefined) {
                folders[folder.name] = [];
              }

              // Check if existent already:
              if (!folders[folder.name].find((o) => o.path === filepath)) {
                // Push file into folder array
                // console.log("Added file: " + name);
                folders[folder.name].push({
                  name: name,
                  path: filepath,
                  document: undefined, // we disgarded this info so gonna open files via path from now on
                });
              }
            }
          }
        }
      }
    }

    await Promise.all(promises);

    // Update vscode saying something changed in tree data
    this._onDidChangeTreeData.fire();
  }
}

// Export
exports.LogicalFolderProvider = LogicalFolderProvider;
