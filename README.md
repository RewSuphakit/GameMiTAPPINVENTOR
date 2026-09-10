# 🚀 App Inventor: The Code Breaker Mission (v3.0)

> เว็บแอปพลิเคชันเพื่อการฝึกทักษะการคิดเชิงคำนวณและเก็บรวบรวมข้อมูลงานวิจัยเชิงปริมาณ สำหรับนักเรียนระดับประกาศนียบัตรวิชาชีพ (ปวช. 2)

---

## 📂 โครงสร้างไฟล์โปรเจกต์ (Project Structure)

```
GameMiTAPPINVENTOR/
├── index.html                  # Shell หลักของเว็บแอป (HTML5 Semantic + PWA)
├── manifest.json               # Web App Manifest สำหรับติดตั้งลงหน้าจอมือถือ
├── sw.js                       # Service Worker แคชไฟล์สำหรับเล่นออฟไลน์ 100%
├── vite.config.js              # ค่าคอนฟิกสำหรับกรณีต้องการ build production
├── google_apps_script.js       # โค้ด Google Apps Script v3.0 ฝั่งรับข้อมูลวิจัย
├── css/
│   ├── reset.css               # Reset styles & Safe-area-insets
│   ├── tokens.css              # Design Tokens (สีบล็อก AI, Dark Mode, Typography)
│   ├── layout.css              # Header, 3 คอลัมน์, Phone Bezel, Action bar
│   ├── components.css          # Authentic Puzzle Blocks, Modals, Buttons, Toasts
│   ├── animations.css          # Snap ripple, Confetti, Shake penalty
│   └── responsive.css          # Breakpoints มือถือ (320-430px) และแท็บเล็ต/เดสก์ท็อป
├── js/
│   ├── main.js                 # Bootstrap Entry Point
│   ├── config.js               # ค่าคงที่ระบบทั้งหมด (Zero magic numbers)
│   ├── state.js                # State Management (Single source of truth + Pub/Sub)
│   ├── levels.data.js          # ข้อมูล 8 ด่าน + Variants + Hints 3 ระดับ
│   ├── blocks.data.js          # นิยามโครงสร้างและ HTML ของบล็อก MIT App Inventor
│   ├── dragEngine.js           # Pointer Events Engine (Mouse + Touch + Stylus)
│   ├── snapEngine.js           # Magnetic Snap & Ghost Preview
│   ├── validator.js            # Unified Central Validator
│   ├── simulator.js            # Phone Simulator Engine (เรนเดอร์หน้าจอมือถือจำลอง)
│   ├── gamification.js         # XP, 1-3 Stars, Streak, Badges, Mascot
│   ├── audio.js                # Web Audio API Synthesizer (เสียงในตัว ไม่พึ่งเน็ต)
│   ├── effects.js              # Canvas Confetti & Screen Shake
│   ├── ui.js                   # จัดการ View, Modals, Toasts, World Map
│   ├── dataCollector.js        # เก็บ Event Logs ละเอียด & บันทึกวิจัย
│   ├── sync.js                 # Offline Queue + Retry Backoff + Google Sheets
│   └── utils.js                # XSS Sanitizer, UUID, Time Formatter, Haptic Vibrate
└── tests/
    └── validator.test.js       # ชุดทดสอบอัตโนมัติ Vitest สำหรับ Validator & Engine
```

---

## 🛠️ วิธีการเปิดรัน (How to Run)

เนื่องจากโปรเจกต์ใช้ **Standard ES Modules (`type="module"`)** เบราว์เซอร์จำเป็นต้องเปิดผ่าน HTTP Server (ไม่ใช่ `file://`):

### วิธีที่ 1: ใช้ VS Code Live Server (ง่ายที่สุด)
1. เปิดโฟลเดอร์นี้ใน **VS Code**
2. ติดตั้ง Extension: **Live Server**
3. คลิกขวาที่ไฟล์ `index.html` แล้วเลือก **"Open with Live Server"**

### วิธีที่ 2: ใช้ Python Built-in Server
เปิด Terminal / PowerShell ในโฟลเดอร์นี้ แล้วพิมพ์:
```bash
python -m http.server 3000
```
จากนั้นเปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

### วิธีที่ 3: รันด้วย Vite (สำหรับ Production Build)
```bash
npm install vite --save-dev
npx vite
```

---

## ☁️ วิธีการตั้งค่า Google Sheets (Research Data Backend)

1. สร้าง Google Sheets ขึ้นมา 1 แผ่นใหม่
2. ไปที่แถบเมนู **"ส่วนขยาย" (Extensions) > "Apps Script"**
3. ลบโค้ดเริ่มต้นออก แล้วคัดลอกโค้ดจากไฟล์ `google_apps_script.js` ไปวางแทน
4. กด **บันทึก (Save 💾)**
5. กดปุ่ม **"ทำให้ใช้งานได้" (Deploy) > "รายการทำให้ใช้งานได้ใหม่" (New Deployment)**
   - **เลือกประเภท**: เว็บแอป (Web app)
   - **คำอธิบาย**: `App Inventor Code Breaker v3.0`
   - **ดำเนินการในฐานะ**: ฉัน (Me)
   - **ผู้ที่มีสิทธิ์เข้าถึง**: ทุกคน (Anyone)
6. กด **"ทำให้ใช้งานได้" (Deploy)** แล้วคัดลอก **Web App URL**
7. นำ URL ที่ได้ไปวางแทนค่า `DEFAULT_GSHEET_URL` ในไฟล์ `js/config.js`

