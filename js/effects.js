/**
 * ==============================================================================
 * VISUAL EFFECTS & PARTICLES (js/effects.js)
 * ==============================================================================
 * ระบบอนุภาค Confetti, Screen Shake, Sparkle Burst, และ Floating Score Popup
 * เสริม Game Feel ให้ฉ่ำและสนุกเร้าใจตามหลัก Playful Educational Game
 */

import { Utils } from './utils.js';

export const Effects = {
  /**
   * ยิงพลุกระดาษเฉลิมฉลอง (Confetti Burst)
   */
  celebrate() {
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
      return;
    }
    this.runNativeConfetti();
  },

  /**
   * Native Confetti Runner กรณีไม่มี CDN
   */
  runNativeConfetti() {
    let canvas = document.getElementById('canvas-confetti-fallback');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'canvas-confetti-fallback';
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#fbbf24'];
    const particles = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.55,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.85) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    let frame = 0;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // แรงโน้มถ่วง
        p.rotation += p.vRot;
        p.alpha -= 0.012;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      frame++;
      if (alive && frame < 120) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    requestAnimationFrame(render);
  },

  /**
   * สั่นเตือนข้อผิดพลาดเบา ๆ (Screen Shake & Haptic)
   * @param {HTMLElement} element 
   */
  shake(element) {
    if (!element) return;
    element.classList.add('shake-penalty');
    Utils.vibrate([35, 50, 35]);
    setTimeout(() => {
      element.classList.remove('shake-penalty');
    }, 550);
  },

  /**
   * สร้างคลื่นแสง Ripple กระจายรอบ Socket ที่ Snap สำเร็จ
   * @param {HTMLElement} target 
   */
  createRipple(target) {
    if (!target) return;
    const ripple = document.createElement('div');
    ripple.className = 'snap-ripple-effect';
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);

    // ปล่อยประกายดาว Sparkles รอบจุดที่ต่อ
    this.createSparkleBurst(target);
  },

  /**
   * ปล่อยละอองดาวระยิบระยับ (Sparkle Burst) เมื่อต่อบล็อกสำเร็จ
   * @param {HTMLElement} target 
   */
  createSparkleBurst(target) {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const sparkles = ['✨', '⭐', '🌟', '💫'];
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('div');
      spark.className = 'floating-sparkle';
      spark.textContent = sparkles[i % sparkles.length];
      spark.style.left = `${centerX + (Math.random() - 0.5) * 40}px`;
      spark.style.top = `${centerY + (Math.random() - 0.5) * 30}px`;
      document.body.appendChild(spark);

      setTimeout(() => spark.remove(), 700);
    }
  },

  /**
   * แสดงข้อความคะแนนลอยขึ้น (Floating Score Text) เช่น +125 PTS
   */
  showFloatingScore(x, y, text = '+125 PTS', color = '#10b981') {
    const el = document.createElement('div');
    el.className = 'floating-score-popup';
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = color;
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1100);
  }
};
