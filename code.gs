/**
 * HỆ THỐNG QUẢN LÝ SINH HOẠT HÈ - BACKEND (V8.0 - OPTIMIZED FILTERS)
 * Cập nhật: Tự động ghi danh sách người xem vào cột G của sheet 'notifications' để dễ theo dõi trên file Excel.
 */

const SPREADSHEET_ID = "1ebzd0DRukRVtInH7srEqOBeX7NntSkbHsqFcHlEe7hU";
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.payload;

    // --- 1. NHÓM TÍNH NĂNG HỆ THỐNG ---
    if (action === 'LOGIN') return handleLogin(payload);
    if (action === 'GET_USERS') return handleGetAdminData(); 
    if (action === 'GET_STUDENTS_BY_GROUP') return handleGetStudentsByGroup(payload);
    if (action === 'GET_GROUPS_PUBLIC') return handleGetGroupsPublic();
    if (action === 'REGISTER_STUDENT') return handleRegisterStudent(payload);
    if (action === 'SAVE_ATTENDANCE') return handleSaveAttendance(payload);
    if (action === 'GET_ADMIN_STATS') return handleGetAdminStats();
    if (action === 'GET_ADMIN_EXTRAS') return handleGetAdminExtras(payload);
    if (action === 'BACKUP_SYSTEM') return handleBackupSystem(payload);
    if (action === 'RESTORE_SYSTEM') return handleRestoreSystem(payload);
    
    // --- 2. NHÓM TÍNH NĂNG LOGS & NOTIFICATIONS ---
    if (action === 'GET_LOGS') return handleGetLogs();
    if (action === 'MARK_READ') return handleMarkRead(payload);
    if (action === 'SEND_FEEDBACK') return handleSendFeedback(payload);
    if (action === 'GET_FEEDBACKS') return handleGetFeedbacks(payload);
    if (action === 'REPLY_FEEDBACK') return handleReplyFeedback(payload);
    if (action === 'SAVE_EVALUATION') return handleSaveEvaluation(payload);
    if (action === 'GET_EVALUATIONS') return handleGetEvaluations(payload);
    if (action === 'GET_CONFIG') return handleGetConfig();
    if (action === 'SAVE_CONFIG') return handleSaveConfig(payload);
    if (action === 'RESET_EVALUATIONS') return handleResetEvaluations(payload);

    // --- 2.1. FILE UPLOAD ---
    if (action === 'UPLOAD_FILE') return handleUploadFile(payload);
    if (action === 'GET_UPLOADS') return handleGetUploads(payload);

    // --- 3. NHÓM TÍNH NĂNG CRUD ---
    if (action === 'ADD_DATA') return handleAddData(payload);
    if (action === 'UPDATE_DATA') return handleUpdateData(payload);
    if (action === 'DELETE_DATA') return handleDeleteData(payload);
    if (action === 'RESET_PASSWORD') return handleResetPassword(payload);
    if (action === 'IMPORT_STUDENTS') return handleImportStudents(payload);

    // --- 4. NHÓM TÍNH NĂNG QUỸ ---
    if (action === 'SAVE_FUND_LOG') return handleSaveFundLog(payload);
    if (action === 'SAVE_EXPENSE_LOG') return handleSaveExpenseLog(payload);
    if (action === 'GET_FUND_LOGS') return handleGetFundLogs(payload);
    if (action === 'CHANGE_PASSWORD') return handleUserChangePassword(payload);
    if (action === 'UPDATE_AVATAR') return handleUserUpdateAvatar(payload);
    if (action === 'TOGGLE_PIN') return handleTogglePIN(payload);
    if (action === 'VERIFY_PIN') return handleVerifyPIN(payload);
    if (action === 'CHANGE_PIN') return handleUserChangePin(payload);

    // --- 5. NHÓM TÍNH NĂNG BÌNH CHỌN (POLL) ---
    if (action === 'VOTE_POLL') return handleVotePoll(payload);
    if (action === 'GET_POLL_RESULTS') return handleGetPollResults(payload);
    if (action === 'GET_POLL_VOTES') return handleGetPollVotes(payload);

    return response({ status: 'error', message: 'Hành động không hợp lệ' });
  } catch (err) {
    return response({ status: 'error', message: 'Lỗi server: ' + err.toString() });
  }
}

// ============================================================
// TÍNH NĂNG MỚI: ĐÁNH DẤU ĐÃ XEM & ĐỒNG BỘ SHEET
// ============================================================

function handleMarkRead(payload) {
  try {
    let sheet = ss.getSheetByName('notification_reads');
    if (!sheet) {
      sheet = ss.insertSheet('notification_reads');
      sheet.appendRow(['Timestamp', 'Username', 'Notification_ID']);
    }
    
    const data = sheet.getDataRange().getValues();
    const user = payload.username;
    const notiId = payload.notification_id;
    
    // Kiểm tra trùng lặp
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] == user && data[i][2] == notiId) {
        return response({ status: 'success', message: 'Đã xem rồi' });
      }
    }

    // Ghi nhận đã xem
    sheet.appendRow([new Date(), user, notiId]);

    // --- ĐỒNG BỘ SANG SHEET NOTIFICATIONS (CỘT G) ---
    syncReadersToNotificationSheet(notiId);

    return response({ status: 'success', message: 'Đã đánh dấu đã xem' });
  } catch (e) {
    return response({ status: 'error', message: 'Lỗi mark read: ' + e.toString() });
  }
}

function syncReadersToNotificationSheet(notiId) {
  try {
    // 1. Lấy danh sách tất cả người đã đọc thông báo này
    const readSheet = ss.getSheetByName('notification_reads');
    const readData = readSheet.getDataRange().getValues();
    const readers = [];
    for (let i = 1; i < readData.length; i++) {
      if (readData[i][2] == notiId) {
        readers.push(readData[i][1]);
      }
    }
    const readersStr = readers.join(', ');

    // 2. Tìm và cập nhật vào sheet notifications
    const notiSheet = ss.getSheetByName('notifications');
    if (notiSheet) {
      const notiData = notiSheet.getDataRange().getValues();
      
      // Tự động thêm header cho cột G nếu chưa có
      if (notiData.length > 0 && (!notiData[0][6] || notiData[0][6] === '')) {
         notiSheet.getRange(1, 7).setValue('Người đã xem (Auto)');
      }

      for (let j = 1; j < notiData.length; j++) {
        if (notiData[j][0] == notiId) {
          // Ghi danh sách người xem vào cột 7 (Cột G)
          notiSheet.getRange(j + 1, 7).setValue(readersStr);
          break;
        }
      }
    }
  } catch (e) { console.error("Lỗi đồng bộ sheet: " + e.toString()); }
}

