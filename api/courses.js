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
 * GET /courses Route to return a paginated list of courses - admin only
 */
// Need to add code for if its an authenticated user
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

/*
 * POST /courses Route to create a new course with admin authentication
 */
router.post('/', async (req, res) => {
    // Need to add code for if its an authenticated user
    if (validateAgainstSchema(req.body, CourseSchema)) {
      try {
        const id = await insertNewCourse(req.body)
        res.status(201).send({
          id: id
        })
      } catch (err) {
        console.error(err)
        res.status(500).send({
          error: "Error inserting course into DB.  Please try again later."
        })
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid course object."
      })
    }
  })