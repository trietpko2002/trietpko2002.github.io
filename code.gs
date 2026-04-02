/**
 * Há»† THá»NG QUáº¢N LÃ SINH HOáº T HÃˆ - BACKEND (V8.0 - OPTIMIZED FILTERS)
 * Cáº­p nháº­t: Tá»± Ä‘á»™ng ghi danh sÃ¡ch ngÆ°á»i xem vÃ o cá»™t G cá»§a sheet 'notifications' Ä‘á»ƒ dá»… theo dÃµi trÃªn file Excel.
 */

const SPREADSHEET_ID = "1ebzd0DRukRVtInH7srEqOBeX7NntSkbHsqFcHlEe7hU";
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

const SCHOOL_LIST = [
  "THPT ChuyÃªn LÃª QuÃ½ ÄÃ´n - ÄÃ´ng Háº£i",
  "THPT Nguyá»…n TrÃ£i - Phan Rang",
  "THPT Chu VÄƒn An",
  "THPT ThÃ¡p ChÃ m",
  "THPT DÃ¢n tá»™c Ná»™i trÃº Ninh Thuáº­n",
  "TrÆ°á»ng THCS - THPT Tráº§n HÆ°ng Äáº¡o",
  "TrÆ°á»ng HNQT iSchool Ninh Thuáº­n",
  "TrÆ°á»ng TH-THCS-THPT Hoa Sen",
  "THCS Tráº§n PhÃº",
  "THCS LÃ½ Tá»± Trá»ng",
  "THCS VÃµ Thá»‹ SÃ¡u",
  "THCS LÃª Há»“ng Phong",
  "THCS Nguyá»…n VÄƒn Trá»—i",
  "TH&THCS Tráº§n Thi - Phan Rang",
  "TH&THCS LÃª ÄÃ¬nh Chinh",
  "TH&THCS VÃµ NguyÃªn GiÃ¡p",
  "THPT Ninh Háº£i",
  "THCS LÃª VÄƒn TÃ¡m"
];

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Há»‡ thá»‘ng SHH')
    .addItem('Má»Ÿ Panel quáº£n lÃ½ (Modal)', 'showAdminPanel')
    .addSeparator()
    .addItem('Kiá»ƒm tra & Táº¡o báº£ng máº«u', 'checkAndCreateSheets')
    .addItem('Táº¡o dá»¯ liá»‡u máº«u nhanh', 'createSampleData')
    .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function checkAndCreateSheets() {
  const ui = SpreadsheetApp.getUi();
  const required = {
    users: ['User', 'Pass', 'Role', 'Group', 'Name', 'Avatar', 'Email', 'LastChangeName', 'LastChangeUser', 'Honors', 'Phone', 'GoogleUID', 'GroqKey'],
    students: ['ID', 'Fullname', 'Gender', 'DOB', 'Class', 'School', 'Address', 'Phone', 'GroupID', 'Time', 'Location', 'Activities', 'Password', 'AllowChange'],
    groups: ['GroupID', 'GroupName', 'Limit'],
    attendance: ['ID', 'Timestamp', 'StudentID', 'Status', 'Reason', 'Recorder', 'GroupID'],
    notifications: ['ID', 'Title', 'Content', 'DateTime', 'Early', 'CreatedAt', 'ReadBy', 'Type', 'Location', 'Attachment', 'AttachmentName', 'Link', 'TargetGroup'],
    notification_reads: ['Timestamp', 'Username', 'Notification_ID']
  };

  let summary = [];
  for (let sheetName in required) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(required[sheetName]);
      summary.push(`Táº¡o má»›i sheet '${sheetName}' vÃ  header.`);
    } else {
      const values = sheet.getDataRange().getValues();
      if (!values || values.length === 0) {
        sheet.appendRow(required[sheetName]);
        summary.push(`Sheet '${sheetName}' cÃ³ header trá»‘ng, Ä‘Ã£ thÃªm header.`);
      } else {
        const header = values[0].map(h => h.toString().trim());
        const missing = required[sheetName].filter(col => !header.includes(col));
        if (missing.length > 0) {
          sheet.insertColumnAfter(header.length);
          for (let i = 0; i < missing.length; i++) {
            sheet.getRange(1, header.length + 1 + i).setValue(missing[i]);
          }
          summary.push(`Sheet '${sheetName}' thiáº¿u cá»™t [${missing.join(', ')}], Ä‘Ã£ thÃªm.`);
        } else {
          summary.push(`Sheet '${sheetName}' OK.`);
        }
      }
    }
  }

  ui.alert('Kiá»ƒm tra & Táº¡o báº£ng máº«u', summary.join('\n'), ui.ButtonSet.OK);
}