// ============================================================
// TÍNH NĂNG GÓP Ý & PHẢN HỒI (FEEDBACK)
// ============================================================

function handleSendFeedback(payload) {
  try {
    let sheet = ss.getSheetByName('feedback');
    if (!sheet) {
      sheet = ss.insertSheet('feedback');
      // Header: ID, Time, Username, Fullname, Phone, Group, Title, Difficulty, Suggestion, Admin_Reply, Status, Attachment, Attachment_Name, Drive_Link
      sheet.appendRow(['ID', 'Timestamp', 'Username', 'Fullname', 'Phone', 'Group', 'Title', 'Difficulty', 'Suggestion', 'Admin_Reply', 'Status', 'Attachment', 'Attachment_Name', 'Drive_Link']);
    }
    
    const id = 'FB' + new Date().getTime();
    const timestamp = new Date();
    
    sheet.appendRow([
      id, timestamp, payload.username, payload.fullname, payload.phone, payload.group_id,
      payload.title, payload.difficulty, payload.suggestion, '', 'pending',
      payload.attachment || '', payload.attachment_name || '', payload.drive_link || ''
    ]);
    
    return response({ status: 'success', message: 'Đã gửi góp ý thành công!' });
  } catch (e) { return response({ status: 'error', message: 'Lỗi gửi góp ý: ' + e.toString() }); }
}

function handleGetFeedbacks(payload) {
  try {
    const sheet = ss.getSheetByName('feedback');
    if (!sheet) return response({ status: 'success', data: [] });
    
    const data = sheet.getDataRange().getValues();
    const feedbacks = [];
    const isSpecificUser = payload && payload.username; // Nếu có username là lấy cho User, không có là Admin lấy tất cả
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (let i = data.length - 1; i >= 1; i--) {
      // CLEANUP LOGIC: Xóa file đính kèm nếu quá 7 ngày (Chỉ xóa nội dung cột Attachment để tiết kiệm, giữ lại log)
      // Hoặc xóa cả dòng nếu muốn. Ở đây xóa nội dung file Base64.
      const ts = data[i][1] instanceof Date ? data[i][1] : new Date(data[i][1]);
      if (ts < sevenDaysAgo && data[i][11]) {
         // Nếu có file và cũ hơn 7 ngày -> Xóa file
         sheet.getRange(i + 1, 12).setValue(""); // Clear Attachment
         data[i][11] = ""; // Update local var
      }

      // Nếu là User thường thì chỉ lấy của chính mình, Admin lấy hết
      if (isSpecificUser && data[i][2] !== payload.username) continue;

      feedbacks.push({
        id: data[i][0],
        timestamp: (data[i][1] instanceof Date ? Utilities.formatDate(data[i][1], "GMT+7", "dd/MM/yyyy HH:mm") : data[i][1].toString()),
        username: data[i][2],
        fullname: data[i][3],
        phone: data[i][4],
        group_id: data[i][5],
        title: data[i][6] || '',
        difficulty: data[i][7],
        suggestion: data[i][8],
        reply: data[i][9],
        status: data[i][10],
        attachment: data[i][11],
        attachment_name: data[i][12],
        drive_link: data[i][13]
      });
    }
    return response({ status: 'success', data: feedbacks });
  } catch (e) { return response({ status: 'error', message: 'Lỗi lấy feedback: ' + e.toString() }); }
}

function handleReplyFeedback(payload) {
  try {
    // Tận dụng hàm update chung hoặc viết riêng để update cột Reply (cột 10 - index 9)
    const sheet = ss.getSheetByName('feedback');
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == payload.id) {
        sheet.getRange(i + 1, 10).setValue(payload.reply); // Cột J: Admin_Reply
        sheet.getRange(i + 1, 11).setValue('replied');     // Cột K: Status
        return response({ status: 'success', message: 'Đã gửi phản hồi!' });
      }
    }
    return response({ status: 'error', message: 'Không tìm thấy ID góp ý' });
  } catch (e) { return response({ status: 'error', message: 'Lỗi reply: ' + e.toString() }); }
}

// ============================================================
// TÍNH NĂNG ĐÁNH GIÁ & XẾP LOẠI (EVALUATION)
// ============================================================

function handleSaveEvaluation(payload) {
  try {
    let sheet = ss.getSheetByName('evaluations');
    if (!sheet) {
      sheet = ss.insertSheet('evaluations');
      // Header: StudentID, StudentName, GroupID, Discipline, Positivity, Volunteering, Classification, UpdatedBy, Timestamp
      sheet.appendRow(['StudentID', 'StudentName', 'GroupID', 'Discipline', 'Positivity', 'Volunteering', 'Classification', 'UpdatedBy', 'Timestamp']);
    }

    const data = sheet.getDataRange().getValues();
    const timestamp = new Date();
    let found = false;

    // Tìm xem học sinh này đã được đánh giá chưa để cập nhật
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(payload.student_id)) {
        // Cập nhật dòng hiện tại
        sheet.getRange(i + 1, 4, 1, 6).setValues([[
          payload.discipline, 
          payload.positivity, 
          payload.volunteering, 
          payload.classification, 
          payload.updated_by, 
          timestamp
        ]]);
        found = true;
        break;
      }
    }

    if (!found) {
      // Thêm mới
      sheet.appendRow([
        payload.student_id, payload.student_name, payload.group_id,
        payload.discipline, payload.positivity, payload.volunteering, 
        payload.classification, payload.updated_by, timestamp
      ]);
    }

    return response({ status: 'success', message: 'Đã lưu đánh giá thành công!' });
  } catch (e) { return response({ status: 'error', message: 'Lỗi lưu đánh giá: ' + e.toString() }); }
}

function handleGetEvaluations(payload) {
  try {
    const sheet = ss.getSheetByName('evaluations');
    if (!sheet) return response({ status: 'success', data: [] });
    const data = sheet.getDataRange().getValues();
    // Bỏ header, trả về mảng object hoặc mảng thô tùy nhu cầu. Ở đây trả về mảng thô cho gọn
    return response({ status: 'success', data: data.slice(1) });
  } catch (e) { return response({ status: 'error', message: 'Lỗi lấy đánh giá: ' + e.toString() }); }
}

