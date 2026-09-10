/**
 * ==============================================================================
 * POINTER DRAG & DROP + TAP-TO-SNAP ENGINE (js/dragEngine.js)
 * ==============================================================================
 * จัดการการลากวาง (Pointer Events API) และการแตะเพื่อต่อบล็อกอัตโนมัติ (Tap-to-Snap)
 * รองรับทั้ง Smartphone Touchscreen, Mouse Desktop, Stylus และ Keyboard Accessibility
 */

import { CONFIG } from './config.js';
import { GameState } from './state.js';
import { SnapEngine } from './snapEngine.js';
import { AudioEngine } from './audio.js';
import { Effects } from './effects.js';
import { Utils } from './utils.js';

export const DragEngine = {
  activeBlock: null,
  pendingBlock: null,
  startX: 0,
  startY: 0,
  isDragging: false,
  pointerType: 'mouse',
  offsetX: 0,
  offsetY: 0,
  originalParent: null,
  isOverTrash: false,
  initialRect: null,
  initialized: false,

  // Event callbacks
  onLogEvent: null,
  onShowToast: null,

  /**
   * เริ่มต้นการผูก Event Listener ส่วนกลาง
   */
  init(callbacks = {}) {
    if (this.initialized) return;
    this.initialized = true;

    this.onLogEvent = callbacks.onLogEvent || (() => {});
    this.onShowToast = callbacks.onShowToast || (() => {});

    SnapEngine.init();

    // ผูก Pointer Events ส่วนกลาง
    window.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.onPointerUp(e), { passive: false });
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e), { passive: false });

    // รองรับ Keyboard Accessibility
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
  },

  /**
   * ผูกเหตุการณ์ลากและแตะกับบล็อกทั้งหมดในหน้าจอ
   */
  bindAllDraggables() {
    // ผูกเฉพาะบล็อกระดับบนสุด (Top-level draggable blocks) ป้องกันบล็อกย่อยภายในถูกดึงแยก
    document.querySelectorAll('#toolbox-blocks > *').forEach((b) => this.makeDraggable(b));
    document.querySelectorAll('#workspace-canvas > .ai-block, #workspace-canvas > .ai-c-block').forEach((b) => this.makeDraggable(b));
    document.querySelectorAll('.ai-socket > .ai-block, .ai-c-cavity > .ai-block, .ai-stack-slot > .ai-block').forEach((b) => this.makeDraggable(b));
  },

  /**
   * ทำให้อิลิเมนต์สามารถลากหรือแตะได้
   * @param {HTMLElement} element 
   */
  makeDraggable(element) {
    if (!element) return;
    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
    element.setAttribute('aria-grabbed', 'false');

    element.onpointerdown = (e) => this.onPointerDown(e, element);
  },

  /**
   * เริ่มต้นเมื่อผู้ใช้กดแตะบล็อก (Pointer Down)
   */
  onPointerDown(e, element) {
    if (this.activeBlock || this.pendingBlock) return;
    if (['BUTTON', 'INPUT', 'SELECT'].includes(e.target.tagName)) return;

    e.preventDefault();
    e.stopPropagation();

    const clientX = e.clientX !== undefined ? e.clientX : 0;
    const clientY = e.clientY !== undefined ? e.clientY : 0;

    this.pendingBlock = element;
    this.startX = clientX;
    this.startY = clientY;
    this.pointerType = e.pointerType || 'mouse';
    this.isDragging = false;
  },

  /**
   * เริ่มต้นกระบวนการลากจริงเมื่อมีการเลื่อนตำแหน่งเกินเกณฑ์ (Drag Start)
   */
  startDrag(e, element) {
    this.isDragging = true;
    this.activeBlock = element;

    AudioEngine.playClick();

    const elemRect = element.getBoundingClientRect();
    this.initialRect = elemRect;

    const clientX = e.clientX !== undefined ? e.clientX : elemRect.left;
    const clientY = e.clientY !== undefined ? e.clientY : elemRect.top;

    // คำนวณ Offset โดยยกตำแหน่งขึ้นเล็กน้อยสำหรับจอสัมผัส (นิ้วจะได้ไม่บังรอยต่อ)
    const touchLiftOffset = this.pointerType === 'touch' ? 26 : 0;
    this.offsetX = clientX - elemRect.left;
    this.offsetY = (clientY - elemRect.top) + touchLiftOffset;

    // บันทึกเวลาที่เริ่มกระทำครั้งแรกเพื่อการวิจัย (Time to First Action)
    const stats = GameState.levelStats[GameState.currentLevel];
    if (stats && !stats.firstActionTimestamp) {
      stats.firstActionTimestamp = new Date().toISOString();
    }

    // ตรวจสอบที่อยู่เดิมของบล็อก
    const parentSocket = element.closest('.ai-socket, .ai-c-cavity, .ai-stack-slot');
    if (parentSocket && parentSocket !== element) {
      this.originalParent = parentSocket;
      parentSocket.classList.remove('filled');
      const placeholder = parentSocket.querySelector('.ai-placeholder');
      if (placeholder) placeholder.style.display = '';
    } else if (element.classList.contains('in-toolbox') || element.parentElement?.id === 'toolbox-blocks') {
      this.originalParent = document.getElementById('toolbox-blocks');
    } else {
      this.originalParent = null;
    }

    element.style.width = `${elemRect.width}px`;
    element.style.position = 'fixed';
    element.style.left = `${clientX - this.offsetX}px`;
    element.style.top = `${clientY - this.offsetY}px`;
    element.style.zIndex = '99999';
    element.style.margin = '0';

    element.classList.add('is-dragging');
    element.setAttribute('aria-grabbed', 'true');
    element.classList.remove('in-socket', 'in-cavity', 'in-stack', 'in-toolbox');

    document.body.appendChild(element);

    this.onLogEvent('block_pickup', element.getAttribute('data-block-kind') || 'block', {
      id: element.id || '',
      type: element.getAttribute('data-type') || ''
    });
  },

  /**
   * ขณะลากบล็อก (Pointer Move)
   */
  onPointerMove(e) {
    // หากกดค้างไว้และเริ่มมีการขยับเกิน 6px ให้เริ่มสถานะลาก (Drag)
    if (this.pendingBlock && !this.isDragging) {
      const clientX = e.clientX !== undefined ? e.clientX : 0;
      const clientY = e.clientY !== undefined ? e.clientY : 0;
      const dist = Math.hypot(clientX - this.startX, clientY - this.startY);
      if (dist > 6) {
        this.startDrag(e, this.pendingBlock);
      }
    }

    if (!this.activeBlock || !this.isDragging) return;
    if (e.cancelable) e.preventDefault();

    const clientX = e.clientX;
    const clientY = e.clientY;

    const curX = clientX - this.offsetX;
    const curY = clientY - this.offsetY;

    this.activeBlock.style.left = `${curX}px`;
    this.activeBlock.style.top = `${curY}px`;

    // 1. ตรวจสอบการลากเข้าใกล้ถังขยะ
    const trashWidget = document.getElementById('trash-can-widget');
    if (trashWidget) {
      const trashRect = trashWidget.getBoundingClientRect();
      const distToTrash = Math.hypot(
        clientX - (trashRect.left + trashRect.width / 2),
        clientY - (trashRect.top + trashRect.height / 2)
      );

      if (distToTrash < CONFIG.TRASH_PROXIMITY) {
        trashWidget.classList.add('drag-over');
        this.isOverTrash = true;
        SnapEngine.clearHighlight();
        return;
      } else {
        trashWidget.classList.remove('drag-over');
        this.isOverTrash = false;
      }
    }

    // 2. ตรวจสอบแรงดึงดูดแม่เหล็ก Snap
    SnapEngine.checkSnap(this.activeBlock, clientX, clientY);
  },

  /**
   * ปล่อยการกด/สัมผัส (Pointer Up)
   */
  onPointerUp(e) {
    // กรณีที่ 1: การแตะสั้น ๆ โดยไม่มีการลาก (Tap-to-Snap Action ⚡)
    if (this.pendingBlock && !this.isDragging) {
      const tapped = this.pendingBlock;
      this.resetState();
      this.handleTap(tapped);
      return;
    }

    this.pendingBlock = null;
    if (!this.activeBlock) {
      this.resetState();
      return;
    }

    const block = this.activeBlock;
    const trashWidget = document.getElementById('trash-can-widget');
    if (trashWidget) trashWidget.classList.remove('drag-over');

    block.classList.remove('is-dragging');
    block.setAttribute('aria-grabbed', 'false');

    const dropX = e.clientX !== undefined ? e.clientX : (block.getBoundingClientRect().left + this.offsetX);
    const dropY = e.clientY !== undefined ? e.clientY : (block.getBoundingClientRect().top + this.offsetY);

    // กรณีที่ 2: ทิ้งลงถังขยะ 🗑️
    if (this.isOverTrash) {
      AudioEngine.playTrash();
      const isBuggy = block.id && block.id.includes('buggy');
      const isDecoy = block.getAttribute('data-decoy') === 'true';

      if (isBuggy || isDecoy) {
        block.remove();
        this.onShowToast('ลบบล็อกที่ผิดพลาดลงถังขยะเรียบร้อย! 🗑️', 'success');
        this.onLogEvent('block_trash', 'bug_or_decoy', { id: block.id });
      } else {
        this.returnToToolbox(block);
        this.onShowToast('ส่งบล็อกกลับคืนกล่องเครื่องมือ', 'info');
        this.onLogEvent('block_return', 'toolbox', { id: block.id });
      }

      GameState.save();
      this.resetState();
      return;
    }

    // กรณีที่ 3: ดูดติดแม่เหล็ก (Snap Target)
    const snapTarget = SnapEngine.currentSnapTarget;
    if (snapTarget) {
      AudioEngine.playSnap();
      Effects.createRipple(snapTarget);

      snapTarget.classList.remove('snap-highlight');
      snapTarget.classList.add('filled');

      const placeholder = snapTarget.querySelector('.ai-placeholder');
      if (placeholder) placeholder.style.display = 'none';

      block.style.position = '';
      block.style.left = '';
      block.style.top = '';
      block.style.width = '';
      block.style.zIndex = '';
      block.style.margin = '';

      if (snapTarget.classList.contains('ai-socket')) block.classList.add('in-socket');
      else if (snapTarget.classList.contains('ai-c-cavity')) block.classList.add('in-cavity');
      else if (snapTarget.classList.contains('ai-stack-slot')) block.classList.add('in-stack');

      snapTarget.appendChild(block);
      this.onShowToast('ต่อบล็อกสำเร็จ! 🧩', 'success');
      this.onLogEvent('block_snap', 'snap_target', {
        targetId: snapTarget.id || snapTarget.className,
        blockKind: block.getAttribute('data-block-kind')
      });

      GameState.save();
      this.resetState();
      return;
    }

    // กรณีที่ 4: วางลงบน Canvas โดยอิสระ
    const canvas = document.getElementById('workspace-canvas');
    const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
    const isInsideCanvas = canvasRect && (
      dropX >= canvasRect.left && dropX <= canvasRect.right &&
      dropY >= canvasRect.top && dropY <= canvasRect.bottom
    );

    if (isInsideCanvas || block.getAttribute('data-block-kind') === 'root') {
      let relX = dropX - this.offsetX - (canvasRect ? canvasRect.left : 0);
      let relY = dropY - this.offsetY - (canvasRect ? canvasRect.top : 0);

      const blockW = this.initialRect ? this.initialRect.width : 160;
      const blockH = this.initialRect ? this.initialRect.height : 45;
      if (canvasRect) {
        relX = Math.max(8, Math.min(canvasRect.width - blockW - 8, relX));
        relY = Math.max(8, Math.min(canvasRect.height - blockH - 8, relY));
      }

      block.style.position = 'absolute';
      block.style.left = `${relX}px`;
      block.style.top = `${relY}px`;
      block.style.width = '';
      block.style.zIndex = '10';
      block.style.margin = '';

      if (canvas) canvas.appendChild(block);
      this.onLogEvent('block_drop', 'canvas', { x: Math.round(relX), y: Math.round(relY) });
    } else {
      this.returnToToolbox(block);
    }

    GameState.save();
    this.resetState();
  },

  /**
   * ระบบ Tap-to-Snap: แตะเพื่อส่งไปต่ออัตโนมัติ หรือแตะเพื่อถอดกลับคืนกล่อง
   * @param {HTMLElement} block 
   */
  handleTap(block) {
    if (!block) return;

    // บันทึกเวลาที่เริ่มกระทำครั้งแรกเพื่อการวิจัย
    const stats = GameState.levelStats[GameState.currentLevel];
    if (stats && !stats.firstActionTimestamp) {
      stats.firstActionTimestamp = new Date().toISOString();
    }

    // 1. กรณีเป็นบล็อก Bug ในโหมด Debug -> แตะเพื่อกำจัดทิ้งลงถังขยะทันที 🗑️
    const isBuggy = block.classList.contains('buggy-block') || (block.id && block.id.includes('buggy')) || block.getAttribute('data-type') === 'buggy';
    if (isBuggy) {
      const parent = block.closest('.ai-socket, .ai-c-cavity, .ai-stack-slot');
      if (parent) {
        parent.classList.remove('filled');
        const placeholder = parent.querySelector('.ai-placeholder');
        if (placeholder) placeholder.style.display = '';
      }
      block.remove();
      AudioEngine.playTrash();
      Utils.vibrate([30, 50, 30]);
      this.onShowToast('กำจัดบล็อก Bug ลงถังขยะเรียบร้อย! 🗑️', 'success');
      this.onLogEvent('block_tap_trash_bug', 'buggy', { id: block.id });
      GameState.save();
      return;
    }

    // 2. กรณีบล็อกต่ออยู่ใน Socket หรือ Cavity หรือ Stack Slot แล้ว -> แตะเพื่อถอดกลับคืนกล่องเครื่องมือ
    const currentSocket = block.closest('.ai-socket, .ai-c-cavity, .ai-stack-slot');
    if (currentSocket && currentSocket !== block) {
      currentSocket.classList.remove('filled');
      const placeholder = currentSocket.querySelector('.ai-placeholder');
      if (placeholder) placeholder.style.display = '';

      this.returnToToolbox(block);
      AudioEngine.playClick();
      Utils.vibrate(20);
      this.onShowToast('ดึงบล็อกกลับคืนกล่องเครื่องมือแล้ว', 'info');
      this.onLogEvent('block_tap_remove', block.getAttribute('data-block-kind') || 'block', {
        id: block.id,
        targetId: currentSocket.id || currentSocket.className
      });
      GameState.save();
      return;
    }

    // 3. กรณีเป็น Root Block ของโจทย์ ไม่ต้องทำอะไร
    if (block.getAttribute('data-block-kind') === 'root') {
      Effects.shake(block);
      return;
    }

    // 4. กรณีบล็อกอยู่ในกล่อง Toolbox -> ค้นหาช่องว่างแรกที่ตรงชนิดเพื่อ Snap อัตโนมัติ ⚡
    const blockKind = block.getAttribute('data-block-kind') || 'value';
    let eligibleTargets = [];

    if (blockKind === 'value') {
      eligibleTargets = Array.from(document.querySelectorAll('#workspace-canvas .ai-socket:not(.filled)'));
    } else if (blockKind === 'statement') {
      eligibleTargets = Array.from(document.querySelectorAll('#workspace-canvas .ai-c-cavity:not(.filled), #workspace-canvas .ai-stack-slot:not(.filled)'));
    }

    if (eligibleTargets.length > 0) {
      const target = eligibleTargets[0];
      target.classList.remove('snap-highlight');
      target.classList.add('filled');

      const placeholder = target.querySelector('.ai-placeholder');
      if (placeholder) placeholder.style.display = 'none';

      block.style.position = '';
      block.style.left = '';
      block.style.top = '';
      block.style.width = '';
      block.style.zIndex = '';
      block.style.margin = '';

      block.classList.remove('in-toolbox');
      if (target.classList.contains('ai-socket')) block.classList.add('in-socket');
      else if (target.classList.contains('ai-c-cavity')) block.classList.add('in-cavity');
      else if (target.classList.contains('ai-stack-slot')) block.classList.add('in-stack');

      target.appendChild(block);

      AudioEngine.playSnap();
      Effects.createRipple(target);
      Utils.vibrate([25, 40, 25]);
      this.onShowToast('ต่อบล็อกสำเร็จ! 🧩 (แตะอีกครั้งเพื่อดึงออก)', 'success');
      this.onLogEvent('block_tap_snap', blockKind, {
        targetId: target.id || target.className,
        id: block.id
      });

      // หากอยู่ในโหมดแท็บ Toolbox บนมือถือ ให้สลับไปยังแท็บ Canvas อัตโนมัติ เพื่อให้ผู้เรียนเห็นผลทันที
      if (GameState.activeMobileTab === 'toolbox') {
        const canvasTabBtn = document.querySelector('.mobile-tab-btn[data-view="canvas"]');
        if (canvasTabBtn) canvasTabBtn.click();
      }

      GameState.save();
    } else {
      // ช่องต่อเต็มแล้ว
      AudioEngine.playError();
      Utils.vibrate(50);
      this.onShowToast('ช่องต่อในพื้นที่ประกอบเต็มแล้ว (แตะบล็อกที่ต่ออยู่เพื่อดึงออก)', 'info');
    }
  },

  /**
   * ส่งบล็อกกลับกล่อง Toolbox
   */
  returnToToolbox(block) {
    block.style.position = '';
    block.style.left = '';
    block.style.top = '';
    block.style.width = '';
    block.style.zIndex = '';
    block.style.margin = '';
    block.classList.remove('in-socket', 'in-cavity', 'in-stack');
    block.classList.add('in-toolbox');
    const tb = document.getElementById('toolbox-blocks');
    if (tb) tb.appendChild(block);
  },

  /**
   * ล้างค่าสถานะการลากปัจจุบัน
   */
  resetState() {
    SnapEngine.clearHighlight();
    this.activeBlock = null;
    this.pendingBlock = null;
    this.isDragging = false;
    this.originalParent = null;
    this.initialRect = null;
    this.isOverTrash = false;
    this.offsetX = 0;
    this.offsetY = 0;
  },

  /**
   * รองรับการควบคุมบล็อกด้วย Keyboard
   */
  onKeyDown(e) {
    if (this.activeBlock) {
      const step = 20;
      const curLeft = parseInt(this.activeBlock.style.left) || 0;
      const curTop = parseInt(this.activeBlock.style.top) || 0;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.activeBlock.style.left = `${curLeft + step}px`;
        SnapEngine.checkSnap(this.activeBlock, curLeft + step, curTop);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.activeBlock.style.left = `${curLeft - step}px`;
        SnapEngine.checkSnap(this.activeBlock, curLeft - step, curTop);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.activeBlock.style.top = `${curTop + step}px`;
        SnapEngine.checkSnap(this.activeBlock, curLeft, curTop + step);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.activeBlock.style.top = `${curTop - step}px`;
        SnapEngine.checkSnap(this.activeBlock, curLeft, curTop - step);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.onPointerUp({});
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.returnToToolbox(this.activeBlock);
        this.resetState();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        this.isOverTrash = true;
        this.onPointerUp({});
      }
      return;
    }

    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.classList.contains('ai-block')) {
      e.preventDefault();
      this.handleTap(document.activeElement);
    }
  }
};