function createSampleData() {
  const studentsSheet = ss.getSheetByName('students');
  const userSheet = ss.getSheetByName('users');
  const groupsSheet = ss.getSheetByName('groups');

  if (groupsSheet.getLastRow() === 0) {
    groupsSheet.appendRow(['GroupID', 'GroupName', 'Limit']);
    groupsSheet.appendRow(['G1', 'Nhóm 1', 50]);
    groupsSheet.appendRow(['G2', 'Nhóm 2', 50]);
  }

  if (studentsSheet.getLastRow() === 0) {
    studentsSheet.appendRow(['ID', 'Fullname', 'Gender', 'DOB', 'Class', 'School', 'Address', 'Phone', 'GroupID', 'Time', 'Location', 'Activities', 'Password', 'AllowChange']);
    studentsSheet.appendRow(['ST1001', 'Nguyễn Văn A', 'Nam', '01/01/2008', '10A1', 'THPT ABC', 'Q1', '0987654321', 'G1', '2026-04-02 08:00', 'Trường', '', '123456', 'TRUE']);
  }

  if (userSheet.getLastRow() === 0) {
    userSheet.appendRow(['User', 'Pass', 'Role', 'Group', 'Name', 'Avatar', 'Email', 'LastChangeName', 'LastChangeUser', 'Honors', 'Phone', 'GoogleUID', 'GroqKey']);
    userSheet.appendRow(['admin', 'Admin@123', 'admin', 'ALL', 'Quản trị viên', '', 'admin@example.com', '', '', '', '0123456789', '', '']);
  }

  SpreadsheetApp.getUi().alert('Đã tạo dữ liệu mẫu cơ bản.');
}

function showAdminPanel() {
  const html = HtmlService.createHtmlOutputFromFile('AdminPanel')
      .setWidth(560)
      .setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, 'Báº£ng Ä‘iá»u khiá»ƒn SHH');
}

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.payload;

    // --- 1. NHÃ“M TÃNH NÄ‚NG Há»† THá»NG ---
    if (action === 'LOGIN') return handleLogin(payload);
    if (action === 'GET_USERS') return handleGetAdminData(); 
    if (action === 'GET_STUDENTS_BY_GROUP') return handleGetStudentsByGroup(payload);
    if (action === 'GET_GROUPS_PUBLIC') return handleGetGroupsPublic();
    if (action === 'GET_SCHOOL_LIST') return getSchoolList();
    
    // --- REGISTRATION FLOW ---
    if (action === 'REGISTER_TEMP') return handleRegisterTemp(payload);
    if (action === 'CHANGE_STUDENT_PASS') return handleManagerChangeStudentPass(payload);
    if (action === 'REGENERATE_PASS') return handleRegeneratePass(payload);

    if (action === 'SAVE_ATTENDANCE') return handleSaveAttendance(payload);
    if (action === 'GET_ADMIN_STATS') return handleGetAdminStats();
    if (action === 'GET_ADMIN_PANEL') return handleGetAdminPanel();
    if (action === 'GET_USER_ACCOUNTS') return handleGetUserAccounts();
    if (action === 'GET_NOTIFICATIONS') return handleGetNotifications();
    if (action === 'CREATE_NOTIFICATION') return handleCreateNotification(payload);
    if (action === 'GET_ADMIN_EXTRAS') return handleGetAdminExtras(payload);
    if (action === 'BACKUP_SYSTEM') return handleBackupSystem(payload);
    if (action === 'RESTORE_SYSTEM') return handleRestoreSystem(payload);
    
    // --- 2. NHÃ“M TÃNH NÄ‚NG LOGS & NOTIFICATIONS ---
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
    if (action === 'UPLOAD_MUSIC') return handleUploadMusic(payload);
    if (action === 'TEST_TELEGRAM') return handleTestTelegram(payload);

    // --- 2.1. FILE UPLOAD ---
    if (action === 'UPLOAD_FILE') return handleUploadFile(payload);
    if (action === 'GET_UPLOADS') return handleGetUploads(payload);

    // --- 3. NHÃ“M TÃNH NÄ‚NG CRUD ---
    if (action === 'ADD_DATA') return handleAddData(payload);
    if (action === 'UPDATE_DATA') return handleUpdateData(payload);
    if (action === 'DELETE_DATA') return handleDeleteData(payload);
    if (action === 'RESET_PASSWORD') return handleResetPassword(payload);
    if (action === 'IMPORT_STUDENTS') return handleImportStudents(payload);

    // --- 4. NHÃ“M TÃNH NÄ‚NG QUá»¸ ---
    if (action === 'SAVE_FUND_LOG') return handleSaveFundLog(payload);
    if (action === 'SAVE_EXPENSE_LOG') return handleSaveExpenseLog(payload);
    if (action === 'GET_FUND_LOGS') return handleGetFundLogs(payload);
    if (action === 'CHANGE_PASSWORD') return handleUserChangePassword(payload);
    if (action === 'UPDATE_AVATAR') return handleUserUpdateAvatar(payload);
    if (action === 'UPDATE_PROFILE') return handleUpdateProfile(payload);
    if (action === 'SAVE_USER_ADMIN') return handleSaveUserAdmin(payload);

    // --- 5. NHÃ“M TÃNH NÄ‚NG BÃŒNH CHá»ŒN (POLL) ---
    if (action === 'VOTE_POLL') return handleVotePoll(payload);
    if (action === 'GET_POLL_RESULTS') return handleGetPollResults(payload);
    if (action === 'GET_POLL_VOTES') return handleGetPollVotes(payload);

    // --- 6. NHÃ“M TÃNH NÄ‚NG GOOGLE LOGIN ---
    if (action === 'LOGIN_GOOGLE') return handleLoginGoogle(payload);
    if (action === 'LINK_GOOGLE') return handleLinkGoogle(payload);
    if (action === 'UNLINK_GOOGLE') return handleUnlinkGoogle(payload);
    if (action === 'UPDATE_USER_SETTINGS') return handleUpdateUserSettings(payload);

    return response({ status: 'error', message: 'Hành động không hợp lệ' });
  } catch (err) {
    return response({ status: 'error', message: 'Lỗi server: ' + err.toString() });
  }
}

