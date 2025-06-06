/*
 * Assignments schema and data accessor methods
 */

const { ObjectId } = require('mongodb')

const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

/*
 * Schema describing required/optional fields of an assignments object.
 */
const AssignmentsSchema = {
  courseId: { required: true },
  title: { required: true },
  points: { required: true },
  due: { required: true }
}
exports.AssignmentsSchema = AssignmentsSchema

/*
 * Executes a DB query to insert a new assignment into the database.  Returns
 * a Promise that resolves to the ID of the newly-created assignment entry.
 */
async function insertNewAssignment(assignment) {
  assignment = extractValidFields(assignment, AssignmentsSchema)
  const db = getDbReference()
  const collection = db.collection('assignments')
  const result = await collection.insertOne(assignment)
  return result.insertedId
}
exports.insertNewAssignment = insertNewAssignment