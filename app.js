const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const {pool, selectAllUsers, selectPendingUsers, selectRegisteredTutors, selectRegisteredTutees, selectTutors, selectCourses, checkUser, insertUser, insertTutor, insertTutee, approveUser, deleteUser, banUser, deleteTutorAvailability, saveTutorAvailability, selectTutorAvailability, insertTutorialIntoTutees, checkExistingTutorialTutee, selectPendingTutorials} = require('./db');
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
    cookie: {maxAge: 10000000},
}));

//Body Parser and Cookie Parser
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

//Static Folders
const staticFolders = ['Login', 'Signup', 'Pictures'];

staticFolders.forEach(folder=>{
    app.use(express.static(folder));
});

// Serve static files for Admin
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve static files for Tutor
app.use('/tutor', express.static(path.join(__dirname, 'tutor')));

// Serve static files for Login
app.use('/tutee', express.static(path.join(__dirname, 'tutee')));

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

            if (user.role !== role) {
                res.status(403).send('Access Denied: Incorrect role for login');
                return;
              }

            if (user.role === 'Admin' && user.status === 'registered'){
                res.redirect('/admin');
            }
            else if (user.role === 'Tutee' && user.status === 'registered'){
                res.redirect(`/tutee/${user.userId}`);
            }
            else if (user.role === 'Tutor' && user.status === 'registered'){
                res.redirect(`/tutor/${user.userId}`);
            }
            else{
                window.alert('Access Denied');
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

    };

    if(existingUser && existingUser.status !== 'banned'){

        return res.status(400).send('User already exists');

    };

    if(existingUser && existingUser.status === 'banned'){

        return res.status(400).send('User account was banned')

    }

    else{

        const pendingUser = await insertUser(firstName, lastName, program, yearLvl, contactNo, studentNo, email, password, role, profPic, regForm, status);
        res.redirect('/');
        // window.alert(`You have succesfully registered your account. Please wait for the admin's approval for an access to your account. Thank you!`);
        
    }

    });

//Gets Pending Users from the Database
app.get('/admin/pending-users', async(req, res)=>{

    //Fetch Pending Users
    const users = await selectPendingUsers();
    //Send Pending Users as JSON
    res.json(users);

    });

//Pending User Approval Handler
app.post('/admin/approve-pending-user', async(req, res) => {

    const {userId, role, firstName, lastName} = req.body;

    try{
        
        await approveUser(userId);

    if (role === 'Tutor') {

        await insertTutor(userId, firstName, lastName);

    }
    else if(role === 'Tutee'){

        await insertTutee(userId, firstName, lastName);
        
    }
        res.status(200).json({ message: 'User approved successfully', userId });
    }
    catch(error){
        console.error('Error approving user:', error);
        res.status(500).json({ error: 'Failed to approve user' });
    }
    });

//Pending User Denial Handler
app.post('/admin/deny-pending-user', async(req, res)=>{

    const {userId} = req.body;
    await deleteUser(userId);

    });

//Banning User Handler
app.post('/admin/ban-user', async(req, res)=>{

    const {userId} = req.body;
    try{
        await banUser(userId);
        res.status(200).json({ message: 'User banned successfully', userId });
    }
    catch(error){
        console.error('Error banning user:', error);
        res.status(500).json({ error: 'Failed to ban user' });
    }
    });

//Show Registered Tutors on "Registered" Tab
app.get('/admin/registered-tutors', async(req, res)=>{

    const tutors = await selectRegisteredTutors();
    res.json(tutors);
    });

//Show Registered Tutees on "Registered" Tab
app.get('/admin/registered-tutees', async(req, res)=>{

    const tutees = await selectRegisteredTutees();
    res.json(tutees);
    });

//Render Admin
app.get('/admin', checkRole('Admin'), async(req, res)=>{

    res.sendFile(path.join(__dirname+'/Admin/admin.html'));

    });

//Render Tutee
app.get('/tutee/:userId', checkRole('Tutee'), (req, res)=>{
    res.sendFile(path.join(__dirname, 'Tutee', 'tutee.html'));
    });

app.get('/api/tutee/tutorial-registration', async(req, res)=>{

    //Tutee
    const {firstName, lastName} = req.session.user

    //Fetch courses from db
    const courses = await selectCourses();
    const tutors = await selectTutors();

    console.log(tutors);
    //Send courses to frontend as JSON
    res.json({courses, tutors, firstName, lastName});

    });

app.post('/api/tutee/tutorial-registration', async(req, res)=>{
    
    const {registrationDetails} = req.body;

    // Extract details from the registration request

    const { date, time, tutee } = registrationDetails;

    try {
        // Query to check if a session with the same date, time, and tutee exists
        const [existingSession] = await checkExistingTutorialTutee(date, time, tutee);

        // If a session exists, return an error response
        if (existingSession) {
            return res.status(400).json({
                error: "You already have a tutorial session scheduled for this date and time.",
            });
        }
        else{

            // If no session exists, insert the new registration
            await insertTutorialIntoTutees(registrationDetails);
            res.json({ message: "Tutorial session registered successfully!" });

        }

    } catch (error) {
        console.error("Error during tutorial registration:", error);
        res.status(500).json({ error: "An error occurred while registering the tutorial session." });
    }
    });

app.get('/api/tutee/tutorial-registration-pending-tutorials', async(req, res)=>{

    const pendingTutorials = await selectPendingTutorials();

    res.json(pendingTutorials);
    
    });

//Render Tutor  
app.get('/tutor/:userId', checkRole('Tutor'), (req, res)=>{
    res.sendFile(path.join(__dirname, 'Tutor', 'tutor.html'));
    });

app.get('/api/tutor/availability', async (req, res)=>{

    const {userId} = req.session.user;

    const availability = await selectTutorAvailability(userId);

    console.log('Backend availability:', availability);
    res.json({availability});

});

// Post tutor availability (to update the tutor's schedule)
app.post('/api/tutor/availability', async (req, res) => {
    const {userId} = req.session.user;
    const { availability } = req.body; // Get availability array

    try {

        // First, delete previous availability for the tutor
        await deleteTutorAvailability(userId);

        // Then, insert the new availability
        if (availability.length > 0) {
            await saveTutorAvailability(userId, availability);
        }

        res.json({ success: true, message: 'Availability updated successfully' });
        
    } catch (error) {
        console.error('Error saving availability:', error);
        res.status(500).json({ error: 'Failed to save availability' });
    }
});