function handleResetEvaluations(payload) {
  try {
    const sheet = ss.getSheetByName('evaluations');
    if (!sheet) return response({ status: 'error', message: 'Sheet không tồn tại' });
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    }
    writeLog(payload.admin_user, "RESET_EVALUATIONS", "Đã reset toàn bộ dữ liệu đánh giá");
    return response({ status: 'success', message: 'Đã xóa toàn bộ đánh giá! Có thể bắt đầu đợt mới.' });
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}

// ============================================================
// TÍNH NĂNG UPLOAD FILE (GENERIC)
// ============================================================

function handleUploadFile(payload) {
  try {
    let sheet = ss.getSheetByName('uploads');
    if (!sheet) {
      sheet = ss.insertSheet('uploads');
      // ID, Timestamp, Uploader, Group, Filename, Size, Data
      sheet.appendRow(['ID', 'Timestamp', 'Uploader', 'Group', 'Filename', 'Size', 'Data']);
    }
    const id = 'FILE' + new Date().getTime();
    sheet.appendRow([id, new Date(), payload.uploader, payload.group_id, payload.filename, payload.size, payload.data]);
    return response({ status: 'success', message: 'Upload file thành công!' });
  } catch (e) { return response({ status: 'error', message: 'Lỗi upload: ' + e.toString() }); }
}

// Hàm tạo ID mã hóa (MD5 Hash)
function generateSecureId(prefix) {
  const raw = prefix + new Date().getTime() + Math.random().toString();
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, raw);
  // Lấy 12 ký tự đầu của Base64 hash để làm ID ngắn gọn nhưng bảo mật
  const hash = Utilities.base64EncodeWebSafe(digest).substring(0, 12);
  return prefix + '_' + hash;
}

function handleUploadFile(payload) {
  try {
    let sheet = ss.getSheetByName('uploads');
    if (!sheet) {
      sheet = ss.insertSheet('uploads');
      sheet.appendRow(['ID', 'Timestamp', 'Uploader', 'Group', 'Filename', 'Size', 'Data']);
    }
    // Mã hóa ID file
    const id = generateSecureId('FILE');
    sheet.appendRow([id, new Date(), payload.uploader, payload.group_id, payload.filename, payload.size, payload.data]);
    return response({ status: 'success', message: 'Upload file thành công!' });
  } catch (e) { return response({ status: 'error', message: 'Lỗi upload: ' + e.toString() }); }
}

function handleGetUploads(payload) {
  try {
    const sheet = ss.getSheetByName('uploads');
    if (!sheet) return response({ status: 'success', data: [] });
    const data = sheet.getDataRange().getValues();
    // Trả về toàn bộ dữ liệu (bao gồm Base64) - Lưu ý: Có thể nặng nếu file lớn
    // Bỏ header
    const files = [];
    for (let i = 1; i < data.length; i++) {
      files.push({
        id: data[i][0],
        timestamp: (data[i][1] instanceof Date ? Utilities.formatDate(data[i][1], "GMT+7", "dd/MM/yyyy HH:mm") : data[i][1]),
        uploader: data[i][2],
        group_id: data[i][3],
        filename: data[i][4],
        size: data[i][5],
        data: data[i][6],
        type: data[i][7] || 'FILE'
      });
    }
    return response({ status: 'success', data: files.reverse() }); // Mới nhất lên đầu
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}

// ============================================================
// TÍNH NĂNG CẤU HÌNH HỆ THỐNG (SETTINGS)
// ============================================================

function handleGetConfig() {
  try {
    let sheet = ss.getSheetByName('settings');
    if (!sheet) {
      sheet = ss.insertSheet('settings');
      sheet.appendRow(['Key', 'Value']);
      sheet.appendRow(['evaluation_enabled', 'FALSE']);
      sheet.appendRow(['evaluation_deadline', '']);
      sheet.appendRow(['upload_drive_link', '']);
    }
    const data = sheet.getDataRange().getValues();
    const config = {};
    for (let i = 1; i < data.length; i++) {
      config[data[i][0]] = data[i][1];
    }
    return response({ status: 'success', data: config });
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}

function handleSaveConfig(payload) {
  try {
    let sheet = ss.getSheetByName('settings');
    if (!sheet) {
      sheet = ss.insertSheet('settings');
      sheet.appendRow(['Key', 'Value']);
    }
    const data = sheet.getDataRange().getValues();
    
    const setConfig = (key, val) => {
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === key) { sheet.getRange(i + 1, 2).setValue(val); return; }
      }
      sheet.appendRow([key, val]);
    };

    // Lưu tất cả các key được gửi lên
    for (const key in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) setConfig(key, payload[key]);
    }

    return response({ status: 'success', message: 'Đã lưu cấu hình!' });
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}

// ============================================================
// PHẦN QUẢN LÝ LOGS
// ============================================================

function writeLog(username, action, details) {
  try {
    const sheet = ss.getSheetByName('logs');
    if (sheet) {
      sheet.appendRow([new Date(), username, action, details]);
    }
  } catch (e) { console.error("Lỗi ghi log: " + e.toString()); }
}

function handleGetLogs() {
  try {
    const sheet = ss.getSheetByName('logs');
    if (!sheet) return response({ status: 'error', message: 'Không tìm thấy sheet logs' });
    const data = sheet.getDataRange().getValues();
    const logs = [];
    for (let i = data.length - 1; i >= 1; i--) {
      logs.push({
        timestamp: data[i][0] instanceof Date ? Utilities.formatDate(data[i][0], "GMT+7", "dd/MM/yyyy HH:mm:ss") : data[i][0],
        username: data[i][1],
        action: data[i][2],
        details: data[i][3]
      });
    }
    return response({ status: 'success', data: logs });
  } catch (e) { return response({ status: 'error', message: 'Lỗi lấy logs: ' + e.toString() }); }
}

// ============================================================
// PHẦN XỬ LÝ DỮ LIỆU (CRUD)
// ============================================================

function handleAddData(payload) {
  try {
    const sheet = ss.getSheetByName(payload.type);
    if (!sheet) return response({ status: 'error', message: 'Sheet ' + payload.type + ' không tồn tại' });
    const rowData = Array.isArray(payload.data) ? payload.data : Object.values(payload.data);
    sheet.appendRow(rowData);
    writeLog(payload.admin_user || "System", "ADD_" + payload.type.toUpperCase(), "Thêm mới ID: " + rowData[0]);
    return response({ status: 'success', message: 'Thêm dữ liệu thành công!' });
  } catch (e) { return response({ status: 'error', message: 'Lỗi thêm: ' + e.toString() }); }
}

