/**
 * ==============================================================================
 * NETWORK ADAPTER & OFFLINE QUEUE (js/sync.js)
 * ==============================================================================
 * รับประกันความทนทานของข้อมูลวิจัย (Data Durability) ด้วย Dual Storage
 * และระบบ Offline Queue พร้อม Exponential Backoff
 */

import { CONFIG } from './config.js';
import { Utils } from './utils.js';

export const SyncEngine = {
  retryTimeout: null,
  isProcessing: false,
  onStatusChange: null,

  init(callbacks = {}) {
    this.onStatusChange = callbacks.onStatusChange || (() => {});

    // ดักฟังเมื่อสัญญาณอินเทอร์เน็ตกลับมาต่อติด
    window.addEventListener('online', () => {
      this.notifyStatus('🌐 เชื่อมต่อเน็ตแล้ว กำลังส่งข้อมูลที่ค้างอยู่...', '#3b82f6');
      this.processQueue();
    });
  },

  notifyStatus(text, color) {
    if (this.onStatusChange) this.onStatusChange(text, color);
  },

  /**
   * ดึงคิวรายการออฟไลน์จาก LocalStorage
   * @returns {Array} รายการคิว
   */
  getQueue() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.OFFLINE_QUEUE) || '[]');
    } catch (e) {
      return [];
    }
  },

  /**
   * บันทึกคิวลง LocalStorage
   * @param {Array} q 
   */
  saveQueue(q) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(q));
    } catch (e) {
      console.warn('Cannot save offline queue:', e);
    }
  },

  /**
   * นำข้อมูลเข้าคิวรอส่ง
   * @param {Object} payload 
   */
  enqueue(payload) {
    const q = this.getQueue();
    q.push({
      id: Utils.generateUUID(),
      timestamp: new Date().toISOString(),
      retryCount: 0,
      payload
    });
    this.saveQueue(q);
    Utils.log('Sync', `Enqueued payload. Queue size: ${q.length}`);
    this.notifyStatus(`📦 ข้อมูลถูกบันทึกลงเครื่องแล้ว (รอส่ง ${q.length} รายการ)`, '#f59e0b');
  },

  /**
   * ประมวลผลส่งคิวออฟไลน์ที่ค้างอยู่
   */
  async processQueue() {
    if (this.isProcessing) return;
    const q = this.getQueue();
    if (q.length === 0) return;

    const url = localStorage.getItem(CONFIG.STORAGE_KEYS.GSHEET_URL) || CONFIG.DEFAULT_GSHEET_URL;
    if (!url) return;

    this.isProcessing = true;
    Utils.log('Sync', `Processing queue of ${q.length} items...`);
    const remaining = [];

    for (const item of q) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
          signal: controller.signal
        });

        clearTimeout(timer);
        Utils.log('Sync', `Flushed item ${item.id} successfully`);
      } catch (err) {
        item.retryCount = (item.retryCount || 0) + 1;
        remaining.push(item);
        Utils.log('Sync', `Failed to flush item ${item.id}, will retry`, err);
      }
    }

    this.saveQueue(remaining);
    this.isProcessing = false;

    if (remaining.length > 0) {
      const delay = Math.min(CONFIG.MAX_RETRY_DELAY_MS, 2000 * Math.pow(2, remaining[0].retryCount || 0));
      clearTimeout(this.retryTimeout);
      this.retryTimeout = setTimeout(() => this.processQueue(), delay);
      this.notifyStatus(`⚠️ ข้อมูลค้างส่ง ${remaining.length} รายการ (จะลองใหม่ใน ${Math.round(delay / 1000)} วิ)`, '#f59e0b');
    } else {
      this.notifyStatus('✅ ส่งข้อมูลทั้งหมดเข้า Google Sheets สำเร็จ!', '#10b981');
    }
  },

  /**
   * ส่งข้อมูลเข้า Google Apps Script
   * @param {Object} payload 
   * @returns {Promise<boolean>}
   */
  async send(payload) {
    const url = localStorage.getItem(CONFIG.STORAGE_KEYS.GSHEET_URL) || CONFIG.DEFAULT_GSHEET_URL;
    if (!url) {
      this.enqueue(payload);
      throw new Error('No Google Apps Script URL specified');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

    try {
      this.notifyStatus('⏳ กำลังส่งข้อมูลเข้า Google Sheets...', '#7c3aed');
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      this.notifyStatus('✅ บันทึกคะแนนลง Google Sheets สำเร็จแล้ว!', '#10b981');
      return true;
    } catch (err) {
      clearTimeout(timeoutId);
      this.enqueue(payload);
      this.processQueue();
      throw err;
    }
  },

  /**
   * ดึงข้อมูล Leaderboard จาก Google Apps Script (doGet)
   * @returns {Promise<Array>}
   */
  async fetchLeaderboard() {
    const url = localStorage.getItem(CONFIG.STORAGE_KEYS.GSHEET_URL) || CONFIG.DEFAULT_GSHEET_URL;
    if (!url) return [];

    try {
      const res = await fetch(`${url}?action=leaderboard`, { method: 'GET' });
      const data = await res.json();
      return Array.isArray(data.leaderboard) ? data.leaderboard : [];
    } catch (e) {
      Utils.log('Sync', 'Could not fetch live leaderboard', e);
      return [];
    }
  }
};
