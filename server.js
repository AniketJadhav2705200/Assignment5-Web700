/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other 
*  source (including 3rd party web sites) or distributed to other students.
* 
*  Name: Aniket Jadhav ID: 120734231 Date: 2024-07-20
********************************************************************/ 

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/collegeData.js");

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ 
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }        
    }
}));

app.set('view engine', '.hbs');

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});


app.get("/", (req,res) => {
    res.render("home");
});

app.get("/about", (req,res) => {
    res.render("about");
});

app.get("/htmlDemo", (req,res) => {
    res.render("htmlDemo");
});

app.get("/students", (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(req.query.course)
            .then(function (data) {
                if (data.length > 0) {
                    res.render("students", { students: data });
                } else {
                    res.render("students", { message: "no results" });
                }
            })
            .catch(function (err) {
                res.render("students", { message: "no results" });
            });
    } else {
        data.getAllStudents()
            .then(function (data) {
                if (data.length > 0) {
                    res.render("students", { students: data });
                } else {
                    res.render("students", { message: "No results found" });
                }
            })
            .catch(function (err) {
                res.render("students", { message: "no results" });
            });
    }
});

app.get("/students/add", (req,res) => {
    data.getCourses()
        .then(courses => {
            res.render('addStudent', { courses: courses });
        })
        .catch(err => {
            console.error(err);
            res.render('addStudent', { courses: [] }); // Send an empty array if getCourses() fails
        });
});


app.post("/students/add", (req, res) => {
    let studentData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        addressStreet: req.body.addressStreet,
        addressCity: req.body.addressCity,
        addressProvince: req.body.addressProvince,
        TA: req.body.TA === 'on',
        status: req.body.status,
        // course: parseInt(req.body.course, 10) || null
    };

    data.addStudent(studentData).then(() => {
        res.redirect('/students');
    }).catch(err => {
        console.error(err);
        res.redirect('/students');
    });
});

app.get("/student/:studentNum", (req, res) => {
     // initalize an empty object to store the values
     let viewData = {};
     data.getStudentsByNum(req.params.studentNum).then((data) => {
         if (data) {
             viewData.student = data; //store student data in the "viewData" object as "student"
         } else {
             viewData.student = null; // set student to null if none were returned
         }
     })
     .catch(() => {
         viewData.student = null; // set student to null if there was an error
     })
     .then(data.getCourses)
     .then((data) => {
         viewData.courses = data; 
         for (let i = 0; i < viewData.courses.length; i++) {
             if (viewData.courses[i].courseId == viewData.student.course) {
             viewData.courses[i].selected = true;
             }
         }
     })
     .catch(() => {
         viewData.courses = []; // set courses to empty if there was an error
     })
     .then(() => {
         if (viewData.student == null) { 
             res.status(404).send("Student Not Found");
         } else {
             res.render("student", { viewData: viewData }); // render the "student" view
         }
     });
});

app.post("/student/update", (req, res) => {
    let studentNum = parseInt(req.body.studentNum, 10);
    let course = parseInt(req.body.course, 10);

    if (isNaN(studentNum) || isNaN(course)) {
        return res.status(400).send('Invalid input: studentNum and course must be numbers');
    }

    const updatedStudent = {
        studentNum: studentNum,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        addressStreet: req.body.addressStreet,
        addressCity: req.body.addressCity,
        addressProvince: req.body.addressProvince,
        TA: req.body.TA === 'on',
        status: req.body.status,
        // course: course
    };

    data.updateStudent(updatedStudent)
        .then(() => {
            res.redirect('/students');
        })
        .catch(err => {
            res.redirect('/students');
            // res.status(500).send("Unable to update student: " + err);
        });
});

app.get('/student/delete/:id', (req, res) => {
    data.deleteStudent(req.params.id)
        .then(() => {
            // Deletion successful, redirect to /courses
            res.redirect('/students');
        })
        .catch(err => {
            // Handle errors during deletion
            res.status(500).send("Unable to Remove Student / Student not found");
        });
});

app.get("/courses", (req,res) => {
    data.getCourses().then(courseData => {
        // res.json(data);
        res.render("courses", { courses: courseData });
    }).catch(err => {
        // res.json({ message: err });
        res.render("courses", { message: "no results" });
    });
});

app.get("/course/:id", (req, res) => {
    data.getCourseById(req.params.id)
        .then(data => {
            if (data === undefined) {
                // Data not found, send 404 response
                // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
                res.status(404).send("Course Not Found");
            } else {
                res.render("course", { course: data[0] });
            }
        })
        .catch(err => {
            res.status(500).send("An error occurred while retrieving the course");
        });
});

app.get('/courses/add', (req, res) => {
    res.render("addCourse")
});

app.post('/courses/add', (req, res) => {
    // Send to collegeData for processing
    data.addCourse(req.body).then(() => {
        res.redirect('/courses');
    }).catch(err => {
        console.error(err);
        res.redirect('/courses');
    });
});

app.post('/course/update', (req, res) => {
    let courseId = parseInt(req.body.courseId, 10);

    if (isNaN(courseId)) {
        return res.status(400).send('Invalid input: courseId must be numbers');
    }

    const updatedCourse = {
        courseId: courseId,
        courseCode: req.body.courseCode,
        courseDescription: req.body.courseDescription
    };

    data.updateCourse(updatedCourse)
        .then(() => {
            res.redirect('/courses');
        })
        .catch(err => {
            res.redirect('/courses');
            // res.status(500).send("Unable to update student: " + err);
        });
});


app.get('/course/delete/:id', (req, res) => {
    data.deleteCourse(req.params.id)
        .then(() => {
            // Deletion successful, redirect to /courses
            res.redirect('/courses');
        })
        .catch(err => {
            // Handle errors during deletion
            res.status(500).send("Unable to Remove Course / Course not found");
        });
});

app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});


data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

