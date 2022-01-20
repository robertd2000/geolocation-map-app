const express = require('express')
const cors = require('cors')

require('dotenv').config()

const PORT = process.env.PORT || 3000

//express app init
const app = express()

//enable CORS
app.use(cors())

// routes
app.use('/api/search/', require('./routes/searchResults.js'))

app.listen(PORT, () => console.log(`Server run on PORT - ${PORT}`))
