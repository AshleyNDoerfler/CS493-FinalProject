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
}
exports.UserSchema = UserSchema;

const UserClientFields = ['name', 'email', 'password', 'role']
exports.UserClientFields = UserClientFields

async function createAdminUser(name, email, password) {
  const adminData = {
    name,
    email,
    password,
    role: 'admin'
  }
  return await insertNewUser(adminData)
}

exports.createAdminUser = createAdminUser

async function requireAuthorization(req, res, next){
  try{
    console.log("Checking Authorization")
    console.log(req)

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
  return async function (req, res, next) {
    try {
      const userId = req.user?.id || req.user?.sub;
      const userRole = req.user?.role;
      const targetId = req.params.id || req.params.userId;       if (!userId || !userRole) {
        return res.status(401).json({ error: 'Missing authentication information.' });
      }

      const isAllowedRole = allowedRoles.includes(userRole);
      const isOwner = targetId && userId.toString() === targetId.toString();

      if (isAllowedRole || isOwner) {
        next();
      } else {
        res.status(403).json({ error: 'Privilege error' });
      }

    } catch (err) {
      console.error('Auth error:', err);
      res.status(500).json({ error: 'Internal server error during authorization.' });
    }
  };
}
exports.isAuthorizedUser = isAuthorizedUser

/*
 * Insert new User into the database
 */
async function insertNewUser(userData) {
  const db = getDbReference()
  const collection = db.collection('users')
  console.log(`== Inserting new user with data: ${JSON.stringify(userData)}`)

  const newUser = extractValidFields(userData, UserSchema)
  console.log(`== Inserting new user: ${JSON.stringify(newUser)}`)
  
  newUser.password = await bcrypt.hash(newUser.password, 8)
  console.log(`== Hashed password for new user ${newUser.password}`)
  const result = await collection.insertOne(newUser)
  console.log(`== Inserted new user with ID ${result.insertedId}`)
  return result.insertedId
}

exports.insertNewUser = insertNewUser

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
    return await collection.findOne({ _id: new ObjectId(id) })
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