function getUserByUsername(username) {
  const target = String(username || '').trim().toLowerCase();
  if (!target) return null;

  const userSheet = ss.getSheetByName('users');
  if (userSheet) {
    const users = userSheet.getDataRange().getValues();
    for (let i = 1; i < users.length; i++) {
      if (String(users[i][0] || '').trim().toLowerCase() === target) {
        return { sheet: userSheet, rowIndex: i + 1, row: users[i], type: 'users' };
      }
    }
  }

  const studentSheet = ss.getSheetByName('students');
  if (studentSheet) {
    const students = studentSheet.getDataRange().getValues();
    for (let i = 1; i < students.length; i++) {
      if (String(students[i][0] || '').trim().toLowerCase() === target) {
        return { sheet: studentSheet, rowIndex: i + 1, row: students[i], type: 'students' };
      }
    }
  }

  return null;
}

function handleLogin(payload) {
  try {
    const username = String(payload.username || '').trim();
    const password = String(payload.password || '').trim();

    if (!username || !password) {
      return response({ status: 'error', message: 'Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.' });
    }

    // 1. Quét bảng users (ưu tiên)
    const usersSheet = ss.getSheetByName('users');
    if (usersSheet) {
      const users = usersSheet.getDataRange().getValues();
      for (let i = 1; i < users.length; i++) {
        const userNameCell = String(users[i][0] || '').trim();
        const passwordCell = String(users[i][1] || '').trim();
        if (userNameCell.toLowerCase() === username.toLowerCase()) {
          if (passwordCell !== password) {
            return response({ status: 'error', message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
          }
          const role = String(users[i][2] || '').trim().toLowerCase();
          const group_id = String(users[i][3] || '').trim();
          const user = {
            username: userNameCell,
            role: role,
            group_id: group_id,
            group_name: getGroupName(group_id),
            fullname: String(users[i][4] || '').trim(),
            avatar: String(users[i][5] || '').trim() || 'https://via.placeholder.com/150',
            email: String(users[i][6] || '').trim(),
            honors: String(users[i][9] || '').trim(),
            phone: String(users[i][10] || '').trim(),
            is_default_pass: (passwordCell === 'Abc@123')
          };
          return response({ status: 'success', user: user });
        }
      }
    }

    // 2. Quét bảng students (nếu vẫn duy trì xác thực học sinh)
    const studentsSheet = ss.getSheetByName('students');
    if (studentsSheet) {
      const students = studentsSheet.getDataRange().getValues();
      for (let i = 1; i < students.length; i++) {
        const studentId = String(students[i][0] || '').trim();
        const studentPass = String(students[i][12] || '').trim(); // cột Password ở students
        if (studentId.toLowerCase() === username.toLowerCase()) {
          if (studentPass !== password) {
            return response({ status: 'error', message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
          }
          const group_id = String(students[i][8] || '').trim();
          const user = {
            username: studentId,
            role: 'student',
            group_id: group_id,
            group_name: getGroupName(group_id),
            fullname: String(students[i][1] || '').trim(),
            avatar: 'https://via.placeholder.com/150',
            email: String(students[i][7] || '').trim(),
            honors: '',
            phone: String(students[i][7] || '').trim(),
            is_default_pass: false
          };
          return response({ status: 'success', user: user });
        }
      }
    }

    return response({ status: 'error', message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
  } catch (err) {
    return response({ status: 'error', message: 'Lỗi đăng nhập: ' + err.toString() });
  }
}

function getSchoolList() {
  return response({ status: 'success', data: SCHOOL_LIST });
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
          email: userValues[i][6] || '', // Cá»™t G: Email
          honors: userValues[i][9] || '', // Cá»™t J: Vinh danh
          phone: userValues[i][10] || '' // Cá»™t K: SÄT
        });
      }
    }

    // 2. Groups
    const groupSheet = ss.getSheetByName('groups');
    const groupValues = groupSheet.getDataRange().getValues();
    
    // Count members for Admin
    const stSheet = ss.getSheetByName('students');
    const stRows = stSheet ? stSheet.getDataRange().getValues() : [];
    const counts = {};
    for (let i = 1; i < stRows.length; i++) {
      const gid = String(stRows[i][8]); 
      counts[gid] = (counts[gid] || 0) + 1;
    }

    const groups = [];
    for (let j = 1; j < groupValues.length; j++) {
      if (groupValues[j][0]) {
        const gid = String(groupValues[j][0]);
        groups.push({ 
            group_id: gid, 
            group_name: groupValues[j][1],
            limit: groupValues[j][2] ? parseInt(groupValues[j][2]) : 0,
            count: counts[gid] || 0
        });
      }
    }

    // --- Xá»¬ LÃ Dá»® LIá»†U Äá»ŒC THÃ”NG BÃO ---
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
             type: notiValues[k][7] || 'normal', // Cá»™t H: Loáº¡i (normal, online, offline)
             location: notiValues[k][8] || '',   // Cá»™t I: Link hoáº·c Äá»‹a Ä‘iá»ƒm
             attachment: notiValues[k][9] || '', // Cá»™t J: File Ä‘Ã­nh kÃ¨m (Base64)
             attachment_name: notiValues[k][10] || '', // Cá»™t K: TÃªn file 
             link: notiValues[k][11] || '',      // Cá»™t L: Link liÃªn káº¿t (Má»›i)
             read_by: readMap[nId] || [] // Váº«n láº¥y tá»« readMap Ä‘á»ƒ Ä‘áº£m báº£o chÃ­nh xÃ¡c nháº¥t
           });
        }
      }
    }

    return response({ status: "success", data: { managers, groups, notifications, read_ids: readIds } });
  } catch (err) { return response({ status: 'error', message: 'Lá»—i: ' + err.toString() }); }
}

