/**
 * ==============================================================================
 * MAGNETIC SNAP ENGINE (js/snapEngine.js)
 * ==============================================================================
 * คำนวณแรงดึงดูดแม่เหล็กและแสดงผล Ghost Preview
 */

import { CONFIG } from './config.js';
import { Utils } from './utils.js';

export const SnapEngine = {
  currentSnapTarget: null,
  ghostElement: null,

  /**
   * เริ่มต้น Ghost Preview Element ใน DOM
   */
  init() {
    this.ghostElement = document.getElementById('drag-ghost-preview');
    if (!this.ghostElement) {
      this.ghostElement = document.createElement('div');
      this.ghostElement.id = 'drag-ghost-preview';
      this.ghostElement.className = 'drag-ghost';
      document.body.appendChild(this.ghostElement);
    }
  },

  /**
   * คำนวณระยะห่างทางเรขาคณิตระหว่างสี่เหลี่ยม 2 รูป (Bounding Rectangles)
   */
  getDistance(r1, r2) {
    const overlapX = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
    const overlapY = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
    if (overlapX > 0 && overlapY > 0) return 0; // มีการซ้อนทับกัน

    const dx = Math.max(0, Math.max(r1.left - r2.right, r2.left - r1.right));
    const dy = Math.max(0, Math.max(r1.top - r2.bottom, r2.top - r1.bottom));
    return Math.hypot(dx, dy);
  },

  /**
   * ตรวจสอบเป้าหมาย Snap ที่ใกล้ที่สุดสำหรับบล็อกที่กำลังลาก
   * @param {HTMLElement} activeBlock 
   * @param {number} clientX 
   * @param {number} clientY 
   * @returns {HTMLElement|null} เป้าหมาย Snap ที่ใกล้ที่สุด
   */
  checkSnap(activeBlock, clientX, clientY) {
    if (!activeBlock) return null;
    const blockKind = activeBlock.getAttribute('data-block-kind') || 'value';
    let potentialTargets = [];

    // กรองประเภทช่องรับตามชนิดของบล็อก (Value กับ Statement)
    if (blockKind === 'value') {
      potentialTargets = Array.from(document.querySelectorAll('.ai-socket:not(.filled)'));
    } else if (blockKind === 'statement') {
      potentialTargets = Array.from(document.querySelectorAll('.ai-c-cavity:not(.filled), .ai-stack-slot:not(.filled)'));
    }

    let closestTarget = null;
    let minDistance = CONFIG.SNAP_DISTANCE;
    const blockRect = activeBlock.getBoundingClientRect();

    potentialTargets.forEach((target) => {
      const targetRect = target.getBoundingClientRect();
      const dist = this.getDistance(blockRect, targetRect);
      if (dist < minDistance) {
        minDistance = dist;
        closestTarget = target;
      }
    });

    if (closestTarget !== this.currentSnapTarget) {
      this.clearHighlight();
      if (closestTarget) {
        closestTarget.classList.add('snap-highlight');
        this.currentSnapTarget = closestTarget;
        this.showGhost(closestTarget.getBoundingClientRect());
        Utils.vibrate(20); // สั่นเตือนเบา ๆ เมื่อเข้าใกล้จุดต่อ
      } else {
        this.hideGhost();
      }
    }

    return this.currentSnapTarget;
  },

  /**
   * แสดง Ghost Preview ณ พิกัดของช่องเป้าหมาย
   */
  showGhost(targetRect) {
    if (!this.ghostElement) this.init();
    this.ghostElement.style.display = 'block';
    this.ghostElement.style.left = `${targetRect.left}px`;
    this.ghostElement.style.top = `${targetRect.top}px`;
    this.ghostElement.style.width = `${targetRect.width}px`;
    this.ghostElement.style.height = `${targetRect.height}px`;
  },

  /**
   * ซ่อน Ghost Preview
   */
  hideGhost() {
    if (this.ghostElement) {
      this.ghostElement.style.display = 'none';
    }
  },

  /**
   * ล้างสถานะไฮไลต์ของช่องเป้าหมายทั้งหมด
   */
  clearHighlight() {
    if (this.currentSnapTarget) {
      this.currentSnapTarget.classList.remove('snap-highlight');
      this.currentSnapTarget = null;
    }
    this.hideGhost();
  }
};
