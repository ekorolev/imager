const express		= require('express')
const path			= require('path')
const gm 			= require('gm')
const fs 			= require('fs')
const bodyParser	= require('body-parser')
const fileUpload	= require('express-fileupload')

const CONFIG_PORT = process.env.PORT || 7070
const CONFIG_STATIC_FILES = path.join( __dirname, '../client' )
const CONFIG_FONT_FILE = path.join( __dirname, 'font.ttf' )
const CONFIG_TEXT_BG = '#eeeeee'
const CONFIG_TEXT_COLOR = '#000000'

const app = express()

// Configure server application
app.use( bodyParser() )
app.use( fileUpload() )
app.use( ( req, res, next ) => { req.reqId = getID(); log(`#${req.reqId}: request`); next(); })
app.use( express.static( CONFIG_STATIC_FILES ) )

app.get('/', ( req, res ) => {
	res.send('Hello, world!')
})

app.get('/status', ( req, res ) => {
	res.json({ status: 'work' })
})

app.post('/createtext', (req, res) => {
	let text = req.body.text

	log(text)
	if ( typeof text !== 'string' ) {
		return res.send({ error: 'text error' })
	} else if ( text.length === 0 ) {
		return res.send({ error: 'Empty text error' })
	}

	let filepath = path.join( __dirname, '../userfiles', `${req.reqId}.jpg`)

	let verticalPadding = 15
	let horizontalPadding = 15
	let imgWidth = 60
	let imgHeight = 60
	let fontSize = 30

	let rows = text.split('\n')
	let maxSymbolWidth = 0;
	rows.map( row => { if (row.length >maxSymbolWidth)maxSymbolWidth = row.length })
	imgWidth += maxSymbolWidth * ( fontSize / 2.8 )
	imgHeight += rows.length * ( fontSize / 1.2 )

	let image = gm( imgWidth, imgHeight, CONFIG_TEXT_BG )
	.fill( CONFIG_TEXT_COLOR )

	rows.map( (row, index) => {
		image = image.drawText( horizontalPadding, verticalPadding + fontSize * (index+1), row )
	})
	image = image.fontSize( fontSize ).font( CONFIG_FONT_FILE )

	image
	.write( filepath , error => {
		if (error) {
			log('Error happens', error);
			res.status(500).send('server error');
			return;
		}

		res.sendFile(filepath)
	})
})

app.post('/addcaption', (req, res) => {
	let text = req.body.text
	let filepath = path.join( __dirname, '../userfiles', `${req.reqId}.jpg`)

	if ( !req.files ) {
		return res.status(500).json({ error: 'Empty image error'})
	}

	let userImage = req.files.image

	if ( !userImage ) {
		return res.status(500).json({ error: 'Empty image error' })
	} else if ( typeof text !== 'string' ) {
		return res.status(500).json({ error: 'text error' })
	} else if ( !text.length ) {
		return res.status(500).json({ error: 'Empty text error' })
	}

	let textAreaVerticalPadding = 15
	let textAreaHorizontalPadding = 15
	let textAreaWidth = 60
	let textAreaHeight = 60
	let fontSize = 30

	let imageWidth = null
	let imageHeight = null
	let imageBottomPadding = 20
	let imageLeftPadding = 20

	let rows = text.split('\n')
	let maxSymbolWidth = 0;
	rows.map( row => { if (row.length >maxSymbolWidth)maxSymbolWidth = row.length })
	textAreaWidth += maxSymbolWidth * ( fontSize / 3 )
	textAreaHeight += rows.length * ( fontSize / 1.5 )

	let image = gm( userImage.data )

	image.size( ( error, size ) => {
		if (error) return res.status(500).send('server error')

		imageWidth = size.width
		imageHeight = size.height

		image = image.fill( CONFIG_TEXT_BG )
		.drawRectangle( imageLeftPadding, 
						imageHeight - textAreaHeight - imageBottomPadding,
						imageLeftPadding + textAreaWidth,
						imageHeight - imageBottomPadding )
		.fill( CONFIG_TEXT_COLOR )

		rows.map( (row, index) => {
			image = image.drawText( 
				imageLeftPadding + textAreaHorizontalPadding, 
				(imageHeight - textAreaHeight) + textAreaVerticalPadding + fontSize * index, 
				row 
			)
		})
		image = image.fontSize( fontSize ).font( CONFIG_FONT_FILE )

		image
		.write( filepath , error => {
			if (error) {
				log('Error happens', error);
				res.status(500).send('server error');
				return;
			}

			res.sendFile(filepath)
		})
	})
})

app.get('/image', (req, res) => {
	let id = req.query.id;

	let isExists = fs.existsSync(path.join(__dirname, '../userfiles/', `${id}.jpg`))
	if (!isExists)
		res.status(404).json({ error: 'file not found' })

	res.sendFile(path.join(__dirname, '../userfiles/', `${id}.jpg`))
})

module.exports = function () {
	app.listen(CONFIG_PORT, () => {
		log(`Server started at port ${CONFIG_PORT}`)
	})	
}
module.exports.app = app
module.exports.stop = function () { server.close() }

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

// Logging
function log () {
	if ( process.env.NODE_ENV !== 'test' ) {
		console.log.apply(null, arguments)
	}
}