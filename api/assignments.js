/*
 * API sub-router for assignments collection endpoints.
 */

const { Router } = require('express')

const { validateAgainstSchema } = require('../lib/validation')
const {
  AssignmentsSchema,
  insertNewAssignment,
  getAssignmentById,
  deleteAssignmentById,
  updateAssignmentById
} = require('../models/assignments')

const router = Router()

/*
 * POST /assignments - Route to create a new assignment.
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, AssignmentsSchema)) {
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

/*
 * GET /assignments/{id} - Route to fetch info about a specific assignment.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const assignment = await getAssignmentById(req.params.id)
    if (assignment) {
      res.status(200).send(assignment)
    } else {
      next()
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch assignment.  Please try again later."
    })
  }
})

/*
 * PATCH /assignments/{id} - Route to update a specific assignment.
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const result = await updateAssignmentById(req.params.id, req.body)
    if (result.matchedCount > 0) {
      res.status(200).send({"status": `Assignment updated`});
    } else {
      next()
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to update assignment.  Please try again later."
    })
  }
})

/*
 * DELETE /assignments/{id} - Route to delete a specific assignment.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const result = await deleteAssignmentById(id)
    if (result.deletedCount > 0) {
      res.status(200).send({"status": `Assignment ${id} deleted`});
    } else {
      res.status(404).send({"error": `Assignment ${id} not found`});
      console.log(`== ID ${id} not found`);
      next()
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch assignment.  Please try again later."
    })
  }
})

module.exports = router
