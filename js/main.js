/**
 * ==============================================================================
 * APPLICATION BOOTSTRAP & MAIN CONTROLLER (js/main.js)
 * ==============================================================================
 * จุดเริ่มต้นการทำงาน (Entry Point) เชื่อมโยงทุกโมดูลเข้าด้วยกัน
 */

import { CONFIG } from './config.js';
import { GameState } from './state.js';
import { LEVEL_SCHEMA } from './levels.data.js';
import { GenericValidator } from './validator.js';
import { DragEngine } from './dragEngine.js';
import { PhoneSimulator } from './simulator.js';
import { Gamification } from './gamification.js';
import { DataCollector } from './dataCollector.js';
import { SyncEngine } from './sync.js';
import { AudioEngine } from './audio.js';
import { Effects } from './effects.js';
import { UIController } from './ui.js';
import { Utils } from './utils.js';

/**
 * ฟังก์ชันเริ่มเกมหลังจากกรอกชื่อ-รหัส
 */
function startGame(e) {
  if (e) e.preventDefault();
  const nameInput = document.getElementById('student-name');
  const idInput = document.getElementById('student-id');
  const groupInput = document.getElementById('student-group');

  GameState.studentName = Utils.sanitizeHTML(nameInput?.value.trim() || 'ผู้เรียน');
  GameState.studentId = Utils.sanitizeHTML(idInput?.value.trim() || 'anon');
  GameState.studentGroup = Utils.sanitizeHTML(groupInput?.value.trim() || 'ปวช. 2');
  GameState.startTime = new Date();

  // อัปเดตข้อมูลผู้เรียนที่ Header
  const badge = document.getElementById('student-badge-text');
  if (badge) badge.textContent = `${GameState.studentName} (${GameState.studentGroup})`;

  // ซ่อน Login Modal
  document.getElementById('modal-start')?.classList.remove('active');

  AudioEngine.init();
  AudioEngine.playSuccess();
  startTimer();
  loadLevel(1);
  GameState.save();

  UIController.showToast(`ยินดีต้อนรับคุณ ${GameState.studentName} เข้าสู่ภารกิจ! 🚀`, 'success');
}

/**
 * ตัวจับเวลารวมและเวลารายด่าน
 */
function startTimer() {
  if (GameState.timerInterval) clearInterval(GameState.timerInterval);
  GameState.timerInterval = setInterval(() => {
    GameState.secondsElapsed++;
    GameState.levelSecondsElapsed++;

    const timerEl = document.getElementById('timer-display');
    if (timerEl) timerEl.textContent = Utils.formatTime(GameState.secondsElapsed);
  }, 1000);
}

/**
 * โหลดด่านที่กำหนด
 * @param {number} levelNum 
 * @param {boolean} forceNewRandom 
 */
function loadLevel(levelNum, forceNewRandom = true) {
  GameState.isLevelTransitioning = false;
  GameState.currentLevel = levelNum;
  GameState.levelSecondsElapsed = 0;

  const schema = LEVEL_SCHEMA[levelNum];
  if (!schema) return;

  // สุ่ม Variant หากยังไม่มีหรือต้องการสุ่มใหม่
  if (forceNewRandom || GameState.levelStats[levelNum].variant === undefined) {
    const randomIdx = Math.floor(Math.random() * schema.variants.length);
    GameState.levelStats[levelNum].variant = randomIdx;
  }
  const activeVariantIdx = GameState.levelStats[levelNum].variant;

  // ปลดล็อกปุ่มตรวจคำตอบ
  const checkBtn = document.getElementById('btn-check-answer');
  if (checkBtn) checkBtn.disabled = false;

  // อัปเดต UI หน้าจอ
  UIController.renderLevel(levelNum, activeVariantIdx);
  UIController.showToast(`เข้าสู่ ${schema.modeName}`, 'info');

  // สุ่มคำแนะนำจาก Mascot
  const mascotBubble = document.getElementById('mascot-bubble');
  if (mascotBubble) mascotBubble.textContent = Gamification.getRandomMascotQuote();

  GameState.save();
}

/**
 * ตรวจคำตอบของด่านปัจจุบัน
 */
