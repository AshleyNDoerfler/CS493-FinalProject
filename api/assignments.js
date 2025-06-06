/*
 * API sub-router for assignments collection endpoints.
 */

const { Router } = require('express')

const { validateAgainstSchema } = require('../lib/validation')
const {
  AssignmentsSchema
} = require('../models/assignments')

const router = Router()

/*
 * GET /assignments - Route to return a paginated list of assignments.
 */
router.get('/', async (req, res) => {
  try {
    res.status(200).send({ message: "All good" });
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Error fetching assignments list.  Please try again later."
    })
  }
})

/*
 * POST /assignments - Route to create a new assignment.
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, BusinessSchema)) {
    try {
      const id = await insertNewAssignment(req.body)
      res.status(201).send({
        id: id
      })
    } catch (err) {
      console.error(err)
      res.status(500).send({
        error: "Error inserting assignment into DB.  Please try again later."
      })
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid assignment object."
    })
  }
})

module.exports = router
