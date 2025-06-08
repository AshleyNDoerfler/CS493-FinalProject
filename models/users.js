/*
 * User schema and data accessor methods
 */

const bcrypt = require('bcrypt');

const { ObjectId } = require('mongodb')

const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

const jwtKey = process.env.JWT_SECRET_KEY;

/*
 * Schema describing required/optional fields of a User object.
 */
const UserSchema = {
  name: { required: true }, 
  email: { required: true }, 
  password: { required: true }, 
  role: { required: true }, 
  admin: { required: false, default: false}
}
exports.UserSchema = UserSchema;

const UserClientFields = ['name', 'email', 'password', 'role']
exports.UserClientFields = UserClientFields

function requireAuthorization(req, res, next){
  try{
    const auth_value = req.get('Authorization')

    if(!auth_value || !auth_value.startsWith("Bearer")) {
      return res.status(401).send("Incorrect Token")
    }

    const token = auth_value.split(" ")[1]

    const payload = jwt.verify(token, jwtKey)

    console.log("Payload " + payload)

    req.user = payload.sub
    next()
  } catch (err) {
    res.status(403).send("Unable to Authorize User")
    next(err)
  }
}
exports.requireAuthorization = requireAuthorization

/*
 * Authorizes a user
 * 
 * Parameters:
 *  allowedRoles - who is authorized for this action? (Student, admin, instructor)
 * 
 * ex: 
 *  isAuthorizedUser('admin')
 */
function isAuthorizedUser(...allowedRoles) {
  return function (req, res, next) {
    const userId = req.params.userId
    const authenticatedUser = req.user
  
    if (!authenticatedUser || !authenticatedUser.id || !authenticatedUser.role) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  
    const isOwner = userId && authenticatedUser.id === userId
    const isAllowedRole = allowedRoles.includes(authenticatedUser.role)
  
    if (isOwner || isAllowedRole) {
      next()
    } else {
      res.status(403).json({ error: 'Insufficient privileges' })
    }
  }
}
exports.isAuthorizedUser = isAuthorizedUser

/*
 * Insert new User into the database
 */
async function insertNewUser(userData) {
  const db = getDbReference()
  const collection = db.collection('users')

  const newUser = extractValidFields(userData, UserSchema)
  
  newUser.password = bcrypt.hash(newUser.password, 8)
  const result = await collection.insertOne(newUser)
  return result.insertedId
}

exports.insertNewUser = insertNewUser



/*
 * Insert new User into the database
 */
async function insertNewAdminUser(userData) {
  const db = getDbReference()
  const collection = db.collection('users')

  const newUser = extractValidFields(userData, UserSchema)

  if (newUser.role == "instructor"){
    newUser.admin = true
  }

  newUser.password = bcrypt.hash(newUser.password, 8)
  const result = await collection.insertOne(newUser)
  return result.insertedId
}

exports.insertNewAdminUser = insertNewAdminUser



/*
 * Get a User from the database by email
 */
async function getUserByEmail(email) {
  const db = getDbReference()
  const collection = db.collection('users')
  return await collection.findOne({ email: email })
}

exports.getUserByEmail = getUserByEmail

/*
 * Get a User from the database by id
 */
async function getUserById(id) {
    const db = getDbReference()
    const collection = db.collection('users')
    return await collection.findOne({ _id: id })
}
  
exports.getUserById = getUserById

/*
 * Return a User's (instructor) courses
 */
async function getCoursesByInstructorId(id) {
    const db = getDbReference()
    const collection = db.collection('courses')

    const courses = await collection.find({ instructorId: new ObjectId(id) }).toArray();
    return courses.map(course => course._id.toString())
}
exports.getCoursesByInstructorId = getCoursesByInstructorId

/*
 * Return a User's (student) courses
 */
async function getCoursesByStudentId(id) {
    const db = getDbReference()
    const collection = db.collection('enrollment')
    
    const enrollments = await collection.find({ studentId: new ObjectId(id) }).toArray();
    
    return courses.map(course => course._id.toString())
}

exports.getCoursesByStudentId = getCoursesByStudentId
