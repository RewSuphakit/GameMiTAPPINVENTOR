/**
 * ==============================================================================
 * UNIFIED VALIDATION ENGINE (js/validator.js)
 * ==============================================================================
 * ระบบตรวจสอบคำตอบส่วนกลาง รองรับทุกประเภทโครงสร้างบล็อก:
 * 1. cavity-has-correct (ตรวจบล็อกในโพรง C-Block)
 * 2. sockets-match (ตรวจบล็อกในช่องซ้าย-ขวา)
 * 3. debug-replace (ตรวจการทิ้ง Bug และต่อเงื่อนไขที่ถูกต้อง)
 * 4. sequence-order (ตรวจการเรียงลำดับหลายขั้นตอน)
 */

import { LEVEL_SCHEMA } from './levels.data.js';

export const GenericValidator = {
  /**
   * ฟังก์ชันตรวจคำตอบหลัก
   * @param {number} levelNum - หมายเลขด่าน
   * @param {number} variantIndex - ลำดับโจทย์ย่อยที่สุ่มได้
   * @returns {{ isValid: boolean, isDecoy: boolean, message: string }}
   */
  validate(levelNum, variantIndex = 0) {
    const schema = LEVEL_SCHEMA[levelNum];
    if (!schema) {
      return { isValid: false, isDecoy: false, message: 'ไม่พบข้อมูลนิยามด่าน' };
    }

    const variant = schema.variants[variantIndex || 0];

    switch (schema.validationType) {
      // ------------------------------------------------------------------------
      // กรณี 1: ตรวจบล็อกใน Cavity (ด่าน 1, 5, 7)
      // ------------------------------------------------------------------------
      case 'cavity-has-correct': {
        const cavity = document.querySelector(schema.cavitySelector);
        if (!cavity) return { isValid: false, isDecoy: false, message: 'ไม่พบช่องว่างสำหรับต่อคำสั่ง' };

        // 1. ตรวจสอบว่ามีบล็อกลวง (Decoy) หรือไม่
        const decoy = cavity.querySelector('[data-decoy="true"]');
        if (decoy) {
          return {
            isValid: false,
            isDecoy: true,
            message: variant.decoyFeedback || 'บล็อกที่เลือกยังไม่ใช่คำสั่งที่ถูกต้องตามโจทย์กำหนด'
          };
        }

        // 2. ตรวจสอบว่ามีบล็อกที่ถูกต้องหรือไม่
        const correct = cavity.querySelector('[data-type="correct"]');
        if (correct) {
          return { isValid: true, isDecoy: false, message: 'ต่อคำสั่งในช่องว่างได้ถูกต้องสมบูรณ์' };
        }

        // 3. กรณีมีบล็อกอื่นที่ไม่ใช่หรือยังว่างอยู่
        const anyBlock = cavity.querySelector('.ai-block');
        if (anyBlock) {
          return { isValid: false, isDecoy: false, message: 'บล็อกที่นำมาต่อยังไม่ตรงกับสิ่งที่โจทย์ต้องการ' };
        }

        return { isValid: false, isDecoy: false, message: 'ยังไม่ได้ลากบล็อกคำสั่งมาวางในช่องว่าง' };
      }

      // ------------------------------------------------------------------------
      // กรณี 2: ตรวจบล็อกในช่อง Socket ซ้าย-ขวา (ด่าน 2, 6)
      // ------------------------------------------------------------------------
      case 'sockets-match': {
        const s1 = document.querySelector(schema.socket1);
        const s2 = document.querySelector(schema.socket2);
        if (!s1 || !s2) return { isValid: false, isDecoy: false, message: 'ไม่พบช่อง Socket ข้อมูล' };

        const hasDecoy = !!s1.querySelector('[data-decoy="true"]') || !!s2.querySelector('[data-decoy="true"]');
        if (hasDecoy) {
          return {
            isValid: false,
            isDecoy: true,
            message: variant.decoyFeedback || 'มีบล็อกลวงอยู่ในช่องต่อข้อมูล กรุณาตรวจดูชนิดข้อมูล'
          };
        }

        const b1 = s1.querySelector('.ai-block');
        const b2 = s2.querySelector('.ai-block');
        if (!b1 || !b2) {
          return { isValid: false, isDecoy: false, message: 'กรุณาใส่บล็อกข้อมูลให้ครบทั้งช่อง [ 1 ] และ [ 2 ]' };
        }

        const s1Correct = !!s1.querySelector(`[data-type="${schema.type1}"]`);
        const s2Correct = !!s2.querySelector(`[data-type="${schema.type2}"]`);
        if (s1Correct && s2Correct) {
          return { isValid: true, isDecoy: false, message: 'ต่อบล็อกข้อมูลลงใน Socket ทั้งสองช่องได้ถูกต้อง' };
        }

        return { isValid: false, isDecoy: false, message: 'ข้อมูลในช่อง Socket สลับตำแหน่งหรือไม่ตรงกับรูปแบบ' };
      }

      // ------------------------------------------------------------------------
      // กรณี 3: ตรวจการดีบักและแทนที่เงื่อนไข (ด่าน 3)
      // ------------------------------------------------------------------------
      case 'debug-replace': {
        const sock = document.querySelector(schema.socketSelector);
        if (!sock) return { isValid: false, isDecoy: false, message: 'ไม่พบช่องเงื่อนไข' };

        const hasBuggy = !!sock.querySelector('.buggy-block, [data-type="buggy"]');
        const hasDecoy = !!sock.querySelector('[data-decoy="true"]');
        const hasCorrect = !!sock.querySelector('[data-type="correct"]');

        if (hasBuggy) {
          return { isValid: false, isDecoy: false, message: 'ยังมีบล็อกที่มี Bug ค้างอยู่ กรุณาลากไปทิ้งที่ถังขยะ 🗑️' };
        }
        if (hasDecoy) {
          return { isValid: false, isDecoy: true, message: variant.decoyFeedback || 'บล็อกเงื่อนไขที่นำมาต่อยังไม่ถูกต้อง' };
        }
        if (!sock.querySelector('.ai-block')) {
          return { isValid: false, isDecoy: false, message: 'ทิ้งบล็อกผิดแล้ว กรุณานำบล็อกเงื่อนไขที่ถูกต้องมาต่อแทน' };
        }

        return {
          isValid: hasCorrect,
          isDecoy: false,
          message: hasCorrect ? 'แก้ไข Bug และต่อเงื่อนไขเปรียบเทียบสำเร็จ' : 'เงื่อนไขยังไม่ตรงตามโจทย์'
        };
      }

      // ------------------------------------------------------------------------
      // กรณี 4: ตรวจการจัดเรียงลำดับขั้นตอน (ด่าน 4, 8)
      // ------------------------------------------------------------------------
      case 'sequence-order': {
        const count = schema.slotCount || 4;
        const prefix = schema.slotPrefix;
        const current = [];
        let emptyCount = 0;

        for (let i = 1; i <= count; i++) {
          const slot = document.getElementById(`${prefix}${i}`);
          const stepBlock = slot ? slot.querySelector('[data-step]') : null;
          if (stepBlock) {
            current.push(stepBlock.getAttribute('data-step'));
          } else {
            current.push(null);
            emptyCount++;
          }
        }

        if (emptyCount > 0) {
          return { isValid: false, isDecoy: false, message: `ยังต่อบล็อกไม่ครบทั้ง ${count} ขั้นตอน (ยังว่างอีก ${emptyCount} ช่อง)` };
        }

        const matches = JSON.stringify(current) === JSON.stringify(variant.correctSequence);
        if (matches) {
          return { isValid: true, isDecoy: false, message: 'จัดเรียงลำดับขั้นตอนได้ถูกต้องครบถ้วนสมบูรณ์' };
        }

        return { isValid: false, isDecoy: false, message: 'ลำดับขั้นตอนยังไม่ถูกต้อง ลองสังเกตว่าขั้นตอนใดต้องทำก่อน-หลัง' };
      }

      default:
        return { isValid: false, isDecoy: false, message: 'ไม่พบประเภทการตรวจสอบที่รองรับ' };
    }
  }
};
