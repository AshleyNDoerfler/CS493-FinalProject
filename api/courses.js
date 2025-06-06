/*
 * API sub-router for courses collection endpoints.
 */

const { Router } = require('express')

const { validateAgainstSchema } = require('../lib/validation')

const {
    CourseSchema,
    getCoursesPage,
    insertNewCourse,
    getCourseId,
    updateCourseById,
    deleteCourseById,
    getStudentsByCourseId,
    updateEnrollmentByCourseId,
    getRosterByCourseId,
    getAssignmentsByCourseId
  } = require('../models/courses')

const router = Router()

/*
 * GET /courses Route to return a paginated list of courses
 * Supports filtering by subject, number, term
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const filters = {
            subject: req.query.subject,
            number: req.query.number,
            term: req.query.term
        };
        const coursePage = await getCoursesPage(page, filters);
        coursePage.links = {};
        if (coursePage.page < coursePage.totalPages) {
            coursePage.links.nextPage = `/courses?page=${coursePage.page + 1}`;
            coursePage.links.lastPage = `/courses?page=${coursePage.totalPages}`;
        }
        if (coursePage.page > 1) {
            coursePage.links.prevPage = `/courses?page=${coursePage.page - 1}`;
            coursePage.links.firstPage = '/courses?page=1';
        }
        // res does not include students or assignments
        coursePage.courses = coursePage.courses.map(course => {
            delete course.students;
            delete course.assignments;
            return course;
        });
        res.status(200).send(coursePage);
    } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Error fetching course list. Please try again later"
        });
    }
});

/*
 * POST /courses Create a new course (admin only)
 */
router.post('/', async (req, res) => {

    // TODO: add authentication/authorization middleware for admin

    if (validateAgainstSchema(req.body, CourseSchema)) {
        try {
            // TODO: Check instructorId is a valid instructor
            const id = await insertNewCourse(req.body);
            res.status(201).send({ id });
        } catch (err) {
            res.status(500).send({ error: "Error inserting course. Try again later." });
        }
    } else {
        res.status(400).send({ error: "Request body does not contain a valid Course." });
    }
});

/*
 * GET /courses/:id Fetch data about a specific Course
 */

router.get('/:id', async (req, res) => {
    try {
        const course = await getCourseId(req.params.id);
        if (course) {

            // Remove students and assignments from response if present

            delete course.students;
            delete course.assignments;
            res.status(200).send(course);
        } else {
            res.status(404).send({ error: "Course not found." });
        }
    } catch (err) {
        res.status(500).send({ error: "Error fetching course." });
    }
});

/*
 * PATCH /courses/:id Update data for a specific Course
 */
router.patch('/:id', async (req, res) => {

    // TODO: add authentication/authorization middleware for admin or instructor


    const allowedFields = ['subject', 'number', 'title', 'term', 'instructorId'];
    const updates = {};
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (Object.keys(updates).length === 0) {
        return res.status(400).send({ error: "No valid fields to update." });
    }
    try {

        // TODO: implement updateCourseById

        const updated = await updateCourseById(req.params.id, updates);
        if (updated) {
            res.status(200).end();
        } else {
            res.status(404).send({ error: "Course not found." });
        }
    } catch (err) {
        res.status(500).send({ error: "Error updating course." });
    }
});

/*
 * DELETE /courses/:id Remove a specific Course (admin only)
 */
router.delete('/:id', async (req, res) => {

    // TODO: add authentication/authorization middleware for admin

    try {
        // TODO: Implement deleteCourseById
        const deleted = await deleteCourseById(req.params.id);
        if (deleted) {
            res.status(204).end();
        } else {
            res.status(404).send({ error: "Course not found." });
        }
    } catch (err) {
        res.status(500).send({ error: "Error deleting course." });
    }
});

/*
 * GET /courses/:id/students Fetch a list of the students enrolled in the Course
 */
router.get('/:id/students', async (req, res) => {

    // TODO: add authentication/authorization middleware for admin/instructor

    try {
        // TODO: Implement getStudentsByCourseId
        const students = await getStudentsByCourseId(req.params.id);
        if (students) {
            res.status(200).send({ students });
        } else {
            res.status(404).send({ error: "Course not found." });
        }
    } catch (err) {
        res.status(500).send({ error: "Error fetching students." });
    }
});

/*
 * POST /courses/:id/students Update enrollment for a Course
 */
router.post('/:id/students', async (req, res) => {

    // TODO: add authentication/authorization middleware for admin/instructor

    const { add, remove } = req.body;
    if (!Array.isArray(add) && !Array.isArray(remove)) {
        return res.status(400).send({ error: "Request body must contain 'add' and/or 'remove' arrays." });
    }
    try {

        // TODO: iimplement updateEnrollmentByCourseId

        const updated = await updateEnrollmentByCourseId(req.params.id, { add, remove });
        if (updated) {
            res.status(200).end();
        } else {
            res.status(404).send({ error: "Course not found." });
        }
    } catch (err) {
        res.status(500).send({ error: "Error updating enrollment." });
    }
});

/*
 * GET /courses/:id/roster fetch a CSV file containing list of the students enrolled in the course
 */
router.get('/:id/roster', async (req, res) => {

    // TODO: add authentication/authorization middleware for admin/instructor

    try {
        // TODO: add functionality to download a CSV file
        const students = await getStudentsByCourseId(req.params.id);
        if (!students) {
            return res.status(404).send({ error: "Course not found." });
        }
        // students should be an array of objects: { id, name, email }
        const csv = students.map(s =>
            `"${s.id}","${s.name}","${s.email}"`
        ).join('\n');
        res.set('Content-Type', 'text/csv');
        res.status(200).send(csv);
    } catch (err) {
        res.status(500).send({ error: "Error fetching roster." });
    }
});

/*
 * GET /courses/:id/assignments Fetch a list of the Assignments for the Course
 */
router.get('/:id/assignments', async (req, res) => {
    try {

        // TODO: Implement getAssignmentsByCourseId

        const assignments = await getAssignmentsByCourseId(req.params.id);
        if (assignments) {
            res.status(200).send({ assignments });
        } else {
            res.status(404).send({ error: "Course not found." });
        }
    } catch (err) {
        res.status(500).send({ error: "Error fetching assignments." });
    }
});

module.exports = router;