function handleGetStudentsByGroup(payload) {
  const rows = ss.getSheetByName('students').getDataRange().getValues();
  const list = [];
  const realGroupName = getGroupName(payload.group_id.toString());
  // Structure Students: ID(0), Fullname(1), Gender(2), DOB(3), Class(4), School(5), Address(6), Phone(7), GroupID(8), Time(9), Location(10), Activities(11)
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][8].toString() === payload.group_id.toString()) {
      list.push({ 
        id: rows[i][0], fullname: rows[i][1], gender: rows[i][2], dob: formatDateVN(rows[i][3]), 
        class_name: rows[i][4], school: rows[i][5], address: rows[i][6], phone: rows[i][7],
        reg_time: rows[i][9], reg_loc: rows[i][10], reg_act: rows[i][11],
        group_name: realGroupName 
      });
    }
  }
  return response({ status: "success", data: list });
}

// HÃ m dá»n dáº¹p dá»¯ liá»‡u cÅ© (7 ngÃ y cho file, 30 ngÃ y cho link/feedback)
function cleanUpSystem() {
  const now = new Date().getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  // 1. Cleanup Uploads (7 days)
  const upSheet = ss.getSheetByName('uploads');
  if (upSheet) {
    const data = upSheet.getDataRange().getValues();
    // Duyá»‡t ngÆ°á»£c Ä‘á»ƒ xÃ³a khÃ´ng bá»‹ lá»—i index
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
    attendanceSheet.appendRow([timestamp, item.student_id, item.status === 'present' ? 'CÃ³ máº·t' : (item.status === 'absent_perm' ? 'Váº¯ng (P)' : 'Váº¯ng'), item.reason || "", payload.group_id, payload.recorded_by]);
  });
  writeLog(payload.recorded_by, "ATTENDANCE", "Äiá»ƒm danh nhÃ³m: " + payload.group_id);
  return response({ status: "success", message: "ÄÃ£ lÆ°u thÃ nh cÃ´ng!" });
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
    if (statusText === 'CÃ³ máº·t') stats.present++;
    else if (statusText === 'Váº¯ng (P)') stats.absent_perm++;
    else if (statusText === 'Váº¯ng') stats.absent++;
    stats.history.push({
      timestamp: attData[i][0] instanceof Date ? Utilities.formatDate(attData[i][0], "GMT+7", "dd/MM/yyyy HH:mm:ss") : attData[i][0].toString(),
      student_id: sId,
      student_name: studentMap[sId] || sId,
      status: statusText === 'CÃ³ máº·t' ? 'present' : (statusText === 'Váº¯ng (P)' ? 'absent_perm' : 'absent'),
      reason: attData[i][3] || "",
      group_id: groupMap[attData[i][4]] || attData[i][4],
      recorded_by: attData[i][5] || "Admin"
    });
  }
  return response({ status: "success", data: stats });
}

