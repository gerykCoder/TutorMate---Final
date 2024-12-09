const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

async function selectAllUsers(){
    const [users] = await pool.query(`
        SELECT
        *
        FROM
        users`)
    return users;
};

async function selectPendingUsers(){
    const [users] = await pool.query(`
        SELECT
        *
        FROM
        users
        WHERE
        status = 'pending'`);
    return users;
};

async function selectRegisteredTutors(){
    const [users] = await pool.query(`
        SELECT
        *
        FROM
        users
        WHERE
        status = 'registered'
        AND
        role = 'Tutor'`);
    return users;
};

async function selectRegisteredTutees(){
    const [users] = await pool.query(`
        SELECT
        *
        FROM
        users
        WHERE
        status = 'registered'
        AND
        role = 'Tutee'`);
    return users;
};

async function selectTutors(){

    const [tutors] = await pool.query(`
        SELECT
        *
        FROM
        tutors`);

    return tutors;
}

async function selectCourses(){
    const [courses] = await pool.query(`
        SELECT
        *
        FROM
        courses`);
    return courses;
};

async function checkUser(email, studentNo){
    const [user] = await pool.query(`
        SELECT
        *
        FROM
        users
        WHERE
        email=?
        OR
        studentNo=?`, [email, studentNo]);

    return user[0];
};

