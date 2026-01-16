/**
 * MOCK API FOR DEMO PURPOSES
 * Simulates backend responses to ensure data is displayed without connection errors.
 */

const MOCK_DATA = {
    users: [
        { username: 'admin', password: '123', fullname: 'Administrator', role: 'admin', group_id: 'ADMIN', avatar: 'https://i.pravatar.cc/150?u=admin' },
        { username: 'manager', password: '123', fullname: 'Nguyễn Văn Quản Lý', role: 'manager', group_id: '1', group_name: 'Nhóm 1', avatar: 'https://i.pravatar.cc/150?u=manager' },
        { username: 'supervisor', password: '123', fullname: 'Trần Giám Sát', role: 'supervisor', group_id: 'SUP', avatar: 'https://i.pravatar.cc/150?u=sup', honors: '{"level":"vip10","titles":["CẤP QUẢN LÝ XỊN SÒ"]}' }
    ],
    students: [
        { id: 'ST1', fullname: 'Nguyễn Văn A', dob: '2010-01-01', class_name: '9A1', group_id: '1', group_display: 'Nhóm 1', school: 'THCS A', phone: '0901234567', address: 'Hà Nội' },
        { id: 'ST2', fullname: 'Trần Thị B', dob: '2010-05-15', class_name: '9A2', group_id: '1', group_display: 'Nhóm 1', school: 'THCS A', phone: '0909876543', address: 'Hà Nội' },
        { id: 'ST3', fullname: 'Lê Văn C', dob: '2010-09-20', class_name: '8B1', group_id: '2', group_display: 'Nhóm 2', school: 'THCS B', phone: '0912345678', address: 'Hà Nội' }
    ],
    groups: [
        { group_id: '1', group_name: 'Nhóm 1', id: '1', name: 'Nhóm 1' },
        { group_id: '2', group_name: 'Nhóm 2', id: '2', name: 'Nhóm 2' }
    ],
    notifications: [
        { id: 'NOTI1', title: 'Thông báo họp phụ huynh', content: 'Kính mời phụ huynh tham gia họp...', datetime: '2023-10-25 08:00', type: 'normal', early: 'FALSE' },
        { id: 'NOTI2', title: 'Bình chọn hoạt động hè', content: '{"question":"Đi đâu?","options":["Biển","Núi"],"deadline":"2023-12-31T23:59"}', datetime: '2023-10-26 09:00', type: 'poll', early: 'TRUE' }
    ],
    feedbacks: [
        { id: 'FB1', title: 'Lỗi đăng nhập', difficulty: 'Không đăng nhập được', timestamp: '2023-10-20 10:00', fullname: 'Nguyễn Văn A', status: 'pending' }
    ],
    evaluations: [
        ['ST1', 'Nguyễn Văn A', '1', 'Tốt', 'Tốt', 'Có', 'Tốt']
    ],
    uploads: [
        { id: 'UP1', filename: 'Ke_hoach_he.docx', uploader: 'admin', group_id: 'ADMIN', size: '2 MB', timestamp: '2023-10-01', data: '#' }
    ],
    fund_logs: [
        { timestamp: '2023-10-01', type: 'THU', amount: 200000, manager: 'manager', details: 'Thu quỹ đợt 1', paid_list: 'Nguyễn Văn A' }
    ]
};

