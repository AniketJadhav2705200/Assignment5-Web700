const Sequelize = require('sequelize');

// Set up sequelize to point to your Postgres database
var sequelize = new Sequelize('neondb', 'neondb_owner', 'sZcedgr86ARB', {
    dialectModule: require('pg'),
    host: 'ep-noisy-fog-a5456gpy.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }, 
    query: { raw: true }
});

// Define Student model
var Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

// Define Course model
var Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

//Relationship between Student and Course
Course.hasMany(Student, { foreignKey: 'course' });


class Data{
    constructor(students, courses){
        this.students = students;
        this.courses = courses;
    }
}

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch((err) => reject("Unable to sync the database:", err));
    });
}

module.exports.getAllStudents = function(){
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(data => resolve(data))
            .catch(err => reject("No results returned"));
    });
}

module.exports.getCourses = function(){
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(data => resolve(data))
            .catch(err => reject("No results returned"));
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        Student.findOne({ where: { studentNum: num } })
            .then(data => resolve(data))
            .catch(err => reject("No results returned"));
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { course: course } })
            .then(data => resolve(data))
            .catch(err => reject("No results returned"));
    });
};

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.findAll({ where: { courseId: id } })
            .then(data => resolve(data))
            .catch(err => reject("No results returned"));
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        // Ensure the TA property is set correctly
        studentData.TA = studentData.TA ? true : false;
        // Iterate over the studentData object and set empty strings to null
        for (let property in studentData) {
            if (studentData[property] === "") {
                studentData[property] = null;
            }
        }

        // Create a new student in the database
        Student.create(studentData)
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to create student: " + err);
            });
    });
};

module.exports.updateStudent = function (studentData) {
    studentData.TA = studentData.TA ? true : false;

    for (let property in studentData) {
        if (studentData[property] === "") {
            studentData[property] = null;
        }
    }

    return new Promise((resolve, reject) => {
        Student.update(studentData, { where: { studentNum: studentData.studentNum } })
            .then(() => resolve())
            .catch(err => reject("Unable to update student"));
    });
};

//Delete a student
module.exports.deleteStudent = function (id) {
    return new Promise((resolve, reject) => {
        Student.destroy({ where: { studentNum: id }})
            .then(() => resolve())
            .catch(err => reject("Unable to delete Student"));
    });
};

module.exports.addCourse = function(courseData) {
    return new Promise((resolve, reject) => {
        // Iterate over the courseData object and set empty strings to null
        for (let property in courseData) {
            if (courseData[property] === "") {
                courseData[property] = null;
            }
        }

        // Create a new student in the database
        Course.create(courseData)
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to create course: " + err);
            });
    });
}

// Update a course
module.exports.updateCourse = function(courseData) {
    for (let property in courseData) {
        if (courseData[property] === "") {
            courseData[property] = null;
        }
    }
    
    return new Promise((resolve, reject) => {
        Course.update(courseData, { where: { courseId: courseData.courseId } })
            .then(() => resolve())
            .catch(err => reject("Unable to update course"));
    });
};

// Delete a course
module.exports.deleteCourse = function(id) {
    return new Promise((resolve, reject) => {
        Course.destroy({ where: { courseId: id }})
            .then(() => resolve())
            .catch(err => reject("Unable to delete course"));
    });
};
