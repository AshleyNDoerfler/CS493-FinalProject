/*
 * Course schema and data accessor methods
 */

const { ObjectId } = require('mongodb')

const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

/*
 * Schema describing required/optional fields of a course object.
 */
const CourseSchema = {
  subject: { required: true },
  number: { required: true },
  title: { required: true },
  term: { required: true },
  instructorId: { required: true },
}
exports.CourseSchema = CourseSchema

/*
 * Executes a DB query to return a single page of course.  Returns a
 * Promise that resolves to an array containing the fetched page of course.
 */
async function getCoursesPage(page) {
  const db = getDbReference()
  const collection = db.collection('course')
  const count = await collection.countDocuments()

  /*
   * Compute last page number and make sure page is within allowed bounds.
   * Compute offset into collection.
   */
  const pageSize = 10
  const lastPage = Math.ceil(count / pageSize)
  page = page > lastPage ? lastPage : page
  page = page < 1 ? 1 : page
  const offset = (page - 1) * pageSize

  const results = await collection.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray()

  return {
    course: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  }
}
exports.getCoursesPage = getCoursesPage

/*
 * Executes a DB query to insert a new course into the database.  Returns
 * a Promise that resolves to the ID of the newly-created course entry.
 */
async function insertNewCourse(course) {
  course = extractValidFields(course, CourseSchema)
  const db = getDbReference()
  const collection = db.collection('course')
  const result = await collection.insertOne(course)
  return result.insertedId
}
exports.insertNewCourse = insertNewCourse

/*
 * Executes a DB query to fetch detailed information about a single
 * specified course based on its ID, including photo data for
 * the course.  Returns a Promise that resolves to an object containing
 * information about the requested course.  If no course with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getCourseById(id) {
  const db = getDbReference()
  const collection = db.collection('course')
  if (!ObjectId.isValid(id)) {
    return null
  } else {
    const results = await collection.aggregate([
      { $match: { _id: new ObjectId(id) } },
      { $lookup: {
          from: "photos",
          localField: "_id",
          foreignField: "courseId",
          as: "photos"
      }}
    ]).toArray()
    return results[0]
  }
}
exports.getCourseById = getCourseById

/*
 * Executes a DB query to bulk insert an array new course into the database.
 * Returns a Promise that resolves to a map of the IDs of the newly-created
 * course entries.
 */
async function bulkInsertNewCourse(course) {
  const courseToInsert = course.map(function (course) {
    return extractValidFields(course, CourseSchema)
  })
  const db = getDbReference()
  const collection = db.collection('course')
  const result = await collection.insertMany(courseToInsert)
  return result.insertedIds
}
exports.bulkInsertNewCourse = bulkInsertNewCourse

/*
 * Fetch a course by its ID.
 */
async function getCourseId(id) {
  const db = getDbReference()
  const collection = db.collection('course')
  if (!ObjectId.isValid(id)) {
    return null
  }
  const course = await collection.findOne({ _id: new ObjectId(id) })
  return course
}
exports.getCourseId = getCourseId

/*
 * Update a course by its ID.
 */
async function updateCourseById(id, updates) {
  const db = getDbReference()
  const collection = db.collection('course')
  if (!ObjectId.isValid(id)) {
    return false
  }
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  )
  return result.matchedCount > 0
}
exports.updateCourseById = updateCourseById

/*
 * Delete a course by its ID.
 */
async function deleteCourseById(id) {
  const db = getDbReference()
  const collection = db.collection('course')
  if (!ObjectId.isValid(id)) {
    return false
  }
  const result = await collection.deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}
exports.deleteCourseById = deleteCourseById

/*
 * Get students enrolled in a course by course ID.
 */
async function getStudentsByCourseId(courseId) {
  const db = getDbReference()
  const enrollmentCollection = db.collection('enrollment')
  const usersCollection = db.collection('users')
  if (!ObjectId.isValid(courseId)) {
    return null
  }
  const enrollments = await enrollmentCollection.find({ courseId: new ObjectId(courseId) }).toArray()
  const studentIds = enrollments.map(e => e.studentId)
  const students = await usersCollection.find({ _id: { $in: studentIds } }).toArray()
  return students.map(s => ({
    id: s._id.toString(),
    name: s.name,
    email: s.email
  }))
}
exports.getStudentsByCourseId = getStudentsByCourseId

/*
 * Update enrollment for a course by course ID.
 * Expects { add: [studentId], remove: [studentId] }
 */
async function updateEnrollmentByCourseId(courseId, { add = [], remove = [] }) {
  const db = getDbReference()
  const enrollmentCollection = db.collection('enrollment')
  if (!ObjectId.isValid(courseId)) {
    return false
  }
  // Add students
  if (Array.isArray(add) && add.length > 0) {
    const addDocs = add.map(studentId => ({
      courseId: new ObjectId(courseId),
      studentId: new ObjectId(studentId)
    }))
    await enrollmentCollection.insertMany(addDocs)
  }
  // Remove students
  if (Array.isArray(remove) && remove.length > 0) {
    await enrollmentCollection.deleteMany({
      courseId: new ObjectId(courseId),
      studentId: { $in: remove.map(id => new ObjectId(id)) }
    })
  }
  return true
}
exports.updateEnrollmentByCourseId = updateEnrollmentByCourseId

/*
 * Get roster for a course by course ID (returns array of students).
 */
async function getRosterByCourseId(courseId) {
  // Just reuse getStudentsByCourseId
  return await getStudentsByCourseId(courseId)
}
exports.getRosterByCourseId = getRosterByCourseId

/*
 * Get assignments for a course by course ID.
 */
async function getAssignmentsByCourseId(courseId) {
  const db = getDbReference()
  const assignmentsCollection = db.collection('assignments')
  if (!ObjectId.isValid(courseId)) {
    return null
  }
  const assignments = await assignmentsCollection.find({ courseId: new ObjectId(courseId) }).toArray()
  return assignments.map(a => ({
    id: a._id.toString(),
    title: a.title,
    due: a.due,
    points: a.points
  }))
}
exports.getAssignmentsByCourseId = getAssignmentsByCourseId
