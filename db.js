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
        tutors(firstName, lastName)
        VALUES (?, ?, ?)`, [userId, firstName, lastName]);

    return user[0];
};

async function insertTutee(userId, firstName, lastName){

    const [user] = await pool.query(`
        INSERT
        INTO
        tutees(userId, firstName, lastName)
        VALUES (?, ?, ?)`, [userId, firstName, lastName]);

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
async function deleteTutorAvailability(userId) {
    await pool.query('DELETE FROM availability WHERE userId = ?', [userId]);
};

async function saveTutorAvailability(userId, availability) {
    const query = 'INSERT INTO availability (userId, day, timeslot) VALUES (?, ?, ?)';
    
    for (let { day, time } of availability) {
        await pool.query(query, [userId, day, time]);
    }
};

async function selectTutorAvailability(userId) {

    const [availability] = await pool.query(`
        SELECT day, timeslot
        FROM availability
        WHERE userId = ?`, [userId]);

    return availability;
};

//Tutee functions
async function insertTutorialIntoTutees(registrationDetails){
    
    const query = 
    `
        INSERT INTO
        tutee_tutorials
        (noOfTutees, course, topics, date, time, tutee, tutor, status) VALUES (?,?,?,?,?,?,?,?)`;

    const {noOfTutees, course, topics, date, time, tutee, tutor, status} = registrationDetails;
        await pool.query(query, [noOfTutees, course, topics, date, time, tutee, tutor, status]);
};

async function checkExistingTutorialTutee(date, time, tutee) {

    const [existingSession] = await pool.query(`
        SELECT * 
        FROM tutee_tutorials 
        WHERE date = ? AND time = ? AND tutee = ?`,[date, time, tutee]);

    return existingSession;
};

async function selectPendingTutorials(){

    const [pendingTutorials] = await pool.query(`
        SELECT *
        FROM tutee_tutorials
        WHERE status='pending'`);

    return pendingTutorials;
};




module.exports = {pool, selectAllUsers, selectPendingUsers, selectRegisteredTutors, selectRegisteredTutees, selectTutors, selectCourses, checkUser, insertUser, insertTutor, insertTutee, approveUser, deleteUser, banUser, saveTutorAvailability, deleteTutorAvailability, selectTutorAvailability, insertTutorialIntoTutees, checkExistingTutorialTutee, selectPendingTutorials};