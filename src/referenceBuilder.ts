import * as vscode from 'vscode';

export type ReferenceMode = 'all' | 'zip';

export interface ReferenceInput {
  filePath: string;
  context: string[];
  startLine: number;
  endLine: number;
  code: string;
  languageId: string;
}

/**
 * Build a reference string based on the mode.
 *
 * All: filepath::Class::method lines:X-Y\n```lang\ncode\n```
 * Zip: filepath::Class::method lines:X-Y
 */
export function buildReference(input: ReferenceInput, mode: ReferenceMode): string {
  const pathPart = buildPathPart(input.filePath, input.context);
  const linesPart = `lines:${input.startLine}-${input.endLine}`;

  switch (mode) {
    case 'zip':
      return `${pathPart} ${linesPart}`;

    case 'all':
      return `${pathPart} ${linesPart}\n\`\`\`${input.languageId}\n${input.code}\n\`\`\``;
  }
}

/**
 * Build the path::context portion (used for status bar display).
 */
export function buildPathPart(filePath: string, context: string[]): string {
  const normalized = filePath.replace(/\\/g, '/');

  if (context.length === 0) {
    return normalized;
  }

  return `${normalized}::${context.join('::')}`;
}
