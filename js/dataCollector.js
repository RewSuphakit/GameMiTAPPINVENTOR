/**
 * ==============================================================================
 * EDUCATIONAL RESEARCH DATA COLLECTOR (js/dataCollector.js)
 * ==============================================================================
 * เครื่องมือเก็บรวบรวมข้อมูลเชิงปริมาณสำหรับการวิจัยทักษะการคิดเชิงคำนวณ (ปวช. 2)
 */

import { CONFIG } from './config.js';
import { GameState } from './state.js';
import { Utils } from './utils.js';

export const DataCollector = {
  /**
   * บันทึกความเคลื่อนไหวของผู้เรียน (Granular Event Log)
   * @param {string} action - การกระทำ เช่น 'block_pickup', 'block_snap', 'hint_unlocked'
   * @param {string} blockKind - ประเภทบล็อก
   * @param {Object} details - รายละเอียดเพิ่มเติม
   */
  logEvent(action, blockKind, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: GameState.currentLevel,
      action,
      blockKind,
      details
    };
    GameState.eventLog.push(entry);
    Utils.log('Event', `${action} on [${blockKind}]`, details);
  },

  /**
   * สร้างโครงสร้างข้อมูลงานวิจัยฉบับสมบูรณ์ (Research Payload)
   * @returns {Object} Payload สำหรับ Google Sheets / Export
   */
  buildResearchPayload() {
    let totalAttempts = 0;
    let totalHints = 0;
    let totalDecoys = 0;
    let totalStars = 0;

    for (let i = 1; i <= CONFIG.TOTAL_LEVELS; i++) {
      const st = GameState.levelStats[i] || {};
      totalAttempts += st.attempts || 0;
      totalDecoys += st.decoyUsesCount || 0;
      totalStars += st.stars || 0;
      if (st.hintsUnlocked) {
        totalHints += st.hintsUnlocked.filter(Boolean).length;
      }
    }

    const accuracy = totalAttempts > 0 ? Math.round((CONFIG.TOTAL_LEVELS / totalAttempts) * 100) : 100;

    let grade = 'ยอดเยี่ยม (A)';
    if (GameState.totalScore < 600) grade = 'ต้องปรับปรุง (C)';
    else if (GameState.totalScore < 800) grade = 'ดี (B)';

    const payload = {
      timestamp: new Date().toISOString(),
      sessionId: GameState.sessionId,
      studentId: GameState.studentId,
      studentName: GameState.studentName,
      studentGroup: GameState.studentGroup,
      totalScore: GameState.totalScore,
      totalStars,
      totalTimeSec: GameState.secondsElapsed,
      totalTimeFormatted: Utils.formatTime(GameState.secondsElapsed),
      accuracyPercent: accuracy,
      grade,
      playerLevel: GameState.playerLevel,
      playerXP: GameState.playerXP,
      highestStreak: GameState.highestStreak,
      totalHintsUsed: totalHints,
      totalDecoysTriggered: totalDecoys,
      unlockedBadges: GameState.unlockedBadges,
      deviceInfo: Utils.getDeviceInfo(),
      eventLog: GameState.eventLog
    };

    // บันทึกสถิติแยกรายด่าน (Level 1 ถึง Level 8)
    for (let i = 1; i <= CONFIG.TOTAL_LEVELS; i++) {
      const s = GameState.levelStats[i] || {};
      payload[`l${i}_attempts`] = s.attempts || 0;
      payload[`l${i}_time`] = s.timeSpentSec || 0;
      payload[`l${i}_score`] = s.score || 0;
      payload[`l${i}_penalty`] = s.penalty || 0;
      payload[`l${i}_stars`] = s.stars || 0;
      payload[`l${i}_variant`] = (s.variant || 0) + 1;
      payload[`l${i}_hints`] = s.hintsUnlocked ? s.hintsUnlocked.filter(Boolean).length : 0;
      payload[`l${i}_decoys`] = s.decoyUsesCount || 0;
      payload[`l${i}_timeToFirstAction`] = s.firstActionTimestamp || '';
    }

    return payload;
  },

  /**
   * ส่งออกข้อมูลเป็นไฟล์ CSV สำหรับวิเคราะห์ทางสถิติ (SPSS, Excel)
   */
  exportCSV() {
    const headers = [
      'SessionID', 'StudentID', 'StudentName', 'Group',
      'Level', 'Variant', 'Attempts', 'TimeSpentSec',
      'Score', 'Stars', 'Penalty', 'HintsUsed', 'DecoysTriggered', 'Timestamp'
    ];

    const rows = [];
    for (let lvl = 1; lvl <= CONFIG.TOTAL_LEVELS; lvl++) {
      const s = GameState.levelStats[lvl] || {};
      const hintsCount = s.hintsUnlocked ? s.hintsUnlocked.filter(Boolean).length : 0;
      rows.push([
        `"${GameState.sessionId}"`,
        `"${GameState.studentId}"`,
        `"${GameState.studentName}"`,
        `"${GameState.studentGroup}"`,
        lvl,
        (s.variant || 0) + 1,
        s.attempts || 0,
        s.timeSpentSec || 0,
        s.score || 0,
        s.stars || 0,
        s.penalty || 0,
        hintsCount,
        s.decoyUsesCount || 0,
        `"${new Date().toISOString()}"`
      ]);
    }

    // BOM (\uFEFF) เพื่อให้อ่านภาษาไทยใน Excel บน Windows ได้ถูกต้อง
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Research_CodeBreaker_${GameState.studentId || 'anon'}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  /**
   * ส่งออกข้อมูลเป็นไฟล์ JSON ฉบับเต็มพร้อม Event Logs
   */
  exportJSON() {
    const payload = this.buildResearchPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Research_CodeBreaker_${GameState.studentId || 'anon'}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
