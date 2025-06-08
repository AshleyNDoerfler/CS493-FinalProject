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