function checkCurrentLevel() {
  if (GameState.isLevelTransitioning) return;

  const lvl = GameState.currentLevel;
  const schema = LEVEL_SCHEMA[lvl];
  const stats = GameState.levelStats[lvl];
  stats.attempts++;

  const variantIdx = stats.variant || 0;
  const res = GenericValidator.validate(lvl, variantIdx);

  // กรณีติดกับดักบล็อกลวง (Decoy Block)
  if (res.isDecoy) {
    stats.decoyUsesCount = (stats.decoyUsesCount || 0) + 1;
    const penalty = stats.decoyUsesCount === 1 ? CONFIG.DECOY_PENALTY_FIRST : CONFIG.DECOY_PENALTY_SUBSEQUENT;
    stats.penalty += penalty;

    Gamification.updateStreak(false);
    updateStreakUI();

    AudioEngine.playError();
    if (penalty === 0) {
      UIController.showToast(`💡 บล็อกนี้ยังไม่ใช่! (สำรวจฟรี ไม่หักคะแนน)`, 'warning');
    } else {
      UIController.showToast(`⚠️ บล็อกลวง! หักโบนัส -${penalty} คะแนน`, 'error');
    }
    UIController.setFormativeFeedback(`⚠️ บล็อกลวง: ${res.message}`, 'error');

    // สั่นบล็อกและส่งกลับ Toolbox
    const decoys = document.querySelectorAll('[data-decoy="true"].in-socket, [data-decoy="true"].in-cavity, [data-decoy="true"].in-stack');
    decoys.forEach((d) => {
      Effects.shake(d);
      setTimeout(() => {
        const parent = d.parentElement;
        if (parent) {
          parent.classList.remove('filled', 'in-socket', 'in-cavity');
          const placeholder = parent.querySelector('.ai-placeholder');
          if (placeholder) placeholder.style.display = '';
        }
        DragEngine.returnToToolbox(d);
      }, 550);
    });

    DataCollector.logEvent('check_attempt', 'decoy_error', { level: lvl, penalty });
    GameState.save();
    return;
  }

  // กรณีต่อบล็อกถูกต้องสมบูรณ์ (Success)
  if (res.isValid) {
    GameState.isLevelTransitioning = true;
    const checkBtn = document.getElementById('btn-check-answer');
    if (checkBtn) checkBtn.disabled = true;

    stats.completed = true;
    stats.timeSpentSec = GameState.levelSecondsElapsed;

    // คำนวณคะแนนตาม Scoring Rubric
    const isFirstTry = stats.attempts === 1;
    const streakBonus = isFirstTry ? CONFIG.STREAK_BONUS : 0;
    Gamification.updateStreak(isFirstTry);
    updateStreakUI();

    const rawScore = schema.points - ((stats.attempts - 1) * CONFIG.ATTEMPT_PENALTY) - stats.penalty + streakBonus;
    const earned = Math.max(CONFIG.MIN_LEVEL_SCORE, rawScore);
    stats.score = earned;
    GameState.totalScore += earned;

    // คำนวณดาวและ XP
    const stars = Gamification.calculateStars(earned, stats);
    stats.stars = stars;
    const { earnedXP } = Gamification.addXP(stars);

    // ตรวจสอบเข็มกลัดรางวัล (Badges)
    const newBadges = Gamification.checkBadges(lvl, stats);
    newBadges.forEach((b) => {
      UIController.showToast(`🎖️ ปลดล็อกความสำเร็จ: ${b.name}!`, 'success');
    });

    // แสดงตัวเลขคะแนนที่ Header
    updateScoreUI();

    // เอฟเฟกต์เฉลิมฉลอง
    AudioEngine.playSuccess();
    Effects.celebrate();

    // ตัวเลขคะแนนลอย (Floating Score)
    const checkBtnEl = document.getElementById('btn-check-answer');
    if (checkBtnEl) {
      const rect = checkBtnEl.getBoundingClientRect();
      Effects.showFloatingScore(rect.left + rect.width / 2, rect.top - 10, `+${earned} ⭐`);
    }

    UIController.showToast(`🎉 ผ่านภารกิจที่ ${lvl}! +${earned} คะแนน (${'⭐'.repeat(stars)})`, 'success');
    UIController.setFormativeFeedback(`🎉 ยอดเยี่ยมมาก! ${res.message}`, 'success');

    DataCollector.logEvent('level_completed', 'success', { level: lvl, earned, stars, attempts: stats.attempts });
    GameState.save();

    // แสดง Victory Modal
    showVictoryModal(lvl, earned, stars, earnedXP);
  } else {
    // กรณีต่อบล็อกผิด (Formative Feedback)
    Gamification.updateStreak(false);
    updateStreakUI();

    AudioEngine.playError();
    UIController.showToast('บล็อกยังต่อไม่สมบูรณ์ ลองตรวจดูคำแนะนำด้านบน', 'error');
    UIController.setFormativeFeedback(`💡 คำแนะนำ: ${res.message}`, 'error');
    DataCollector.logEvent('check_attempt', 'failed', { level: lvl, reason: res.message });
    GameState.save();
  }
}

