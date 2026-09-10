/**
 * ==============================================================================
 * AUTOMATED UNIT TESTS (tests/validator.test.js)
 * ==============================================================================
 * ชุดทดสอบ Vitest สำหรับ GenericValidator, Gamification, และ Security Utils
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GenericValidator } from '../js/validator.js';
import { Gamification } from '../js/gamification.js';
import { Utils } from '../js/utils.js';

describe('Security & Utils Tests', () => {
  it('should escape malicious XSS characters in student input', () => {
    const maliciousInput = '<script>alert("hacked")</script>&"\'';
    const clean = Utils.sanitizeHTML(maliciousInput);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('&lt;script&gt;');
    expect(clean).toContain('&quot;');
    expect(clean).toContain('&#039;');
  });

  it('should format seconds into MM:SS correctly', () => {
    expect(Utils.formatTime(0)).toBe('00:00');
    expect(Utils.formatTime(65)).toBe('01:05');
    expect(Utils.formatTime(3599)).toBe('59:59');
  });

  it('should generate valid UUID v4 format', () => {
    const uuid = Utils.generateUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});

describe('Gamification Star Rubric Tests', () => {
  it('should award 3 stars for score >= 100 with no decoy and no tier-3 hint', () => {
    const stats = { decoyUsesCount: 0, hintsUnlocked: [false, false, false] };
    const stars = Gamification.calculateStars(110, stats);
    expect(stars).toBe(3);
  });

  it('should degrade to 2 stars if score >= 100 but player used a decoy block', () => {
    const stats = { decoyUsesCount: 1, hintsUnlocked: [false, false, false] };
    const stars = Gamification.calculateStars(100, stats);
    expect(stars).toBe(2);
  });

  it('should award 2 stars for score between 60 and 99', () => {
    const stats = { decoyUsesCount: 0, hintsUnlocked: [true, false, false] };
    const stars = Gamification.calculateStars(75, stats);
    expect(stars).toBe(2);
  });

  it('should award 1 star for low score passing the level', () => {
    const stats = { decoyUsesCount: 2, hintsUnlocked: [true, true, true] };
    const stars = Gamification.calculateStars(35, stats);
    expect(stars).toBe(1);
  });
});

describe('GenericValidator DOM Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should validate cavity-has-correct successfully when correct block is present', () => {
    document.body.innerHTML = `
      <div id="l1-cavity">
        <div class="ai-block" data-type="correct">Correct Block</div>
      </div>
    `;
    const res = GenericValidator.validate(1, 0);
    expect(res.isValid).toBe(true);
    expect(res.isDecoy).toBe(false);
  });

  it('should flag decoy block when decoy is present in cavity', () => {
    document.body.innerHTML = `
      <div id="l1-cavity">
        <div class="ai-block" data-decoy="true">Decoy Block</div>
      </div>
    `;
    const res = GenericValidator.validate(1, 0);
    expect(res.isValid).toBe(false);
    expect(res.isDecoy).toBe(true);
  });

  it('should reject debug-replace if buggy block is still in socket', () => {
    document.body.innerHTML = `
      <div id="l3-sock">
        <div class="ai-block buggy-block" data-type="buggy">Buggy Block</div>
      </div>
    `;
    const res = GenericValidator.validate(3, 0);
    expect(res.isValid).toBe(false);
    expect(res.message).toContain('Bug');
  });

  it('should validate sequence-order when all 4 slots match variant order', () => {
    document.body.innerHTML = `
      <div id="l4-slot-1"><div data-step="s4-init"></div></div>
      <div id="l4-slot-2"><div data-step="s4-calc"></div></div>
      <div id="l4-slot-3"><div data-step="s4-label"></div></div>
      <div id="l4-slot-4"><div data-step="s4-alert"></div></div>
    `;
    const res = GenericValidator.validate(4, 0);
    expect(res.isValid).toBe(true);
    expect(res.isDecoy).toBe(false);
  });
});