function handleUpdateData(payload) {
  try {
    const sheet = ss.getSheetByName(payload.type);
    const rows = sheet.getDataRange().getValues();
    const idToUpdate = payload.id.toString().trim();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().trim() === idToUpdate) {
        const rowData = Array.isArray(payload.data) ? payload.data : Object.values(payload.data);
        // Lưu ý: Chỉ update các cột dữ liệu chính, không ghi đè cột "Người đã xem" (Cột G) nếu có
        const range = sheet.getRange(i + 1, 1, 1, rowData.length);
        range.setValues([rowData]);
        writeLog(payload.admin_user || "System", "UPDATE_" + payload.type.toUpperCase(), "Sửa ID: " + idToUpdate);
        return response({ status: 'success', message: 'Cập nhật thành công!' });
      }
    }
    return response({ status: 'error', message: 'Không tìm thấy ID: ' + idToUpdate });
  } catch (e) { return response({ status: 'error', message: 'Lỗi cập nhật: ' + e.toString() }); }
}

function handleDeleteData(payload) {
  try {
    const sheet = ss.getSheetByName(payload.type);
    const rows = sheet.getDataRange().getValues();
    const idToDelete = payload.id.toString().trim();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().trim() === idToDelete) {
        sheet.deleteRow(i + 1);
        writeLog(payload.admin_user || "System", "DELETE_" + payload.type.toUpperCase(), "Xóa ID: " + idToDelete);
        return response({ status: 'success', message: 'Đã xóa thành công!' });
      }
    }
    return response({ status: 'error', message: 'Không tìm thấy ID để xóa' });
  } catch (e) { return response({ status: 'error', message: 'Lỗi xóa: ' + e.toString() }); }
}

function handleResetPassword(payload) {
  try {
    const sheet = ss.getSheetByName('users');
    const rows = sheet.getDataRange().getValues();
    const username = String(payload.username).trim();
    const defaultPass = "Abc@123";
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().trim() === username) {
        sheet.getRange(i + 1, 2).setValue(defaultPass);
        writeLog(payload.admin_user || "System", "RESET_PASS", "Reset pass cho: " + username);
        return response({ status: 'success', message: 'Mật khẩu đã reset về: ' + defaultPass });
      }
    }
    return response({ status: 'error', message: 'Không tìm thấy tài khoản' });
  } catch (e) { return response({ status: 'error', message: 'Lỗi reset: ' + e.toString() }); }
}

function handleUserChangePassword(payload) {
  try {
    const sheet = ss.getSheetByName('users');
    const rows = sheet.getDataRange().getValues();
    const username = String(payload.username).trim();
    const newPass = payload.new_pass;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().trim() === username) {
        sheet.getRange(i + 1, 2).setValue(newPass);
        writeLog(username, "CHANGE_PASS", "Người dùng tự đổi mật khẩu");
        return response({ status: 'success', message: 'Đổi mật khẩu thành công!' });
      }
    }
    return response({ status: 'error', message: 'User not found' });
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}

function handleUserUpdateAvatar(payload) {
  try {
    const sheet = ss.getSheetByName('users');
    const rows = sheet.getDataRange().getValues();
    const username = String(payload.username).trim();
    const avatar = payload.avatar;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().trim() === username) {
        sheet.getRange(i + 1, 6).setValue(avatar);
        return response({ status: 'success', message: 'Cập nhật ảnh đại diện thành công!' });
      }
    }
    return response({ status: 'error', message: 'User not found' });
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}

function handleImportStudents(payload) {
  try {
    const sheet = ss.getSheetByName('students');
    if (!sheet) return response({ status: 'error', message: 'Sheet students không tồn tại' });
    
    const students = payload.students;
    if (!students || !Array.isArray(students) || students.length === 0) {
      return response({ status: 'error', message: 'Không có dữ liệu học sinh để nhập.' });
    }

    // 1. Lấy dữ liệu hiện có để kiểm tra trùng lặp (Fullname + GroupID)
    const existingData = sheet.getDataRange().getValues();
    const existingSet = new Set();
    for (let i = 1; i < existingData.length; i++) {
      const key = (String(existingData[i][1]) + "_" + String(existingData[i][5])).toLowerCase().trim();
      existingSet.add(key);
    }

    let addedCount = 0;
    const rowsToAdd = [];
    const baseTime = new Date().getTime();
    
    students.forEach((st, index) => {
      if (!st.fullname) return; // Bỏ qua dòng không có tên

      const key = (String(st.fullname) + "_" + String(st.group_id)).toLowerCase().trim();
      if (existingSet.has(key)) return; // Bỏ qua nếu đã tồn tại
      existingSet.add(key);

      const newId = 'ST' + (baseTime + index);
      
      // Cấu trúc: ID, Fullname, DOB, Address, Phone, GroupID, (Trống), School
      const newRow = [
        newId, 
        st.fullname, 
        st.dob, 
        st.address || '', 
        st.phone || '', 
        st.group_id, 
        "", // Cột G trống
        st.school || ''
      ];
      rowsToAdd.push(newRow);
      addedCount++;
    });

    if (addedCount > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    }

    writeLog(payload.admin_user || "System", "IMPORT_STUDENTS", `Đã nhập ${addedCount}/${students.length} học sinh từ file Excel.`);
    return response({ status: 'success', message: `Đã nhập thành công ${addedCount} học sinh (Bỏ qua ${students.length - addedCount} trùng lặp).`, count: addedCount });
  } catch (e) {
    return response({ status: 'error', message: 'Lỗi khi nhập dữ liệu: ' + e.toString() });
  }
}

// ============================================================
// TÍNH NĂNG QUẢN LÝ QUỸ (FUND MANAGEMENT)
// ============================================================

function getFundSheet() {
  let sheet = ss.getSheetByName('fund_logs');
  if (!sheet) {
    sheet = ss.insertSheet('fund_logs');
    // Timestamp, Type (THU/CHI), GroupID, Manager, Amount, Details, Notes
    sheet.appendRow(['Timestamp', 'Type', 'GroupID', 'Manager', 'Amount', 'Details', 'Notes']);
  }
  return sheet;
}

