/**
 * ==============================================================================
 * DATA-DRIVEN LEVELS CONFIGURATION (js/levels.data.js)
 * ==============================================================================
 * ข้อมูลโจทย์ทั้ง 8 ด่าน พร้อมระบบสุ่มคำถาม (Variants), คำใบ้ 3 ระดับ,
 * บล็อกลวง (Decoys), และโครงสร้าง Canvas Workspace
 */

export const LEVEL_SCHEMA = {
  // ----------------------------------------------------------------------------
  // ด่านที่ 1: Event & Variable Reset
  // ----------------------------------------------------------------------------
  1: {
    id: 1,
    modeName: "ภารกิจที่ 1: รีเซ็ตค่าตัวแปร (Event & Variable Reset)",
    modeIcon: "🧩",
    points: 125,
    validationType: "cavity-has-correct",
    cavitySelector: "#l1-cavity",
    hints: [
      "ลองดูบล็อกสีส้มในกล่องเครื่องมือ หมวด 'Variables' ที่ใช้กำหนดค่าตัวแปร",
      "โจทย์ต้องการคำสั่ง 'set global ... to' และต้องระบุค่าตัวเลขทางขวาให้ตรงกับที่โจทย์กำหนด",
      "ลากบล็อก 'set global [ตัวแปร] to [ค่า]' ไปวางในช่องว่าง (Cavity) ของบล็อกสีทอง when Click do"
    ],
    variants: [
      {
        varName: "score", targetVal: "0", btnName: "Button1",
        title: "ภารกิจที่ 1: รีเซ็ตค่าคะแนนเริ่มต้น (Reset Score)",
        desc: "<strong>🎯 ภารกิจ:</strong> เมื่อผู้ใช้กดปุ่ม Button1 (<code>when Button1.Click do</code>) ให้ทำการ<strong>กำหนดค่าตัวแปร score ให้เป็น 0</strong> เพื่อเริ่มต้นเล่นรอบใหม่ ✨ <em>(มองหาบล็อกสีส้ม set global score to 0 🧩)</em>",
        decoyFeedback: "บล็อกที่เลือกไม่ใช่การกำหนดค่าตัวแปร score ตามที่โจทย์ต้องการ",
        rootHtml: `
          <div class="ai-c-block theme-event" id="l1-root" style="left: 30px; top: 30px;" data-block-kind="root">
            <div class="ai-c-header"><span class="mutator-gear">⚙</span><span>when</span><span class="ai-pill-dropdown">Button1 ▼</span><span>.Click</span><span style="margin-left:auto;">do</span></div>
            <div class="ai-c-body"><div class="ai-c-spine"></div><div class="ai-c-cavity socket-glow-var" id="l1-cavity"><span class="ai-placeholder">🧩 👉 ต่อบล็อกสีส้ม 'set global...' ที่นี่ ✨</span></div></div>
            <div class="ai-c-footer"></div>
          </div>`,
        toolboxBlocks: [
          `<div class="ai-block theme-variable has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="correct"><span>set</span><span class="ai-pill-dropdown pill-var">global score <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-math has-left-plug in-socket" style="padding:2px 8px;margin-left:6px;font-size:0.82rem;">0</div></div>`,
          `<div class="ai-block theme-prop has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="decoy" data-decoy="true"><span>set</span><span class="ai-pill-dropdown pill-prop">Label1.Text <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-text has-left-plug in-socket" style="padding:2px 8px;margin-left:6px;font-size:0.82rem;">“เริ่มเกม”</div></div>`,
          `<div class="ai-block theme-call has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="decoy" data-decoy="true"><span>call</span><span class="ai-pill-dropdown">Notifier1.ShowAlert ▼</span></div>`,
          `<div class="ai-block theme-variable has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>get</span><span class="ai-pill-dropdown pill-var">global score <span class="dropdown-caret">▼</span></span></div>`
        ]
      },
      {
        varName: "lives", targetVal: "3", btnName: "btnStart",
        title: "ภารกิจที่ 1: กำหนดพลังชีวิตเริ่มต้น (Set Initial Lives)",
        desc: "<strong>🎯 ภารกิจ:</strong> เมื่อผู้ใช้กดปุ่ม btnStart (<code>when btnStart.Click do</code>) ให้โปรแกรม<strong>กำหนดค่าตัวแปรชีวิต lives ให้เป็น 3</strong> เพื่อเริ่มเกม ✨ <em>(มองหาบล็อกสีส้ม set global lives to 3 🧩)</em>",
        decoyFeedback: "บล็อกที่เลือกยังไม่ใช่การเซ็ตค่าชีวิต lives ให้เป็น 3",
        rootHtml: `
          <div class="ai-c-block theme-event" id="l1-root" style="left: 30px; top: 30px;" data-block-kind="root">
            <div class="ai-c-header"><span class="mutator-gear">⚙</span><span>when</span><span class="ai-pill-dropdown">btnStart ▼</span><span>.Click</span><span style="margin-left:auto;">do</span></div>
            <div class="ai-c-body"><div class="ai-c-spine"></div><div class="ai-c-cavity socket-glow-var" id="l1-cavity"><span class="ai-placeholder">🧩 👉 ต่อบล็อกสีส้ม 'set global...' ที่นี่ ✨</span></div></div>
            <div class="ai-c-footer"></div>
          </div>`,
        toolboxBlocks: [
          `<div class="ai-block theme-variable has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="correct"><span>set</span><span class="ai-pill-dropdown pill-var">global lives <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-math has-left-plug in-socket" style="padding:2px 8px;margin-left:6px;font-size:0.82rem;">3</div></div>`,
          `<div class="ai-block theme-variable has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="decoy" data-decoy="true"><span>set</span><span class="ai-pill-dropdown pill-var">global score <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-math has-left-plug in-socket" style="padding:2px 8px;margin-left:6px;font-size:0.82rem;">0</div></div>`,
          `<div class="ai-block theme-prop has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="decoy" data-decoy="true"><span>set</span><span class="ai-pill-dropdown pill-prop">lblLives.Text <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-text has-left-plug in-socket" style="padding:2px 8px;margin-left:6px;font-size:0.82rem;">“3”</div></div>`,
          `<div class="ai-block theme-variable has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>get</span><span class="ai-pill-dropdown pill-var">global lives <span class="dropdown-caret">▼</span></span></div>`
        ]
      },
      {
        varName: "total", targetVal: "0", btnName: "btnClear",
        title: "ภารกิจที่ 1: ล้างค่ายอดรวมสะสม (Clear Total)",
        desc: "<strong>🎯 ภารกิจ:</strong> เมื่อผู้ใช้กดปุ่ม btnClear (<code>when btnClear.Click do</code>) ให้โปรแกรม<strong>กำหนดค่าตัวแปร total ให้เป็น 0</strong> เพื่อเคลียร์ค่าคำนวณใหม่ ✨ <em>(มองหาบล็อกสีส้ม set global total to 0 🧩)</em>",
        decoyFeedback: "คำสั่งที่เลือกไม่ใช่การรีเซ็ตตัวแปร total เป็น 0",
        rootHtml: `
          <div class="ai-c-block theme-event" id="l1-root" style="left: 30px; top: 30px;" data-block-kind="root">
            <div class="ai-c-header"><span class="mutator-gear">⚙</span><span>when</span><span class="ai-pill-dropdown">btnClear ▼</span><span>.Click</span><span style="margin-left:auto;">do</span></div>
            <div class="ai-c-body"><div class="ai-c-spine"></div><div class="ai-c-cavity socket-glow-var" id="l1-cavity"><span class="ai-placeholder">🧩 👉 ต่อบล็อกสีส้ม 'set global...' ที่นี่ ✨</span></div></div>
            <div class="ai-c-footer"></div>
          </div>`,
        toolboxBlocks: [
          `<div class="ai-block theme-variable has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="correct"><span>set</span><span class="ai-pill-dropdown pill-var">global total <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-math has-left-plug in-socket" style="padding:2px 8px;margin-left:6px;font-size:0.82rem;">0</div></div>`,
          `<div class="ai-block theme-call has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="decoy" data-decoy="true"><span>call</span><span class="ai-pill-dropdown">Notifier1.ShowAlert ▼</span></div>`,
          `<div class="ai-block theme-variable has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="decoy" data-decoy="true"><span>set</span><span class="ai-pill-dropdown pill-var">global total <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-math has-left-plug in-socket" style="padding:2px 8px;margin-left:6px;font-size:0.82rem;">100</div></div>`,
          `<div class="ai-block theme-variable has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>get</span><span class="ai-pill-dropdown pill-var">global total <span class="dropdown-caret">▼</span></span></div>`
        ]
      }
    ]
  },

  // ----------------------------------------------------------------------------
  // ด่านที่ 2: Math Expression Sockets
  // ----------------------------------------------------------------------------
  2: {
    id: 2,
    modeName: "ภารกิจที่ 2: สมการทางคณิตศาสตร์ (Math Expression)",
    modeIcon: "🧮",
    points: 125,
    validationType: "sockets-match",
    socket1: "#l2-s1",
    socket2: "#l2-s2",
    type1: "c1",
    type2: "c2",
    hints: [
      "สังเกตเครื่องหมายคณิตศาสตร์ (+ หรือ -) ทางซ้ายคือตัวแปรเดิม ทางขวาคือจำนวนที่เปลี่ยนแปลง",
      "ช่อง Socket [ 1 ] ต้องใส่บล็อก 'get global ...' และช่อง [ 2 ] ต้องใส่บล็อกตัวเลข Math สีน้ำเงิน",
      "ลากบล็อก 'get global [ตัวแปร]' ใส่ช่อง [ 1 ] และบล็อกตัวเลข [ค่า] ใส่ช่อง [ 2 ] ให้ครบทั้งสองข้าง"
    ],
    variants: [
      {
        title: "ภารกิจที่ 2: ถอดรหัสสมการคะแนน (+5)",
        desc: "<strong>🎯 ภารกิจ:</strong> ผู้เล่นทำคะแนนได้! ต้องการเพิ่มแต้มสะสมทีละ 5 โดยกำหนดให้ <strong>global score = global score + 5</strong> ✨ <em>(ลากตัวแปรสีส้มใส่ช่องซ้าย [ 🟠 ] และตัวเลข 5 สีน้ำเงินใส่ช่องขวา [ 🔵 ])</em>",
        decoyFeedback: "ระวังบล็อกข้อความ String และตัวแปรอื่นที่ไม่เกี่ยวข้องกับสมการนี้",
        rootHtml: `
          <div class="ai-block theme-variable has-top-notch has-bottom-tab" id="l2-root" style="left:30px;top:40px;padding:12px 16px;" data-block-kind="root">
            <span>set</span><span class="ai-pill-dropdown pill-var">global score <span class="dropdown-caret">▼</span></span><span>to</span>
            <div class="ai-block theme-math has-left-plug in-socket" style="margin-left:10px;padding:6px 10px;">
              <div class="ai-socket socket-glow-var" id="l2-s1" data-accept="c1"><span class="ai-placeholder">🧩 [ 🟠 ตัวแปร ]</span></div>
              <span style="font-size:1.1rem;font-weight:800;margin:0 4px;">+</span>
              <div class="ai-socket socket-glow-math" id="l2-s2" data-accept="c2"><span class="ai-placeholder">🧩 [ 🔵 ตัวเลข ]</span></div>
            </div>
          </div>`,
        toolboxBlocks: [
          `<div class="ai-block theme-variable has-left-plug in-toolbox" data-block-kind="value" data-type="c1"><span>get</span><span class="ai-pill-dropdown pill-var">global score <span class="dropdown-caret">▼</span></span></div>`,
          `<div class="ai-block theme-math has-left-plug in-toolbox" data-block-kind="value" data-type="c2"><span>5</span></div>`,
          `<div class="ai-block theme-text has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>“5”</span></div>`,
          `<div class="ai-block theme-math has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>10</span></div>`,
          `<div class="ai-block theme-variable has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>get</span><span class="ai-pill-dropdown pill-var">global counter <span class="dropdown-caret">▼</span></span></div>`
        ]
      },
      {
        title: "ภารกิจที่ 2: ถอดรหัสสมการเร่งความเร็ว (+10)",
        desc: "<strong>🎯 ภารกิจ:</strong> รถแข่งกดไนตรัส! ต้องการเร่งความเร็วทีละ 10 โดยกำหนดให้ <strong>global speed = global speed + 10</strong> ✨ <em>(ลากตัวแปรสีส้มใส่ช่องซ้าย [ 🟠 ] และตัวเลข 10 สีน้ำเงินใส่ช่องขวา [ 🔵 ])</em>",
        decoyFeedback: "บล็อกที่ใส่ยังไม่ใช่ speed + 10 ให้ตรวจดูชนิดบล็อกและค่าตัวเลข",
        rootHtml: `
          <div class="ai-block theme-variable has-top-notch has-bottom-tab" id="l2-root" style="left:30px;top:40px;padding:12px 16px;" data-block-kind="root">
            <span>set</span><span class="ai-pill-dropdown pill-var">global speed <span class="dropdown-caret">▼</span></span><span>to</span>
            <div class="ai-block theme-math has-left-plug in-socket" style="margin-left:10px;padding:6px 10px;">
              <div class="ai-socket socket-glow-var" id="l2-s1" data-accept="c1"><span class="ai-placeholder">🧩 [ 🟠 ตัวแปร ]</span></div>
              <span style="font-size:1.1rem;font-weight:800;margin:0 4px;">+</span>
              <div class="ai-socket socket-glow-math" id="l2-s2" data-accept="c2"><span class="ai-placeholder">🧩 [ 🔵 ตัวเลข ]</span></div>
            </div>
          </div>`,
        toolboxBlocks: [
          `<div class="ai-block theme-variable has-left-plug in-toolbox" data-block-kind="value" data-type="c1"><span>get</span><span class="ai-pill-dropdown pill-var">global speed <span class="dropdown-caret">▼</span></span></div>`,
          `<div class="ai-block theme-math has-left-plug in-toolbox" data-block-kind="value" data-type="c2"><span>10</span></div>`,
          `<div class="ai-block theme-text has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>“10”</span></div>`,
          `<div class="ai-block theme-math has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>20</span></div>`,
          `<div class="ai-block theme-variable has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>get</span><span class="ai-pill-dropdown pill-var">global score <span class="dropdown-caret">▼</span></span></div>`
        ]
      }
    ]
  },

  // ----------------------------------------------------------------------------
  // ด่านที่ 3: Conditional Logic (Debug & Replace)
  // ----------------------------------------------------------------------------
  3: {
    id: 3,
    modeName: "ภารกิจที่ 3: ดีบักตรรกะเงื่อนไข (Conditional Debug)",
    modeIcon: "🔍",
    points: 125,
    validationType: "debug-replace",
    socketSelector: "#l3-sock",
    hints: [
      "บล็อกที่มีเส้นขอบสีแดงกระพริบคือบล็อกที่มี Bug ให้ลากลงถังขยะ 🗑️ ทางขวาล่าง",
      "ดูเงื่อนไขเปรียบเทียบในโจทย์ให้ดีว่าต้องใช้เครื่องหมายใด (เช่น >= หรือ >) กับค่าตัวเลขใด",
      "ทิ้งบล็อก Bug ลงถังขยะ แล้วนำบล็อกเงื่อนไขสีเขียวที่มีข้อความตรงตามโจทย์มา Snap ใส่แทน"
    ],
    variants: [
      {
        field: "txtScore.Text", op: ">=", val: "50", passText: "ผ่านเกณฑ์", failText: "ไม่ผ่านเกณฑ์",
        title: "ภารกิจที่ 3: แก้ไขตรรกะระบบตัดเกรด (Score >= 50)",
        desc: "<strong>🎯 ภารกิจ:</strong> ระบบตัดเกรดมี Bug! 🐞 เกณฑ์ที่ถูกต้องคือ <strong>ถ้าคะแนนมากกว่าหรือเท่ากับ 50 (txtScore.Text &gt;= 50) ให้ 'ผ่านเกณฑ์'</strong> ✨ <em>(ลากบล็อกสีแดงมี Bug ไปทิ้งถังขยะ 🗑️ แล้วนำบล็อกเงื่อนไข &gt;= 50 มาต่อแทน)</em>",
        decoyFeedback: "บล็อกเงื่อนไขที่เลือกยังไม่ตรงกับ txtScore.Text >= 50",
        rootHtml: `
          <div class="ai-c-block theme-control" id="l3-root" style="left:30px;top:20px;min-width:320px;" data-block-kind="root">
            <div class="ai-c-header" style="background:var(--ai-control);"><span class="mutator-gear">⚙</span><span>if</span>
              <div class="ai-socket filled socket-glow-logic" id="l3-sock" style="min-width:140px;">
                <span class="ai-placeholder" style="display:none;">🧩 [ 🟢 ต่อเงื่อนไข &gt;= 50 ]</span>
                <div class="ai-block theme-math has-left-plug in-socket buggy-block" id="l3-buggy" data-block-kind="value" data-type="buggy">
                  <span>txtScore.Text</span><span class="ai-pill-dropdown pill-op">&lt; <span class="dropdown-caret">▼</span></span><span>50</span>
                </div>
              </div><span style="margin-left:auto;">then</span>
            </div>
            <div class="ai-c-body"><div class="ai-c-spine" style="background:var(--ai-control);"></div><div class="ai-c-cavity filled"><div class="ai-block theme-prop has-top-notch has-bottom-tab in-cavity"><span>set</span><span class="ai-pill-dropdown pill-prop">lblResult.Text <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-text has-left-plug in-socket" style="margin-left:6px;padding:2px 8px;">“ผ่านเกณฑ์”</div></div></div></div>
            <div class="ai-c-header" style="background:var(--ai-control);border-top:1px solid rgba(0,0,0,0.1);"><span>else</span></div>
            <div class="ai-c-body"><div class="ai-c-spine" style="background:var(--ai-control);"></div><div class="ai-c-cavity filled"><div class="ai-block theme-prop has-top-notch has-bottom-tab in-cavity"><span>set</span><span class="ai-pill-dropdown pill-prop">lblResult.Text <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-text has-left-plug in-socket" style="margin-left:6px;padding:2px 8px;">“ไม่ผ่านเกณฑ์”</div></div></div></div>
            <div class="ai-c-footer" style="background:var(--ai-control);"></div>
          </div>`,
        toolboxBlocks: [
          `<div class="ai-block theme-math has-left-plug in-toolbox" data-block-kind="value" data-type="correct"><span>txtScore.Text</span><span class="ai-pill-dropdown pill-op">&gt;= <span class="dropdown-caret">▼</span></span><span>50</span></div>`,
          `<div class="ai-block theme-logic has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>txtScore.Text</span><span class="ai-pill-dropdown">= ▼</span><span>“50”</span></div>`,
          `<div class="ai-block theme-math has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>txtScore.Text</span><span class="ai-pill-dropdown pill-op">&gt; <span class="dropdown-caret">▼</span></span><span>80</span></div>`
        ]
      }
    ]
  },

  // ----------------------------------------------------------------------------
  // ด่านที่ 4: Workflow Sequence (Stacking)
  // ----------------------------------------------------------------------------
  4: {
    id: 4,
    modeName: "ภารกิจที่ 4: ลำดับขั้นตอนการทำงาน (Workflow Pipeline)",
    modeIcon: "⚡",
    points: 125,
    validationType: "sequence-order",
    slotPrefix: "l4-slot-",
    slotCount: 4,
    hints: [
      "คิดถึงลำดับขั้นตอนจริง: ขั้นเตรียมการ (Init) -> คำนวณ (Process) -> แสดงผล (Output) -> แจ้งเตือน (Alert)",
      "บล็อกคำสั่งที่มีคำว่า initialize หรือ set ค่าเริ่มต้นจะต้องอยู่ในช่องที่ 1 เสมอ",
      "เรียงบล็อก 4 ขั้นตามลำดับจากบนลงล่างตามที่โจทย์ระบุไว้ในคำอธิบาย"
    ],
    variants: [
      {
        correctSequence: ['s4-init', 's4-calc', 's4-label', 's4-alert'],
        title: "ภารกิจที่ 4: ลำดับขั้นตอนคำนวณคะแนนสะสม (4 ขั้น)",
        desc: "<strong>🎯 ภารกิจ:</strong> จัดเรียงบล็อกคำสั่งตามลำดับการทำงาน 4 ขั้นตอน: <strong>(1) กำหนดตัวแปรเริ่มต้น ➔ (2) คำนวณบวกเพิ่ม ➔ (3) แสดงผลที่ Label ➔ (4) แจ้งเตือน Notifier</strong> ✨",
        rootHtml: `
          <div style="position:absolute;left:30px;top:20px;display:flex;flex-direction:column;gap:6px;width:380px;">
            <div style="font-size:0.75rem;font-weight:700;color:var(--color-primary);">▼ จัดเรียงขั้นตอน 1 - 4 ที่ช่องด้านล่างนี้:</div>
            <div class="ai-stack-slot socket-glow-var" id="l4-slot-1"><span class="ai-placeholder">🧩 [ 1. กำหนดค่าเริ่มต้นตัวแปร 🟠 ]</span></div>
            <div class="ai-stack-slot socket-glow-math" id="l4-slot-2"><span class="ai-placeholder">🧩 [ 2. คำนวณบวกเพิ่ม 🔵 ]</span></div>
            <div class="ai-stack-slot socket-glow-text" id="l4-slot-3"><span class="ai-placeholder">🧩 [ 3. แสดงผลที่ข้อความ Label 🟢 ]</span></div>
            <div class="ai-stack-slot socket-glow-call" id="l4-slot-4"><span class="ai-placeholder">🧩 [ 4. แจ้งเตือนผ่าน Notifier 🟣 ]</span></div>
          </div>`,
        toolboxBlocks: [
          `<div class="ai-block theme-call has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-step="s4-alert"><span>call</span><span class="ai-pill-dropdown">Notifier1.ShowAlert ▼</span><div class="ai-block theme-text has-left-plug in-socket" style="padding:2px 6px;font-size:0.8rem;margin-left:6px;">“บันทึกสำเร็จ!”</div></div>`,
          `<div class="ai-block theme-variable has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-step="s4-init"><span>initialize global</span><span class="ai-pill-dropdown">totalScore ▼</span><span>to</span><div class="ai-block theme-math has-left-plug in-socket" style="margin-left:6px;padding:2px 8px;">0</div></div>`,
          `<div class="ai-block theme-prop has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-step="s4-label"><span>set</span><span class="ai-pill-dropdown pill-prop">lblDisplay.Text <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-variable has-left-plug in-socket" style="margin-left:6px;padding:2px 8px;">get global totalScore</div></div>`,
          `<div class="ai-block theme-variable has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-step="s4-calc"><span>set</span><span class="ai-pill-dropdown pill-var">global totalScore <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-math has-left-plug in-socket" style="margin-left:6px;padding:2px 8px;"><span>totalScore + 10</span></div></div>`
        ]
      }
    ]
  },

  // ----------------------------------------------------------------------------
  // ด่านที่ 5: Screen Initialize Event
  // ----------------------------------------------------------------------------
  5: {
    id: 5,
    modeName: "ภารกิจที่ 5: อีเวนต์เริ่มต้นหน้าจอ (Screen Initialize)",
    modeIcon: "📱",
    points: 125,
    validationType: "cavity-has-correct",
    cavitySelector: "#l5-cavity",
    hints: [
      "บล็อกทอง 'when Screen1.Initialize do' ใช้เตรียมค่าเริ่มต้นเมื่อเริ่มแอป",
      "เลือกบล็อกคำสั่ง 'set global ... to' ที่มีชื่อตัวแปรและค่าตรงตามโจทย์",
      "ลากบล็อกคำสั่งที่ถูกต้องใส่ลงใน Cavity ของ Screen1.Initialize"
    ],
    variants: [
      {
        varName: "counter", targetVal: "1",
        title: "ภารกิจที่ 5: กำหนดค่าเริ่มต้นตัวนับรอบ (counter = 1)",
        desc: "<strong>🎯 ภารกิจ:</strong> เมื่อเปิดหน้าจอแอปพลิเคชันขึ้นมาครั้งแรก (<code>when Screen1.Initialize do</code>) ให้โปรแกรม<strong>กำหนดค่าตัวแปร counter มีค่าเริ่มต้นเป็น 1</strong> ✨ <em>(มองหาบล็อกสีส้ม set global counter to 1 🧩)</em>",
        decoyFeedback: "ตรวจดูค่าตัวเลขให้ดี counter ต้องเริ่มต้นที่ 1 ไม่ใช่ 0",
        rootHtml: `
          <div class="ai-c-block theme-event" id="l5-root" style="left:30px;top:30px;" data-block-kind="root">
            <div class="ai-c-header"><span class="mutator-gear">⚙</span><span>when</span><span class="ai-pill-dropdown">Screen1 ▼</span><span>.Initialize</span><span style="margin-left:auto;">do</span></div>
            <div class="ai-c-body"><div class="ai-c-spine"></div><div class="ai-c-cavity socket-glow-var" id="l5-cavity"><span class="ai-placeholder">🧩 👉 ต่อบล็อกสีส้ม 'set global...' ที่นี่ ✨</span></div></div>
            <div class="ai-c-footer"></div>
          </div>`,
        toolboxBlocks: [
          `<div class="ai-block theme-variable has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="correct"><span>set</span><span class="ai-pill-dropdown pill-var">global counter <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-math has-left-plug in-socket" style="padding:2px 8px;margin-left:6px;font-size:0.82rem;">1</div></div>`,
          `<div class="ai-block theme-variable has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="decoy" data-decoy="true"><span>set</span><span class="ai-pill-dropdown pill-var">global counter <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-math has-left-plug in-socket" style="padding:2px 8px;margin-left:6px;font-size:0.82rem;">0</div></div>`,
          `<div class="ai-block theme-prop has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="decoy" data-decoy="true"><span>set</span><span class="ai-pill-dropdown pill-prop">Label1.Text <span class="dropdown-caret">▼</span></span><span>to</span><div class="ai-block theme-text has-left-plug in-socket" style="padding:2px 8px;margin-left:6px;font-size:0.82rem;">“1”</div></div>`,
          `<div class="ai-block theme-variable has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>get</span><span class="ai-pill-dropdown pill-var">global counter <span class="dropdown-caret">▼</span></span></div>`
        ]
      }
    ]
  },

  // ----------------------------------------------------------------------------
  // ด่านที่ 6: Text Concatenation (Join)
  // ----------------------------------------------------------------------------
  6: {
    id: 6,
    modeName: "ภารกิจที่ 6: การเชื่อมต่อข้อความ (Text Join)",
    modeIcon: "🔤",
    points: 125,
    validationType: "sockets-match",
    socket1: "#l6-s1",
    socket2: "#l6-s2",
    type1: "c1",
    type2: "c2",
    hints: [
      "คำสั่ง 'join' ใช้เชื่อมข้อความ 2 ชิ้นเข้าด้วยกันเป็นข้อความเดียว",
      "ช่องแรก [ 1 ] ต้องเป็นบล็อกข้อความสีชมพู และช่องที่สอง [ 2 ] คือบล็อกดึงค่าตัวแปร 'get global ...'",
      "ลากบล็อกข้อความใส่ช่อง [ 1 ] และบล็อกตัวแปรสีส้มใส่ช่อง [ 2 ] ให้ครบทั้งคู่"
    ],
    variants: [
      {
        title: "ภารกิจที่ 6: เชื่อมข้อความแสดงผลคะแนน (join)",
        desc: "<strong>🎯 ภารกิจ:</strong> นำข้อความ <strong>'คะแนน: '</strong> มาเชื่อมต่อกับค่าของตัวแปร <strong>global score</strong> โดยใช้บล็อก join ✨ <em>(ลากบล็อกข้อความสีชมพูใส่ช่อง [ 1 ] และตัวแปรสีส้มใส่ช่อง [ 2 ])</em>",
        decoyFeedback: "ระวังการสลับตำแหน่ง ช่องแรกต้องเป็นข้อความ 'คะแนน: ' ช่องที่สองต้องเป็นค่าตัวแปร",
        rootHtml: `
          <div class="ai-block theme-prop has-top-notch has-bottom-tab" id="l6-root" style="left:30px;top:40px;padding:12px 16px;" data-block-kind="root">
            <span>set</span><span class="ai-pill-dropdown pill-prop">lblScore.Text <span class="dropdown-caret">▼</span></span><span>to</span>
            <div class="ai-block theme-text has-left-plug in-socket" style="margin-left:10px;padding:6px 10px;">
              <span>join</span>
              <div class="ai-socket socket-glow-text" id="l6-s1" data-accept="c1"><span class="ai-placeholder">🧩 [ 1. 🟣 ข้อความ ]</span></div>
              <div class="ai-socket socket-glow-var" id="l6-s2" data-accept="c2"><span class="ai-placeholder">🧩 [ 2. 🟠 ตัวแปร ]</span></div>
            </div>
          </div>`,
        toolboxBlocks: [
          `<div class="ai-block theme-text has-left-plug in-toolbox" data-block-kind="value" data-type="c1"><span>“คะแนน: ”</span></div>`,
          `<div class="ai-block theme-variable has-left-plug in-toolbox" data-block-kind="value" data-type="c2"><span>get</span><span class="ai-pill-dropdown pill-var">global score <span class="dropdown-caret">▼</span></span></div>`,
          `<div class="ai-block theme-text has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>“เวลา: ”</span></div>`,
          `<div class="ai-block theme-math has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>100</span></div>`
        ]
      }
    ]
  },

  // ----------------------------------------------------------------------------
  // ด่านที่ 7: List Operations & Conditions
  // ----------------------------------------------------------------------------
  7: {
    id: 7,
    modeName: "ภารกิจที่ 7: โครงสร้างข้อมูลแบบรายการ (List Logic)",
    modeIcon: "📋",
    points: 125,
    validationType: "cavity-has-correct",
    cavitySelector: "#l7-cavity",
    hints: [
      "คำสั่ง 'is list empty?' หรือ 'length of list' ใช้ตรวจสอบว่าในรายการมีข้อมูลอยู่หรือไม่",
      "เลือกบล็อกเงื่อนไขเปรียบเทียบขนาดของ List ที่มากกว่า 0 เพื่อตรวจสอบว่ามีไอเทมในคลัง",
      "ลากบล็อกที่ถูกต้องมาใส่ใน Cavity ของ if...then"
    ],
    variants: [
      {
        title: "ภารกิจที่ 7: ตรวจสอบจำนวนไอเทมในกระเป๋า (length of list > 0)",
        desc: "<strong>🎯 ภารกิจ:</strong> ตรวจสอบว่าในกระเป๋าเก็บไอเทม (<code>inventoryList</code>) มีของอยู่หรือไม่ โดยใช้เงื่อนไข <strong>length of list (inventoryList) &gt; 0</strong> ✨",
        decoyFeedback: "บล็อกที่เลือกยังไม่ใช่การเช็ค length of list > 0",
        rootHtml: `
          <div class="ai-c-block theme-control" id="l7-root" style="left:30px;top:30px;" data-block-kind="root">
            <div class="ai-c-header"><span class="mutator-gear">⚙</span><span>if</span><span style="margin-left:auto;">then</span></div>
            <div class="ai-c-body"><div class="ai-c-spine"></div><div class="ai-c-cavity socket-glow-logic" id="l7-cavity"><span class="ai-placeholder">🧩 👉 ต่อบล็อกเงื่อนไข 'length of list > 0' ที่นี่ ✨</span></div></div>
            <div class="ai-c-footer"></div>
          </div>`,
        toolboxBlocks: [
          `<div class="ai-block theme-logic has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="correct"><span>length of list</span><span class="ai-pill-dropdown">get inventoryList ▼</span><span>&gt; 0</span></div>`,
          `<div class="ai-block theme-logic has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="decoy" data-decoy="true"><span>is list empty?</span><span class="ai-pill-dropdown">get inventoryList ▼</span></div>`,
          `<div class="ai-block theme-math has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-type="decoy" data-decoy="true"><span>get inventoryList</span><span>= 0</span></div>`
        ]
      }
    ]
  },

  // ----------------------------------------------------------------------------
  // ด่านที่ 8: Quantum Pipeline (5-Step Comprehensive Mission)
  // ----------------------------------------------------------------------------
  8: {
    id: 8,
    modeName: "ภารกิจที่ 8: ไปป์ไลน์ประมวลผลขั้นสูง (Quantum 5-Stage Pipeline)",
    modeIcon: "🏆",
    points: 125,
    validationType: "sequence-order",
    slotPrefix: "l8-slot-",
    slotCount: 5,
    hints: [
      "ลำดับ 5 ขั้น: 1. ตรวจสอบข้อมูลนำเข้า -> 2. แปลงเป็นตัวเลข -> 3. ประเมินเงื่อนไข -> 4. แสดงผลลัพธ์ -> 5. แจ้งเตือนเสร็จสิ้น",
      "การ Validate หรือตรวจสอบค่าว่างต้องเริ่มเป็นขั้นตอนแรกเสมอ",
      "การแจ้งเตือน Alert และเล่นเสียงต้องอยู่ขั้นตอนสุดท้ายเสมอ"
    ],
    variants: [
      {
        correctSequence: ['s8-valid', 's8-parse', 's8-eval', 's8-disp', 's8-alert'],
        title: "ภารกิจที่ 8: ถอดรหัสระบบคำนวณขั้นสูง 5 ขั้นตอนสมบูรณ์",
        desc: "<strong>🎯 ภารกิจใหญ่:</strong> จัดเรียงขั้นตอนการประมวลผลระบบโปรแกรม 5 ขั้น: <strong>(1) ตรวจสอบความถูกต้อง ➔ (2) แปลงค่าตัวเลข ➔ (3) คำนวณตรรกะ ➔ (4) แสดงผลที่หน้าจอ ➔ (5) แจ้งเตือนผู้ใช้</strong> ✨",
        rootHtml: `
          <div style="position:absolute;left:25px;top:15px;display:flex;flex-direction:column;gap:5px;width:390px;">
            <div style="font-size:0.75rem;font-weight:700;color:var(--color-primary);">▼ ลำดับขั้นตอน Pipeline ทั้ง 5 Node:</div>
            <div class="ai-stack-slot socket-glow-logic" id="l8-slot-1"><span class="ai-placeholder">🧩 [ 1. ตรวจสอบข้อมูลนำเข้า (Validate) 🟢 ]</span></div>
            <div class="ai-stack-slot socket-glow-var" id="l8-slot-2"><span class="ai-placeholder">🧩 [ 2. แปลงเป็นตัวเลข (Parse) 🟠 ]</span></div>
            <div class="ai-stack-slot socket-glow-math" id="l8-slot-3"><span class="ai-placeholder">🧩 [ 3. ประเมินตรรกะคูณสอง (Evaluate) 🔵 ]</span></div>
            <div class="ai-stack-slot socket-glow-text" id="l8-slot-4"><span class="ai-placeholder">🧩 [ 4. แสดงผลลัพธ์ที่ Label (Display) 🟢 ]</span></div>
            <div class="ai-stack-slot socket-glow-call" id="l8-slot-5"><span class="ai-placeholder">🧩 [ 5. ส่งเสียงและข้อความแจ้งเตือน (Alert) 🟣 ]</span></div>
          </div>`,
        toolboxBlocks: [
          `<div class="ai-block theme-call has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-step="s8-alert"><span>call</span><span class="ai-pill-dropdown">Notifier1.ShowAlert ▼</span><span>(ประมวลผลสำเร็จ)</span></div>`,
          `<div class="ai-block theme-control has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-step="s8-valid"><span>if</span><span>txtInput.Text ≠ ""</span><span>then continue</span></div>`,
          `<div class="ai-block theme-prop has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-step="s8-disp"><span>set</span><span class="ai-pill-dropdown pill-prop">lblResult.Text <span class="dropdown-caret">▼</span></span><span>to</span><span>result</span></div>`,
          `<div class="ai-block theme-math has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-step="s8-eval"><span>set result to</span><span>inputNumber * 2</span></div>`,
          `<div class="ai-block theme-variable has-top-notch has-bottom-tab in-toolbox" data-block-kind="statement" data-step="s8-parse"><span>set inputNumber to</span><span>txtInput.Text as Number</span></div>`
        ]
      }
    ]
  }
};
