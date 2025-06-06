/*
 * User schema and data accessor methods
 */

const bcrypt = require('bcrypt');

// const { ObjectId } = require('mongodb')

const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

/*
 * Schema describing required/optional fields of a User object.
 */
const UserSchema = {
  name: { required: true }, 
  email: { required: true }, 
  password: { required: true }, 
  role: { required: true }, 
}
exports.UserSchema

const UserClientFields = ['name', 'email', 'password', 'role']
exports.UserClientFields = UserClientFields

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
 * Get a User from the database by id
 */
async function getUserByEmail(email) {
  const db = getDbReference()
  const collection = db.collection('users')
  return await collection.findOne({ email: email })
}

exports.getUserByEmail = getUserByEmail