function handleSaveFundLog(payload) {
  try {
    const sheet = getFundSheet();
    const timestamp = new Date();
    
    sheet.appendRow([ timestamp, 'THU', payload.group_id, payload.manager, payload.total_collected, `Thu ${payload.paid_students.split(',').length} người, mỗi người ${payload.amount_per_head.toLocaleString('vi-VN')}đ`, payload.paid_students ]);
    writeLog(payload.manager, "FUND_COLLECT", `Nhóm ${payload.group_id} thu quỹ ${payload.total_collected}`);
    return response({ status: 'success', message: 'Đã lưu vào sổ quỹ.' });
  } catch (e) { return response({ status: 'error', message: 'Lỗi lưu sổ quỹ: ' + e.toString() }); }
}

function handleSaveExpenseLog(payload) {
  try {
    const sheet = getFundSheet();
    const timestamp = new Date();
    
    sheet.appendRow([ timestamp, 'CHI', payload.group_id, payload.manager, payload.amount, payload.reason, payload.notes ]);
    writeLog(payload.manager, "FUND_EXPENSE", `Nhóm ${payload.group_id} chi quỹ ${payload.amount} cho '${payload.reason}'`);
    return response({ status: 'success', message: 'Đã lưu khoản chi.' });
  } catch (e) { return response({ status: 'error', message: 'Lỗi lưu khoản chi: ' + e.toString() }); }
}

function handleGetFundLogs(payload) {
  try {
    const sheet = getFundSheet();
    const data = sheet.getDataRange().getValues();
    const logs = [];
    const groupId = payload.group_id;
    for (let i = data.length - 1; i >= 1; i--) {
      const row = data[i];
      if (groupId && String(row[2]) !== String(groupId)) continue;
      const isThu = row[1] === 'THU';
      logs.push({ timestamp: (row[0] instanceof Date ? Utilities.formatDate(row[0], "GMT+7", "dd/MM/yyyy HH:mm") : row[0].toString()), type: row[1], group_id: row[2], manager: row[3], amount: row[4], reason: row[5], paid_list: isThu ? row[6] : '', details: isThu ? '' : row[6] });
    }
    return response({ status: 'success', data: logs });
  } catch (e) { return response({ status: 'error', message: 'Lỗi lấy lịch sử quỹ: ' + e.toString() }); }
}

function handleBackupSystem(payload) {
  try {
    const sheetNames = ['students', 'users', 'groups', 'attendance', 'notifications', 'notification_reads', 'feedback', 'evaluations', 'logs', 'fund_logs', 'settings'];
    const backupData = {};
    
    sheetNames.forEach(name => {
      const sheet = ss.getSheetByName(name);
      if (sheet) {
        backupData[name] = sheet.getDataRange().getValues();
      }
    });
    
    writeLog(payload.admin_user || "System", "BACKUP", "Thực hiện sao lưu toàn bộ hệ thống");
    return response({ status: 'success', data: backupData });
  } catch (e) {
    return response({ status: 'error', message: 'Lỗi backup: ' + e.toString() });
  }
}

function handleRestoreSystem(payload) {
  try {
    const backupData = payload.data;
    const sheetNames = Object.keys(backupData);

    if (!sheetNames || sheetNames.length === 0) {
      return response({ status: 'error', message: 'Không có dữ liệu để phục hồi.' });
    }

    sheetNames.forEach(name => {
      let sheet = ss.getSheetByName(name);
      const dataToRestore = backupData[name];

      if (!sheet) {
        sheet = ss.insertSheet(name);
      }
      
      if (dataToRestore && dataToRestore.length > 0) {
        sheet.clear();
        sheet.getRange(1, 1, dataToRestore.length, dataToRestore[0].length).setValues(dataToRestore);
      } else {
        sheet.clear(); // Xóa sheet nếu trong backup sheet đó rỗng
      }
    });

    writeLog(payload.admin_user || "System", "RESTORE", "Thực hiện phục hồi hệ thống từ file backup.");
    return response({ status: 'success', message: 'Phục hồi hệ thống thành công!' });
  } catch (e) {
    return response({ status: 'error', message: 'Lỗi khi phục hồi: ' + e.toString() });
  }
}

// ============================================================
// CÁC HÀM NGHIỆP VỤ
// ============================================================

function handleGetGroupsPublic() {
  try {
    const sheet = ss.getSheetByName('groups');
    if (!sheet) return response({ status: "success", data: [] });
    const rows = sheet.getDataRange().getValues();
    const groups = [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        groups.push({ id: rows[i][0], name: rows[i][1] });
      }
    }
    return response({ status: "success", data: groups });
  } catch (e) { return response({ status: "error", message: e.toString() }); }
}

function handleRegisterStudent(payload) {
  try {
    const sheet = ss.getSheetByName('students');
    const rows = sheet.getDataRange().getValues();
    
    // Auto Generate ID: ST + timestamp
    const newId = 'ST' + new Date().getTime(); 
    
    // Structure: ID, Fullname, DOB, Address, Phone, GroupID, (Empty), School
    const newRow = [newId, payload.fullname, payload.dob, payload.address, payload.phone, payload.group_id, "", payload.school];
    
    sheet.appendRow(newRow);
    writeLog("System", "REGISTER_STUDENT", "Đăng ký mới: " + payload.fullname + " vào nhóm " + payload.group_id);
    return response({ status: "success", message: "Đăng ký thành công!" });
  } catch (e) { return response({ status: "error", message: "Lỗi đăng ký: " + e.toString() }); }
}

