/**
 * ==============================================================================
 * INTERACTIVE PHONE SIMULATOR ENGINE (js/simulator.js)
 * ==============================================================================
 * เรนเดอร์และประมวลผลการทำงานบนหน้าจอมือถือจำลองแบบโต้ตอบได้จริง (Live Cause-and-Effect)
 * ครบทั้ง 8 ด่าน พร้อมเสียง เอฟเฟกต์แอนิเมชัน และเกมมินิแอป เพิ่มความสนุกตื่นเต้น
 */

import { LEVEL_SCHEMA } from './levels.data.js';
import { GameState } from './state.js';
import { GenericValidator } from './validator.js';
import { AudioEngine } from './audio.js';

export const PhoneSimulator = {
  onShowToast: null,

  init(callbacks = {}) {
    this.onShowToast = callbacks.onShowToast || (() => {});
  },

  /**
   * เรนเดอร์หน้าจอโทรศัพท์จำลองตามด่านที่เลือก
   * @param {number} levelNum 
   * @param {number} variantIndex 
   */
  render(levelNum, variantIndex = 0) {
    const container = document.getElementById('phone-content');
    if (!container) return;

    const schema = LEVEL_SCHEMA[levelNum];
    const v = schema.variants[variantIndex || 0];

    switch (levelNum) {
      // ------------------------------------------------------------------------
      // ด่านที่ 1: หุ่นยนต์ Cyber Bot (รีเซ็ตระบบ)
      // ------------------------------------------------------------------------
      case 1:
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;text-align:center;">
            <div style="background:var(--bg-surface);padding:10px;border-radius:12px;border:1px solid var(--border-color);">
              <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);">CYBER BOT SYSTEM</div>
              <div id="sim-bot-face" style="font-size:44px;margin:6px 0;transition:transform 0.2s ease;">🤖</div>
              <div id="sim-bot-status" style="font-size:0.8rem;font-weight:700;color:var(--color-primary);">รอรับคำสั่งรีเซ็ต...</div>
            </div>

            <div style="background:#0f172a;color:white;padding:14px;border-radius:14px;">
              <div style="font-size:0.72rem;color:#94a3b8;">CURRENT VALUE (${v.varName.toUpperCase()})</div>
              <div style="font-size:2.2rem;font-weight:900;color:#38bdf8;margin:2px 0;" id="sim-v1">100</div>
              <div style="font-size:0.75rem;color:#34d399;">🎯 ต้องรีเซ็ตให้เหลือ: ${v.targetVal}</div>
            </div>

            <button class="btn-primary" id="sim-btn-1" style="width:100%;min-height:44px;background:linear-gradient(135deg,#e11d48,#be123c);font-size:0.95rem;">
              🕹️ ${v.btnName}.Click (กดเพื่อทดสอบ)
            </button>
          </div>`;
        document.getElementById('sim-btn-1')?.addEventListener('click', () => this.handleL1Click(v));
        break;

      // ------------------------------------------------------------------------
      // ด่านที่ 2: ตู้เกม Arcade Score Booster (+5 / +10 เหรียญ)
      // ------------------------------------------------------------------------
      case 2:
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;text-align:center;">
            <div style="background:var(--bg-surface);padding:10px;border-radius:12px;border:1px solid var(--border-color);">
              <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);">ARCADE SCORE BOOSTER</div>
              <div style="font-size:36px;margin:4px 0;">🎰</div>
              <div style="font-size:0.78rem;color:var(--color-secondary);">สมการเพิ่มคะแนนต่อเนื่อง</div>
            </div>

            <div style="background:#0f172a;color:white;padding:16px;border-radius:14px;position:relative;overflow:hidden;">
              <div style="font-size:0.72rem;color:#94a3b8;">คะแนนปัจจุบัน (SCORE)</div>
              <div style="font-size:2.4rem;font-weight:900;color:#fbbf24;margin:2px 0;" id="sim-v2">0</div>
              <div style="font-size:0.75rem;color:#38bdf8;" id="sim-formula-2">⚡ FORMULA: score + 5</div>
              <div id="sim-coin-float" style="position:absolute;top:10px;right:20px;font-size:1.2rem;font-weight:800;color:#34d399;opacity:0;pointer-events:none;"></div>
            </div>

            <button class="btn-primary" id="sim-btn-2" style="width:100%;min-height:44px;background:linear-gradient(135deg,#7c3aed,#4f46e5);font-size:0.95rem;">
              🪙 กดเพื่อเพิ่มคะแนน (+แต้ม)
            </button>
          </div>`;
        document.getElementById('sim-btn-2')?.addEventListener('click', () => this.handleL2Click());
        break;

      // ------------------------------------------------------------------------
      // ด่านที่ 3: เครื่องตรวจข้อสอบ & ตัดเกรด (Grade Scanner)
      // ------------------------------------------------------------------------
      case 3:
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="background:var(--bg-surface);padding:10px;border-radius:12px;border:1px solid var(--border-color);text-align:center;">
              <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);">GRADE EVALUATOR APP</div>
              <div style="font-size:32px;margin:2px 0;">📝</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">เกณฑ์: ${v.field} ${v.op} ${v.val} ➔ ${v.passText}</div>
            </div>

            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:0.75rem;font-weight:700;">คะแนนที่ทดสอบ:</label>
              <div style="display:flex;gap:6px;">
                <input type="number" id="sim-input-3" value="75" style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-surface);color:var(--text-main);font-size:1rem;font-weight:800;text-align:center;">
                <button class="btn-secondary" id="sim-val-45" style="padding:4px 10px;min-height:36px;font-size:0.8rem;">45</button>
                <button class="btn-secondary" id="sim-val-80" style="padding:4px 10px;min-height:36px;font-size:0.8rem;">80</button>
              </div>
            </div>

            <button class="btn-primary" id="sim-btn-3" style="width:100%;min-height:42px;background:linear-gradient(135deg,#10b981,#059669);">
              🔍 ตรวจสอบผลเกรด
            </button>

            <div id="sim-grade-3" style="padding:14px;background:#0f172a;color:#94a3b8;border-radius:10px;text-align:center;font-weight:900;font-size:1.1rem;transition:all 0.2s ease;">
              [ รอการทดสอบ ]
            </div>
          </div>`;
        document.getElementById('sim-val-45')?.addEventListener('click', () => { document.getElementById('sim-input-3').value = 45; this.handleL3Check(v); });
        document.getElementById('sim-val-80')?.addEventListener('click', () => { document.getElementById('sim-input-3').value = 80; this.handleL3Check(v); });
        document.getElementById('sim-btn-3')?.addEventListener('click', () => this.handleL3Check(v));
        break;

      // ------------------------------------------------------------------------
      // ด่านที่ 4: ฐานยิงจรวด 4 ขั้นตอน (Space Rocket Pipeline)
      // ------------------------------------------------------------------------
      case 4:
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;text-align:center;">
            <div style="background:var(--bg-surface);padding:10px;border-radius:12px;border:1px solid var(--border-color);">
              <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);">SPACE LAUNCH PIPELINE</div>
              <div id="sim-rocket-icon" style="font-size:40px;margin:4px 0;transition:transform 0.4s ease;">🚀</div>
              <div style="font-size:0.75rem;color:var(--color-primary);">ลำดับขั้นตอน 1 ➔ 2 ➔ 3 ➔ 4</div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">
              <div class="sim-node" id="sn-1" style="background:#0f172a;color:#64748b;padding:6px 2px;font-size:0.68rem;font-weight:700;border-radius:6px;">1. ตั้งค่า</div>
              <div class="sim-node" id="sn-2" style="background:#0f172a;color:#64748b;padding:6px 2px;font-size:0.68rem;font-weight:700;border-radius:6px;">2. คำนวณ</div>
              <div class="sim-node" id="sn-3" style="background:#0f172a;color:#64748b;padding:6px 2px;font-size:0.68rem;font-weight:700;border-radius:6px;">3. แสดงผล</div>
              <div class="sim-node" id="sn-4" style="background:#0f172a;color:#64748b;padding:6px 2px;font-size:0.68rem;font-weight:700;border-radius:6px;">4. ปล่อย!</div>
            </div>

            <button class="btn-primary" id="sim-btn-4" style="width:100%;min-height:44px;background:linear-gradient(135deg,#f59e0b,#d97706);">
              🚀 เริ่มปล่อยจรวดตามลำดับ
            </button>
          </div>`;
        document.getElementById('sim-btn-4')?.addEventListener('click', () => this.handleL4Run());
        break;

      // ------------------------------------------------------------------------
      // ด่านที่ 5: แอปส่งเสียงร้องน้องแมว (Pet Soundboard)
      // ------------------------------------------------------------------------
      case 5:
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;text-align:center;">
            <div style="background:var(--bg-surface);padding:10px;border-radius:12px;border:1px solid var(--border-color);">
              <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);">CUTE PET SOUNDBOARD</div>
              <div id="sim-cat-face" style="font-size:54px;margin:6px 0;transition:transform 0.15s ease;cursor:pointer;">🐱</div>
              <div id="sim-cat-status" style="font-size:0.8rem;color:#ec4899;font-weight:700;">แตะปุ่มเพื่อส่งเสียงร้อง!</div>
            </div>

            <button class="btn-primary" id="sim-btn-5" style="width:100%;min-height:46px;background:linear-gradient(135deg,#ec4899,#be185d);font-size:1rem;">
              🔊 SoundButton.Click (กดฟังเสียงแมว)
            </button>
          </div>`;
        document.getElementById('sim-btn-5')?.addEventListener('click', () => this.handleL5Click());
        document.getElementById('sim-cat-face')?.addEventListener('click', () => this.handleL5Click());
        break;

      // ------------------------------------------------------------------------
      // ด่านที่ 6: ตะกร้าช้อปปิ้งสินค้า (Shopping Cart List)
      // ------------------------------------------------------------------------
      case 6:
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:10px;text-align:center;">
            <div style="background:var(--bg-surface);padding:10px;border-radius:12px;border:1px solid var(--border-color);">
              <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);">SMART SHOPPING CART</div>
              <div style="font-size:32px;margin:4px 0;">🛒</div>
              <div style="font-size:0.75rem;color:var(--color-secondary);">รายการสินค้าในตะกร้า (List)</div>
            </div>

            <div id="sim-cart-list" style="background:#0f172a;padding:12px;border-radius:12px;min-height:80px;display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start;">
              <span style="color:#64748b;font-size:0.75rem;">(ตะกร้าว่างเปล่า)</span>
            </div>

            <button class="btn-primary" id="sim-btn-6" style="width:100%;min-height:42px;background:linear-gradient(135deg,#06b6d4,#0891b2);">
              ➕ เพิ่มสินค้าลงในตะกร้า (Add Item)
            </button>
          </div>`;
        document.getElementById('sim-btn-6')?.addEventListener('click', () => this.handleL6Click());
        break;

      // ------------------------------------------------------------------------
      // ด่านที่ 7: มาตรวัดความเร็ววนซ้ำ (Speed Loop Multiplier)
      // ------------------------------------------------------------------------
      case 7:
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;text-align:center;">
            <div style="background:var(--bg-surface);padding:10px;border-radius:12px;border:1px solid var(--border-color);">
              <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);">TURBO LOOP ACCELERATOR</div>
              <div style="font-size:36px;margin:4px 0;">🏎️</div>
              <div style="font-size:0.75rem;color:#e69138;">วนซ้ำนับรอบ: 1 ถึง 5</div>
            </div>

            <div style="background:#0f172a;color:white;padding:14px;border-radius:14px;">
              <div style="font-size:0.72rem;color:#94a3b8;">รอบการวนซ้ำ (INDEX)</div>
              <div style="font-size:2.4rem;font-weight:900;color:#f59e0b;margin:2px 0;" id="sim-loop-num">0</div>
              <div style="font-size:0.75rem;color:#34d399;" id="sim-loop-status">READY TO LOOP</div>
            </div>

            <button class="btn-primary" id="sim-btn-7" style="width:100%;min-height:44px;background:linear-gradient(135deg,#e69138,#b86e20);">
              ⚡ รันลูปวนซ้ำ (For Loop 1..5)
            </button>
          </div>`;
        document.getElementById('sim-btn-7')?.addEventListener('click', () => this.handleL7Click());
        break;

      // ------------------------------------------------------------------------
      // ด่านที่ 8: ฟังก์ชันคำสั่งกระโดดสูง (Super Jump Procedure)
      // ------------------------------------------------------------------------
      case 8:
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;text-align:center;">
            <div style="background:var(--bg-surface);padding:10px;border-radius:12px;border:1px solid var(--border-color);">
              <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);">PROCEDURE ACTION ENGINE</div>
              <div id="sim-jumper" style="font-size:44px;margin:8px 0;transition:transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);">🦘</div>
              <div id="sim-jump-text" style="font-size:0.8rem;color:#8b5cf6;font-weight:700;">call SuperJump()</div>
            </div>

            <button class="btn-primary" id="sim-btn-8" style="width:100%;min-height:44px;background:linear-gradient(135deg,#6a1b9a,#4a148c);">
              🦘 ทดสอบฟังก์ชัน SuperJump()
            </button>
          </div>`;
        document.getElementById('sim-btn-8')?.addEventListener('click', () => this.handleL8Click());
        break;

      default:
        container.innerHTML = `
          <div style="text-align:center;padding:24px 10px;color:var(--text-muted);">
            <div style="font-size:36px;margin-bottom:8px;">📱</div>
            <div style="font-weight:700;color:var(--text-main);">SIMULATOR READY</div>
            <div style="font-size:0.78rem;margin-top:4px;">ระบบจำลองหน้าจอด่านที่ ${levelNum}</div>
          </div>`;
    }
  },

  // ============================================================================
  // EVENT HANDLERS FOR SIMULATOR ACTIONS
  // ============================================================================

  handleL1Click(v) {
    const vIndex = GameState.levelStats[1].variant || 0;
    const res = GenericValidator.validate(1, vIndex);
    const botFace = document.getElementById('sim-bot-face');
    const botStatus = document.getElementById('sim-bot-status');

    if (res.isValid) {
      document.getElementById('sim-v1').textContent = v.targetVal;
      if (botFace) botFace.textContent = '😄';
      if (botStatus) {
        botStatus.textContent = `✅ รีเซ็ต ${v.varName} = ${v.targetVal} สำเร็จ!`;
        botStatus.style.color = '#10b981';
      }
      AudioEngine.playSuccess();
      this.onShowToast(`🎉 ยอดเยี่ยม! รีเซ็ตค่า ${v.varName} เป็น ${v.targetVal} สำเร็จ`, 'success');
    } else {
      AudioEngine.playError();
      if (botFace) {
        botFace.textContent = '😵‍💫';
        setTimeout(() => { botFace.textContent = '🤖'; }, 1000);
      }
      this.onShowToast('ยังต่อบล็อกคำสั่งไม่สมบูรณ์ ตรวจสอบในพื้นที่ต่อ 🧩', 'error');
    }
  },

  handleL2Click() {
    const vIndex = GameState.levelStats[2].variant || 0;
    const res = GenericValidator.validate(2, vIndex);
    if (res.isValid) {
      const el = document.getElementById('sim-v2');
      let val = parseInt(el.textContent) || 0;
      val += 5;
      el.textContent = val;

      const coinFloat = document.getElementById('sim-coin-float');
      if (coinFloat) {
        coinFloat.textContent = '+5 🪙';
        coinFloat.style.opacity = '1';
        coinFloat.style.transform = 'translateY(-20px)';
        coinFloat.style.transition = 'all 0.5s ease-out';
        setTimeout(() => {
          coinFloat.style.opacity = '0';
          coinFloat.style.transform = 'translateY(0)';
        }, 600);
      }

      AudioEngine.playCoin();
      this.onShowToast('🪙 คำนวณสมการเพิ่มแต้มสำเร็จ! (+5 แต้ม)', 'success');
    } else {
      AudioEngine.playError();
      this.onShowToast('สมการยังไม่ถูกต้อง ตรวจสอบช่องต่อ Socket 🧩', 'error');
    }
  },

  handleL3Check(v) {
    const vIndex = GameState.levelStats[3].variant || 0;
    const res = GenericValidator.validate(3, vIndex);
    const inputVal = parseInt(document.getElementById('sim-input-3').value) || 0;
    const gradeEl = document.getElementById('sim-grade-3');
    const targetVal = parseInt(v.val);

    let isPass = false;
    if (v.op === '>=') isPass = inputVal >= targetVal;
    else if (v.op === '>') isPass = inputVal > targetVal;

    if (res.isValid) {
      gradeEl.textContent = isPass ? `🎉 ${v.passText} (PASS)` : `📝 ${v.failText} (FAIL)`;
      gradeEl.style.color = isPass ? '#34d399' : '#fb7185';
      gradeEl.style.background = isPass ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)';
      AudioEngine.playSuccess();
    } else {
      gradeEl.textContent = '⚠️ เกิดข้อผิดพลาด (ตรรกะมี Bug!)';
      gradeEl.style.color = '#f59e0b';
      gradeEl.style.background = '#0f172a';
      AudioEngine.playError();
      this.onShowToast('ตรรกะยังมี Bug อยู่! อย่าลืมเอาบล็อกผิดไปทิ้งถังขยะ 🗑️', 'error');
    }
  },

  handleL4Run() {
    const vIndex = GameState.levelStats[4].variant || 0;
    const res = GenericValidator.validate(4, vIndex);

    if (res.isValid) {
      let step = 1;
      const interval = setInterval(() => {
        const node = document.getElementById(`sn-${step}`);
        if (node) {
          node.style.background = '#10b981';
          node.style.color = 'white';
          AudioEngine.playCoin();
        }
        step++;
        if (step > 4) {
          clearInterval(interval);
          const rocket = document.getElementById('sim-rocket-icon');
          if (rocket) {
            rocket.style.transform = 'translateY(-25px) scale(1.3)';
            setTimeout(() => { rocket.style.transform = 'translateY(0) scale(1)'; }, 1000);
          }
          AudioEngine.playSuccess();
          this.onShowToast('🚀 ปล่อยจรวดสำเร็จครบทั้ง 4 ขั้นตอน!', 'success');
        }
      }, 350);
    } else {
      AudioEngine.playError();
      this.onShowToast('ลำดับขั้นตอนยังไม่ถูกต้อง ตรวจสอบหมายเลขขั้นตอน', 'error');
    }
  },

  handleL5Click() {
    const vIndex = GameState.levelStats[5].variant || 0;
    const res = GenericValidator.validate(5, vIndex);
    const cat = document.getElementById('sim-cat-face');
    const status = document.getElementById('sim-cat-status');

    if (res.isValid) {
      if (cat) {
        cat.textContent = '😸';
        cat.style.transform = 'scale(1.25) rotate(5deg)';
        setTimeout(() => {
          cat.textContent = '🐱';
          cat.style.transform = 'scale(1)';
        }, 600);
      }
      if (status) status.textContent = 'เหมียววว~ 🎵';
      AudioEngine.playMeow();
      this.onShowToast('🐱 เสียงแมวร้องเหมียวสำเร็จ!', 'success');
    } else {
      AudioEngine.playError();
      this.onShowToast('ยังไม่ได้ต่อบล็อกเสียง call Sound1.Play', 'error');
    }
  },

  handleL6Click() {
    const vIndex = GameState.levelStats[6].variant || 0;
    const res = GenericValidator.validate(6, vIndex);
    const cartList = document.getElementById('sim-cart-list');

    if (res.isValid) {
      const items = ['🍎 แอปเปิ้ล', '🥤 ชานม', '🍰 ขนมเค้ก', '🍇 องุ่น'];
      const randomItem = items[Math.floor(Math.random() * items.length)];

      if (cartList.innerHTML.includes('ว่างเปล่า')) {
        cartList.innerHTML = '';
      }

      const badge = document.createElement('span');
      badge.style.background = '#06b6d4';
      badge.style.color = 'white';
      badge.style.padding = '3px 8px';
      badge.style.borderRadius = '6px';
      badge.style.fontSize = '0.75rem';
      badge.style.fontWeight = '700';
      badge.textContent = randomItem;
      cartList.appendChild(badge);

      AudioEngine.playCoin();
      this.onShowToast(`🛒 เพิ่ม ${randomItem} ลงในตะกร้าสำเร็จ!`, 'success');
    } else {
      AudioEngine.playError();
      this.onShowToast('ยังต่อบล็อกจัดการ List ไม่ถูกต้อง', 'error');
    }
  },

  handleL7Click() {
    const vIndex = GameState.levelStats[7].variant || 0;
    const res = GenericValidator.validate(7, vIndex);
    const numEl = document.getElementById('sim-loop-num');
    const statusEl = document.getElementById('sim-loop-status');

    if (res.isValid) {
      let count = 1;
      const interval = setInterval(() => {
        if (numEl) numEl.textContent = count;
        if (statusEl) statusEl.textContent = `LOOPING: ROUND ${count}/5`;
        AudioEngine.playCoin();
        count++;
        if (count > 5) {
          clearInterval(interval);
          if (statusEl) statusEl.textContent = '✅ LOOP COMPLETE (1..5)';
          AudioEngine.playSuccess();
          this.onShowToast('⚡ รันลูปครบ 5 รอบสมบูรณ์!', 'success');
        }
      }, 250);
    } else {
      AudioEngine.playError();
      this.onShowToast('ลูปยังไม่สมบูรณ์ ตรวจสอบบล็อกเงื่อนไขการวนซ้ำ', 'error');
    }
  },

  handleL8Click() {
    const vIndex = GameState.levelStats[8].variant || 0;
    const res = GenericValidator.validate(8, vIndex);
    const jumper = document.getElementById('sim-jumper');

    if (res.isValid) {
      if (jumper) {
        jumper.style.transform = 'translateY(-35px) scale(1.2)';
        setTimeout(() => {
          jumper.style.transform = 'translateY(0) scale(1)';
        }, 400);
      }
      AudioEngine.playSuccess();
      this.onShowToast('🦘 ฟังก์ชัน SuperJump() ทำงานสำเร็จ!', 'success');
    } else {
      AudioEngine.playError();
      this.onShowToast('ฟังก์ชันยังไม่สมบูรณ์ ตรวจสอบการประกอบคำสั่ง Procedure', 'error');
    }
  }
};
