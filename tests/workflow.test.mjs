import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');
const actionRef = name => workflow.match(new RegExp(`uses:\\s*${name}@(\\S+)`))?.[1];

test('the workflow no longer uses Node.js 20 action releases', () => {
  for (const legacy of ['actions/checkout@v4', 'actions/setup-node@v4',
    'actions/upload-pages-artifact@v3', 'actions/deploy-pages@v4']) {
    assert.ok(!workflow.includes(legacy), `legacy action reference: ${legacy}`);
  }
});

test('build actions are pinned by full commit SHA', () => {
  for (const name of ['actions/checkout', 'actions/setup-node', 'actions/upload-pages-artifact']) {
    assert.match(actionRef(name), /^[0-9a-f]{40}$/);
  }
});

test('the project builds on a supported Node.js release', () => {
  assert.match(workflow, /node-version:\s*(?:22|24)\b/);
  assert.doesNotMatch(workflow, /node-version:\s*20\b/);
});
