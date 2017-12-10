const express	= require('express')
const path		= require('path')

const CONFIG_PORT = 7070
const CONFIG_STATIC_FILES = path.join( __dirname, '../client' )

const app = express()

// Configure server application
app.use( express.static( CONFIG_STATIC_FILES ) )

app.get('/', ( req, res ) => {
	res.send('Hello, world!')
})

app.listen(CONFIG_PORT, () => {
	console.log(`Server started at port ${CONFIG_PORT}`)
})