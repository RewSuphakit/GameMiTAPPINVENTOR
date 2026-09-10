/**
 * ==============================================================================
 * BLOCK TEMPLATES & DEFINITIONS (js/blocks.data.js)
 * ==============================================================================
 * นิยามหน้าตาและโครงสร้าง HTML ของบล็อก MIT App Inventor แท้
 */

export const BlockTemplates = {
  /**
   * บล็อกกำหนดค่าตัวแปร: set global [var] to [value]
   */
  setVariable(varName, valueHtml, isDecoy = false, type = 'correct') {
    const decoyAttr = isDecoy ? 'data-decoy="true"' : '';
    return `
      <div class="ai-block theme-variable has-top-notch has-bottom-tab in-toolbox" 
           data-block-kind="statement" data-type="${type}" ${decoyAttr}>
        <span>set</span>
        <span class="ai-pill-dropdown pill-var">global ${varName} <span class="dropdown-caret">▼</span></span>
        <span>to</span>
        ${valueHtml}
      </div>`;
  },

  /**
   * บล็อกดึงค่าตัวแปร: get global [var]
   */
  getVariable(varName, isDecoy = false, type = 'value') {
    const decoyAttr = isDecoy ? 'data-decoy="true"' : '';
    return `
      <div class="ai-block theme-variable has-left-plug in-toolbox" 
           data-block-kind="value" data-type="${type}" ${decoyAttr}>
        <span>get</span>
        <span class="ai-pill-dropdown pill-var">global ${varName} <span class="dropdown-caret">▼</span></span>
      </div>`;
  },

  /**
   * บล็อกตัวเลขทางคณิตศาสตร์ (Math Number)
   */
  mathNumber(num, isDecoy = false, type = 'value') {
    const decoyAttr = isDecoy ? 'data-decoy="true"' : '';
    return `
      <div class="ai-block theme-math has-left-plug in-toolbox" 
           data-block-kind="value" data-type="${type}" ${decoyAttr}
           style="padding: 2px 10px;">
        <span>${num}</span>
      </div>`;
  },

  /**
   * บล็อกข้อความ String: "text"
   */
  textString(text, isDecoy = false, type = 'value') {
    const decoyAttr = isDecoy ? 'data-decoy="true"' : '';
    return `
      <div class="ai-block theme-text has-left-plug in-toolbox" 
           data-block-kind="value" data-type="${type}" ${decoyAttr}>
        <span>“${text}”</span>
      </div>`;
  },

  /**
   * บล็อกเงื่อนไขเปรียบเทียบ: [field] [operator] [value]
   */
  compareCondition(field, op, val, isDecoy = false, type = 'value') {
    const decoyAttr = isDecoy ? 'data-decoy="true"' : '';
    return `
      <div class="ai-block theme-math has-left-plug in-toolbox" 
           data-block-kind="value" data-type="${type}" ${decoyAttr}>
        <span>${field}</span>
        <span class="ai-pill-dropdown pill-op">${op} <span class="dropdown-caret">▼</span></span>
        <span>${val}</span>
      </div>`;
  },

  /**
   * บล็อกคำสั่งคอมโพเนนต์: set [prop] to [val]
   */
  setProperty(propName, valueHtml, isDecoy = false, type = 'statement') {
    const decoyAttr = isDecoy ? 'data-decoy="true"' : '';
    return `
      <div class="ai-block theme-prop has-top-notch has-bottom-tab in-toolbox" 
           data-block-kind="statement" data-type="${type}" ${decoyAttr}>
        <span>set</span>
        <span class="ai-pill-dropdown pill-prop">${propName} <span class="dropdown-caret">▼</span></span>
        <span>to</span>
        ${valueHtml}
      </div>`;
  },

  /**
   * บล็อกเรียกฟังก์ชันคอมโพเนนต์: call [component.method]
   */
  callMethod(methodName, isDecoy = false, type = 'statement') {
    const decoyAttr = isDecoy ? 'data-decoy="true"' : '';
    return `
      <div class="ai-block theme-call has-top-notch has-bottom-tab in-toolbox" 
           data-block-kind="statement" data-type="${type}" ${decoyAttr}>
        <span>call</span>
        <span class="ai-pill-dropdown">${methodName} ▼</span>
      </div>`;
  }
};
