const express		= require('express')
const path			= require('path')
const gm 			= require('gm')
const fs 			= require('fs')
const bodyParser	= require('body-parser')
const fileUpload	= require('express-fileupload')

const CONFIG_PORT = 7070
const CONFIG_STATIC_FILES = path.join( __dirname, '../client' )
const CONFIG_FONT_FILE = path.join( __dirname, 'font.ttf' )
const CONFIG_TEXT_BG = '#eeeeee'
const CONFIG_TEXT_COLOR = '#000000'

const app = express()

// Configure server application
app.use( bodyParser() )
app.use( fileUpload() )
app.use( ( req, res, next ) => { req.reqId = getID(); console.log(`#${req.reqId}: request`); next(); })
app.use( express.static( CONFIG_STATIC_FILES ) )

app.get('/', ( req, res ) => {
	res.send('Hello, world!')
})

app.post('/createtext', (req, res) => {
	let text = req.body.text
	let filepath = path.join( __dirname, '../userfiles', `${req.reqId}.jpg`)

	let verticalPadding = 15
	let horizontalPadding = 15
	let imgWidth = 60
	let imgHeight = 60
	let fontSize = 30

	let rows = text.split('\n')
	let maxSymbolWidth = 0;
	rows.map( row => { if (row.length >maxSymbolWidth)maxSymbolWidth = row.length })
	imgWidth += maxSymbolWidth * ( fontSize / 3 )
	imgHeight += rows.length * ( fontSize / 1.5 )

	let image = gm( imgWidth, imgHeight, CONFIG_TEXT_BG )
	.fill( CONFIG_TEXT_COLOR )

	rows.map( (row, index) => {
		image = image.drawText( horizontalPadding, verticalPadding + fontSize * (index+1), row )
	})
	image = image.fontSize( fontSize ).font( CONFIG_FONT_FILE )

	image
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
	let text = req.body.text
	let filepath = path.join( __dirname, '../userfiles', `${req.reqId}.jpg`)
	let userImage = req.files.image

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
				console.log('Error happens', error);
				res.status(500).send('server error');
				return;
			}

			res.sendFile(filepath)
		})
	})
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