function handleLogin(payload) {
  const sheet = ss.getSheetByName('users');
  const rows = sheet.getDataRange().getValues();
  const userIn = payload.username.toString().trim();
  const passIn = payload.password.toString().trim();
  const pinIn = payload.pin ? payload.pin.toString().trim() : null;
  
  // Chạy dọn dẹp hệ thống (Xóa file > 7 ngày, Link > 30 ngày) khi có người đăng nhập
  cleanUpSystem();

  // --- CHECK MAINTENANCE MODE ---
  let isMaintenance = false;
  const settingsSheet = ss.getSheetByName('settings');
  if (settingsSheet) {
    const sData = settingsSheet.getDataRange().getValues();
    for (let k = 1; k < sData.length; k++) {
      if (sData[k][0] === 'maintenance_mode' && String(sData[k][1]).toUpperCase() === 'TRUE') {
        isMaintenance = true; break;
      }
    }
  }

  // 2. Kiểm tra An ninh (Số lần lỗi & Thiết bị)
  const secData = getSecurityData(userIn); // { rowIndex, failedAttempts, devices, successfulAttempts }
  
  // Nếu sai quá 10 lần -> Khóa
  if (secData.failedAttempts >= 10) {
     return response({ status: "error", message: "Tài khoản bị tạm khóa do nhập sai mật khẩu quá 10 lần. Vui lòng liên hệ Admin." });
  }

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().trim() === userIn) {
      // Kiểm tra mật khẩu
      if (rows[i][1].toString().trim() === passIn) {
        // --- ĐĂNG NHẬP THÀNH CÔNG ---
        const role = rows[i][2].toString().trim().toLowerCase();

        // CHẶN NẾU ĐANG BẢO TRÌ (Trừ Admin)
        if (isMaintenance && role !== 'admin') {
            return response({ status: "error", message: "Hệ thống đang bảo trì để nâng cấp. Vui lòng quay lại sau!" });
        }
        
        // Kiểm tra thiết bị (User Agent)
        const currentUA = payload.userAgent || "Unknown Device";
        let devices = secData.devices || [];
        // Nếu thiết bị mới chưa có trong danh sách -> Thêm vào
        if (!devices.includes(currentUA)) {
          devices.push(currentUA);
        }

        const isPinEnabled = (rows[i][6] === true || rows[i][6] === 'TRUE');
        // Nếu đổi thiết bị quá 5 lần -> Bắt buộc xác thực PIN
        const forcePinByDevice = devices.length > 5;
        // Nếu đăng nhập thành công liên tục >= 10 lần -> Bắt buộc xác thực PIN
        const forcePinBySuccess = secData.successfulAttempts >= 9; // Lần này là lần thứ 10

        if (isPinEnabled || forcePinByDevice || forcePinBySuccess) {
          // --- LOGIC KIỂM TRA PIN ---
          if (pinIn) {
             // Nếu người dùng đã gửi PIN lên
             const correctPin = rows[i][7].toString().trim();
             if (pinIn !== correctPin) {
                 return response({ status: "error", message: "Mã PIN không chính xác!" });
             }
             // PIN đúng -> Cho qua (Tiếp tục chạy xuống logic updateSecurityData bên dưới)
             writeLog(userIn, "LOGIN_PIN", "Đăng nhập với PIN thành công");
          } else {
             // Chưa có PIN -> Yêu cầu nhập PIN
             let msg = "";
             if (forcePinBySuccess) msg = "Yêu cầu xác thực PIN (Đăng nhập nhiều lần).";
             else if (forcePinByDevice) msg = "Yêu cầu xác thực PIN (Thiết bị mới).";
             else msg = "Tài khoản này yêu cầu mã PIN bảo mật.";
             
             return response({ status: "pin_required", username: rows[i][0].toString().trim(), message: msg });
          }
        }

        // Đăng nhập thành công, không cần PIN -> Tăng bộ đếm thành công
        updateSecurityData(userIn, 0, devices, secData.successfulAttempts + 1);

        writeLog(userIn, "LOGIN", "Đăng nhập thành công");
        return response({ 
          status: "success", 
          user: { username: rows[i][0], role: role, group_id: rows[i][3].toString(), group_name: getGroupName(rows[i][3].toString()), fullname: rows[i][4], avatar: rows[i][5] || 'https://via.placeholder.com/150', is_pin_enabled: isPinEnabled, is_default_pass: (rows[i][1].toString().trim() === 'Abc@123') } 
        });
      } else {
        // --- SAI MẬT KHẨU ---
        // Tăng số lần lỗi, reset số lần thành công về 0
        updateSecurityData(userIn, secData.failedAttempts + 1, secData.devices, 0);
        return response({ status: "error", message: "Sai mật khẩu! (Lần " + (secData.failedAttempts + 1) + "/10)" });
      }
    }
  }
  return response({ status: "error", message: "Sai tài khoản hoặc mật khẩu!" });
}

function handleGetAdminExtras(payload) {
  try {
    // 1. Managers
    const userSheet = ss.getSheetByName('users');
    const userValues = userSheet.getDataRange().getValues();
    const managers = [];
    for (let i = 1; i < userValues.length; i++) {
      const role = userValues[i][2] ? userValues[i][2].toString().toLowerCase() : "";
      if (role === 'manager' || role === 'admin') {
        managers.push({
          username: userValues[i][0],
          role: userValues[i][2],
          group_id: userValues[i][3],
          group_display: getGroupName(userValues[i][3]), 
          fullname: userValues[i][4],
          avatar: userValues[i][5] || 'https://via.placeholder.com/150',
          is_pin_enabled: (userValues[i][6] === true || userValues[i][6] === 'TRUE')
        });
      }
    }

    // 2. Groups
    const groupSheet = ss.getSheetByName('groups');
    const groupValues = groupSheet.getDataRange().getValues();
    const groups = [];
    for (let j = 1; j < groupValues.length; j++) {
      if (groupValues[j][0]) {
        groups.push({ group_id: groupValues[j][0], group_name: groupValues[j][1] });
      }
    }

    // --- XỬ LÝ DỮ LIỆU ĐỌC THÔNG BÁO ---
    const readSheet = ss.getSheetByName('notification_reads');
    const readMap = {}; 
    const readIds = []; 

    if (readSheet) {
      const readData = readSheet.getDataRange().getValues();
      for (let r = 1; r < readData.length; r++) {
        const u = readData[r][1]; 
        const nid = readData[r][2]; 
        
        if (!readMap[nid]) readMap[nid] = [];
        readMap[nid].push(u);

        if (payload && payload.username && u == payload.username) {
          readIds.push(nid);
        }
      }
    }

    // 3. Notifications
    const notiSheet = ss.getSheetByName('notifications');
    const notifications = [];
    if (notiSheet) {
      const notiValues = notiSheet.getDataRange().getValues();
      for (let k = 1; k < notiValues.length; k++) {
        if (notiValues[k][0]) {
           let dt = notiValues[k][3];
           if (dt instanceof Date) dt = Utilities.formatDate(dt, "GMT+7", "yyyy-MM-dd HH:mm");
           
           const nId = notiValues[k][0];
           notifications.push({
             id: nId,
             title: notiValues[k][1],
             content: notiValues[k][2],
             datetime: dt,
             early: notiValues[k][4],
             type: notiValues[k][7] || 'normal', // Cột H: Loại (normal, online, offline)
             location: notiValues[k][8] || '',   // Cột I: Link hoặc Địa điểm
             attachment: notiValues[k][9] || '', // Cột J: File đính kèm (Base64)
             attachment_name: notiValues[k][10] || '', // Cột K: Tên file
             read_by: readMap[nId] || [] // Vẫn lấy từ readMap để đảm bảo chính xác nhất
           });
        }
      }
    }

    return response({ status: "success", data: { managers, groups, notifications, read_ids: readIds } });
  } catch (err) { return response({ status: 'error', message: 'Lỗi: ' + err.toString() }); }
}