/**
 * แสดงหน้าต่างชัยชนะประจำด่าน (Victory Modal)
 */
function showVictoryModal(levelNum, score, stars, xp) {
  const modal = document.getElementById('modal-victory');
  if (!modal) return;

  document.getElementById('vic-title').textContent = `ภารกิจที่ ${levelNum} สำเร็จ!`;
  document.getElementById('vic-score').textContent = `+${score} คะแนน`;
  document.getElementById('vic-xp').textContent = `+${xp} XP`;

  // เรนเดอร์ดาวพร้อมเอฟเฟกต์กระเด้งและเสียงกระดิ่งทีละดวง
  const starsContainer = document.getElementById('vic-stars');
  if (starsContainer) {
    starsContainer.innerHTML = `
      <span class="vic-star" id="vic-star-1">⭐</span>
      <span class="vic-star" id="vic-star-2">⭐</span>
      <span class="vic-star" id="vic-star-3">⭐</span>
    `;
    for (let i = 1; i <= 3; i++) {
      const starEl = document.getElementById(`vic-star-${i}`);
      if (starEl && i <= stars) {
        setTimeout(() => {
          starEl.classList.add('earned');
          AudioEngine.playStar(i);
        }, 250 + (i * 280));
      }
    }
  }

  modal.classList.add('active');

  document.getElementById('btn-vic-next')?.addEventListener('click', () => {
    modal.classList.remove('active');
    if (levelNum < CONFIG.TOTAL_LEVELS) {
      loadLevel(levelNum + 1, true);
    } else {
      finishGame();
    }
  }, { once: true });
}

/**
 * จบการทดสอบครบ 8 ด่าน
 */
function finishGame() {
  clearInterval(GameState.timerInterval);
  GameState.endTime = new Date();
  GameState.clearAutoSave();

  // สรุปข้อมูลใน Dashboard Modal
  document.getElementById('sum-student-name').textContent = GameState.studentName;
  document.getElementById('sum-score').textContent = GameState.totalScore;
  document.getElementById('sum-time').textContent = Utils.formatTime(GameState.secondsElapsed);

  let totalAttempts = 0;
  for (let i = 1; i <= CONFIG.TOTAL_LEVELS; i++) {
    totalAttempts += GameState.levelStats[i]?.attempts || 0;
  }
  const accuracy = totalAttempts > 0 ? Math.round((CONFIG.TOTAL_LEVELS / totalAttempts) * 100) : 100;
  document.getElementById('sum-accuracy').textContent = `${accuracy}%`;

  let grade = 'ยอดเยี่ยม (A)';
  if (GameState.totalScore < 600) grade = 'ต้องปรับปรุง (C)';
  else if (GameState.totalScore < 800) grade = 'ดี (B)';
  document.getElementById('sum-grade').textContent = grade;

  document.getElementById('modal-summary')?.classList.add('active');
  AudioEngine.playSuccess();
  Effects.celebrate();

  // ส่งข้อมูลวิจัยเข้า Google Sheets โดยอัตโนมัติ
  sendScoreToSheets();
}

/**
 * ส่งคะแนนเข้า Google Sheets ผ่าน SyncEngine
 */
async function sendScoreToSheets() {
  const payload = DataCollector.buildResearchPayload();
  try {
    await SyncEngine.send(payload);
    UIController.showToast('ส่งคะแนนวิจัยเข้า Google Sheets เรียบร้อย ☁️', 'success');
  } catch (e) {
    UIController.showToast('บันทึกข้อมูลออฟไลน์ในเครื่องเรียบร้อย (จะส่งเมื่อต่อเน็ต)', 'info');
  }
}

function updateScoreUI() {
  const el = document.getElementById('score-display');
  if (el) el.textContent = GameState.totalScore;
}

function updateStreakUI() {
  const el = document.getElementById('streak-count');
  if (el) el.textContent = GameState.currentStreak;
}

