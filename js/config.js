/**
 * ==============================================================================
 * APPLICATION CONFIGURATION (js/config.js)
 * ==============================================================================
 * ค่าคงที่ส่วนกลางทั้งหมดของระบบ ไม่มี Magic Numbers
 */

export const CONFIG = Object.freeze({
  // ข้อมูลด่านและจำนวน
  TOTAL_LEVELS: 8,

  // ระยะสัมผัส Drag & Snap (พิกเซล)
  SNAP_DISTANCE: 85,
  TRASH_PROXIMITY: 75,

  // ระบบคะแนนและบทลงโทษ (Positive Reinforcement & Playful Rubric)
  BASE_LEVEL_SCORE: 125,
  ATTEMPT_PENALTY: 5,        // หักแต้มเบา ๆ เมื่อลองใหม่ เพื่อไม่ให้ผู้เรียนหมดกำลังใจ
  DECOY_PENALTY_FIRST: 0,    // ติดบล็อกลวงครั้งแรกฟรี! ไม่หักคะแนน ให้เรียนรู้จากข้อผิดพลาด
  DECOY_PENALTY_SUBSEQUENT: 5,
  MIN_LEVEL_SCORE: 25,
  HINT_COSTS: [0, 5, 10],    // คำใบ้ระดับที่ 1 ฟรี 100% (0 แต้ม) ใครติดขัดเปิดดูได้ทันที!

  // เกณฑ์ดาว 1-3 ดาว
  STAR_THRESHOLDS: {
    THREE_STAR_MIN: 95, // แต้มสุทธิ >= 95
    TWO_STAR_MIN: 60,   // แต้มสุทธิ >= 60
    ONE_STAR_MIN: 10    // ผ่านด่านสำเร็จ
  },

  // คะแนนโบนัสและการสะสมเลเวล
  STREAK_BONUS: 15,       // โบนัสเมื่อตอบถูกในครั้งแรกติดต่อกัน
  XP_PER_STAR: 50,        // ค่าประสบการณ์ต่อดาว
  XP_BASE_PASS: 100,      // ค่าประสบการณ์พื้นฐานเมื่อผ่านด่าน

  // คีย์สำหรับจัดเก็บข้อมูลใน Local Storage & IndexedDB
  STORAGE_KEYS: {
    AUTO_SAVE: 'appinventor_ide_autosave_v3',
    OFFLINE_QUEUE: 'appinventor_ide_offline_queue_v3',
    GSHEET_URL: 'appinventor_gsheet_url_v3',
    THEME: 'codebreaker_theme_preference',
    ANONYMOUS_MODE: 'codebreaker_anon_mode'
  },

  // การเชื่อมต่อเครือข่ายและ Google Apps Script
  DEFAULT_GSHEET_URL: 'https://script.google.com/macros/s/AKfycbxts5ZdQnVz2Y3CnLX2x3hv9zbMlyueeEYkweYeS5D2qx4sWmxbBAdW3hEZQcz5CXVO2A/exec',
  FETCH_TIMEOUT_MS: 15000,
  MAX_RETRY_DELAY_MS: 30000
});
