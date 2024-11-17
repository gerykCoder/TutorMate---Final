const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const {pool, selectAllUsers, selectPendingUsers, checkUser, insertUser, approveUser, deleteUser} = require('./db');
const checkRole = require('./middleware');
const { error } = require('console');

//Server Port
app.listen(3000);

//CORS
app.use(
    cors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

//Express-Session
app.use(session({
    key: "userId",
    secret: "some_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 30000},
}));

//Body Parser and Cookie Parser
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

//Static Files
app.use(express.static('Login'));
app.use(express.static('SignUp'));
app.use(express.static('Admin'));
app.use(express.static('Tutee'));
app.use(express.static('Tutor'));
app.use(express.static('Pictures'));


//Render Login
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname+'/Login/login.html'));
})

//POST request handler for Login Form
app.post('/', async(req, res)=>{

    const {email, password, role} = req.body;
    console.log(`Received data - Username: ${email}, Password: ${password}, Role: ${role}`);  // Logging received data

    try{
        const [results] =  await pool.query(`
            SELECT
            *
            FROM
            users
            WHERE
            email=? and password=?`, [email, password]);
    
        if(results.length>0){
            const user = results[0];
            req.session.user = user;
            console.log("User session set: ", req.session.user);

            if (user.role === 'admin'){
                res.redirect('/admin');
            }
            else if (user.role === 'tutee'){
                res.redirect('/tutee');
            }
            else if (user.role === 'tutor'){
                res.redirect('/tutor');
            }
        }
        else{
            res.status(401).send('Invalid Email or Password');
        }
    }
    catch(error){
        res.status(500).send('Error while logging in')
    }
});

//Render Signup 
app.get('/signup', (req, res)=>{
    res.sendFile(path.join(__dirname+'/SignUp/sign-up.html'));
});

//POST request handler for Signup
app.post('/signup', async(req, res)=>{
    
    const {firstName, lastName, program, yearLvl, contactNo, studentNo, email, password, role, profPic, regForm, status} = req.body

    console.log(`Received Data - First Name: ${firstName}, Last Name: ${lastName}, Program: ${program}, Year Lvl: ${yearLvl}, Contact No.: ${contactNo}, Student No.: ${studentNo}, Email: ${email}, Password: ${password}, Role: ${role}`);

    const existingUser = await checkUser(email, studentNo);

    if(yearLvl > 4 || yearLvl < 1){

        return res.status(400).send('Invalid Year Level');

    }

    if(existingUser){

        return res.status(400).send('User already exists');

    }
    else{

        const pendingUser = await insertUser(firstName, lastName, program, yearLvl, contactNo, studentNo, email, password, role, profPic, regForm, status);
        res.send(`You have succesfully registered your account. Please wait for the admin's approval for an access to your account. Thank you!`);
        
    }

    });

//Gets Pending Users from the Database
app.get('/admin/pending-users', async(req, res)=>{

    //Fetch Pending Users
    const pendingUsers = await selectPendingUsers();
    //Send Pending Users as JSON
    res.json(pendingUsers);

    });

//Pending User Approval Handler
app.post('/admin/approve-pending-user', async(req, res) => {

    const {userId} = req.body;
    await approveUser(userId);

    });

//Pending User Denial Handler
app.post('/admin/deny-pending-user', async(req, res)=>{

    const {userId} = req.body;
    await deleteUser(userId);
    
    });

//Render Admin
app.get('/admin', checkRole('admin'), async(req, res)=>{

    res.sendFile(path.join(__dirname+'/Admin/admin.html'));

});

//Render Tutee
app.get('/tutee', checkRole('tutee'), (req, res)=>{
    res.sendFile(path.join(__dirname+'/Tutee/tutee.html'));
})

//Render Tutor
app.get('/tutor', checkRole('tutor'), (req, res)=>{
    res.sendFile(path.join(__dirname+'/Tutor/tutor.html'));
})