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

async function insertUser(firstName, lastName, program, yearLvl, contactNo, studentNo, email, password, role, profPic, regForm, status){

    const [user] = await pool.query(`
        INSERT
        INTO
        users(firstName, lastName, program, yearLvl, contactNo, studentNo, email, password, role, profPic, regForm, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [firstName, lastName, program, yearLvl, contactNo, studentNo, email, password, role, profPic, regForm, status]);

    return user[0];
};

async function insertTutor(firstName, lastName){

    const [user] = await pool.query(`
        INSERT
        INTO
        tutors(firstName, lastName)
        VALUES (?, ?)`, [firstName, lastName]);

    return user[0];
};

async function insertTutee(firstName, lastName){

    const [user] = await pool.query(`
        INSERT
        INTO
        tutees(firstName, lastName)
        VALUES (?, ?)`, [firstName, lastName]);

    return user[0];
}

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

async function getAvailability(userId) {
    const [rows] = await pool.query(
        `SELECT 
        dayIndex, timeIndex 
        FROM 
        availability 
        WHERE 
        userId = ?`, [userId]);
    return rows;
};

async function clearAvailability(userId) {
    await pool.query(`
        DELETE 
        FROM 
        availability 
        WHERE 
        userId = ?`, [userId]);
};

async function insertAvailability(day, timeSlot) {
    await pool.query(
        `INSERT 
        INTO 
        availability (day, timeSlot) VALUES (?, ?, ?)`,[day, timeSlot]);
};

async function saveAvailability(userId, availability) {
    try {
        // Loop through each availability item and insert it into the database
        for (const item of availability) {
            const { day, time } = item;

            // Check if the availability already exists (optional)
            const [existingAvailability] = await pool.query(`
                SELECT * 
                FROM availability
                WHERE userId = ? AND day = ? AND timeSlot = ?`, [userId, day, time]);

            // If the availability doesn't exist, insert it
            if (existingAvailability.length === 0) {
                await pool.query(`
                    INSERT INTO availability (userId, day, timeSlot) 
                    VALUES (?, ?, ?)`, [userId, day, time]);
            }
        }
        return { message: 'Availability saved successfully!' };
    } catch (error) {
        console.error('Error saving availability:', error);
        throw new Error('Failed to save availability');
    }
}



module.exports = {pool, selectAllUsers, selectPendingUsers, selectRegisteredTutors, selectRegisteredTutees, selectCourses, checkUser, insertUser, insertTutor, insertTutee, approveUser, deleteUser, banUser, getAvailability, clearAvailability, insertAvailability, saveAvailability};