//Registration functions
async function insertUser(firstName, lastName, program, yearLvl, contactNo, studentNo, email, password, role, profPic, regForm, status){

    const [user] = await pool.query(`
        INSERT
        INTO
        users(firstName, lastName, program, yearLvl, contactNo, studentNo, email, password, role, profPic, regForm, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [firstName, lastName, program, yearLvl, contactNo, studentNo, email, password, role, profPic, regForm, status]);

    return user[0];
};

async function insertTutor(userId, firstName, lastName, program, yearLvl, profPic){

    const [user] = await pool.query(`
        INSERT
        INTO
        tutors(userId, firstName, lastName, program, yearLvl, profPic)
        VALUES (?, ?, ?, ?, ?, ?)`, [userId, firstName, lastName, program, yearLvl, profPic]);

    return user[0];
};

async function insertTutee(userId, firstName, lastName, program){

    const [user] = await pool.query(`
        INSERT
        INTO
        tutees(userId, firstName, lastName, program)
        VALUES (?, ?, ?, ?)`, [userId, firstName, lastName, program]);

    return user[0];
}

//Admin Pending Tutorials approval functions
async function approveUser(userId){
    
    const [user] = await pool.query(`
        UPDATE
        users
        SET
        status = 'registered'
        WHERE
        userId = ?`, [userId]);
};

async function updateTuteeId(userId){

    await pool.query(`
        UPDATE users
        JOIN tutees ON users.userId = tutees.userId
        SET users.tuteeId = tutees.tuteeId
        WHERE users.userId = ?`, [userId])
};

async function updateTutorId(userId){

    await pool.query(`
        UPDATE users
        JOIN tutors ON users.userId = tutors.userId
        SET users.tutorId = tutors.tutorId
        WHERE users.userId = ?`, [userId])
};

async function deleteUser(userId){

    const [user] = await pool.query(`
        DELETE
        FROM
        users
        WHERE
        userId = ?`, [userId]);
};

async function banUser(userId){
    
    const [user] = await pool.query(`
        UPDATE
        users
        SET
        status = 'banned'
        WHERE
        userId = ?`, [userId]);
};

async function countTutorialByStatus(){

    const [tutorCount] = await pool.query(`
        SELECT tutor,
        SUM(CASE when status='Pending' then 1 else 0 END) AS pending_count,
        SUM(CASE when status='Scheduled' then 1 else 0 END) AS scheduled_count
        FROM tutorials
        GROUP BY tutor`);

    return tutorCount;

};

async function countPendingOrScheduledAdmin(){

    const [tutorialCount] = await pool.query(`
        SELECT 
        SUM(CASE when status='Pending' then 1 else 0 END) AS pending_count,
        SUM(CASE when status='Scheduled' then 1 else 0 END) AS scheduled_count
        FROM tutorials
        `)
    return tutorialCount;
};

async function countCompletedOrCancelledAdmin(){

    const [tutorialCount] = await pool.query(`
        SELECT
        SUM(CASE when status='Completed' then 1 else 0 END) AS completed_count,
        SUM(CASE when status IN ('Cancelled By Admin', 'Cancelled By Tutor', 'Cancelled By Tutee') then 1 else 0 END) AS cancelled_count
        FROM all_tutorials
        `)

    return tutorialCount;
};

async function countTutorialPerTutorAdmin(){

    const [tutorialCount] = await pool.query(`
        SELECT tutor, 
        COUNT(*) AS tutorial_count
        FROM all_tutorials
        WHERE status = 'Completed'
        GROUP BY tutor
        `)
    return tutorialCount;
}

async function countAccsForApprovalAdmin(){

    const [accounts] = await pool.query(`
        SELECT COUNT(*) AS account_count
        FROM users
        WHERE status = 'pending'
        `)
    return accounts;
};



async function selectPendingTutorialsAdmin(){

    const [tutorials] = await pool.query(`
        SELECT *
        FROM tutorials WHERE status='Pending'
    `)

    return tutorials;
};

async function selectScheduledTutorialsAdmin(){

    const [tutorials] = await pool.query(`
        SELECT *
        FROM tutorials WHERE status='Scheduled'
    `)

    return tutorials;
};

//Tutor functions
async function deleteTutorAvailability(tutorId) {
    await pool.query('DELETE FROM availability WHERE tutorId = ?', [tutorId]);
};

async function saveTutorAvailability(tutorId, availability) {
    const query = 'INSERT INTO availability (tutorId, day, timeslot) VALUES (?, ?, ?)';
    
    for (let { day, time } of availability) {
        await pool.query(query, [tutorId, day, time]);
    }
};

async function selectTutorAvailability(tutorId) {

    const [availability] = await pool.query(`
        SELECT day, timeslot
        FROM availability
        WHERE tutorId = ?`, [tutorId]);

    return availability;
};

async function updateTutorTeachableCourses(coursesHandled, tutorId){

    await pool.query(`
        UPDATE tutors
        SET coursesHandled=?
        WHERE tutorId=?`, [coursesHandled, tutorId]);
};

//Tutee functions

async function insertTutorial(registrationDetails){
    
    const query = 
    `
        INSERT INTO
        tutorials
        (tuteeId, tutorId, tutee, tutor, program, course, topics, noOfTutees, date, time, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;

    const {tuteeId, tutorId, tutee, tutor, program, course, topics, noOfTutees, date, time, status} = registrationDetails;
        await pool.query(query, [tuteeId, tutorId, tutee, tutor, program, course, topics, noOfTutees, date, time, status]);
};

async function checkExistingTutorialTutee(date, time, tuteeId) {

    const [existingSession] = await pool.query(`
        SELECT * 
        FROM tutorials 
        WHERE date = ? AND time = ? AND tuteeId = ?`,[date, time, tuteeId]);

    return existingSession;
};

async function selectPendingTutorialsTutee(tuteeId){
    
    const [pendingTutorials] = await pool.query(`
        SELECT *
        FROM tutorials
        WHERE status = 'Pending'
        AND tuteeId = ?`, [tuteeId]);

    return pendingTutorials;
};

async function selectScheduledTutorialsTutee(tuteeId){

    const [scheduledTutorials] = await pool.query(`
        SELECT *
        FROM tutorials
        WHERE status = 'Scheduled'
        AND tuteeId = ?`, [tuteeId]);
    
    return scheduledTutorials;
};

async function deletePendingTutorial(id){

    await pool.query(`
        DELETE FROM tutorials
        WHERE id=?`,[id]);
}

async function selectPendingTutorialsTutor(tutorId){

    const [pendingTutorials] = await pool.query(`
        SELECT *
        FROM tutorials
        WHERE status = 'Pending'
        AND tutorId = ?`, [tutorId]);

    return pendingTutorials;
};

async function selectScheduledTutorialsTutor(tutorId){

    const [scheduledTutorials] = await pool.query(`
        SELECT *
        FROM tutorials
        WHERE status = 'Scheduled'
        AND tutorId = ?`, [tutorId]);

    return scheduledTutorials;
};

async function updateTutorialStatusToScheduled(id){

    await pool.query(`
        UPDATE tutorials
        SET status='Scheduled'
        WHERE id=?`, [id]);
};

async function deleteScheduledTutorial(id){

    await pool.query(`
        DELETE FROM tutorials
        WHERE id=?`, [id]);
};

async function insertIntoAllTutorials(tutorId, tutor, tutee, program, course, topics, noOfTutees, date, roomNo, totalTime, status){

    await pool.query(`
        INSERT INTO
        all_tutorials(tutorId, tutor, tutee, program, course, topics, noOfTutees, date, roomNo, totalTime, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [tutorId, tutor, tutee, program, course, topics, noOfTutees, date, roomNo, totalTime, status]);
};

async function selectCompletedTutorialTutor(tutor){

    await pool.query(`
        SELECT * FROM all_tutorials
        WHERE status='Completed' AND tutor=?`, [tutor]);
};

async function selectAllTutorials(){

    const [allTutorials] = await pool.query(`
        SELECT * FROM all_tutorials`);

    return allTutorials;
};

async function selectAllTutorialsTutor(tutorId){

    const [allTutorials] = await pool.query(`
        SELECT * FROM all_tutorials
        WHERE tutorId=?`, [tutorId]);

    return allTutorials;
};

async function selectTutorAvailabilityCourses(tutorId){

    const [courses] = await pool.query(`
        SELECT coursesHandled
        FROM tutors
        WHERE tutorId=?`, [tutorId]);

    return courses[0];

};

async function updateTutorialStatusToCancelled(date){

    await pool.query(`
        UPDATE tutorials
        SET status='Cancelled By Admin'
        WHERE date=?`, [date]);
};

async function deleteScheduledTutorialAdmin(date){

    await pool.query(`
        DELETE FROM tutorials
        WHERE date=?`, [date]);
};

async function insertCancelledByAdminToAllTutorials(date){

    await pool.query(`
        INSERT INTO
        all_tutorials(tutorId, tutor, tutee, program, course, topics, noOfTutees, date, roomNo, totalTime, status)
        SELECT tutorId, tutor, tutee, program, course, topics, noOfTutees, date, 'None', 'None', 'Cancelled By Admin'
        FROM tutorials
        WHERE date=?`, [date]);
}

async function selectAllAvailability(){

    const [availability] = await pool.query(`
        SELECT * FROM
        availability`);
    return availability;
};

module.exports = {pool, selectAllUsers, selectPendingUsers, selectRegisteredTutors, selectRegisteredTutees, selectTutors, selectCourses, checkUser, insertUser, insertTutor, insertTutee, approveUser, updateTuteeId, updateTutorId, deleteUser, banUser, countTutorialByStatus, saveTutorAvailability, deleteTutorAvailability, selectTutorAvailability, updateTutorTeachableCourses, checkExistingTutorialTutee, selectPendingTutorialsTutee, selectPendingTutorialsTutor, selectScheduledTutorialsTutee, selectScheduledTutorialsTutor, updateTutorialStatusToScheduled, deleteScheduledTutorial, selectCompletedTutorialTutor, selectAllTutorials, selectAllTutorialsTutor, selectTutorAvailabilityCourses, insertTutorial, deletePendingTutorial, insertIntoAllTutorials, selectPendingTutorialsAdmin, selectScheduledTutorialsAdmin, updateTutorialStatusToCancelled, selectAllAvailability, countPendingOrScheduledAdmin, countCompletedOrCancelledAdmin, countTutorialPerTutorAdmin, countAccsForApprovalAdmin, selectPendingTutorialsTutee, selectScheduledTutorialsTutee, selectPendingTutorialsTutor, selectScheduledTutorialsTutor, deleteScheduledTutorialAdmin, insertCancelledByAdminToAllTutorials};