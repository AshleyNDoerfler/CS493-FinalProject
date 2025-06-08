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
 * Schema describing required/optional fields of a submissions object.
 */
const SubmissionsSchema = {
  assignmentId: { required: false },
  studentId: { required: true },
  timestamp: { required: false },
  grade: { required: false }
}
exports.SubmissionsSchema = SubmissionsSchema

/*
 * Executes a DB query to insert a new assignment into the database.  Returns
 * a Promise that resolves to the ID of the newly-created assignment entry.
 */
async function insertNewAssignment(assignment) {
  assignment = extractValidFields(assignment, AssignmentsSchema)
  if (ObjectId.isValid(assignment.courseId)) {
    assignment.courseId = new ObjectId(assignment.courseId);
  } else {
    return null;
  }
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

async function getAssignmentsByCourseId(courseId) {
    const db = getDbReference()
    const collection = db.collection('assignments')
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const files = await collection
        .find({ "courseId": new ObjectId(courseId) });
        return files
    }
}

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
        data = extractValidFields(data, AssignmentsSchema)
        const result = await collection
        .updateOne({ "_id": new ObjectId(id) }, { $set: data });
        return result
    }
}
exports.updateAssignmentById = updateAssignmentById

/*
 * Executes a DB query to return a single page of submissions.  Returns a
 * Promise that resolves to an array containing the fetched page of submissions.
 */
async function getSubmissionsPage(page, assignmentId) {
    const db = getDbReference()
    const files = await db.collection('submissions.files')
      .find({ "metadata.assignmentId": assignmentId });
    const count = await db.collection('submissions.files').countDocuments({ "metadata.assignmentId": assignmentId })

  /*
   * Compute last page number and make sure page is within allowed bounds.
   * Compute offset into collection.
   */
  const pageSize = 5
  const lastPage = Math.ceil(count / pageSize)
  page = page > lastPage ? lastPage : page
  page = page < 1 ? 1 : page
  const offset = (page - 1) * pageSize

  let results = await files
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray()

  results = results.map((r)=> ({
    _id: r._id,
    assignmentId: r.metadata.assignmentId,
    studentId: r.metadata.studentId,
    timestamp: r.metadata.timestamp,
    grade: r.metadata.grade,
    file: `/assignments/${assignmentId}/submissions/media/${r._id}`
  }))

  return {
    submissions: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  }
}
exports.getSubmissionsPage = getSubmissionsPage

async function setMetadata(data, submissionId) {
  const db = getDbReference()
  await db.collection('submissions.files').updateOne(
    { _id: submissionId },
    { $set: {
      "metadata.studentId": data.studentId,
      "metadata.grade": null,
      "metadata.timestamp": Date.toISOString()
    }}
  );
}
exports.setMetadata = setMetadata



async function createEnrollment({ assignmentId, studentId= null, courseId= null}) {
  const db = getDbReference()

  if (!asignmentId) {
    throw new error('assingmentId is required')
  }


  const assignmentCollection = db.collection('assignments')
  const submissionCollection = db.collection('submissions.files')
  const enrollmentCollection = db.collection('enrollment')

  const assignmentObjectId = new ObjectId(assignmentId)


  // if studentId is provided
  if (studentId && !courseId) {
    const assignment = await assignmentCollection.findOne({ _id: assignmentObjectId })
    if (!assignment) throw new Error('Assignment not found')
      courseId = assignment.courseId
  }

  // if courseId is provided
  if (courseId && !studentId) {
    const submission = await submissionCollection.findOne({ assignmentId: assignmentObjectId })
    if (!submission) throw new Error('Submission not found')
      studentId = submission.studentId
  }


  // check if already enrolled
  const existingEnrollment = await enrollmentCollection.findOne({
    userId: new ObjectId(studentId),
    courseId: new ObjectId(courseId)
  })

  if (existingEnrollment) {
    return { alreadyEnrolled: true }
  }

  // insert enrollment
  const result = await existingEnrollment.insertOne({
    userId: new ObjectId(studentId),
    courseId: new ObjectId(courseId)
  })

  return { enrollmentId: result.insertedId }

}

exports.createEnrollment = createEnrollment