/**
 * เริ่มต้นระบบเมื่อ DOM พร้อม
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. ลงทะเบียน Service Worker สำหรับ PWA และโหมดออฟไลน์
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(() => {
      console.log('[PWA] Service Worker registered successfully');
    }).catch((err) => console.warn('[PWA] Service Worker registration failed:', err));
  }

  // 2. เริ่มต้น Theme และ Engines
  UIController.initTheme();

  DragEngine.init({
    onLogEvent: (action, kind, details) => DataCollector.logEvent(action, kind, details),
    onShowToast: (msg, type) => UIController.showToast(msg, type)
  });

  PhoneSimulator.init({
    onShowToast: (msg, type) => UIController.showToast(msg, type)
  });

  SyncEngine.init({
    onStatusChange: (text, color) => UIController.updateGsheetStatus(text, color)
  });

  // 3. ผูกเหตุการณ์ปุ่ม Header และ Action Bar
  document.getElementById('btn-check-answer')?.addEventListener('click', checkCurrentLevel);
  document.getElementById('btn-theme-toggle')?.addEventListener('click', () => UIController.toggleTheme());
  document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
    GameState.isSoundEnabled = !GameState.isSoundEnabled;
    const btn = document.getElementById('btn-sound-toggle');
    if (btn) btn.textContent = GameState.isSoundEnabled ? '🔊' : '🔇';
    UIController.showToast(GameState.isSoundEnabled ? 'เปิดเสียงแล้ว' : 'ปิดเสียงแล้ว', 'info');
  });

  document.getElementById('btn-worldmap-toggle')?.addEventListener('click', () => UIController.openWorldMap());
  document.getElementById('btn-close-worldmap')?.addEventListener('click', () => UIController.closeWorldMap());

  document.getElementById('btn-hint-toggle')?.addEventListener('click', () => UIController.openHintModal());
  document.getElementById('btn-close-hint')?.addEventListener('click', () => UIController.closeHintModal());

  document.getElementById('btn-mission-toggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    UIController.toggleMissionCard();
  });

  document.getElementById('mission-desc-card')?.addEventListener('click', () => {
    const card = document.getElementById('mission-desc-card');
    if (card && card.classList.contains('is-collapsed')) {
      UIController.toggleMissionCard();
    }
  });

  document.getElementById('btn-reset-level')?.addEventListener('click', () => {
    AudioEngine.playClick();
    loadLevel(GameState.currentLevel, false);
    UIController.showToast('รีเซ็ตด่านนี้เรียบร้อย', 'info');
  });

  // ผูกการสลับแท็บบนมือถือ
  document.querySelectorAll('.mobile-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      UIController.setMobileView(view);
      AudioEngine.playClick();
    });
  });

  // ผูกแบบฟอร์มเข้าสู่ระบบ
  document.getElementById('form-login')?.addEventListener('submit', startGame);

  // ปุ่ม Export CSV และ JSON
  document.getElementById('btn-export-csv')?.addEventListener('click', () => DataCollector.exportCSV());
  document.getElementById('btn-export-json')?.addEventListener('click', () => DataCollector.exportJSON());

  // รับ Event กระโดดเปลี่ยนด่านจาก World Map
  window.addEventListener('requestJumpLevel', (e) => {
    if (e.detail?.level) loadLevel(e.detail.level, false);
  });

  // 4. ตรวจสอบว่ามีข้อมูล Auto-save อยู่เดิมหรือไม่
  if (GameState.restore()) {
    const resumePrompt = document.getElementById('modal-resume');
    if (resumePrompt) {
      document.getElementById('resume-student-name').textContent = GameState.studentName;
      document.getElementById('resume-level').textContent = GameState.currentLevel;
      resumePrompt.classList.add('active');

      document.getElementById('btn-resume-yes')?.addEventListener('click', () => {
        resumePrompt.classList.remove('active');
        document.getElementById('modal-start')?.classList.remove('active');
        document.getElementById('student-badge-text').textContent = `${GameState.studentName} (${GameState.studentGroup})`;
        updateScoreUI();
        updateStreakUI();
        startTimer();
        loadLevel(GameState.currentLevel, false);
        UIController.showToast('กู้คืนข้อมูลการเล่นสำเร็จ ✨', 'success');
      });

      document.getElementById('btn-resume-no')?.addEventListener('click', () => {
        resumePrompt.classList.remove('active');
        GameState.clearAutoSave();
        GameState.initLevelStats();
      });
    }
  }

  // ประมวลผลคิวออฟไลน์ที่อาจหลงเหลือ
  SyncEngine.processQueue();
});