function handleGetAdminPanel() {
  try {
    const usersSheet = ss.getSheetByName('users');
    const studentsSheet = ss.getSheetByName('students');
    const groupsSheet = ss.getSheetByName('groups');
    const attendanceSheet = ss.getSheetByName('attendance');
    const notiSheet = ss.getSheetByName('notifications');

    const totalUsers = usersSheet ? Math.max(0, usersSheet.getLastRow() - 1) : 0;
    const totalStudents = studentsSheet ? Math.max(0, studentsSheet.getLastRow() - 1) : 0;
    const totalGroups = groupsSheet ? Math.max(0, groupsSheet.getLastRow() - 1) : 0;

    const aData = attendanceSheet ? attendanceSheet.getDataRange().getValues() : [];
    const today = new Date();
    const todayShort = Utilities.formatDate(today, 'GMT+7', 'yyyy-MM-dd');
    let present = 0, absent = 0, absentPerm = 0;
    for (let i = 1; i < aData.length; i++) {
      const row = aData[i];
      const ts = row[0];
      const status = (row[3] || row[2] || '').toString();
      const rowDate = ts instanceof Date ? Utilities.formatDate(ts, 'GMT+7', 'yyyy-MM-dd') : '';
      if (rowDate === todayShort) {
        if (status === 'CÃ³ máº·t' || status === 'present') present++;
        else if (status === 'Váº¯ng (P)' || status === 'absent_perm') absentPerm++;
        else if (status === 'Váº¯ng' || status === 'absent') absent++;
      }
    }

    const notiData = notiSheet ? notiSheet.getDataRange().getValues() : [];
    const totalNoti = Math.max(0, notiData.length - 1);

    const groups = [];
    if (groupsSheet) {
      const groupValues = groupsSheet.getDataRange().getValues();
      const studentValues = studentsSheet ? studentsSheet.getDataRange().getValues() : [];
      const groupCounts = {};
      for (let i = 1; i < studentValues.length; i++) {
        const gid = (studentValues[i][8] || '').toString();
        if (!gid) continue;
        groupCounts[gid] = (groupCounts[gid] || 0) + 1;
      }
      for (let j = 1; j < groupValues.length; j++) {
        if (!groupValues[j][0]) continue;
        groups.push({
          id: groupValues[j][0],
          name: groupValues[j][1],
          limit: parseInt(groupValues[j][2]) || 0,
          count: groupCounts[groupValues[j][0]] || 0
        });
      }
    }

    return response({ status: 'success', data: {
      totalUsers, totalStudents, totalGroups,
      attendanceToday: { present, absent, absentPerm },
      totalNotifications: totalNoti, groups
    }});
  } catch (e) {
    return response({ status: 'error', message: 'Lá»—i láº¥y dashboard: ' + e.toString() });
  }
}

function handleGetUserAccounts() {
  try {
    const sheet = ss.getSheetByName('users');
    if (!sheet) return response({ status: 'success', data: [] });
    const values = sheet.getDataRange().getValues();
    const accounts = [];
    for (let i = 1; i < values.length; i++) {
      if (!values[i][0]) continue;
      accounts.push({
        username: values[i][0],
        role: values[i][2],
        group: values[i][3],
        name: values[i][4],
        email: values[i][6],
        phone: values[i][10]
      });
    }
    return response({ status: 'success', data: accounts });
  } catch (e) {
    return response({ status: 'error', message: 'Lá»—i láº¥y tÃ i khoáº£n quáº£n lÃ½: ' + e.toString() });
  }
}

function handleGetNotifications() {
  try {
    const sheet = ss.getSheetByName('notifications');
    if (!sheet) return response({ status: 'success', data: [] });
    const rows = sheet.getDataRange().getValues();
    const notis = [];
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      notis.push({
        id: rows[i][0], title: rows[i][1], content: rows[i][2], datetime: rows[i][3], type: rows[i][7], link: rows[i][11] || ''
      });
    }
    return response({ status: 'success', data: notis });
  } catch (e) {
    return response({ status: 'error', message: 'Lá»—i láº¥y thÃ´ng bÃ¡o: ' + e.toString() });
  }
}

function handleCreateNotification(payload) {
  try {
    const sheet = ss.getSheetByName('notifications') || ss.insertSheet('notifications');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['ID','Title','Content','DateTime','Early','CreatedAt','ReadBy','Type','Location','Attachment','AttachmentName','Link','TargetGroup']);
    }
    const id = 'N' + new Date().getTime();
    const timestamp = new Date();
    sheet.appendRow([id, payload.title, payload.content, timestamp, payload.early || '', timestamp, '', payload.type || 'normal', payload.location || '', payload.attachment || '', payload.attachment_name || '', payload.link || '', payload.target_group || 'ALL']);
    writeLog(payload.admin_user || 'System', 'CREATE_NOTIFICATION', 'Táº¡o thÃ´ng bÃ¡o ' + id);
    return response({ status: 'success', message: 'ÄÃ£ táº¡o thÃ´ng bÃ¡o.' });
  } catch (e) {
    return response({ status: 'error', message: 'Lá»—i táº¡o thÃ´ng bÃ¡o: ' + e.toString() });
  }
}

