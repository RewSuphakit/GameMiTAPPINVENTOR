/**
 * ==============================================================================
 * ZERO-DEPENDENCY NODE.JS TEST RUNNER (tests/run_node_tests.js)
 * ==============================================================================
 * ทดสอบฟังก์ชันตรรกะหลักของเกมโดยไม่ต้องติดตั้ง npm packages
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { LEVEL_SCHEMA } from '../js/levels.data.js';
import { Gamification } from '../js/gamification.js';
import { Utils } from '../js/utils.js';

test('Security & Utils: Sanitize HTML against XSS', () => {
  const maliciousInput = '<script>alert("hacked")</script>&"\'';
  const clean = Utils.sanitizeHTML(maliciousInput);
  assert.ok(!clean.includes('<script>'), 'Should not contain script tag');
  assert.ok(clean.includes('&lt;script&gt;'), 'Should escape <script>');
  assert.ok(clean.includes('&quot;'), 'Should escape quotes');
});

test('Security & Utils: Format time MM:SS', () => {
  assert.equal(Utils.formatTime(0), '00:00');
  assert.equal(Utils.formatTime(65), '01:05');
  assert.equal(Utils.formatTime(3599), '59:59');
});

test('Security & Utils: UUID v4 generation', () => {
  const uuid = Utils.generateUUID();
  assert.match(uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test('Gamification: 3-Star scoring rubric', () => {
  const stats = { decoyUsesCount: 0, hintsUnlocked: [false, false, false] };
  const stars = Gamification.calculateStars(110, stats);
  assert.equal(stars, 3, 'Should award 3 stars for score >= 100 with zero decoys/hints');
});

test('Gamification: 2-Star penalty on decoy use', () => {
  const stats = { decoyUsesCount: 1, hintsUnlocked: [false, false, false] };
  const stars = Gamification.calculateStars(100, stats);
  assert.equal(stars, 2, 'Should drop to 2 stars if decoy was used');
});

test('Gamification: 1-Star minimum pass', () => {
  const stats = { decoyUsesCount: 2, hintsUnlocked: [true, true, true] };
  const stars = Gamification.calculateStars(35, stats);
  assert.equal(stars, 1, 'Should award 1 star minimum for completion');
});

test('Levels Schema: All 8 levels exist and have required properties', () => {
  for (let i = 1; i <= 8; i++) {
    const lvl = LEVEL_SCHEMA[i];
    assert.ok(lvl, `Level ${i} should exist`);
    assert.ok(lvl.modeName, `Level ${i} should have modeName`);
    assert.ok(lvl.variants && lvl.variants.length > 0, `Level ${i} should have variants`);
    assert.ok(lvl.hints && lvl.hints.length === 3, `Level ${i} should have 3 hint tiers`);
    assert.ok(lvl.validationType, `Level ${i} should have validationType`);
  }
});
