const chai = require('chai');
const expect=  require('chai').expect;
const server= require('../server');
const apiAdress= 'http://localhost:4000';
chai.use(require('chai-http'));
chai.use(require('chai-json-schema-ajv'));
const userCreatedSchemas = require('./schema/userCreated.json');
const jsonwebtoken = require('jsonwebtoken');
describe('Demonstration of test', function(){
	before(function(){
		// open the server
		server.start();
	});
	after(function(){
		//close the server
		server.close();
	});
	describe('test route /users',function(){
		
		it('should return successful response', async function(){
			//prepare http request
			//send the request to our server
			await chai.request(apiAdress).get('/users')
				.then(response => { 
					expect(response).to.have.status(200);
				})
				.catch(error => {
					throw error;
				})

		})

		/* it('should return status 200 with correct request', async function (){
			await chai.request(apiAdress)
				.post('/users')
				.send({
					FirstName: "Iheb",
			        LastName: "CHEMKHI",
			        DateOfBirth: "1999-10-12",
			        Email: "testuser@gmail.com",
			        Gender: "Male",
			        City: "Oulu",
			        CountryCode: "FI",
			        Username: "putra",
			        Password: "putra123"
				})
				.then(response => { expect(response.status).to.equal(200)})
				.catch(error => {throw error });

		})*/ 

		it('should reject (status 400) request with missing field(s)', async function (){

			await chai.request(apiAdress)
				.post('/users')
				.send({
			        LastName: "CHEMKHI",
			        DateOfBirth: "1999-10-12",
			        Email: "testuser@gmail.com",
			        Gender: "Male",
			        CountryCode: "FI",
			        Username: "putra",
			        Password: "putra123"
				})
				.then(response => { expect(response.status).to.equal(400)})
				.catch(error => {throw error });

			await chai.request(apiAdress)
				.post('/users')
				.send({
			        FirstName:"Iheb",
			        DateOfBirth: "1999-10-12",
			        Email: "testuser@gmail.com",
			        Gender: "Male",
			        CountryCode: "FI",
			        Username: "putra",
			        Password: "putra123"
				})
				.then(response => { expect(response.status).to.equal(400)})
				.catch(error => {throw error });
			
		})

		it('should reject request (status 400) with empty fields' , async function(){
			await chai.request(apiAdress)
				.post('/users')
				.send({
					FirstName: "",
			        LastName: "CHEMKHI",
			        DateOfBirth: "1999-10-12",
			        Email: "testuser@gmail.com",
			        Gender: "Male",
			        City: "Oulu",
			        CountryCode: "FI",
			        Username: "putra",
			        Password: "putra123"
				})
				.then(response => { expect(response.status).to.equal(400)})
				.catch(error => {throw error });
		})

		it('should reject request (status 400) with wrong CountryCode field' , async function(){
			await chai.request(apiAdress)
				.post('/users')
				.send({
					FirstName: "",
			        LastName: "CHEMKHI",
			        DateOfBirth: "1999-10-12",
			        Email: "testuser@gmail.com",
			        Gender: "Male",
			        City: "Oulu",
			        CountryCode: "FII",
			        Username: "putra",
			        Password: "putra123"
				})
				.then(response => { expect(response.status).to.equal(400)})
				.catch(error => {throw error });

			await chai.request(apiAdress)
				.post('/users')
				.send({
					FirstName: "",
			        LastName: "CHEMKHI",
			        DateOfBirth: "1999-10-12",
			        Email: "testuser@gmail.com",
			        Gender: "Male",
			        City: "Oulu",
			        CountryCode: "F",
			        Username: "putra",
			        Password: "putra123"
				})
				.then(response => { expect(response.status).to.equal(400)})
				.catch(error => {throw error });
		})

		it('should reject request (status 400) if the password is weak (less than 6 characters)' , async function(){
			await chai.request(apiAdress)
				.post('/users')
				.send({
					FirstName: "Iheb",
			        LastName: "CHEMKHI",
			        DateOfBirth: "1999-10-12",
			        Email: "testuser@gmail.com",
			        Gender: "Male",
			        City: "Oulu",
			        CountryCode: "FI",
			        Username: "putra",
			        Password: "123"
				})
				.then(response => { expect(response.status).to.equal(400)})
				.catch(error => {throw error });
		})

		it('should reject request (status 400) if the username already exists', async function(){
			await chai.request(apiAdress)
				.post('/users')
				.send({
					FirstName: "khalil",
					LastName: "CHEMKHI",
					DateOfBirth: "1999-10-12",
					Email: "khalilchemkhi@fifiabdo.com",
					Gender: "Male",
					City: "Oulu",
					CountryCode: "FI",
					Username: "putra",
					Password: "123456"
				})
				.then(response =>{ expect(response.status).to.equal(400)})
				.catch(error => {throw error});
		})

		it('should reject request (status 400) if the email already exists', async function(){
			await chai.request(apiAdress)
				.post('/users')
				.send({
					FirstName: "khalil",
					LastName: "CHEMKHI",
					DateOfBirth: "1999-10-12",
					Email: "ihebchemkhi@gmail.com",
					Gender: "Male",
					City: "Oulu",
					CountryCode: "FI",
					Username: "zakabare",
					Password: "123456"
				})
				.then(response =>{ expect(response.status).to.equal(400)})
				.catch(error => {throw error});
		})

		it('should response with an ID and a date of creation if all information are correct', async function(){
			await chai.request(apiAdress)
				.post('/users')
				.send({
					FirstName: "Iheb",
			        LastName: "CHEMKHI",
			        DateOfBirth: "1999-10-12",
			        Email: "testus55er@gmail.com",
			        Gender: "Male",
			        City: "Oulu",
			        CountryCode: "FI",
			        Username: "putra55",
			        Password: "putra123"
				})
				.then(response => { 
					expect(response.status).to.equal(201)
					//validate response
					expect(response.body).to.be.jsonSchema(userCreatedSchemas)

				})
				.catch(error => {throw error });
		})
		

		describe('[GET POST PUT DELETE]', function () {
			let userJwt = null;
			let decodedJwt = null;
		
			before(async function(){
			  await chai.request(apiAdress)
				.get('/login')
				.auth('putra', 'putra123')
				.then(response => {
				  expect(response).to.have.property('status');
				  expect(response.status).to.equal(200);
				  expect(response.body).to.have.property('token');
		
				  userJwt = response.body.token;
				  decodedJwt = jsonwebtoken.decode(userJwt, { complete: true });
				});
			});
		it('should reject adding new item if you are not logged in:', async function(){
			await chai.request(apiAdress)
			.post('/users/items')
			.send({
				title: "testing1",
				description: "testing1 ",
				category: "testing1",
				location: "testing1",
				images: "testing1.png",
				price: 20000,
				
				type:"testing1",
				shipping:"testing1",
			})	
			.then( response => {
				expect(response.status).to.equal(401);
			})
		})


		it('should reject adding new item if there is a missing field:', async function(){
			await chai.request(apiAdress)
			.post('/users/items')
			.set('Authorization', 'Bearer ' + userJwt)
			.send({
				description: "testing1 ",
				category: "testing1",
				location: "testing1",
				images: "testing1.png",
				price: 20000,

				type:"testing1",
				shipping:"testing1",
			})	
			.then( response => {
				expect(response.status).to.equal(400);
			})
		})

		it('should reject adding new item if there is an empty field:', async function(){
			await chai.request(apiAdress)
			.post('/users/items')
			.set('Authorization', 'Bearer ' + userJwt)
			.send({
				title: null,
				description: "testing1 ",
				category: "testing1",
				location: "testing1",
				images: "testing1.png",
				price: 20000,
				type:"testing1",
				shipping:"testing1",
			},
			{
				title: "testing1",
				description: "testing1 ",
				category: "testing1",
				location: null,
				images: "testing1.png",
				price: 20000,
				type:"testing1",
				shipping:"testing1",
			}
			)	
			.then( response => {
				expect(response.status).to.equal(400);
			})
		})

		it('should add the new item if nothing is wrong:', async function(){
			await chai.request(apiAdress)
			.post('/users/items')
			.set('Authorization', 'Bearer ' + userJwt)
			.send({
				title: "testing1",
				description: "testing1 ",
				category: "testing1",
				location: "testing1",
				images: "testing1.png",
				price: 20000,
				type:"testing1",
				shipping:"testing1",
			}
			)	
			.then( response => {
				expect(response.status).to.equal(201);
			})
		})



		it('should reject modifying new item if you are not the seller:', async function(){
			await chai.request(apiAdress)
			.put('/users/items/21944c58-1280-4a17-8614-a4059901de57')
			.set('Authorization', 'Bearer ' + userJwt)
			.send(
			{
				title: "testing1",
				description: "testing1 ",
				category: "testing1",
				location: "testing1",
				images: "testing1.png",
				price: 20000,
				type:"testing1",
				shipping:"testing1",
			}
			)	
			.then( response => {
				expect(response.status).to.equal(401);
			})
		})

		it('should reject modifying new item if the id doesnt exist:', async function(){
			await chai.request(apiAdress)
			.put('/users/items/21944c58-1ezaeaze-4a17-8614-a4059901de57')
			.set('Authorization', 'Bearer ' + userJwt)
			.send(
			{
				title: "testing1",
				description: "testing1 ",
				category: "testing1",
				location: "testing1",
				images: "testing1.png",
				price: 20000,
				
				type:"testing1",
				shipping:"testing1",
			}
			)	
			.then( response => {
				expect(response.status).to.equal(400);
			})
		})

		it('should reject modifying new item if there is a missing field:', async function(){
			await chai.request(apiAdress)
			.put('/users/items/21944c58-1ezaeaze-4a17-8614-a4059901de57')
			.set('Authorization', 'Bearer ' + userJwt)
			.send(
			{
				description: "testing1 ",
				category: "testing1",
				location: "testing1",
				images: "testing1.png",
				price: 20000,
				
				type:"testing1",
				shipping:"testing1",
			}
			)	
			.then( response => {
				expect(response.status).to.equal(400);
			})
		})


		it('should reject modifying new item if there is an empty field:', async function(){
			await chai.request(apiAdress)
			.put('/users/items/21944c58-1ezaeaze-4a17-8614-a4059901de57')
			.set('Authorization', 'Bearer ' + userJwt)
			.send(
			{
				title: null,
				description: "testing1 ",
				category: "testing1",
				location: "testing1",
				images: "testing1.png",
				price: 20000,
				
				type:"testing1",
				shipping:"testing1",
			}
			)	
			.then( response => {
				expect(response.status).to.equal(400);
			})
		})

		it('should modify the item if everything is ok:', async function(){
			await chai.request(apiAdress)
			.put('/users/items/4027ccf0-38d2-4626-a74b-3fb341b6cfe9')
			.set('Authorization', 'Bearer ' + userJwt)
			.send(
			{
				title: "testing1",
				description: "testing1 ",
				category: "testing1",
				location: "testing1",
				images: "testing1.png",
				price: 20000,
				
				type:"testing1",
				shipping:"testing1",
			}
			)	
			.then( response => {
				expect(response.status).to.equal(200);
			})
		})


		it('should reject deleting the item if you are not the seller:', async function(){
			await chai.request(apiAdress)
			.delete('/users/items/21944c58-1280-4a17-8614-a4059901de57')
			.set('Authorization', 'Bearer ' + userJwt)	
			.then( response => {
				expect(response.status).to.equal(400);
			})
		})


		it('should reject deleting the item does not exist:', async function(){
			await chai.request(apiAdress)
			.put('/users/items/imaginaryItem')
			.set('Authorization', 'Bearer ' + userJwt)
			.then( response => {
				expect(response.status).to.equal(400);
			})
		})





		})


	})


	// testing LOGIN

	describe('test route /login',function(){
			
		it('should reject the login request if the username is incorrect',async function(){
			await chai.request(apiAdress)
			.get('/login')
			.auth("zakabare","putra123")
			.then(response =>{
				 expect(response.status).to.equal(401)
				})
			.catch(error => {throw error});

		})

		it('should reject the login request if the passowrd is incorrect',async function(){
			await chai.request(apiAdress)
			.get('/login')
			.auth("putra","1234")
			.then(response =>{
				 expect(response.status).to.equal(401)
				})
			.catch(error => {throw error});
		})

		it('should reject the login request if the username empty',async function(){
			await chai.request(apiAdress)
			.get('/login')
			.auth(null,"putra123")
			.then(response =>{
				 expect(response.status).to.equal(401)
				})
			.catch(error => {throw error});

		})

		it('should reject the login request if the password empty',async function(){
			await chai.request(apiAdress)
			.get('/login')
			.auth("putra",null)
			.then(response =>{
				 expect(response.status).to.equal(401)
				})
			.catch(error => {throw error});

		})


		it('should return status 201 if the password and the username are correct',async function(){
			await chai.request(apiAdress)
			.get('/login')
			.auth("putra","putra123")
			.then(response =>{
				 expect(response.status).to.equal(200)
				})
			.catch(error => {throw error});

		})
	

		
		
			
			});

	describe('test route /items',function(){
		it('should display all items', async function(){
			//prepare http request
			//send the request to our server
			await chai.request(apiAdress).get('/items')
				.then(response => { 
					expect(response).to.have.status(200);
				})
				.catch(error => {
					throw error;
				})
		})

		it('should display all the items in that location return status 200', async function(){
			//prepare http request
			//send the request to our server
			await chai.request(apiAdress).get('/items/searchByLocation/Oulu')
				.then(response => { 
					expect(response).to.have.status(200);
				})
				.catch(error => {
					throw error;
				})
		})


		it('should display all the items on that date return status 200', async function(){
			//prepare http request
			//send the request to our server
			await chai.request(apiAdress).get('/items/searchByDate/12-04-2020')
				.then(response => { 
					expect(response).to.have.status(200);
				})
				.catch(error => {
					throw error;
				})
		})

		it('should display all the items related to that category return status 200', async function(){
			//prepare http request
			//send the request to our server
			await chai.request(apiAdress).get('/items/searchByCategory/sextoys')
				.then(response => { 
					expect(response).to.have.status(200);
				})
				.catch(error => {
					throw error;
				})
		})

		it('should return status 404 if the parametre(get: /items/searchByLocation/ ) is empty', async function(){
			//prepare http request
			//send the request to our server
			await chai.request(apiAdress).get('/items/searchByLocation/')
				.then(response => { 
					expect(response).to.have.status(404);
				})
				.catch(error => {
					throw error;
				})
		})

		it('should return status 404 if the parametre (get: /items/searchByDate/) is empty', async function(){
			//prepare http request
			//send the request to our server
			await chai.request(apiAdress).get('/items/searchByDate/')
				.then(response => { 
					expect(response).to.have.status(404);
				})
				.catch(error => {
					throw error;
				})
		})

		it('should return status 404 if the parametre (get: /items/searchByCategory/) is empty', async function(){
			//prepare http request
			//send the request to our server
			await chai.request(apiAdress).get('/items/searchByCategory/')
				.then(response => { 
					expect(response).to.have.status(404);
				})
				.catch(error => {
					throw error;
				})
		})
	})
		

	})