function handleGetAdminData() {
  const userSheet = ss.getSheetByName('users');
  const studentSheet = ss.getSheetByName('students');
  const studentValues = studentSheet.getDataRange().getValues();
  const students = [];
  // Structure Students: ID(0), Fullname(1), Gender(2), DOB(3), Class(4), School(5), Address(6), Phone(7), GroupID(8), Time(9), Location(10), Activities(11)
  for (let j = 1; j < studentValues.length; j++) {
    if (studentValues[j][1]) {
      students.push({
        id: studentValues[j][0],
        fullname: studentValues[j][1],
        gender: studentValues[j][2],
        dob: formatDateVN(studentValues[j][3]),
        class_name: studentValues[j][4],
        school: studentValues[j][5],
        address: studentValues[j][6],
        phone: studentValues[j][7],
        group_id: studentValues[j][8],
        group_display: getGroupName(studentValues[j][8]),
        reg_time: studentValues[j][9],
        reg_loc: studentValues[j][10],
        reg_act: studentValues[j][11]
      });
    }
  }
  return response({ status: "success", data: { students: students, totalStudents: students.length, totalAdmins: userSheet.getLastRow() - 1 } });
}

function getGroupName(groupId) {
  if (groupId === "ALL") return "Há»‡ thá»‘ng";
  const groupSheet = ss.getSheetByName('groups');
  if (!groupSheet) return "NhÃ³m " + groupId;
  const groupValues = groupSheet.getDataRange().getValues();
  for (let i = 1; i < groupValues.length; i++) {
    if (groupValues[i][0].toString().trim() === groupId.toString().trim()) return groupValues[i][1];
  }
  return "NhÃ³m " + groupId;
}

