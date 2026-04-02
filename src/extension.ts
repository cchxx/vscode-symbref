import * as vscode from 'vscode';
import { resolveSymbolContext } from './symbolResolver';
import { buildReference, buildPathPart, ReferenceMode } from './referenceBuilder';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('codeRef.copyFull', () => copyReference('all')),
    vscode.commands.registerCommand('codeRef.copyRef', () => copyReference('zip'))
  );
}

async function copyReference(mode: ReferenceMode): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const document = editor.document;
  const selection = editor.selection;

  // Expand selection to full lines
  const startLine = selection.start.line;
  const endLine = selection.end.line;
  const fullRange = new vscode.Range(
    startLine, 0,
    endLine, document.lineAt(endLine).text.length
  );

  // If nothing is selected, use the cursor line
  const effectiveRange = selection.isEmpty
    ? new vscode.Range(startLine, 0, startLine, document.lineAt(startLine).text.length)
    : fullRange;

  const effectiveStartLine = effectiveRange.start.line;
  const effectiveEndLine = effectiveRange.end.line;

  // Get workspace-relative file path
  const filePath = vscode.workspace.asRelativePath(document.uri, false);

  // Resolve enclosing class/function context
  const symbolContext = await resolveSymbolContext(document, effectiveRange);

  // Get the code text (full lines)
  const code = document.getText(effectiveRange);

  // Build the reference string (1-based line numbers for human readability)
  const reference = buildReference(
    {
      filePath,
      context: symbolContext,
      startLine: effectiveStartLine + 1,
      endLine: effectiveEndLine + 1,
      code,
      languageId: document.languageId,
    },
    mode
  );

  // Copy to clipboard
  await vscode.env.clipboard.writeText(reference);

  // Show feedback
  const modeLabels: Record<ReferenceMode, string> = {
    all: 'All',
    zip: 'Zip',
  };
  const shortRef = buildPathPart(filePath, symbolContext);
  vscode.window.setStatusBarMessage(
    `$(clippy) ${modeLabels[mode]}: ${shortRef}`,
    3000
  );
}

export function deactivate() {}
