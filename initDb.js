const { connectToDb, getDbReference, closeDbConnection } = require('./lib/mongo')
const { bulkInsertNewBusinesses } = require('./models/business')

const businessData = require('./data/businesses.json')

const mongoCreateUser = process.env.MONGO_CREATE_USER
const mongoCreatePassword = process.env.MONGO_CREATE_PASSWORD

connectToDb(async function () {
  /*
   * Insert initial business data into the database
   */
  const ids = await bulkInsertNewBusinesses(businessData)
  console.log("== Inserted businesses with IDs:", ids)

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
