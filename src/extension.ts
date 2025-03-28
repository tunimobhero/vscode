import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.autoImportSharedModule",
    async () => {
      const sharedModuleName = "AppModule"; // Replace with your shared module name
      const sharedModulePath = "./app.module"; // Replace with the relative path to your shared module

      if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage("No workspace folder open.");
        return;
      }

      const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

      async function processFile(filePath: string) {
        try {
          let content = fs.readFileSync(filePath, "utf8");

          // Simple check if the module is already imported.
          if (
            content.includes(
              `import { ${sharedModuleName} } from '${sharedModulePath}';`
            )
          ) {
            return; // Already imported
          }

          // Simple insertion of the import statement at the top.
          const importStatement = `import { ${sharedModuleName} } from '${sharedModulePath}';\n`;
          content = importStatement + content;

          fs.writeFileSync(filePath, content, "utf8");

          console.log(`Imported ${sharedModuleName} into ${filePath}`);
        } catch (error) {
          console.error(`Error processing ${filePath}: ${error}`);
        }
      }

      async function processDirectory(dirPath: string) {
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);

          if (stats.isDirectory()) {
            await processDirectory(filePath); // Recursive call for subdirectories
          } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
            // Filter for TypeScript files
            await processFile(filePath);
          }
        }
      }

      await processDirectory(workspacePath);

      vscode.window.showInformationMessage(
        `Auto-imported ${sharedModuleName} into relevant files.`
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