---

## 🧩 วิธีการเพิ่มด่านใหม่ (Step-by-Step Guide)

การเพิ่มด่านใหม่ทำได้ง่ายดายโดยแก้ไขเพียงไฟล์เดียวคือ **`js/levels.data.js`** โดยไม่ต้องแตะต้องโค้ด Logic ใด ๆ:

### ขั้นตอน:
1. เปิดไฟล์ `js/levels.data.js`
2. เพิ่ม Key หมายเลขด่านถัดไป (เช่น ด่านที่ 9) ตาม Schema กลาง:

```javascript
9: {
  id: 9,
  modeName: "ภารกิจที่ 9: ฟังก์ชันคำนวณพื้นที่ (Procedures with Result)",
  modeIcon: "📐",
  points: 125,
  validationType: "cavity-has-correct",
  cavitySelector: "#l9-cavity",
  hints: [
    "ฟังก์ชันต้องการส่งค่าผลลัพธ์กลับ ให้สังเกตบล็อก 'result' สีม่วง",
    "โจทย์ต้องการนำกว้างคูณยาว (width * height)",
    "ลากบล็อกการคูณทางคณิตศาสตร์มาวางในช่อง Cavity ของ to calculateArea do"
  ],
  variants: [
    {
      title: "ภารกิจที่ 9: คำนวณพื้นที่สี่เหลี่ยมผืนผ้า (width * height)",
      desc: "<strong>🎯 โจทย์:</strong> สร้าง Procedure ชื่อ <code>calculateArea</code> ให้คำนวณและส่งกลับค่า <strong>get global width × get global height</strong>",
      decoyFeedback: "ระวังบล็อกการบวกหรือตัวแปรอื่นที่ไม่ใช่ width * height",
      rootHtml: `
        <div class="ai-c-block theme-call" id="l9-root" style="left:30px;top:30px;" data-block-kind="root">
          <div class="ai-c-header"><span class="mutator-gear">⚙</span><span>to</span><span class="ai-pill-dropdown">calculateArea ▼</span><span>result</span></div>
          <div class="ai-c-body"><div class="ai-c-spine"></div><div class="ai-c-cavity" id="l9-cavity"><span class="ai-placeholder">[ ลากบล็อกคำนวณมาต่อที่นี่ ]</span></div></div>
          <div class="ai-c-footer"></div>
        </div>`,
      toolboxBlocks: [
        `<div class="ai-block theme-math has-left-plug in-toolbox" data-block-kind="value" data-type="correct"><span>get width</span><span>×</span><span>get height</span></div>`,
        `<div class="ai-block theme-math has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>get width</span><span>+</span><span>get height</span></div>`,
        `<div class="ai-block theme-variable has-left-plug in-toolbox" data-block-kind="value" data-type="decoy" data-decoy="true"><span>get global score</span></div>`
      ]
    }
  ]
}
```

3. เปลี่ยนค่า `TOTAL_LEVELS` ใน `js/config.js` เป็น `9`
4. ระบบจะสร้างโหนดด่านที่ 9 ใน World Map และปรับตัวนับความก้าวหน้าโดยอัตโนมัติ!

---

## ✅ Checklist การทดสอบก่อนนำไปใช้จริงกับนักเรียน

- [ ] **การเปิดบนมือถือ (Mobile Test)**: ทดสอบเปิดผ่านเบราว์เซอร์ Chrome และ Safari บนสมาร์ตโฟน (ทดสอบทั้งแนวตั้งและแนวนอน)
- [ ] **การสลับแท็บมือถือ (Segmented View)**: กดสลับปุ่ม `[ 📦 กล่องบล็อก | 🧩 พื้นที่ต่อ | 📱 ตัวจำลอง ]` แผงทำงานแสดงผลถูกต้องและลื่นไหล
- [ ] **การลากวางและ Snap (Pointer Precision)**: ทดสอบหยิบบล็อก สังเกตว่านิ้วไม่บังรอยต่อ และมีแสง Ghost Preview เรืองแสงเมื่อเข้าใกล้ Socket
- [ ] **การทำงานของบล็อกลวง (Decoy Trap)**: เมื่อใส่บล็อกลวงแล้วกด "ตรวจคำตอบ" บล็อกจะต้องสั่นเตือน มีเสียง Buzzer และเด้งกลับคืนกล่องพร้อมหักแต้มโบนัส
- [ ] **การทิ้งถังขยะ (Trash Widget)**: ลากบล็อกที่มี Bug หรือบล็อกลวงไปปล่อยที่ถังขยะมุมขวาล่าง บล็อกจะต้องหายไปพร้อมเสียง Drop
- [ ] **การทำงานออฟไลน์ (Offline Mode)**: ปิด Wi-Fi หรือเปิดโหมดเครื่องบิน (Airplane Mode) แล้วรีเฟรชหน้าเว็บ แอปต้องยังเปิดเล่นต่อได้ตามปกติ
- [ ] **การเชื่อมโยงข้อมูล (Data Sync & Export)**: เมื่อทำครบ 8 ด่าน กดปุ่ม "ส่งออก CSV" และ "ส่งออก JSON" เพื่อตรวจสอบว่ามีข้อมูลครบถ้วน และข้อมูลใน Google Sheets ปรากฏครบทุกคอลัมน์