function formatDateVN(dateVal) {
  if (!dateVal) return "";
  try {
    if (typeof dateVal === 'string' && dateVal.match(/^\d{4}-\d{2}-\d{2}$/)) {
       const parts = dateVal.split('-');
       return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (dateVal instanceof Date) return Utilities.formatDate(dateVal, "GMT+7", "dd/MM/yyyy");
    return dateVal.toString();
  } catch (e) { return dateVal.toString(); }
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function handleUpdateProfile(payload) {
  const currentUsername = String(payload.current_username).trim().toLowerCase();
  const newUsername = String(payload.new_username).trim();
  const newFullname = String(payload.fullname).trim();
  const newEmail = String(payload.email || '').trim();
  const newPhone = String(payload.phone || '').trim();
  const now = new Date();

  const userEntry = getUserByUsername(currentUsername);
  if (!userEntry) {
    return response({ status: "error", message: "KhÃ´ng tÃ¬m tháº¥y tÃ i khoáº£n: " + payload.current_username });
  }

  const sheet = userEntry.sheet;
  const rowIndex = userEntry.rowIndex;
  const currentRow = userEntry.row;
  const lastChangeName = currentRow[7] ? new Date(currentRow[7]) : null;
  const lastChangeUser = currentRow[8] ? new Date(currentRow[8]) : null;

  const role = (currentRow[2] || '').toString().trim().toLowerCase();

  // 1. TÃªn hiá»ƒn thá»‹ (7 ngÃ y)
  if (newFullname && newFullname !== currentRow[4]) {
    if (lastChangeName && (now - lastChangeName) < (7 * 24 * 60 * 60 * 1000)) {
      return response({ status: "error", message: "Báº¡n chá»‰ Ä‘Æ°á»£c Ä‘á»•i tÃªn hiá»ƒn thá»‹ 7 ngÃ y má»™t láº§n!" });
    }
    sheet.getRange(rowIndex, 5).setValue(newFullname);
    sheet.getRange(rowIndex, 8).setValue(now);

    if (role === 'student') {
      const students = ss.getSheetByName('students');
      if (students) {
        const data = students.getDataRange().getValues();
        for (let j = 1; j < data.length; j++) {
          if (String(data[j][0]).trim() === currentUsername) {
            students.getRange(j + 1, 2).setValue(newFullname);
            break;
          }
        }
      }
    }
  }

  // 2. Kiá»ƒm tra Ä‘á»•i Username (30 ngÃ y)
  if (newUsername && newUsername !== currentUsername) {
    if (lastChangeUser && (now - lastChangeUser) < (30 * 24 * 60 * 60 * 1000)) {
      return response({ status: "error", message: "Báº¡n chá»‰ Ä‘Æ°á»£c Ä‘á»•i Username 30 ngÃ y má»™t láº§n!" });
    }

    // Check duplicate in users and students tables
    const existingUser = getUserByUsername(newUsername);
    if (existingUser) {
      return response({ status: "error", message: "Username Ä‘Ã£ tá»“n táº¡i!" });
    }

    sheet.getRange(rowIndex, 1).setValue(newUsername);
    sheet.getRange(rowIndex, 9).setValue(now);

    if (role === 'student') {
      const students = ss.getSheetByName('students');
      if (students) {
        const data = students.getDataRange().getValues();
        for (let j = 1; j < data.length; j++) {
          if (String(data[j][0]).trim() === currentUsername) {
            students.getRange(j + 1, 1).setValue(newUsername);
            break;
          }
        }
      }
    }

    // If role changes to student where is found in user table, also migrate?
  }

  // 3. Cáº­p nháº­t Email & Phone
  sheet.getRange(rowIndex, 7).setValue(newEmail);
  sheet.getRange(rowIndex, 11).setValue(newPhone);

  if (role === 'student') {
    const students = ss.getSheetByName('students');
    if (students) {
      const data = students.getDataRange().getValues();
      for (let j = 1; j < data.length; j++) {
        if (String(data[j][0]).trim() === (newUsername || currentUsername)) {
          students.getRange(j + 1, 7).setValue(data[j][6]); // address untouched
          students.getRange(j + 1, 8).setValue(newPhone);
          break;
        }
      }
    }
  }

  return response({ status: "success", message: "Cáº­p nháº­t há»“ sÆ¡ thÃ nh cÃ´ng!" });
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

    return response({ status: 'success', message: 'ÄÃ£ ghi nháº­n bÃ¬nh chá»n (' + students.length + ' HS)' });
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}

function handleSaveUserAdmin(payload) {
  try {
    const sheet = ss.getSheetByName('users');
    const rows = sheet.getDataRange().getValues();
    const id = payload.id; // Username cÅ© (náº¿u update)
    const data = payload.data; // [User, Pass, Role, Group, Name, Avatar, Email, HonorsJSON]
    
    // data tá»« client gá»­i lÃªn: [u_name, u_pass, u_role, u_group, u_fullname, u_avatar, u_email, u_honors, u_phone]
    // Cáº¥u trÃºc Sheet: A:User, B:Pass, C:Role, D:Group, E:Name, F:Avatar, G:Email, H:LastChangeName, I:LastChangeUser, J:Honors, K:Phone

    if (payload.is_add) {
      // ThÃªm má»›i: Ghi Ä‘á»§ cÃ¡c cá»™t, H vÃ  I Ä‘á»ƒ trá»‘ng
      sheet.appendRow([data[0], data[1], data[2], data[3], data[4], data[5], data[6], "", "", data[7], data[8]]);
      return response({ status: 'success', message: 'ThÃªm tÃ i khoáº£n thÃ nh cÃ´ng!' });
    } else {
      // Cáº­p nháº­t: TÃ¬m dÃ²ng vÃ  ghi Ä‘Ã¨ cÃ¡c cá»™t A-G vÃ  J, giá»¯ nguyÃªn H-I
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0].toString().trim() === id) {
          // Láº¥y máº­t kháº©u hiá»‡n táº¡i
          const currentPassword = rows[i][1];
          // Náº¿u máº­t kháº©u gá»­i lÃªn lÃ  rá»—ng (do admin khÃ´ng sá»­a), giá»¯ láº¡i máº­t kháº©u cÅ©. NgÆ°á»£c láº¡i, dÃ¹ng máº­t kháº©u má»›i.
          const newPassword = (data[1] === "" || data[1] == null) ? currentPassword : data[1];

          // Ghi A-G (7 cá»™t Ä‘áº§u), sá»­ dá»¥ng máº­t kháº©u Ä‘Ã£ Ä‘Æ°á»£c xá»­ lÃ½
          sheet.getRange(i + 1, 1, 1, 7).setValues([[data[0], newPassword, data[2], data[3], data[4], data[5], data[6]]]);
          // Ghi J (Cá»™t 10)
          sheet.getRange(i + 1, 10).setValue(data[7]);
          // Ghi K (Cá»™t 11)
          sheet.getRange(i + 1, 11).setValue(data[8]);
          
          writeLog(payload.admin_user, "UPDATE_USER", "Cáº­p nháº­t user: " + id);
          return response({ status: 'success', message: 'Cáº­p nháº­t tÃ i khoáº£n thÃ nh cÃ´ng!' });
        }
      }
      return response({ status: 'error', message: 'KhÃ´ng tÃ¬m tháº¥y User ID: ' + id });
    }
  } catch (e) { return response({ status: 'error', message: 'Lá»—i lÆ°u user: ' + e.toString() }); }
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
// CÃC HÃ€M Há»– TRá»¢ Báº¢O Máº¬T (CAPTCHA & SECURITY LOGS)
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
    // Cáº­p nháº­t dÃ²ng cÅ©
    sheet.getRange(secData.rowIndex, 2, 1, 3).setValues([[failedCount, devicesJson, successfulCount]]);
  } else {
    // ThÃªm dÃ²ng má»›i
    sheet.appendRow([username, failedCount, devicesJson, successfulCount]);
  }
}

// ============================================================
// CÃC HÃ€M Xá»¬ LÃ GOOGLE LOGIN
// ============================================================

