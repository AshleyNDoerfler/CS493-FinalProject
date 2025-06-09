const { Router } = require('express')
const router = Router()

router.use('/assignments', require('./assignments')) // Add back in when stuff in the file
router.use('/courses', require('./courses'))
router.use('/users', require('./users'))

module.exports = router
