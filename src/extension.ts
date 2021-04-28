import { window, workspace } from "vscode";
import * as path from "path";
import * as vscode from "vscode";
import * as cp from "child_process";
import * as split from "split2";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "quickopen-currentdir.quick-open-current-dir",
    () => quickOpenCurrentDir()
  );

  context.subscriptions.push(disposable);
}

async function quickOpenCurrentDir() {
  const items = await getFiles();
  console.log("getFiles returned", items);
  const quickPick = window.createQuickPick<File>();
  // quickPick.matchOnDescription = false;
  // quickPick.matchOnDetail = true;
  // quickPick.placeholder = "Search";
  if (!items) {
    return;
  }
  quickPick.onDidAccept(async () => {
    const file = quickPick.selectedItems[0];
    const doc = await workspace.openTextDocument(file.path);
    await window.showTextDocument(doc);
  });
  quickPick.items = items;
  quickPick.show();
}

interface File extends vscode.QuickPickItem {
  path: string;
}

function getFiles(): Promise<File[]> {
  const currentFile = vscode.window.activeTextEditor!.document.uri.fsPath;
  const cwd = path.join(currentFile, "..");
  return new Promise((resolve, reject) => {
    const process = cp.spawn("fd", ["--type=f", "--exact-depth=1"], {
      cwd,
    });
    const files: File[] = [];
    const stream = process.stdout.pipe(split());
    stream.on("close", () => resolve(files));
    stream.on("end", () => resolve(files));
    stream.on("error", () => reject("stream failed"));
    stream.on("data", (filename: string) => {
      console.log(filename);
      files.push({ label: filename, path: path.join(cwd, filename) });
    });
  });
}

export function deactivate() {}
