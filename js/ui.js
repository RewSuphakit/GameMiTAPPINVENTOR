/**
 * ==============================================================================
 * UI CONTROLLER & VIEW RENDERING (js/ui.js)
 * ==============================================================================
 * จัดการการเรนเดอร์หน้าจอ, Dialog Modals, Toast, World Map, และสลับแท็บมือถือ
 */

import { CONFIG } from './config.js';
import { GameState } from './state.js';
import { LEVEL_SCHEMA } from './levels.data.js';
import { DragEngine } from './dragEngine.js';
import { PhoneSimulator } from './simulator.js';
import { AudioEngine } from './audio.js';
import { Utils } from './utils.js';

export const UIController = {
  /**
   * แสดง Toast Notification
   * @param {string} msg 
   * @param {'info'|'success'|'error'} type 
   */
  showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${Utils.sanitizeHTML(msg)}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 15);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  },

  /**
   * แสดงแถบ Formative Feedback ด้านบน
   */
  setFormativeFeedback(message, type = 'info') {
    const el = document.getElementById('formative-banner');
    if (!el) return;
    if (!message) {
      el.classList.remove('show');
      el.textContent = '';
      return;
    }
    el.className = `formative-banner show ${type}`;
    el.textContent = message;
  },

  /**
   * อัปเดตข้อความสถานะ Google Sheets
   */
  updateGsheetStatus(text, color = '#7c3aed') {
    const el = document.getElementById('gsheet-status-text');
    if (el) {
      el.textContent = text;
      el.style.color = color;
    }
  },

  /**
   * สลับมุมมองแท็บบนมือถือ (Toolbox | Canvas | Simulator)
   * @param {'toolbox'|'canvas'|'simulator'} tabName 
   */
  setMobileView(tabName) {
    GameState.activeMobileTab = tabName;
    const workspace = document.querySelector('.main-workspace');
    if (workspace) {
      workspace.setAttribute('data-active-view', tabName);
    }

    document.querySelectorAll('.mobile-tab-btn').forEach((btn) => {
      if (btn.getAttribute('data-view') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    AudioEngine.playClick();
    Utils.vibrate(15);
  },

  /**
   * สลับระหว่าง Light Mode และ Dark Mode
   */
  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    GameState.theme = next;
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, next);

    const btn = document.getElementById('btn-theme-toggle');
    if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
    this.showToast(next === 'dark' ? 'เปิดโหมดมืด (Dark Mode)' : 'เปิดโหมดสว่าง (Light Mode)', 'info');
  },

  /**
   * โหลด Theme เริ่มต้นจาก LocalStorage
   */
  initTheme() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    GameState.theme = saved;
    const btn = document.getElementById('btn-theme-toggle');
    if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';
  },

  /**
   * ย่อ / ขยายการแสดงผลการ์ดโจทย์คำอธิบาย
   */
  toggleMissionCard() {
    const card = document.getElementById('mission-desc-card');
    const toggleBtn = document.getElementById('btn-mission-toggle');
    if (!card) return;
    const isCollapsed = card.classList.toggle('is-collapsed');
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('.toggle-icon');
      if (icon) icon.textContent = isCollapsed ? '▼' : '▲';
      toggleBtn.setAttribute('aria-expanded', !isCollapsed);
    }
  },

  /**
   * เรนเดอร์ด่านปัจจุบันลงบน Canvas, กล่อง Toolbox, และ Simulator
   */
  renderLevel(levelNum, variantIndex) {
    const schema = LEVEL_SCHEMA[levelNum];
    if (!schema) return;
    const variant = schema.variants[variantIndex || 0];

    // 1. อัปเดต Mission Strip ด้านบน
    const lvlBadge = document.getElementById('mission-lvl-badge');
    const missionTitle = document.getElementById('mission-title');
    const missionDesc = document.getElementById('mission-desc-text');
    if (lvlBadge) lvlBadge.textContent = `LV.${levelNum} ${schema.modeIcon}`;
    if (missionTitle) missionTitle.textContent = variant.title;
    if (missionDesc) missionDesc.innerHTML = variant.desc;

    // คืนค่าการ์ดโจทย์ให้เปิดอ่านได้ชัดเจน
    const card = document.getElementById('mission-desc-card');
    const toggleBtn = document.getElementById('btn-mission-toggle');
    if (card && card.classList.contains('is-collapsed')) {
      card.classList.remove('is-collapsed');
      if (toggleBtn) {
        const icon = toggleBtn.querySelector('.toggle-icon');
        if (icon) icon.textContent = '▲';
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    }

    // 2. เคลียร์ Formative Feedback เก่า
    this.setFormativeFeedback('', 'info');

    // 3. เรนเดอร์ Canvas
    const canvas = document.getElementById('workspace-canvas');
    const trashWidget = document.getElementById('trash-can-widget');
    if (canvas) {
      canvas.innerHTML = variant.rootHtml;
      if (trashWidget) canvas.appendChild(trashWidget);
    }

    // 4. เรนเดอร์ Toolbox Blocks (สับเปลี่ยนตำแหน่งแบบสุ่ม)
    const toolbox = document.getElementById('toolbox-blocks');
    if (toolbox) {
      toolbox.innerHTML = Utils.shuffleArray(variant.toolboxBlocks).join('');
    }

    // 5. ผูก Draggables กับ Pointer Events
    DragEngine.bindAllDraggables();

    // 6. เรนเดอร์หน้าจอโทรศัพท์จำลอง
    PhoneSimulator.render(levelNum, variantIndex);
  },

  /**
   * เปิด Modal ขอคำใบ้ (3 ระดับ)
   */
  openHintModal() {
    const lvl = GameState.currentLevel;
    const schema = LEVEL_SCHEMA[lvl];
    if (!schema) return;

    const list = document.getElementById('hint-cards-list');
    if (!list) return;
    list.innerHTML = '';

    const stats = GameState.levelStats[lvl];
    if (!stats.hintsUnlocked) stats.hintsUnlocked = [false, false, false];

    schema.hints.forEach((hintText, idx) => {
      const tierNum = idx + 1;
      const cost = CONFIG.HINT_COSTS[idx];
      const isUnlocked = stats.hintsUnlocked[idx];

      const card = document.createElement('div');
      card.style.background = isUnlocked ? 'var(--color-warning-bg)' : 'var(--bg-app)';
      card.style.border = `1px solid ${isUnlocked ? 'var(--color-warning-border)' : 'var(--border-color)'}`;
      card.style.padding = '12px 14px';
      card.style.borderRadius = '10px';

      if (isUnlocked) {
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong style="color:#b45309;font-size:0.85rem;">💡 คำใบ้ระดับที่ ${tierNum} (เปิดแล้ว)</strong>
            <span style="font-size:0.75rem;color:${cost === 0 ? '#10b981' : '#b45309'};font-weight:700;">${cost === 0 ? '🎁 ฟรี' : `-${cost} PTS`}</span>
          </div>
          <div style="margin-top:6px;font-size:0.84rem;color:var(--text-main);line-height:1.45;">${hintText}</div>
        `;
      } else {
        const canUnlock = idx === 0 || stats.hintsUnlocked[idx - 1];
        const costLabel = cost === 0 
          ? `<span style="font-size:0.75rem;color:#10b981;font-weight:800;background:rgba(16,185,129,0.15);padding:2px 8px;border-radius:999px;">🎁 ฟรี (0 แต้ม)</span>`
          : `<span style="font-size:0.75rem;color:var(--text-muted);font-weight:700;">หักแต้ม -${cost} PTS</span>`;

        const btnClass = cost === 0 ? 'btn-primary' : 'btn-secondary';
        const btnBg = cost === 0 ? 'background:linear-gradient(135deg,#10b981,#059669);' : '';
        const btnText = cost === 0 ? '🔓 เปิดดูคำใบ้ฟรี ✨' : '🔓 ปลดล็อกคำใบ้';

        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong style="color:var(--text-main);font-size:0.85rem;">🔒 คำใบ้ระดับที่ ${tierNum}</strong>
            ${costLabel}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
            <span style="font-size:0.75rem;color:var(--text-muted);">
              ${idx === 0 ? 'คำใบ้ชี้แนะเริ่มต้น' : idx === 1 ? 'คำใบ้เจาะจงบล็อก' : 'เฉลยขั้นตอนสมบูรณ์'}
            </span>
            <button class="${btnClass}" id="btn-unlock-hint-${idx}" style="padding:4px 12px;font-size:0.78rem;min-height:36px;${btnBg}" ${canUnlock ? '' : 'disabled'}>
              ${btnText}
            </button>
          </div>
        `;
      }
      list.appendChild(card);

      if (!isUnlocked) {
        document.getElementById(`btn-unlock-hint-${idx}`)?.addEventListener('click', () => {
          stats.hintsUnlocked[idx] = true;
          stats.penalty += cost;
          AudioEngine.playHint();
          this.showToast(cost === 0 ? 'เปิดคำใบ้ฟรีเรียบร้อย! ✨' : `ปลดล็อกคำใบ้ระดับ ${tierNum} แล้ว (-${cost} คะแนน)`, 'info');
          GameState.save();
          this.openHintModal();
        });
      }
    });

    document.getElementById('modal-hint')?.classList.add('active');
    AudioEngine.playClick();
  },

  closeHintModal() {
    document.getElementById('modal-hint')?.classList.remove('active');
  },

  /**
   * เปิดหน้าต่าง World Map (Duolingo Learning Path)
   */
  openWorldMap() {
    const container = document.getElementById('world-path-nodes');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 1; i <= CONFIG.TOTAL_LEVELS; i++) {
      const schema = LEVEL_SCHEMA[i];
      const stats = GameState.levelStats[i] || {};
      const isCompleted = !!stats.completed;
      const isActive = i === GameState.currentLevel;

      // สามารถเล่นได้ถ้าเป็นด่าน 1 หรือด่านก่อนหน้าเสร็จสิ้นแล้ว
      const isUnlocked = i === 1 || !!GameState.levelStats[i - 1]?.completed;

      const node = document.createElement('div');
      node.className = `path-node ${isUnlocked ? 'unlocked' : ''} ${isCompleted ? 'completed' : ''} ${isActive ? 'active-now' : ''}`;
      node.style.cursor = isUnlocked ? 'pointer' : 'not-allowed';
      node.style.opacity = isUnlocked ? '1' : '0.5';

      let starsHtml = '';
      if (isCompleted) {
        const starCount = stats.stars || 1;
        starsHtml = `<div class="node-stars">${'⭐'.repeat(starCount)}</div>`;
      }

      node.innerHTML = `
        <span style="font-size:1.4rem;">${schema.modeIcon}</span>
        <span style="font-size:0.75rem;font-weight:800;">LV.${i}</span>
        ${starsHtml}
      `;

      if (isUnlocked) {
        node.addEventListener('click', () => {
          AudioEngine.playClick();
          this.closeWorldMap();
          window.dispatchEvent(new CustomEvent('requestJumpLevel', { detail: { level: i } }));
        });
      }

      container.appendChild(node);
    }

    document.getElementById('modal-worldmap')?.classList.add('active');
    AudioEngine.playClick();
  },

  closeWorldMap() {
    document.getElementById('modal-worldmap')?.classList.remove('active');
  }
};