function handleGetStudentsByGroup(payload) {
  const rows = ss.getSheetByName('students').getDataRange().getValues();
  const list = [];
  const realGroupName = getGroupName(payload.group_id.toString());
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][5].toString() === payload.group_id.toString()) {
      list.push({ id: rows[i][0], fullname: rows[i][1], dob: formatDateVN(rows[i][2]), address: rows[i][3], phone: rows[i][4], school: rows[i][7], group_name: realGroupName });
    }
  }
  return response({ status: "success", data: list });
}

// Hàm dọn dẹp dữ liệu cũ (7 ngày cho file, 30 ngày cho link/feedback)
function cleanUpSystem() {
  const now = new Date().getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  // 1. Cleanup Uploads (7 days)
  const upSheet = ss.getSheetByName('uploads');
  if (upSheet) {
    const data = upSheet.getDataRange().getValues();
    // Duyệt ngược để xóa không bị lỗi index
    for (let i = data.length - 1; i >= 1; i--) {
      const ts = new Date(data[i][1]).getTime();
      if (now - ts > sevenDays) upSheet.deleteRow(i + 1);
    }
  }

  // 2. Cleanup Feedback/Links (30 days)
  const fbSheet = ss.getSheetByName('feedback');
  if (fbSheet) {
    const data = fbSheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      const ts = new Date(data[i][1]).getTime();
      if (now - ts > thirtyDays) fbSheet.deleteRow(i + 1);
    }
  }
}

function handleSaveAttendance(payload) {
  const attendanceSheet = ss.getSheetByName('attendance');
  const timestamp = new Date(); 
  payload.attendance.forEach(item => {
    attendanceSheet.appendRow([timestamp, item.student_id, item.status === 'present' ? 'Có mặt' : (item.status === 'absent_perm' ? 'Vắng (P)' : 'Vắng'), item.reason || "", payload.group_id, payload.recorded_by]);
  });
  writeLog(payload.recorded_by, "ATTENDANCE", "Điểm danh nhóm: " + payload.group_id);
  return response({ status: "success", message: "Đã lưu thành công!" });
}

function handleGetAdminStats() {
  const attSheet = ss.getSheetByName('attendance');
  const attData = attSheet.getDataRange().getValues();
  const stuData = ss.getSheetByName('students').getDataRange().getValues();
  const grpData = ss.getSheetByName('groups').getDataRange().getValues();
  let studentMap = {}; for (let s = 1; s < stuData.length; s++) { studentMap[stuData[s][0]] = stuData[s][1]; }
  let groupMap = {}; for (let g = 1; g < grpData.length; g++) { groupMap[grpData[g][0]] = grpData[g][1]; }
  let stats = { present: 0, absent_perm: 0, absent: 0, history: [] };
  for (let i = attData.length - 1; i >= 1; i--) {
    const sId = attData[i][1];
    const statusText = attData[i][2] ? attData[i][2].toString().trim() : "";
    if (!sId) continue;
    if (statusText === 'Có mặt') stats.present++;
    else if (statusText === 'Vắng (P)') stats.absent_perm++;
    else if (statusText === 'Vắng') stats.absent++;
    stats.history.push({
      timestamp: attData[i][0] instanceof Date ? Utilities.formatDate(attData[i][0], "GMT+7", "dd/MM/yyyy HH:mm:ss") : attData[i][0].toString(),
      student_id: sId,
      student_name: studentMap[sId] || sId,
      status: statusText === 'Có mặt' ? 'present' : (statusText === 'Vắng (P)' ? 'absent_perm' : 'absent'),
      reason: attData[i][3] || "",
      group_id: groupMap[attData[i][4]] || attData[i][4],
      recorded_by: attData[i][5] || "Admin"
    });
  }
  return response({ status: "success", data: stats });
}

function handleGetAdminData() {
  const userSheet = ss.getSheetByName('users');
  const studentSheet = ss.getSheetByName('students');
  const studentValues = studentSheet.getDataRange().getValues();
  const students = [];
  for (let j = 1; j < studentValues.length; j++) {
    if (studentValues[j][1]) {
      students.push({
        id: studentValues[j][0],
        fullname: studentValues[j][1],
        dob: formatDateVN(studentValues[j][2]),
        group_id: studentValues[j][5],
        group_display: getGroupName(studentValues[j][5]), 
        school: studentValues[j][7],
        address: studentValues[j][3],
        phone: studentValues[j][4]
      });
    }
  }
  return response({ status: "success", data: { students: students, totalStudents: students.length, totalAdmins: userSheet.getLastRow() - 1 } });
}

function getGroupName(groupId) {
  if (groupId === "ALL") return "Hệ thống";
  const groupSheet = ss.getSheetByName('groups');
  if (!groupSheet) return "Nhóm " + groupId;
  const groupValues = groupSheet.getDataRange().getValues();
  for (let i = 1; i < groupValues.length; i++) {
    if (groupValues[i][0].toString().trim() === groupId.toString().trim()) return groupValues[i][1];
  }
  return "Nhóm " + groupId;
}

function formatDateVN(dateVal) {
  if (!dateVal) return "";
  try {
    if (dateVal instanceof Date) return Utilities.formatDate(dateVal, "GMT+7", "dd/MM/yyyy");
    return dateVal.toString();
  } catch (e) { return dateVal.toString(); }
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// TÍNH NĂNG BẢO MẬT MÃ PIN
// ============================================================

function handleTogglePIN(payload) {
  const sheet = ss.getSheetByName('users');
  const rows = sheet.getDataRange().getValues();
  const targetUser = payload.target_user.toString().trim();
  const enable = payload.enable; // boolean
  const defaultPin = '1234';
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().trim() === targetUser) {
      sheet.getRange(i + 1, 7).setValue(enable); // Column G: pin_enabled
      if (enable) {
        sheet.getRange(i + 1, 8).setValue(defaultPin); // Column H: pin_code
      } else {
        sheet.getRange(i + 1, 8).setValue(""); // Xóa PIN nếu tắt
      }
      writeLog(payload.admin_user, "TOGGLE_PIN", (enable ? "Bật" : "Tắt") + " mã PIN cho " + targetUser);
      return response({ status: "success", message: "Đã cập nhật trạng thái mã PIN" });
    }
  }
  return response({ status: "error", message: "User not found" });
}

