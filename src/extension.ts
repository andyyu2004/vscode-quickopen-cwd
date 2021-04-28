import { window, workspace } from "vscode";
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
  // const items = await getFiles();
  // console.log(files);
  const quickPick = window.createQuickPick<File>();
  // quickPick.matchOnDescription = false;
  // quickPick.matchOnDetail = true;
  // quickPick.placeholder = "Search";
  const items = [{ label: "werr" }];
  console.log("populateSearch returned", items);
  if (!items) {
    return;
  }
  quickPick.items = items;
  quickPick.show();
}

interface File extends vscode.QuickPickItem {}

function getFiles(): Promise<File[]> {
  const cwd = workspace.workspaceFolders![0].uri.fsPath;
  return new Promise((resolve, reject) => {
    const process = cp.spawn("fd", ["--type=f --exact-depth=1"], {
      cwd,
    });
    const files: File[] = [];
    const stream = process.stdout.pipe(split());
    stream.on("close", () => resolve(files));
    stream.on("end", () => resolve(files));
    stream.on("error", () => reject("stream failed"));
    stream.on("data", (filename: string) => {
      files.push({ label: filename });
    });
  });
}

export function deactivate() {}
