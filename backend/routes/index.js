const express = require('express');
const userRouter = require('./user');
const roomRouter = require('./room');

const router = express.Router();
router.use("/api/user", userRouter)

router.use("/api/room", roomRouter)

module.exports = router;