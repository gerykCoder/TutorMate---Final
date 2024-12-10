const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const {pool, selectAllUsers, selectPendingUsers, selectRegisteredTutors, selectRegisteredTutees, selectTutors, selectCourses, checkUser, insertUser, insertTutor, insertTutee, approveUser, updateTuteeId, updateTutorId, deleteUser, banUser, countTutorialByStatus, deleteTutorAvailability, saveTutorAvailability, selectTutorAvailability, updateTutorTeachableCourses, checkExistingTutorialTutee, selectPendingTutorialsTutee, selectPendingTutorialsTutor, selectScheduledTutorialsTutor, selectScheduledTutorialsTutee, updateTutorialStatusToScheduled, deleteScheduledTutorial, selectCompletedTutorialTutor, selectAllTutorials, selectAllTutorialsTutor, selectTutorAvailabilityCourses, insertTutorial, deletePendingTutorial, insertIntoAllTutorials, selectPendingTutorialsAdmin, selectScheduledTutorialsAdmin, updateTutorialStatusToCancelled, selectAllAvailability, countPendingOrScheduledAdmin, countCompletedOrCancelledAdmin, countTutorialPerTutorAdmin, countAccsForApprovalAdmin,  deleteScheduledTutorialAdmin,insertCancelledByAdminToAllTutorials} = require('./db');
const checkRole = require('./middleware');
const { error, count } = require('console');

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        if(file.fieldname === 'profPic'){
            cb(null, 'profilePics')
        }
        else if(file.fieldname === 'regForm'){
            cb(null, 'regForms')
        }
 
    },
    filename: (req, file, cb)=>{
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const maxSize = 5*1000*1000;

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = {
            profPic: ['.jpg', '.jpeg', '.png'],
            regForm: ['.pdf']
        };
        const ext = path.extname(file.originalname).toLowerCase();

        if (file.fieldname === 'profPic' && !allowedExtensions.profPic.includes(ext)) {
            return cb(new Error('Invalid file type for profile picture. Allowed: JPG, JPEG, PNG.'));
        }
        if (file.fieldname === 'regForm' && !allowedExtensions.regForm.includes(ext)) {
            return cb(new Error('Invalid file type for registration form. Allowed: PDF.'));
        }

        cb(null, true);
    },
    limits: {fileSize: maxSize}
});

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

