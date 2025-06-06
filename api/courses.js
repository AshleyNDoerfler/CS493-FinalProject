/*
 * API sub-router for courses collection endpoints.
 */

const { Router } = require('express')

const { validateAgainstSchema } = require('../lib/validation')

const {
    CourseSchema,
    getCoursesPage,
    insertNewCourse,
    getCourseId
  } = require('../models/courses')

const router = Router()

/*
 * GET /courses Route to return a paginated list of courses
 */
router.get('/', async (req, res) => {
    try {
        const coursePage = await getCoursesPage(parseInt(req.query.page) || 1)
        coursePage.links = {}
        if (coursePage.page < coursePage.totalPages) {
            coursePage.links.nextPage = `/courses?page=${coursePage.page + 1}`
            coursePage.links.lastPage = `/courses?page=${coursePage.totalPages}`
        }
        if (coursePage.page > 1) {
            coursePage.links.prevPage = `/courses?page=${coursePage.page - 1}`
            coursePage.links.firstPage = '/courses?page=1'
        }
        res.status(200).send(coursePage)
    } catch (err) {
        console.error(err)
        res.status(500).send({
            error: "Error fetching course list. Please try again later"
        })
    }
})