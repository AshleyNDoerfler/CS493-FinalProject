const { Router } = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const { insertNewUser, getUserById, getUserByEmail, getCoursesByInstructorId, getCoursesByStudentId, UserSchema } = require('../models/users')
const { validateAgainstSchema } = require('../lib/validation')

const router = Router()

const jwtKey = process.env.JWT_SECRET_KEY;

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
  

/*
 * Authenticated Admin can create a User
 */
router.post('/', requireAuthorization, isAuthorizedUser('admin'), async (req, res) => {
    if (!validateAgainstSchema(req.body, UserSchema)) {
        return res.status(400).json({ error: "Missing or invalid user fields" })
    }

    try{
        const user = await insertNewUser(req.body)
        res.status(201).send({ id: user.id })
    } catch (e) {
        console.error(e)
    }
})

/*
 * Authenticate a specific User with their email address and password.
 */
router.post('/login', requireAuthorization, isAuthorizedUser, async (req, res) => {
    const email = req.body.email
    const password = req.body.password


    if (!email || !password) {
        return res.status(400).send({error: "Email and password required"})
    }

    const result = await getUserByEmail(email)

    const password_hash = result.password;
    const is_password = await bcrypt.compare(password, password_hash);

    if(is_password) {
        payload = { "sub": result.id, admin: result.admin }
        expiration = { "expiresIn": "24h" }
        token = jwt.sign(payload, process.env.JWT_SECRET_KEY, expiration)
        res.status(200).send({
            token
        })
      } else {
        res.status(401).json({ error: "Incorrect username or password" })
        console.log(`== Failed login for user ${username}`)
      }
})

/*
 * Returns information about the specified User.
 * 
 * if the User has the 'instructor' role, the response should
 * include a list of the IDs of the Courses the User teaches
 * 
 * if the User has the 'student' role, the response should 
 * include a list of the IDs of the Courses the User is 
 * enrolled in
 * 
 * Only an authenticated User whose ID matches the ID of 
 * the requested User can fetch this information.
 * 
 */
router.get('/:id', requireAuthorization, async (req, res) => {
    try {
        const reqId = req.params.id
        const user = req.user

        if (user.id !== reqId) {
            return res.status(403).send({ error: "User not authorized" })
        }

        const reqUser = await getUserById(reqId)

        if (!reqUser) {
            return res.status(404).json({ error: 'User not found' })
        }

        const userInfo = {
            id: reqUser._id.toString(),
            name: reqUser.name,
            email: reqUser.email,
            role: reqUser.role
        }

        const courses = []
        if (reqUser.role === 'instructor') {
            courses = await getCoursesByInstructorId(requestedId)
        } else if (reqUser.role === 'student') {
            courses = await getCoursesByStudentId(requestedId)
        }

        res.status(200).json({ ...userInfo, courses }) 
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch user info' })
    }
})

module.exports = router;
