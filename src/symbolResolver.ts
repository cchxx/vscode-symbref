import * as vscode from 'vscode';

/**
 * Walks the document symbol tree to find the enclosing context for a given position.
 * Returns a path like ["ClassName", "method_name"] or ["function_name"] or [].
 */
export async function resolveSymbolContext(
  document: vscode.TextDocument,
  range: vscode.Range
): Promise<string[]> {
  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    'vscode.executeDocumentSymbolProvider',
    document.uri
  );

  if (!symbols || symbols.length === 0) {
    return [];
  }

  const context: string[] = [];
  findEnclosingSymbols(symbols, range, context);
  return context;
}

function findEnclosingSymbols(
  symbols: vscode.DocumentSymbol[],
  range: vscode.Range,
  context: string[]
): void {
  for (const symbol of symbols) {
    if (!symbol.range.contains(range)) {
      continue;
    }

    if (isContextSymbol(symbol.kind)) {
      context.push(symbol.name);
    }

    if (symbol.children && symbol.children.length > 0) {
      findEnclosingSymbols(symbol.children, range, context);
    }

    // Found the innermost enclosing symbol, stop searching siblings
    return;
  }
}

function isContextSymbol(kind: vscode.SymbolKind): boolean {
  return (
    kind === vscode.SymbolKind.Class ||
    kind === vscode.SymbolKind.Function ||
    kind === vscode.SymbolKind.Method ||
    kind === vscode.SymbolKind.Interface ||
    kind === vscode.SymbolKind.Enum ||
    kind === vscode.SymbolKind.Module ||
    kind === vscode.SymbolKind.Namespace
  );
}
