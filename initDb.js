const { connectToDb, getDbReference, closeDbConnection } = require('./lib/mongo')
const { insertNewAssignment }  = require('./models/assignments')

const assignmentData = require('./data/assignments.json')

const mongoCreateUser = process.env.MONGO_CREATE_USER
const mongoCreatePassword = process.env.MONGO_CREATE_PASSWORD

connectToDb(async function () {
  /*
   * Insert initial assignment data into the database
   */
  // const ids = await insertNewAssignment(assignmentData)
  // console.log("== Inserted assignments with IDs:", ids)

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
