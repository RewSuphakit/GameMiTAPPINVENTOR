/**
 * ==============================================================================
 * APPLICATION STATE & REACTIVE STORE (js/state.js)
 * ==============================================================================
 * Single Source of Truth พร้อมระบบ Pub/Sub Pattern
 */

import { CONFIG } from './config.js';
import { Utils } from './utils.js';

export const GameState = {
  sessionId: Utils.generateUUID(),
  studentName: '',
  studentId: '',
  studentGroup: '',
  startTime: null,
  endTime: null,

  totalScore: 0,
  currentLevel: 1,
  secondsElapsed: 0,
  levelSecondsElapsed: 0,
  timerInterval: null,

  // ข้อมูล Gamification
  playerXP: 0,
  playerLevel: 1,
  currentStreak: 0,
  highestStreak: 0,
  unlockedBadges: [],

  // การตั้งค่าระบบ
  isSoundEnabled: true,
  theme: 'light',
  isLevelTransitioning: false,
  activeMobileTab: 'canvas', // 'toolbox' | 'canvas' | 'simulator'

  // สถิติรายด่านและบันทึกประวัติเพื่อการวิจัย
  levelStats: {},
  eventLog: [],

  // ผู้รับฟังการเปลี่ยนแปลง (Pub/Sub)
  listeners: {},

  /**
   * ลงทะเบียนรับการแจ้งเตือนเมื่อ State มีการเปลี่ยนแปลง
   * @param {string} event - ชื่อเหตุการณ์ เช่น 'scoreChange', 'levelChange'
   * @param {Function} callback 
   */
  subscribe(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },

  /**
   * แจ้งเตือนผู้รับฟังทั้งหมด
   */
  notify(event, payload = null) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(payload));
    }
  },

  /**
   * กำหนดค่าเริ่มต้นสถิติของทั้ง 8 ด่าน
   */
  initLevelStats() {
    for (let i = 1; i <= CONFIG.TOTAL_LEVELS; i++) {
      if (!this.levelStats[i]) {
        this.levelStats[i] = {
          attempts: 0,
          timeSpentSec: 0,
          score: 0,
          penalty: 0,
          stars: 0,
          completed: false,
          variant: 0,
          hintsUnlocked: [false, false, false],
          firstActionTimestamp: null,
          decoyUsesCount: 0
        };
      }
    }
  },

  /**
   * บันทึกสถานะปัจจุบันลงใน LocalStorage
   */
  save() {
    try {
      const serialized = {
        sessionId: this.sessionId,
        studentName: this.studentName,
        studentId: this.studentId,
        studentGroup: this.studentGroup,
        startTime: this.startTime ? this.startTime.toISOString() : null,
        totalScore: this.totalScore,
        currentLevel: this.currentLevel,
        secondsElapsed: this.secondsElapsed,
        playerXP: this.playerXP,
        playerLevel: this.playerLevel,
        currentStreak: this.currentStreak,
        highestStreak: this.highestStreak,
        unlockedBadges: this.unlockedBadges,
        levelStats: this.levelStats,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(CONFIG.STORAGE_KEYS.AUTO_SAVE, JSON.stringify(serialized));
    } catch (e) {
      console.warn('Auto-save failed:', e);
    }
  },

  /**
   * กู้คืนข้อมูลเซสชันเดิมหากมีบันทึกค้างไว้
   * @returns {boolean} สำเร็จหรือไม่
   */
  restore() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTO_SAVE);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data.studentId) return false;

      this.sessionId = data.sessionId || this.sessionId;
      this.studentName = data.studentName || '';
      this.studentId = data.studentId || '';
      this.studentGroup = data.studentGroup || '';
      this.startTime = data.startTime ? new Date(data.startTime) : new Date();
      this.totalScore = data.totalScore || 0;
      this.currentLevel = data.currentLevel || 1;
      this.secondsElapsed = data.secondsElapsed || 0;
      this.playerXP = data.playerXP || 0;
      this.playerLevel = data.playerLevel || 1;
      this.currentStreak = data.currentStreak || 0;
      this.highestStreak = data.highestStreak || 0;
      this.unlockedBadges = data.unlockedBadges || [];
      this.levelStats = data.levelStats || {};

      this.initLevelStats();
      this.notify('stateRestored', this);
      return true;
    } catch (e) {
      console.warn('Auto-restore failed:', e);
      return false;
    }
  },

  /**
   * ล้างข้อมูล Auto-save ออกจากเครื่อง
   */
  clearAutoSave() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTO_SAVE);
  }
};

// เริ่มต้นโครงสร้างสถิติ
GameState.initLevelStats();
