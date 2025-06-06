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

/*
 * Executes a DB query to fetch detailed information about a single
 * specified assignment based on its ID. Returns a Promise that resolves to an object containing
 * information about the requested assignment.  If no assignment with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getAssignmentById(id) {
  const db = getDbReference()
  const collection = db.collection('assignments')
  if (!ObjectId.isValid(id)) {
    return null
  } else {
    const file = await collection
      .findOne({ "_id": new ObjectId(id) });
    return file
  }
}
exports.getAssignmentById = getAssignmentById

async function deleteAssignmentById(id) {
    const db = getDbReference()
    const collection = db.collection('assignments')
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const result = await collection
        .deleteOne({ "_id": new ObjectId(id) });
        return result
    }
}
exports.deleteAssignmentById = deleteAssignmentById

async function updateAssignmentById(id, data) {
    const db = getDbReference()
    const collection = db.collection('assignments')
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const result = await collection
        .updateOne({ "_id": new ObjectId(id) }, { $set: data });
        return result
    }
}
exports.updateAssignmentById = updateAssignmentById