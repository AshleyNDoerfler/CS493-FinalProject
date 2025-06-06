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
