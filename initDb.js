const { connectToDb, getDbReference, closeDbConnection } = require('./lib/mongo')
const { insertNewAssignment }  = require('./models/assignments')
const { insertNewUser }  = require('./models/users')


const assignmentData = require('./data/assignments.json')
const userData = require('./data/user.json')


const mongoCreateUser = process.env.MONGO_CREATE_USER
const mongoCreatePassword = process.env.MONGO_CREATE_PASSWORD

connectToDb(async function () {
  /*
   * Insert initial assignment data into the database
   */
  const assignmentid = await insertNewAssignment(assignmentData)
  console.log("== Inserted assignment with ID:", assignmentid)


    /*
   * Insert initial admin user  into the database
   */

  const adminUserId = await insertNewAdminUser(userData)
  console.log(('== Inserted new admin with ID:', adminUserId))


  /*
   * Create a new, lower-privileged database user if the correct environment
   * variables were specified.
   */
  if (mongoCreateUser && mongoCreatePassword) {
    const db = getDbReference()
    const result = await db.addUser(mongoCreateUser, mongoCreatePassword, {
      roles: "readWrite"
    })
    console.log("== New user created:", result)
  }

  closeDbConnection(function () {
    console.log("== DB connection closed")
  })
})
