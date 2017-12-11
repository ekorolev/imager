const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const server = require('../server/app')
const fs = require('fs')

chai.use(chaiHttp)

// Тестируем функцию преобразования текста в изображение
describe('Server', () => {
	it('Server status should be "work"', (done) => {
		chai.request(server.app)
		.get('/status')
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('status').eql('work')
			done()
		})
	})
})
describe('/createtext', () => {
	it('Empty text', (done) => {
		chai.request(server.app)
		.post('/createtext')
		.send({ text: '' })
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('error').eql('Empty text error')
			done()
		})
	})
	it('send valid text', done => {
		chai.request(server.app)
		.post('/createtext')
		.send({ text: 'test text' })
		.end((err, res) => {
			res.should.have.status(200)
			done()
		})
	})
})

describe('/appcaption', () => {
	it('Request without image', done => {
		chai.request(server.app)
		.post('/addcaption')
		.send({ text: 'Test text' })
		.end((err, res) => {
			res.should.have.status(500)
			res.body.should.be.a('object')
			res.body.should.have.property('error').eql('Empty image error')
			done()
		})
	})
	it('Valid request', done => {
		chai.request(server.app)
		.post('/addcaption')
		.field('text', 'test text')
		.attach('image', fs.readFileSync(__dirname+'/testImage.jpg'), 'image.jpg')
		.end((err, res) => {
			res.should.have.status(200)
			done()
		})
	})
})