function handleLoginGoogle(payload) {
  const sheet = ss.getSheetByName('users');
  const rows = sheet.getDataRange().getValues();
  const googleUid = payload.google_uid;
  
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

  for (let i = 1; i < rows.length; i++) {
    // Check column L (index 11) for Google UID
    if (String(rows[i][11]) === String(googleUid)) {
        const role = rows[i][2].toString().trim().toLowerCase();
        
        if (isMaintenance && role !== 'admin') {
            return response({ status: "error", message: "Há»‡ thá»‘ng Ä‘ang báº£o trÃ¬." });
        }

        // --- SYNC GOOGLE INFO ---
        let updated = false;
        if (payload.fullname && payload.fullname !== rows[i][4]) {
             sheet.getRange(i + 1, 5).setValue(payload.fullname);
             rows[i][4] = payload.fullname;
             updated = true;
        }
        if (payload.avatar && payload.avatar !== rows[i][5]) {
             sheet.getRange(i + 1, 6).setValue(payload.avatar);
             rows[i][5] = payload.avatar;
             updated = true;
        }
        if (payload.email && payload.email !== rows[i][6]) {
             sheet.getRange(i + 1, 7).setValue(payload.email);
             rows[i][6] = payload.email;
             updated = true;
        }
        if (payload.phone && payload.phone !== rows[i][10]) {
             sheet.getRange(i + 1, 11).setValue(payload.phone);
             rows[i][10] = payload.phone;
             updated = true;
        }

        writeLog(rows[i][0], "LOGIN_GOOGLE", "ÄÄƒng nháº­p báº±ng Google" + (updated ? " (ÄÃ£ Ä‘á»“ng bá»™)" : ""));
        return response({ 
          status: "success", 
          user: { 
            username: rows[i][0], 
            role: role, 
            group_id: rows[i][3].toString(), 
            group_name: getGroupName(rows[i][3].toString()), 
            fullname: rows[i][4], 
            avatar: rows[i][5] || 'https://via.placeholder.com/150', 
            email: rows[i][6] || '', 
            is_default_pass: (rows[i][1].toString().trim() === 'Abc@123'),
            honors: rows[i][9] || '',
            phone: rows[i][10] || '',
            google_uid: rows[i][11] || '',
            groq_api_key: rows[i][12] || ''
          } 
        });
    }
  }
  return response({ status: "error", message: "TÃ i khoáº£n Google chÆ°a Ä‘Æ°á»£c liÃªn káº¿t." });
}

function handleLinkGoogle(payload) {
  try {
    const sheet = ss.getSheetByName('users');
    const rows = sheet.getDataRange().getValues();
    const username = payload.username;
    const googleUid = payload.google_uid;
    
    // Check if google_uid is already used
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][11]) === String(googleUid) && rows[i][0] !== username) {
            return response({ status: 'error', message: 'TÃ i khoáº£n Google nÃ y Ä‘Ã£ Ä‘Æ°á»£c liÃªn káº¿t vá»›i user khÃ¡c!' });
        }
    }

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().trim() === username) {
        sheet.getRange(i + 1, 12).setValue(googleUid); // Column L (12)
        
        if (payload.fullname) sheet.getRange(i + 1, 5).setValue(payload.fullname);
        if (payload.avatar) sheet.getRange(i + 1, 6).setValue(payload.avatar);
        if (payload.email) sheet.getRange(i + 1, 7).setValue(payload.email);
        if (payload.phone) sheet.getRange(i + 1, 11).setValue(payload.phone);

        writeLog(username, "LINK_GOOGLE", "LiÃªn káº¿t Google UID vÃ  Ä‘á»“ng bá»™");
        return response({ status: 'success', message: 'ÄÃ£ liÃªn káº¿t Google vÃ  Ä‘á»“ng bá»™ thÃ´ng tin thÃ nh cÃ´ng!' });
      }
    }
    return response({ status: 'error', message: 'User not found' });
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}

function handleUpdateUserSettings(payload) {
  try {
    const sheet = ss.getSheetByName('users');
    const rows = sheet.getDataRange().getValues();
    const username = String(payload.username).trim();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().trim() === username) {
        if (payload.groq_api_key !== undefined) sheet.getRange(i + 1, 13).setValue(payload.groq_api_key);
        return response({ status: 'success', message: 'ÄÃ£ cáº­p nháº­t cÃ i Ä‘áº·t ngÆ°á»i dÃ¹ng!' });
      }
    }
    return response({ status: 'error', message: 'User not found' });
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}

function handleUnlinkGoogle(payload) {
  try {
    const sheet = ss.getSheetByName('users');
    const rows = sheet.getDataRange().getValues();
    const username = payload.username;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().trim() === username) {
        sheet.getRange(i + 1, 12).setValue(""); // Clear Column L
        writeLog(username, "UNLINK_GOOGLE", "Há»§y liÃªn káº¿t Google");
        return response({ status: 'success', message: 'ÄÃ£ há»§y liÃªn káº¿t Google!' });
      }
    }
    return response({ status: 'error', message: 'User not found' });
  } catch (e) { return response({ status: 'error', message: e.toString() }); }
}
