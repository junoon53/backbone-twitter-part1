var restify = require('restify');
var server = restify.createServer();
server.use(restify.fullResponse());
server.use(restify.bodyParser());
server.use(restify.queryParser({ mapParams: false }));

var mongoose = require('mongoose');
//var config = require('./config');
db = mongoose.connect('mongodb://localhost/cdfdb');

mongoose.connection.on("open", function(){
  console.log("mongodb is connected!!");
});

Schema = mongoose.Schema;

// Create a schema for our data
var PatientsSchema = new Schema({firstName:String,lastName:String, _id: Number,id:String});
var DoctorsSchema = new Schema({firstName:String,lastName:String, _id: Number,active:Number,clinics:Array,id:String});
var paymentOptionSchema = new Schema({name:String,_id:Number});
var revenueSchema = new Schema({_id:Number,date:Date,clinicId:Number,patientId:Number,doctorId:Number,amount:Number,paymentOptionId:Number});
var ClinicSchema = new Schema({_id:Number,name:String,shortName:String});
var UserSchema = new Schema({_id:Object,username:String,password:String,firstName:String,lastName:String,clinics:Array});

// Use the schema to register a model with MongoDb
mongoose.model('Patient',PatientsSchema,'patients');
var patients = mongoose.model('Patient');
mongoose.model('Doctor',DoctorsSchema,'doctors');
var doctors = mongoose.model('Doctor');
mongoose.model('PaymentOption',paymentOptionSchema,'paymentOptions');
var paymentOptions = mongoose.model('PaymentOption');
mongoose.model('Revenue',revenueSchema,'revenue');
var revenue = mongoose.model('Revenue');
mongoose.model('Clinic',ClinicSchema,'clinics');
var clinics = mongoose.model('Clinic');
mongoose.model('User',UserSchema,'users');
var users = mongoose.model('User');

function auth(req,res,next){
	console.log('authenticating...'+ req.params.username + " " + req.params.password);
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");
	var username = req.params.username;
	var password = req.params.password;

	users.find({username:username,password:password}).execFind(function(err,data){
		
		res.send(data);
	});
};

function saveRevenue(req,res,next){
	console.log("saving revenue : "+req.params);
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");
	var revenueEntry = new revenue();
	revenueEntry.date = req.params.date;
	revenueEntry.clinicId = req.params.clinicId;
	revenueEntry.patientId = req.params.patientId;
	revenueEntry.doctorId = req.params.doctorId;
	revenueEntry.amount = req.params.amount;
	revenueEntry.paymentOptionId = req.params.paymentTypeId;

	revenue.count({},function(err,count){
		revenueEntry._id = count;
		revenueEntry.save(function(){
			res.send(req.body);
		});
	});	

};

function getRevenue(req,res,next){
	console.log("getting revenue for: "+req.query.q);
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");

	
	revenue.find({"date": req.query.q.toString()}).execFind(function(arr,data){
    	res.send(data);
	});

};

function getDoctors(req,res,next){
	console.log("sending doctors like :"+req.query.q);
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");

	doctors.find({"id" : {$regex : ".*"+req.query.q.toUpperCase()+".*"}}).execFind(function(arr,data){
    	res.send(data);
	});

};

function getPatients(req,res,next){
	console.log("sending all patients with names containing :"+req.query.q);
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");
	patients.find({"id" : {$regex : ".*"+req.query.q.toUpperCase()+".*"}}).execFind(function(arr,data){
    	res.send(data);
	});

};

function getPaymentOptions(req,res,next){
	console.log('sending payment options');
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");
	paymentOptions.find({"name" : {$regex : ".*"+req.query.q+".*"}}).execFind(function(arr,data){
    	res.send(data);
	});
};

function saveClinic(req,res,next){
	console.log("saving clinic : "+req.params);
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");
	var clinics = new Clinics();
	clinics.shortName = req.params.shortName;
	clinics.name = req.params.name;
	
	clinics.count({},function(err,count){
		clinics._id = count;
		clinics.save(function(){
			res.send(req.body);
		});
	});	

};

function getClinics(req,res,next){
	console.log('sending clinicss');
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");
	clinics.find().execFind(function(arr,data){
    	res.send(data);
	});
};



function addNewDoctor(req,res,next){
	console.log("adding new doctor");
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");
	var doctor = new doctors();
	doctor.firstName = req.params.firstName;
	doctor.lastName = req.params.lastName;
	doctor.id = req.params.firstName.toUpperCase()+" "+req.params.lastName.toUpperCase();

	doctors.count({},function(err,count){
		doctor._id = 1001+count;
		doctor.save(function(){
			res.send(req.body);
		});
	});	
};

function addNewPatient(req,res,next){
	console.log("adding new patient");
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");
	
	var patient = new patients();
	patient.firstName = req.params.firstName;
	patient.lastName = req.params.lastName;
	patient.id = req.params.firstName.toUpperCase()+" "+req.params.lastName.toUpperCase();
	
	patients.count({},function(err,count){
		patient._id = 1001+count;
		patient.save(function(){
			res.send(req.body);
		});
	});
};

// set up our routes and start the server 
server.get('/doctors',getDoctors);
server.put('/doctors',addNewDoctor);

server.get('/patients',getPatients);
server.post('/patients',addNewPatient);

server.get('/paymentOptions',getPaymentOptions);

server.post('/revenue',saveRevenue);
server.get('/revenue',getRevenue);

server.post('/clinics',saveClinic);
server.get('/clinics',getClinics);

server.post('/auth',auth);

function unknownMethodHandler(req, res) {
  if (req.method.toLowerCase() === 'options') {
    var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version'];

    if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
    res.header('Access-Control-Allow-Methods', res.methods.join(', '));
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Methods", "put, GET, PUT, DELETE, OPTIONS");

    return res.send(204);
  }
  else
    return res.send(new restify.MethodNotAllowedError());
}

server.on('MethodNotAllowed', unknownMethodHandler);

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
