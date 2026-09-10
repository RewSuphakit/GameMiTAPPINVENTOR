/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT: App Inventor Code Breaker Research Data Receiver v3.0
 * ==============================================================================
 * เครื่องมือบันทึกข้อมูลวิจัยการเรียนรู้และทักษะการแก้ปัญหาเชิงคำนวณ (ปวช. 2)
 * รองรับ Gamification (Stars, XP, Streak, Decoy Count, Time-to-first-action)
 * และระบบ Live Leaderboard Top 10
 *
 * วิธีการติดตั้ง:
 * 1. เปิด Google Sheets เปล่าขึ้นมา 1 ไฟล์
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมทั้งหมดออก แล้ววางโค้ดไฟล์นี้ลงไปแทน
 * 4. กดบันทึก (Save)
 * 5. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) > "รายการทำให้ใช้งานได้ใหม่" (New Deployment)
 * 6. เลือกประเภท: "เว็บแอป" (Web app)
 * 7. คำอธิบาย: "App Inventor Code Breaker v3.0"
 * 8. ดำเนินการในฐานะ: "ฉัน" (Me)
 * 9. ผู้ที่มีสิทธิ์เข้าถึง: "ทุกคน" (Anyone)
 * 10. กด "ทำให้ใช้งานได้" (Deploy) แล้วคัดลอก Web App URL มาใส่ในเว็บแอป
 * ==============================================================================
 */

/**
 * Handle POST request from the web application
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // รอ Lock สูงสุด 30 วินาทีป้องกัน Concurrent writes ชนกัน
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Server busy, lock timeout: ' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ResearchData');
    if (!sheet) {
      sheet = ss.insertSheet('ResearchData');
    }

    var logSheet = ss.getSheetByName('EventLogs');
    if (!logSheet) {
      logSheet = ss.insertSheet('EventLogs');
    }

    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    // กำหนดหัวคอลัมน์ของแผ่นงาน ResearchData
    var headers = [
      'Timestamp',
      'Session_ID',
      'Student_ID',
      'Student_Name',
      'Student_Group',
      'Total_Score',
      'Total_Stars',
      'Total_Time_Sec',
      'Total_Time_Formatted',
      'Accuracy_Percent',
      'Grade',
      'Player_Level',
      'Player_XP',
      'Highest_Streak',
      'Total_Hints_Used',
      'Total_Decoys_Triggered',
      'Device_OS',
      'Device_Browser',
      'Screen_Size',
      'Connection_Type'
    ];

    // เพิ่มคอลัมน์สถิติแต่ละด่าน L1 ถึง L8
    for (var l = 1; l <= 8; l++) {
      headers.push('L' + l + '_Attempts');
      headers.push('L' + l + '_Time_Sec');
      headers.push('L' + l + '_Score');
      headers.push('L' + l + '_Stars');
      headers.push('L' + l + '_Penalty');
      headers.push('L' + l + '_Variant');
      headers.push('L' + l + '_Hints');
      headers.push('L' + l + '_Decoys');
      headers.push('L' + l + '_TimeToFirstAction');
    }
    headers.push('Raw_Payload');

    // สร้าง Header แถวแรกหากแผ่นงานยังว่างอยู่
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#7c3aed');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var dev = payload.deviceInfo || {};
    var rowData = [
      payload.timestamp || new Date().toISOString(),
      payload.sessionId || '',
      payload.studentId || '',
      payload.studentName || '',
      payload.studentGroup || '',
      payload.totalScore || 0,
      payload.totalStars || 0,
      payload.totalTimeSec || 0,
      payload.totalTimeFormatted || '',
      payload.accuracyPercent || 0,
      payload.grade || '',
      payload.playerLevel || 1,
      payload.playerXP || 0,
      payload.highestStreak || 0,
      payload.totalHintsUsed || 0,
      payload.totalDecoysTriggered || 0,
      dev.os || '',
      dev.browser || '',
      dev.screen || '',
      dev.connection || ''
    ];

    for (var i = 1; i <= 8; i++) {
      rowData.push(payload['l' + i + '_attempts'] || 0);
      rowData.push(payload['l' + i + '_time'] || 0);
      rowData.push(payload['l' + i + '_score'] || 0);
      rowData.push(payload['l' + i + '_stars'] || 0);
      rowData.push(payload['l' + i + '_penalty'] || 0);
      rowData.push(payload['l' + i + '_variant'] || 1);
      rowData.push(payload['l' + i + '_hints'] || 0);
      rowData.push(payload['l' + i + '_decoys'] || 0);
      rowData.push(payload['l' + i + '_timeToFirstAction'] || '');
    }

    rowData.push(JSON.stringify(payload));
    sheet.appendRow(rowData);

    // บันทึก Event Logs ละเอียดลง sheet EventLogs
    if (payload.eventLog && Array.isArray(payload.eventLog) && payload.eventLog.length > 0) {
      var logHeaders = ['Timestamp', 'Session_ID', 'Student_ID', 'Level', 'Action', 'Block_Kind', 'Details'];
      if (logSheet.getLastRow() === 0) {
        logSheet.appendRow(logHeaders);
        var lhr = logSheet.getRange(1, 1, 1, logHeaders.length);
        lhr.setBackground('#06b6d4');
        lhr.setFontColor('#ffffff');
        lhr.setFontWeight('bold');
        logSheet.setFrozenRows(1);
      }

      var eventRows = [];
      for (var j = 0; j < payload.eventLog.length; j++) {
        var ev = payload.eventLog[j];
        eventRows.push([
          ev.timestamp || new Date().toISOString(),
          payload.sessionId || '',
          payload.studentId || '',
          ev.level || '',
          ev.action || '',
          ev.blockKind || '',
          typeof ev.details === 'object' ? JSON.stringify(ev.details) : (ev.details || '')
        ]);
      }

      if (eventRows.length > 0) {
        logSheet.getRange(logSheet.getLastRow() + 1, 1, eventRows.length, logHeaders.length).setValues(eventRows);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Research record saved successfully v3.0',
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET request: Healthcheck & Live Leaderboard Top 10
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';

  if (action === 'leaderboard') {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('ResearchData');
      if (!sheet || sheet.getLastRow() <= 1) {
        return ContentService.createTextOutput(JSON.stringify({ leaderboard: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var data = sheet.getDataRange().getValues();
      var rows = data.slice(1); // ข้ามแถว Header

      // เรียงลำดับคะแนนจากมากไปน้อย (Col index 5 คือ Total_Score)
      rows.sort(function(a, b) {
        return (Number(b[5]) || 0) - (Number(a[5]) || 0);
      });

      var top10 = rows.slice(0, 10).map(function(r) {
        return {
          studentName: r[3] || 'Anonymous',
          studentGroup: r[4] || '',
          score: Number(r[5]) || 0,
          stars: Number(r[6]) || 0,
          timeFormatted: r[8] || ''
        };
      });

      return ContentService.createTextOutput(JSON.stringify({ leaderboard: top10 }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ error: err.toString(), leaderboard: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Default ping response
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    instrument: 'App Inventor: The Code Breaker Mission',
    version: '3.0',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
