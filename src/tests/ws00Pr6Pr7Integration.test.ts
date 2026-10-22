import test from 'node:test';
import assert from 'node:assert/strict';

import { INITIAL_AUDITED_BUSINESSES } from '../data/mockData';
import {
  AUDITED_DRAFT_VERSION,
  parseAuditedBusinessesDraft,
  removeAccountNoteAndDescendants,
} from '../context/draftSerialization';

// WS00 integration rehearsal only. No legal calculation, taxpayer write or rule activation.
const original = INITIAL_AUDITED_BUSINESSES[0];

test('WS00: WS05 draft export remains readable after PR6 serialization hardening', () => {
  assert.ok(original);
  const payload = { version: AUDITED_DRAFT_VERSION, auditedBusinesses: [original] };
  const imported = parseAuditedBusinessesDraft(JSON.parse(JSON.stringify(payload)));
  assert.ok(imported, 'valid existing local audited-business draft must import');
  assert.deepEqual(imported, [original]);
});

test('WS00: orphaned and wrongly-leveled account notes fail closed on draft import', () => {
  const root = original.notes.find(note => note.level === 1);
  const level2 = original.notes.find(note => note.level === 2);
  assert.ok(root && level2, 'existing three-level original synthetic fixture must exist');
  const payload = (notes: typeof original.notes) => ({
    version: AUDITED_DRAFT_VERSION,
    auditedBusinesses: [{ ...original, notes }],
  });
  assert.equal(
    parseAuditedBusinessesDraft(payload(original.notes.map(note =>
      note.id === level2.id ? { ...note, parentId: 'missing-parent' } : note))),
    null,
    'do not import an orphaned child',
  );
  assert.equal(
    parseAuditedBusinessesDraft(payload(original.notes.map(note =>
      note.id === level2.id ? { ...note, parentId: level2.id } : note))),
    null,
    'do not import a level-two note parented by itself',
  );
  assert.equal(
    parseAuditedBusinessesDraft(payload(original.notes.map(note =>
      note.id === root.id ? { ...note, parentId: level2.id } : note))),
    null,
    'a level-one root must not have a parent',
  );
});

test('WS00: deleting a note removes descendants, not unrelated notes or source state', () => {
  const notes = original.notes;
  const root = notes.find(note => note.level === 1);
  assert.ok(root);
  const sibling = { ...root, id: 'ws00-other-root', noteNumber: 'WS00' };
  const withSibling = [...notes, sibling];
  const originalSerialized = JSON.stringify(withSibling);
  const retained = removeAccountNoteAndDescendants(withSibling, root.id);
  assert.deepEqual(retained.map(note => note.id), [sibling.id]);
  assert.equal(JSON.stringify(withSibling), originalSerialized, 'helper must not mutate the input');
});
