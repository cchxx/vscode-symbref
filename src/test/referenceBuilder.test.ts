import { buildReference, buildPathPart, ReferenceInput } from '../referenceBuilder';

// Simple test runner (no external test framework needed)
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

function assertEqual(actual: string, expected: string, label: string) {
  if (actual !== expected) {
    throw new Error(
      `FAIL: ${label}\n  Expected:\n${expected}\n  Actual:\n${actual}`
    );
  }
}

function runTests() {
  let passed = 0;
  let failed = 0;

  const tests: [string, () => void][] = [
    ['buildPathPart: class method', () => {
      assertEqual(
        buildPathPart('src/utils.py', ['MyClass', 'my_method']),
        'src/utils.py::MyClass::my_method',
        'path part class method'
      );
    }],

    ['buildPathPart: standalone function', () => {
      assertEqual(
        buildPathPart('tests/test_utils.py', ['test_something']),
        'tests/test_utils.py::test_something',
        'path part standalone function'
      );
    }],

    ['buildPathPart: top-level code (no context)', () => {
      assertEqual(
        buildPathPart('config.py', []),
        'config.py',
        'path part top-level'
      );
    }],

    ['buildPathPart: backslash normalization', () => {
      assertEqual(
        buildPathPart('src\\utils\\helper.ts', ['Helper', 'run']),
        'src/utils/helper.ts::Helper::run',
        'backslash normalization'
      );
    }],

    ['Reference: class method with lines', () => {
      const input: ReferenceInput = {
        filePath: 'src/utils.py',
        context: ['MyClass', 'my_method'],
        startLine: 10,
        endLine: 25,
        code: '',
        languageId: 'python',
      };
      assertEqual(
        buildReference(input, 'zip'),
        'src/utils.py::MyClass::my_method lines:10-25',
        'reference mode'
      );
    }],

    ['Reference: top-level with lines', () => {
      const input: ReferenceInput = {
        filePath: 'config.py',
        context: [],
        startLine: 1,
        endLine: 3,
        code: '',
        languageId: 'python',
      };
      assertEqual(
        buildReference(input, 'zip'),
        'config.py lines:1-3',
        'reference mode top-level'
      );
    }],

    ['Full: class method with code block', () => {
      const input: ReferenceInput = {
        filePath: 'src/utils.py',
        context: ['MyClass', 'my_method'],
        startLine: 10,
        endLine: 12,
        code: 'def my_method(self):\n    return self.value + 1',
        languageId: 'python',
      };
      const expected =
        'src/utils.py::MyClass::my_method lines:10-12\n' +
        '```python\n' +
        'def my_method(self):\n' +
        '    return self.value + 1\n' +
        '```';
      assertEqual(
        buildReference(input, 'all'),
        expected,
        'full mode with code block'
      );
    }],

    ['Full: top-level code', () => {
      const input: ReferenceInput = {
        filePath: 'main.go',
        context: [],
        startLine: 1,
        endLine: 1,
        code: 'package main',
        languageId: 'go',
      };
      const expected =
        'main.go lines:1-1\n' +
        '```go\n' +
        'package main\n' +
        '```';
      assertEqual(
        buildReference(input, 'all'),
        expected,
        'full mode top-level go'
      );
    }],

    ['Full: JSON data file', () => {
      const input: ReferenceInput = {
        filePath: 'config/settings.json',
        context: [],
        startLine: 5,
        endLine: 8,
        code: '  "debug": {\n    "enabled": true,\n    "level": "verbose"\n  }',
        languageId: 'json',
      };
      const expected =
        'config/settings.json lines:5-8\n' +
        '```json\n' +
        '  "debug": {\n' +
        '    "enabled": true,\n' +
        '    "level": "verbose"\n' +
        '  }\n' +
        '```';
      assertEqual(
        buildReference(input, 'all'),
        expected,
        'full mode JSON data file'
      );
    }],

    ['Full: YAML data file', () => {
      const input: ReferenceInput = {
        filePath: 'k8s/deployment.yaml',
        context: [],
        startLine: 12,
        endLine: 15,
        code: 'spec:\n  replicas: 3\n  selector:\n    matchLabels:',
        languageId: 'yaml',
      };
      const expected =
        'k8s/deployment.yaml lines:12-15\n' +
        '```yaml\n' +
        'spec:\n' +
        '  replicas: 3\n' +
        '  selector:\n' +
        '    matchLabels:\n' +
        '```';
      assertEqual(
        buildReference(input, 'all'),
        expected,
        'full mode YAML data file'
      );
    }],
  ];

  for (const [name, fn] of tests) {
    try {
      fn();
      console.log(`  + ${name}`);
      passed++;
    } catch (e) {
      console.error(`  x ${name}`);
      console.error(`    ${(e as Error).message}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

console.log('Running referenceBuilder tests...\n');
runTests();
