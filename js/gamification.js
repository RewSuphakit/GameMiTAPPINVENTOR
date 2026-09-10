/**
 * ==============================================================================
 * GAMIFICATION ENGINE (js/gamification.js)
 * ==============================================================================
 * ระบบดาว 1-3 ดวง, XP, เลเวลผู้เล่น, Combo Streak, และเข็มกลัดรางวัล (Badges)
 */

import { CONFIG } from './config.js';
import { GameState } from './state.js';

export const Gamification = {
  // นิยามเข็มกลัดความสำเร็จ (Achievements / Badges)
  BADGES: [
    { id: 'first_step', icon: '🌱', name: 'ก้าวแรกสู่นักพัฒนา', desc: 'พิชิตภารกิจแรกสำเร็จ' },
    { id: 'no_decoy', icon: '🎯', name: 'บล็อกแม่นยำ', desc: 'ผ่านด่านโดยไม่ติดกับดักบล็อกลวงเลย' },
    { id: 'speedy', icon: '⚡', name: 'คิดไว แก้ไว', desc: 'พิชิตด่านได้ภายในเวลาต่ำกว่า 40 วินาที' },
    { id: 'streak_3', icon: '🔥', name: 'คอมโบขั้นเทพ', desc: 'ตอบถูกในครั้งแรกติดต่อกัน 3 ด่าน' },
    { id: 'master', icon: '👑', name: 'ปรมาจารย์โค้ดเบรกเกอร์', desc: 'พิชิตครบทั้ง 8 ด่านสมบูรณ์' }
  ],

  // คำพูดให้กำลังใจของ Mascot
  MASCOT_QUOTES: [
    "ตึงมากวัยรุ่นโค้ดเดอร์! สู้ ๆ ลุยต่อเลย 🚀",
    "สังเกตสีบล็อกกับช่องต่อนะ สีตรงกันเสียบเข้ากันได้พอดีเลย! 🎨",
    "ถ้าติดขัด กดปุ่ม '💡 คำใบ้' ได้เลยนะ ระดับ 1 ฟรีไม่เสียแต้ม! 🎁",
    "เก่งมาก! อีกนิดเดียวแอปบนมือถือจำลองจะทำงานได้แล้ว ✨",
    "แตะบล็อกในกล่องเครื่องมือเบา ๆ มันจะพุ่งไปต่อให้อัตโนมัติเลย ⚡",
    "ด่านไหนมี Bug เส้นประสีแดง แตะที่บล็อกนั้นเพื่อเตะทิ้งลงถังขยะได้เลย 🗑️",
    "ตอบถูกรอบเดียวได้คอมโบไฟลุก 🔥 บวกโบนัสแต้มพิเศษด้วยนะ!"
  ],

  /**
   * คำนวณดาว 1 - 3 ดวงตามเกณฑ์การประเมิน (ให้กำลังใจและยุติธรรม)
   * @param {number} earnedScore - คะแนนที่ได้ในด่าน
   * @param {Object} stats - สถิติของด่านนั้น
   * @returns {number} จำนวนดาว (1 ถึง 3)
   */
  calculateStars(earnedScore, stats) {
    const decoyCount = stats.decoyUsesCount || 0;
    const usedTier3Hint = stats.hintsUnlocked && stats.hintsUnlocked[2];

    // ได้ 3 ดาวหากคะแนน >= 95 และไม่ติดกับดักบล็อกลวง (Decoy) เลย และไม่ใช้เฉลยขั้นสุดท้าย
    if (earnedScore >= CONFIG.STAR_THRESHOLDS.THREE_STAR_MIN && decoyCount === 0 && !usedTier3Hint) {
      return 3;
    }
    if (earnedScore >= CONFIG.STAR_THRESHOLDS.TWO_STAR_MIN) {
      return 2;
    }
    return 1;
  },

  /**
   * เพิ่มค่าประสบการณ์ (XP) และปรับระดับผู้เล่น
   * @param {number} stars 
   * @returns {{ earnedXP: number, didLevelUp: boolean, newLevel: number }}
   */
  addXP(stars) {
    const earnedXP = CONFIG.XP_BASE_PASS + (stars * CONFIG.XP_PER_STAR);
    GameState.playerXP += earnedXP;

    // คำนวณเลเวล: ทุก ๆ 300 XP เลเวลจะขึ้น 1 ขั้น
    const newLevel = Math.floor(GameState.playerXP / 300) + 1;
    const didLevelUp = newLevel > GameState.playerLevel;
    if (didLevelUp) {
      GameState.playerLevel = newLevel;
    }

    return { earnedXP, didLevelUp, newLevel };
  },

  /**
   * ตรวจสอบและบันทึก Streak
   * @param {boolean} isFirstAttemptSuccess 
   * @returns {number} Current Streak
   */
  updateStreak(isFirstAttemptSuccess) {
    if (isFirstAttemptSuccess) {
      GameState.currentStreak += 1;
      if (GameState.currentStreak > GameState.highestStreak) {
        GameState.highestStreak = GameState.currentStreak;
      }
    } else {
      GameState.currentStreak = 0;
    }
    return GameState.currentStreak;
  },

  /**
   * ตรวจสอบว่าปลดล็อก Badge ใหม่หรือไม่
   * @param {number} levelNum 
   * @param {Object} stats 
   * @returns {Object[]} รายการ Badge ที่เพิ่งปลดล็อกได้ใหม่
   */
  checkBadges(levelNum, stats) {
    const newBadges = [];

    const unlock = (badgeId) => {
      if (!GameState.unlockedBadges.includes(badgeId)) {
        GameState.unlockedBadges.push(badgeId);
        const b = this.BADGES.find((x) => x.id === badgeId);
        if (b) newBadges.push(b);
      }
    };

    // 1. ด่านแรก
    if (levelNum === 1 && stats.completed) unlock('first_step');

    // 2. ไม่โดนบล็อกลวง
    if (stats.completed && (!stats.decoyUsesCount || stats.decoyUsesCount === 0)) unlock('no_decoy');

    // 3. ผ่านไวใน 40 วิ
    if (stats.completed && stats.timeSpentSec > 0 && stats.timeSpentSec <= 40) unlock('speedy');

    // 4. Streak 3
    if (GameState.currentStreak >= 3) unlock('streak_3');

    // 5. จบ 8 ด่าน
    let allDone = true;
    for (let i = 1; i <= CONFIG.TOTAL_LEVELS; i++) {
      if (!GameState.levelStats[i]?.completed) { allDone = false; break; }
    }
    if (allDone) unlock('master');

    return newBadges;
  },

  /**
   * สุ่มประโยคพูดของ Mascot
   */
  getRandomMascotQuote() {
    return this.MASCOT_QUOTES[Math.floor(Math.random() * this.MASCOT_QUOTES.length)];
  }
};