window.originalFetch = window.fetch;
window.fetch = async (url, options) => {
    if (url && url.includes("script.google.com")) {
        console.log("Mock API Call:", JSON.parse(options.body).action);
        const body = JSON.parse(options.body);
        const action = body.action;
        const payload = body.payload || {};

        return new Promise(resolve => {
            setTimeout(() => {
                let responseData = { status: 'success', message: 'Thành công' };

                switch (action) {
                    case 'LOGIN':
                        const user = MOCK_DATA.users.find(u => u.username === payload.username && u.password === payload.password);
                        if (user) responseData.user = user;
                        else { responseData.status = 'error'; responseData.message = 'Sai tài khoản hoặc mật khẩu'; }
                        break;
                    case 'GET_USERS':
                        responseData.data = { students: MOCK_DATA.students, totalStudents: MOCK_DATA.students.length };
                        break;
                    case 'GET_ADMIN_STATS':
                        responseData.data = { 
                            present: 10, absent_perm: 2, absent: 1, 
                            history: [
                                { timestamp: '25/10/2023 08:00', student_name: 'Nguyễn Văn A', group_id: '1', status: 'present', recorded_by: 'manager' }
                            ],
                            total_students: MOCK_DATA.students.length,
                            eval_xs: 5, eval_tot: 10, eval_tb: 2, eval_yeu: 0, eval_none: 1
                        };
                        break;
                    case 'GET_ADMIN_EXTRAS':
                        responseData.data = { 
                            managers: MOCK_DATA.users.filter(u => u.role !== 'admin'), 
                            groups: MOCK_DATA.groups, 
                            notifications: MOCK_DATA.notifications 
                        };
                        break;
                    case 'GET_GROUPS_PUBLIC':
                        responseData.data = MOCK_DATA.groups;
                        break;
                    case 'GET_STUDENTS_BY_GROUP':
                        responseData.data = MOCK_DATA.students.filter(s => s.group_id === payload.group_id);
                        break;
                    case 'GET_REGISTRATIONS':
                        responseData.data = [{ id: 'REG1', pass: '123456', fullname: 'Học sinh mới', class_name: '6A', school: 'THCS C' }];
                        break;
                    case 'GET_UPLOADS':
                        responseData.data = MOCK_DATA.uploads;
                        break;
                    case 'GET_FEEDBACKS':
                        responseData.data = MOCK_DATA.feedbacks;
                        break;
                    case 'GET_EVALUATIONS':
                        responseData.data = MOCK_DATA.evaluations;
                        break;
                    case 'GET_FUND_LOGS':
                        responseData.data = MOCK_DATA.fund_logs;
                        break;
                    case 'GET_CONFIG':
                        responseData.data = { 
                            maintenance_mode: 'FALSE', 
                            troll_enabled: 'FALSE',
                            evaluation_enabled: 'TRUE',
                            marquee_enabled: 'TRUE',
                            marquee_text: 'Chào mừng đến với hệ thống quản lý sinh hoạt hè!'
                        };
                        break;
                    case 'REGISTER_TEMP':
                        responseData.data = { id: 'REG_NEW_' + Date.now(), pass: '123456' };
                        break;
                    case 'LOGIN_TEMP':
                        if(payload.id && payload.pass) {
                            responseData.data = { id: payload.id, fullname: 'Học sinh Test', dob: '2010-01-01' };
                        } else { responseData.status = 'error'; responseData.message = 'Sai thông tin'; }
                        break;
                    case 'UPDATE_PROFILE':
                    case 'CHANGE_PASSWORD':
                    case 'UPDATE_AVATAR':
                    case 'ADD_DATA':
                    case 'UPDATE_DATA':
                    case 'DELETE_DATA':
                    case 'SAVE_ATTENDANCE':
                    case 'SAVE_EVALUATION':
                    case 'SEND_FEEDBACK':
                    case 'REPLY_FEEDBACK':
                    case 'UPLOAD_FILE':
                    case 'SAVE_CONFIG':
                    case 'SAVE_FUND_LOG':
                    case 'SAVE_EXPENSE_LOG':
                    case 'VOTE_POLL':
                    case 'CONFIRM_REGISTRATION':
                        // Generic success for write operations
                        break;
                    default:
                        // Default success
                        break;
                }

                resolve({
                    ok: true,
                    json: () => Promise.resolve(responseData)
                });
            }, 300); // Simulate network delay
        });
    }
    return window.originalFetch(url, options);
};