# vscode-symbref

Copy symbol-aware code references to clipboard -- file path, class, function, line numbers -- in one keystroke.

## Install

```bash
# From VSIX (local)
code --install-extension vscode-symbref-0.2.1.vsix
```

## Usage

| Shortcut (Win/Linux) | Shortcut (macOS) | Mode | Output |
|---|---|------|--------|
| `Ctrl+K, Ctrl+A` | `Cmd+K, Cmd+A` | **All** | path + lines + code block (markdown) |
| `Ctrl+K, Ctrl+Z` | `Cmd+K, Cmd+Z` | **Zip** | path + lines |

**Mnemonic:** A (All) = full detail, Z (Zip) = condensed.

## Output Format

Separator is `::` (double colon). Path is workspace-relative.

### All mode (`Ctrl/Cmd+K, A`)
```
src/utils.py::MyClass::my_method lines:10-25
```python
def my_method(self):
    return self.value + 1
`` `
```

### Zip mode (`Ctrl/Cmd+K, Z`)
```
src/utils.py::MyClass::my_method lines:10-25
```

## Context Resolution

| Code Location | Reference Format |
|--------------|-----------------|
| Class method | `filepath::ClassName::method_name` |
| Standalone function | `filepath::function_name` |
| Top-level code | `filepath` |

## Language Support

Works with **any language** that has a DocumentSymbol provider. Symbol context (class/function) requires a language server; without one, output gracefully degrades to filepath + line numbers.

**Built-in:** TypeScript, JavaScript, JSON, HTML, CSS, Markdown

**With extensions:** Python, Go, C/C++, Java, Rust, C#, Ruby, PHP, YAML, XML, and more

## Design

- Pure logic in `referenceBuilder.ts` (testable without VS Code runtime)
- VS Code API calls isolated in `extension.ts` and `symbolResolver.ts`
- Line numbers are 1-based, selections auto-expand to full lines
- If no text is selected, the cursor line is used

## Development

```bash
npm install
npm run compile
npm run watch    # for development
node out/test/referenceBuilder.test.js  # run unit tests
```

### Package

```bash
npx @vscode/vsce package
```

## Changelog

### 0.2.1
- Renamed modes: Full -> All, Reference -> Zip (matches A/Z keybinding mnemonics)
- Path and line info on single line (`filepath::Class::method lines:X-Y`)

### 0.2.0
- Removed Simple mode (Q keybinding) -- `Cmd+K Cmd+Q` conflicts with macOS "Go to Last Edit Location"
- Added macOS `Cmd+K` chord support
- Two commands: All (A) and Zip (Z)

### 0.1.0
- Initial release with 3 modes (Full/Reference/Simple)

## License

MIT
