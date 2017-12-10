const express		= require('express')
const path			= require('path')
const gm 			= require('gm')
const fs 			= require('fs')
const bodyParser	= require('body-parser')

const CONFIG_PORT = 7070
const CONFIG_STATIC_FILES = path.join( __dirname, '../client' )
const CONFIG_FONT_FILE = path.join( __dirname, 'font.ttf' )

const app = express()

// Configure server application
app.use( bodyParser() )
app.use( ( req, res, next ) => { req.reqId = getID(); console.log(`#${req.reqId}: request`); next(); })
app.use( express.static( CONFIG_STATIC_FILES ) )

app.get('/', ( req, res ) => {
	res.send('Hello, world!')
})

app.post('/createtext', (req, res) => {
	let text = req.body.text
	let filepath = path.join( __dirname, '../userfiles', `${req.reqId}.jpg`)

	gm( 200, 400, '#eeeeee' )
	.drawText( 15, 15, text )
	.fontSize( 25 )
	.font( CONFIG_FONT_FILE )
	.write( filepath , error => {
		if (error) {
			console.log('Error happens', error);
			res.status(500).send('server error');
			return;
		}

		res.sendFile(filepath)
	})
})

app.post('/addcaption', (req, res) => {

})

app.listen(CONFIG_PORT, () => {
	console.log(`Server started at port ${CONFIG_PORT}`)
})

/* Support functions */
/* ================= */

// Get "unique" string
function getID () {
	let _return = ''
	let _length = 20
	let d = () => Math.floor(Math.random()*9)+1
	for (let i = 0; i < _length; ++i) _return+=`${d()}`;
	return _return;
}