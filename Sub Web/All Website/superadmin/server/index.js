require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 5555

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true })
app.use('/api/', limiter)

app.use('/api/auth', require('./routes/auth'))
app.use('/api/admins', require('./routes/admins'))
app.use('/api/users', require('./routes/users'))
app.use('/api/services', require('./routes/services'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/dashboard', require('./routes/dashboard'))

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Sholok Super Admin API running on port ${PORT}`)
})
