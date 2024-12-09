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
        AND
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

async function insertTutor(userId, firstName, lastName){

    const [user] = await pool.query(`
        INSERT
        INTO
        tutors(userId, firstName, lastName)
        VALUES (?, ?, ?)`, [userId, firstName, lastName]);

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
async function insertTutorialIntoTutees(registrationDetails){
    
    const query = 
    `
        INSERT INTO
        tutee_tutorials
        (tuteeId, status, tutor, course, topics, noOfTutees, date, time) VALUES (?,?,?,?,?,?,?,?)`;

    const {tuteeId, status, tutor, course, topics, noOfTutees, date, time} = registrationDetails;
        await pool.query(query, [tuteeId, status, tutor, course, topics, noOfTutees, date, time]);
};

async function insertTutorialIntoTutors(registrationDetails){

    const query = 
    `
    INSERT INTO
    tutor_tutorials
    (tutorId, noOfTutees, course, topics, date, time, tutee, program, status) VALUES (?,?,?,?,?,?,?,?,?)`;

const {tutorId, noOfTutees, course, topics, date, time, tutee, program, status} = registrationDetails;
    await pool.query(query, [tutorId, noOfTutees, course, topics, date, time, tutee, program, status]);

}

async function checkExistingTutorialTutee(date, time, tuteeId) {

    const [existingSession] = await pool.query(`
        SELECT * 
        FROM tutee_tutorials 
        WHERE date = ? AND time = ? AND tuteeId = ?`,[date, time, tuteeId]);

    return existingSession;
};

async function selectPendingTutorialsTutee(tuteeId){

    const [pendingTutorials] = await pool.query(`
        SELECT *
        FROM tutee_tutorials
        WHERE status = 'Pending'
        AND tuteeId = ?`, [tuteeId]);

    return pendingTutorials;
};

async function selectScheduledTutorialsTutee(tuteeId){

    const [scheduledTutorials] = await pool.query(`
        SELECT *
        FROM tutee_tutorials
        WHERE status = 'Scheduled'
        AND tuteeId = ?`, [tuteeId]);
    
    return scheduledTutorials;
}

async function deletePendingTutorialTutee(id){

    await pool.query(`
        DELETE FROM tutee_tutorials
        WHERE id=?`, [id]);
};

async function deletePendingTutorialTutor(id){

    await pool.query(`
        DELETE FROM tutor_tutorials
        WHERE id=?`, [id]);
}

async function selectPendingTutorialsTutor(tutorId){

    const [pendingTutorials] = await pool.query(`
        SELECT *
        FROM tutor_tutorials
        WHERE status = 'Pending'
        AND tutorId = ?`, [tutorId]);

    return pendingTutorials;
};

async function selectScheduledTutorialsTutor(tutorId){

    const [scheduledTutorials] = await pool.query(`
        SELECT *
        FROM tutor_tutorials
        WHERE status = 'Scheduled'
        AND tutorId = ?`, [tutorId]);

    return scheduledTutorials;
};

async function updateTutorialStatusToScheduledTutor(id){

    await pool.query(`
        UPDATE tutor_tutorials
        SET status='Scheduled'
        WHERE id=?`, [id]);
};

async function updateTutorialStatusToScheduledTutee(id){

    await pool.query(`
        UPDATE tutee_tutorials
        SET status='Scheduled'
        WHERE id=?`, [id]);
};

async function deleteScheduledTutorialTutee(id){

    await pool.query(`
        DELETE FROM tutee_tutorials
        WHERE id=?`, [id]);
};

async function deleteScheduledTutorialTutor(id){

    await pool.query(`
        DELETE FROM tutor_tutorials
        WHERE id=?`, [id]);
};

async function insertCompletedTutorialTutor(tutorId, tutor, tutee, program, course, topic, noOfTutees, date, roomNo, totalTime, status){

    await pool.query(`
        INSERT INTO
        all_tutorials(tutorId, tutor, tutee, program, course, topic, noOfTutees, date, roomNo, totalTime, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [tutorId, tutor, tutee, program, course, topic, noOfTutees, date, roomNo, totalTime, status]);
};

async function insertDeniedTutorialTutor(tutor, tutee, program, course, topic, noOfTutees, date, roomNo, totalTime, status){

    await pool.query(`
        INSERT INTO
        all_tutorials(tutor, tutee, program, course, topic, noOfTutees, date, roomNo, totalTime, status)
        VALUES (?,?,?,?,?,?,?,?,?,?)`, [tutor, tutee, program, course, topic, noOfTutees, date, roomNo, totalTime, status]);
};

async function selectCompletedTutorialTutor(tutor){

    await pool.query(`
        SELECT * FROM all_tutorials
        WHERE status='Completed' AND tutor=?`, [tutor]);
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

    return courses;

};

async function insertCancelledTutorialTutor(tutorId, tutor, tutee, program, course, topic, noOfTutees, date, roomNo, totalTime, status){

    await pool.query(`
        INSERT INTO
        all_tutorials(tutorId, tutor, tutee, program, course, topic, noOfTutees, date, roomNo, totalTime, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [tutorId, tutor, tutee, program, course, topic, noOfTutees, date, roomNo, totalTime, status])
};


module.exports = {pool, selectAllUsers, selectPendingUsers, selectRegisteredTutors, selectRegisteredTutees, selectTutors, selectCourses, checkUser, insertUser, insertTutor, insertTutee, approveUser, updateTuteeId, updateTutorId, deleteUser, banUser, saveTutorAvailability, deleteTutorAvailability, selectTutorAvailability, updateTutorTeachableCourses, insertTutorialIntoTutees, insertTutorialIntoTutors, checkExistingTutorialTutee, selectPendingTutorialsTutee, deletePendingTutorialTutee, deletePendingTutorialTutor, selectPendingTutorialsTutor, selectScheduledTutorialsTutee, selectScheduledTutorialsTutor, updateTutorialStatusToScheduledTutor, updateTutorialStatusToScheduledTutee, deleteScheduledTutorialTutee, deleteScheduledTutorialTutor, insertCompletedTutorialTutor, selectCompletedTutorialTutor, insertDeniedTutorialTutor, selectAllTutorialsTutor, selectTutorAvailabilityCourses, insertCancelledTutorialTutor};