app.use('/profilePics', express.static(path.join(__dirname, 'profilePics')));
app.use('/regForms', express.static(path.join(__dirname, 'regForms')));

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
                res.redirect(`/tutee/${user.tuteeId}`);
            }
            else if (user.role === 'Tutor' && user.status === 'registered'){
                res.redirect(`/tutor/${user.tutorId}`);
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
app.post('/signup', upload.fields([
    { name: 'profPic', maxCount: 1 }, // For Profile Picture
    { name: 'regForm', maxCount: 1 } // For Registration Form
]), async(req, res)=>{
    
    const {firstName, lastName, program, yearLvl, contactNo, studentNo, email, password, role, status} = req.body

    console.log(`Received Data - First Name: ${firstName}, Last Name: ${lastName}, Program: ${program}, Year Lvl: ${yearLvl}, Contact No.: ${contactNo}, Student No.: ${studentNo}, Email: ${email}, Password: ${password}, Role: ${role}`);

        try{

            const existingUser = await checkUser(email, studentNo);

            if(yearLvl > 4 || yearLvl < 1){

                return res.status(400).send('Invalid Year Level');

            }

            if(existingUser){

                return res.status(400).send('User already exists');

            }

            else if(existingUser && existingUser.status === 'banned'){

                return res.status(400).send('User account was banned')

            }

            else{
                    // Extract file paths from uploaded files
                    const profPicPath = req.files['profPic'][0].path.replace(/\\/g, '/');
                    const regFormPath = req.files['regForm'][0].path.replace(/\\/g, '/');
                    console.log(profPicPath);

                    await insertUser(firstName, lastName, program, yearLvl, contactNo, studentNo, email, password, role, profPicPath, regFormPath, status);
                    res.redirect('/');
            }
        }
        catch(error){   
            console.error(error);
            return res.status(500).send('An error occurred. Please try again.');
        }
    });

//Render Admin
app.get('/admin', checkRole('Admin'), async(req, res)=>{

    res.sendFile(path.join(__dirname+'/Admin/admin.html'));

    });

app.get('/admin/home-counts', async(req, res)=>{

    const pendingOrScheduled = await countPendingOrScheduledAdmin();
    const completedOrCancelled = await countCompletedOrCancelledAdmin();
    const tutorialPerTutor = await countTutorialPerTutorAdmin();
    const accsForApproval = await countAccsForApprovalAdmin();

    res.json({
        pendingOrScheduled: pendingOrScheduled[0], 
        completedOrCancelled: completedOrCancelled[0], 
        tutorialPerTutor: tutorialPerTutor, 
        accsForApproval: accsForApproval[0]});
})

    //Gets Pending Users from the Database
app.get('/admin/pending-users', async(req, res)=>{

    //Fetch Pending Users
    const users = await selectPendingUsers();
    //Send Pending Users as JSON
    res.json(users);

    });

//Pending User Approval Handler
app.post('/admin/approve-pending-user', async(req, res) => {

    const {userId, firstName, lastName, program, yearLvl, profPic, role} = req.body;

    try{
        
        await approveUser(userId);

    if (role === 'Tutor') {

        await insertTutor(userId, firstName, lastName, program, yearLvl, profPic);
        await updateTutorId(userId);

    }
    else if(role === 'Tutee'){

        await insertTutee(userId, firstName, lastName, program);
        await updateTuteeId(userId);
        
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

    const [users] = await pool.query('SELECT profPic, regForm FROM users WHERE userId = ?', [userId]);
    const user = users[0];

    const profPicPath = path.join(__dirname, user.profPic);
    console.log(profPicPath);
    const regFormPath = path.join(__dirname, user.regForm);

    if(fs.existsSync(profPicPath)){
        fs.unlinkSync(profPicPath);
        console.log(`Deleted file: ${profPicPath}`);
    }

    if (fs.existsSync(regFormPath)) {
        fs.unlinkSync(regFormPath);
        console.log(`Deleted file: ${regFormPath}`);
    }

    await deleteUser(userId);

    });

//Banning User Handler
app.post('/admin/ban-user', async(req, res)=>{

    const {userId} = req.body;
    try{
        const [users] = await pool.query('SELECT profPic, regForm FROM users WHERE userId = ?', [userId]);
        const user = users[0];
    
        const profPicPath = path.join(__dirname, user.profPic);
        console.log(profPicPath);
        const regFormPath = path.join(__dirname, user.regForm);
    
        if(fs.existsSync(profPicPath)){
            fs.unlinkSync(profPicPath);
            console.log(`Deleted file: ${profPicPath}`);
        }
    
        if (fs.existsSync(regFormPath)) {
            fs.unlinkSync(regFormPath);
            console.log(`Deleted file: ${regFormPath}`);
        }

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

app.get('/admin/tutorial-session', async(req, res)=>{


    const tutorialCount = await countTutorialByStatus();
    const [tutorials] = await pool.query(`SELECT * FROM tutorials`);
    const tutors = await selectTutors();
    
    res.json({tutorialCount, tutorials, tutors});
    });

app.get('/admin/tutorial-session-details', async(req, res)=>{

    const pendingTutorials = await selectPendingTutorialsAdmin();
    const scheduledTutorials = await selectScheduledTutorialsAdmin();

    res.json({pendingTutorials, scheduledTutorials});
});

app.post('/admin/tutorial-session-cancel-tutorials', async(req, res)=>{

    const {cancelDate} = req.body;

    await insertCancelledByAdminToAllTutorials(cancelDate);
    await deleteScheduledTutorialAdmin(cancelDate);

    res.redirect('/admin');
    
});

app.get('/admin/tutorial-history', async(req, res)=>{

    const allTutorials = await selectAllTutorials();

    res.json(allTutorials);

    });

//Render Tutee
app.get('/tutee/:tuteeId', checkRole('Tutee'), (req, res)=>{
    res.sendFile(path.join(__dirname, 'Tutee', 'tutee.html'));
    });

app.get('/api/tutee/user-name', async(req, res)=>{

    const {lastName} = req.session.user;

    res.json({lastName});
})

app.get('/api/tutee/tutorial-registration', async(req, res)=>{

    //Tutee
    const {tuteeId, firstName, lastName, program} = req.session.user

    //Fetch courses from db
    const courses = await selectCourses();
    const tutors = await selectTutors();
    const tuteeName = `${firstName} ${lastName}`;

    console.log(tutors);
    //Send courses to frontend as JSON
    res.json({courses, tutors, tuteeId, tuteeName, program});

    });

app.post('/api/tutee/tutorial-registration', async(req, res)=>{
    
    const {registrationDetails} = req.body;

    // Extract details from the registration request

    const { date, time, tuteeId } = registrationDetails;

    try {
        // Query to check if a session with the same date, time, and tutee exists
        const [existingSession] = await checkExistingTutorialTutee(date, time, tuteeId);

        // If a session exists, return an error response
        if (existingSession) {
            return res.status(400).json({
                error: "You already have a tutorial session scheduled for this date and time.",
            });
        }
        else{

            // If no session exists, insert the new registration
            await insertTutorial(registrationDetails);
            res.json({ message: "Tutorial session registered successfully!" });

        }

    } catch (error) {
        console.error("Error during tutorial registration:", error);
        res.status(500).json({ error: "An error occurred while registering the tutorial session." });
    }
    });

app.get('/api/tutee/tutorial-registration-pending-tutorials', async(req, res)=>{

    const {tuteeId} = req.session.user;
    const pendingTutorials = await selectPendingTutorialsTutee(tuteeId);

    res.json(pendingTutorials);

    });

app.post('/api/tutee/tutorial-registration-pending-tutorials', async(req, res)=>{

    const {id} = req.body;

    await deletePendingTutorial(id);

});
    
app.get('/api/tutee/tutorial-registration-scheduled-tutorials', async(req, res)=>{

    const {tuteeId} = req.session.user;
    const scheduledTutorials = await selectScheduledTutorialsTutee(tuteeId);

    res.json(scheduledTutorials);
    
})

app.post('/api/tutee/tutorial-registration-cancel-scheduled-tutorials', async(req, res)=>{

    const {id, cancelledTutorial} = req.body;

    const {tutorId, tutor, tutee, program, course, topics, noOfTutees, date, roomNo, totalTime, status} = cancelledTutorial;
    await insertIntoAllTutorials(tutorId, tutor, tutee, program, course, topics, noOfTutees, date, roomNo, totalTime, status);
    await deleteScheduledTutorial(id);

});

app.get('/api/tutee/tutorial-list-of-tutors', async(req, res)=>{

    const courses = await selectCourses();
    const availability = await selectAllAvailability();
    const tutors = await selectTutors();

    res.json({courses, availability, tutors});
})


//Render Tutor  
app.get('/tutor/:tutorId', checkRole('Tutor'), (req, res)=>{
    res.sendFile(path.join(__dirname, 'Tutor', 'tutor.html'));
    });

app.get('/api/tutor/user-name', async(req, res)=>{

    const {lastName} = req.session.user;

    res.json({lastName});
})

app.get('/api/tutor/availability', async (req, res)=>{

    const {tutorId} = req.session.user;

    const availability = await selectTutorAvailability(tutorId);

    console.log('Backend availability:', availability);
    res.json({availability});

});

// Post tutor availability (to update the tutor's schedule)
app.post('/api/tutor/availability', async (req, res) => {
    const {tutorId} = req.session.user;
    const { availability } = req.body; // Get availability array

    try {

        // First, delete previous availability for the tutor
        await deleteTutorAvailability(tutorId);

        // Then, insert the new availability
        if (availability.length > 0) {
            await saveTutorAvailability(tutorId, availability);
        }

        res.json({ success: true, message: 'Availability updated successfully' });
        
    } catch (error) {
        console.error('Error saving availability:', error);
        res.status(500).json({ error: 'Failed to save availability' });
    }
});

app.get('/api/tutor/availability-teachable-courses', async(req, res)=>{

    const courses = await selectCourses();

    res.json(courses);
});

app.post('/api/tutor/availability-teachable-courses', async(req, res)=>{

    const {tutorId} = req.session.user;
    const {coursesHandled} = req.body;

    const courses = coursesHandled.join(', ');

    await updateTutorTeachableCourses(courses, tutorId);


});

app.get('/api/tutor/selected-courses', async(req, res)=>{

    const {tutorId} = req.session.user;

    try{
        const selectedCourses = await selectTutorAvailabilityCourses(tutorId);
        res.json(selectedCourses);
    }
    catch(error){
        console.error('Error fetching selected courses:', error);
        res.status(500).json({ error: 'Failed to fetch selected courses' });
    }
});

app.get('/api/tutor/tutorial-registration-pending-tutorials', async(req, res)=>{

    const {tutorId} = req.session.user;
    const pendingTutorials = await selectPendingTutorialsTutor(tutorId);

    res.json(pendingTutorials);

});

app.post('/api/tutor/tutorial-registration-accept-pending-tutorials', async(req, res)=>{

    const {id} = req.body;

    await updateTutorialStatusToScheduled(id);

});

app.post('/api/tutor/tutorial-registration-deny-pending-tutorials', async(req, res)=>{

    const {id, pendingTutorial} = req.body;

    const {tutorId, tutor, tutee, program, course, topic, noOfTutees, date, roomNo, totalTime, status} = pendingTutorial;

    await insertIntoAllTutorials(tutorId, tutor, tutee, program, course, topic, noOfTutees, date, roomNo, totalTime, status);
    await deletePendingTutorial(id)
});

app.get('/api/tutor/tutorial-registration-scheduled-tutorials', async(req, res)=>{

    const {tutorId, firstName, lastName} = req.session.user;
    const tutor = `${firstName} ${lastName}`;
    const scheduledTutorials = await selectScheduledTutorialsTutor(tutorId);
    const courses = await selectCourses();

    res.json({tutor, scheduledTutorials, courses});

});

app.post('/api/tutor/tutorial-registration-complete-scheduled-tutorials', async(req, res)=>{

    const {completedTutorial, id} = req.body;
    const {tutorId, tutor, tutee, program, course, topics, noOfTutees, date, roomNo, totalTime, status} = completedTutorial;

    await insertIntoAllTutorials(tutorId, tutor, tutee, program, course, topics, noOfTutees, date, roomNo, totalTime, status);
    await deleteScheduledTutorial(id);

});

app.post('/api/tutor/tutorial-registration-cancel-scheduled-tutorials', async(req, res)=>{

    const {id, cancelledTutorial} = req.body;
    const {tutorId, tutor, tutee, program, course, topics, noOfTutees, date, roomNo, totalTime, status} = cancelledTutorial;
    
    await insertIntoAllTutorials(tutorId, tutor, tutee, program, course, topics, noOfTutees, date, roomNo, totalTime, status);
    await deleteScheduledTutorial(id)

});

app.get('/api/tutor/tutorial-history', async(req, res)=>{

    const {tutorId} = req.session.user;

    const allTutorials = await selectAllTutorialsTutor(tutorId);

    res.json(allTutorials);

});

