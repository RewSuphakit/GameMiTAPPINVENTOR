/**
 * ==============================================================================
 * UTILITY FUNCTIONS & SECURITY HELPERS (js/utils.js)
 * ==============================================================================
 * เครื่องมือช่วยเหลือด้านความปลอดภัย, ข้อมูลอุปกรณ์, และฟังก์ชันทั่วไป
 */

export const Utils = {
  /**
   * ป้องกันการโจมตีแบบ XSS โดยแปลงอักขระพิเศษเป็น HTML entities
   * @param {string} str - ข้อความที่ต้องการ sanitize
   * @returns {string} ข้อความที่ปลอดภัย
   */
  sanitizeHTML(str) {
    if (!str) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(str).replace(/[&<>"']/g, (m) => map[m]);
  },

  /**
   * สุ่มสร้าง Unique Identifier แบบ UUID v4
   * @returns {string} UUID
   */
  generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch (e) { /* fallback ด้านล่าง */ }
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  /**
   * ดึงข้อมูลสภาพแวดล้อมของอุปกรณ์เพื่อการวิจัย (OS, Browser, Screen, Connection)
   * @returns {Object} ข้อมูลอุปกรณ์
   */
  getDeviceInfo() {
    const ua = navigator.userAgent || '';
    let os = 'Unknown OS';
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';

    let browser = 'Unknown Browser';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';

    // ตรวจสอบชนิดการเชื่อมต่อเครือข่ายถ้าอุปกรณ์รองรับ (Network Information API)
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const connectionType = conn ? (conn.effectiveType || conn.type || 'unknown') : 'standard';

    return {
      os,
      browser,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      screenRatio: window.devicePixelRatio || 1,
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      connection: connectionType
    };
  },

  /**
   * จัดรูปแบบเวลาจำนวนวินาทีให้อยู่ในรูป MM:SS
   * @param {number} totalSeconds 
   * @returns {string} รูปแบบ "02:45"
   */
  formatTime(totalSeconds) {
    const sec = Math.max(0, Math.floor(totalSeconds || 0));
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  },

  /**
   * สับเปลี่ยนตำแหน่งไอเทมในอาร์เรย์แบบสุ่ม (Fisher-Yates Shuffle)
   * @param {Array} arr 
   * @returns {Array} อาร์เรย์ที่สับเปลี่ยนแล้ว
   */
  shuffleArray(arr) {
    if (!Array.isArray(arr)) return [];
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },

  /**
   * สั่นสะเทือนมอเตอร์มือถือ (Haptic Feedback) อย่างปลอดภัย
   * @param {number|number[]} pattern - ระยะเวลาสั่นในหน่วยมิลลิวินาที
   */
  vibrate(pattern = 30) {
    try {
      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // อุปกรณ์ไม่รองรับหรือไม่ได้รับอนุญาต ข้ามอย่างเงียบ ๆ
    }
  },

  /**
   * พิมพ์ Log พร้อมแท็กหมวดหมู่และเวลา
   */
  log(category, message, data = null) {
    const time = new Date().toTimeString().split(' ')[0];
    const prefix = `[CodeBreaker][${time}][${category}]`;
    if (data !== null) console.log(prefix, message, data);
    else console.log(prefix, message);
  }
};