function handleVerifyPIN(payload) {
  const sheet = ss.getSheetByName('users');
  const rows = sheet.getDataRange().getValues();
  const username = payload.username.toString().trim();
  const pin_in = payload.pin.toString().trim();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().trim() === username) {
      const pin_sheet = rows[i][7].toString();
      if (pin_sheet !== pin_in) return response({ status: "error", message: "Mã PIN không đúng!" });
      
      writeLog(username, "LOGIN_PIN", "Đăng nhập bằng mã PIN thành công");
      return response({ 
        status: "success", 
        user: {
          username: rows[i][0],
          role: rows[i][2].toString().toLowerCase(),
          group_id: rows[i][3].toString(),
          group_name: getGroupName(rows[i][3].toString()),
          fullname: rows[i][4],
          avatar: rows[i][5] || 'https://via.placeholder.com/150',
          is_pin_enabled: true,
          is_default_pin: (pin_sheet === '1234'),
          is_default_pass: (rows[i][1].toString().trim() === 'Abc@123')
        } 
      });
    }
  }
  return response({ status: "error", message: "Tài khoản không tồn tại" });
}

function handleVotePoll(payload) {
  try {
    // payload: { poll_id, manager, group_id, students: ['Name A', 'Name B'], option: 'Option A' }
    let sheet = ss.getSheetByName('poll_votes');
    if (!sheet) {
      sheet = ss.insertSheet('poll_votes');
      sheet.appendRow(['PollID', 'Timestamp', 'Manager', 'GroupID', 'StudentName', 'Option']);
    }
    
    const data = sheet.getDataRange().getValues();
    const voteMap = new Map(); // Key: PollID_StudentName -> RowIndex
    for (let i = 1; i < data.length; i++) {
      voteMap.set(String(data[i][0]) + '_' + String(data[i][4]), i + 1);
    }

    const timestamp = new Date();
    const students = Array.isArray(payload.students) ? payload.students : [payload.student_name];
    
    students.forEach(stName => {
        if(!stName) return;
        const key = String(payload.poll_id) + '_' + String(stName);
        if (voteMap.has(key)) {
            const r = voteMap.get(key);
            sheet.getRange(r, 6).setValue(payload.option);
            sheet.getRange(r, 2).setValue(timestamp);
        } else {
            sheet.appendRow([payload.poll_id, timestamp, payload.manager, payload.group_id, stName, payload.option]);
        }
    });

    return response({ status: 'success', message: 'Đã ghi nhận bình chọn (' + students.length + ' HS)' });
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}

function handleGetPollResults(payload) {
  try {
    const sheet = ss.getSheetByName('poll_votes');
    if (!sheet) return response({ status: 'success', data: {} });
    const data = sheet.getDataRange().getValues();
    const counts = {};
    const pollId = String(payload.poll_id);
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === pollId) {
        const opt = data[i][5];
        counts[opt] = (counts[opt] || 0) + 1;
      }
    }
    return response({ status: 'success', data: counts });
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}

function handleGetPollVotes(payload) {
  try {
    const sheet = ss.getSheetByName('poll_votes');
    if (!sheet) return response({ status: 'success', data: [] });
    const data = sheet.getDataRange().getValues();
    const votes = [];
    const pollId = String(payload.poll_id);
  
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === pollId) {
        votes.push({
          poll_id: data[i][0],
          timestamp: (data[i][1] instanceof Date ? Utilities.formatDate(data[i][1], "GMT+7", "dd/MM/yyyy HH:mm") : data[i][1]),
          manager: data[i][2],
          group_id: data[i][3],
          student_name: data[i][4],
          option: data[i][5]
        });
      }
    }
    return response({ status: 'success', data: votes });
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}

// ============================================================
// CÁC HÀM HỖ TRỢ BẢO MẬT (CAPTCHA & SECURITY LOGS)
// ============================================================

function getSecuritySheet() {
  let sheet = ss.getSheetByName('security_state');
  if (!sheet) {
    sheet = ss.insertSheet('security_state');
    sheet.appendRow(['Username', 'FailedAttempts', 'Devices', 'SuccessfulAttempts']); // Header
  }
  // Ensure the new header exists for old sheets
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (headers.length < 4 || headers[3] !== 'SuccessfulAttempts') {
    sheet.getRange(1, 4).setValue('SuccessfulAttempts');
  }
  return sheet;
}

function getSecurityData(username) {
  const sheet = getSecuritySheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(username)) {
      let devices = [];
      try { devices = JSON.parse(data[i][2] || '[]'); } catch(e) { devices = []; }
      return { 
        rowIndex: i + 1, 
        failedAttempts: Number(data[i][1]) || 0, 
        devices: devices,
        successfulAttempts: Number(data[i][3]) || 0
      };
    }
  }
  return { rowIndex: -1, failedAttempts: 0, devices: [], successfulAttempts: 0 };
}

function updateSecurityData(username, failedCount, devices, successfulCount) {
  const sheet = getSecuritySheet();
  const secData = getSecurityData(username);
  const devicesJson = JSON.stringify(devices);
  
  if (secData.rowIndex > 0) {
    // Cập nhật dòng cũ
    sheet.getRange(secData.rowIndex, 2, 1, 3).setValues([[failedCount, devicesJson, successfulCount]]);
  } else {
    // Thêm dòng mới
    sheet.appendRow([username, failedCount, devicesJson, successfulCount]);
  }
}

function handleUserChangePin(payload) {
  const sheet = ss.getSheetByName('users');
  const rows = sheet.getDataRange().getValues();
  const username = payload.username.toString().trim();
  const current_pin = payload.current_pin.toString().trim();
  const new_pin = payload.new_pin.toString().trim();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().trim() === username) {
      const pin_sheet = rows[i][7].toString();
      if (pin_sheet !== current_pin) return response({ status: "error", message: "Mã PIN hiện tại không đúng!" });

      sheet.getRange(i + 1, 8).setValue(new_pin);
      writeLog(username, "CHANGE_PIN", "Người dùng tự đổi mã PIN");
      return response({ status: "success", message: "Đổi mã PIN thành công!" });
    }
  }
  return response({ status: "error", message: "Tài khoản không tồn tại" });
}