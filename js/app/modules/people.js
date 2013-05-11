
CDF.Models.People.Patient = Backbone.Model.extend({
	url:'http://192.168.211.132:8080/patients'
});

CDF.Collections.People.Patients = Backbone.Collection.extend({
	model: CDF.Models.People.Patient,
	url: 'http://192.168.211.132:8080/patients'
});

CDF.Views.People.AddPatient = Backbone.View.extend({
	events: {
		'click #add-patient-button' : 'addPatient'
	},
	initialize: function(){
		this.template = _.template($('#add-patient-template').html());
		this.$el.html(this.template({}));
		this.$('#firstname').val(this.model.get("firstName"));
		this.$('#lastname').val(this.model.get("lastName"));
	},
	render: function(){
		return this;
	},
	addPatient: function(ev){
		ev.preventDefault();
		this.model.set("firstName",this.$('#firstname').val());
		this.model.set("lastName",this.$('#lastname').val());

		this.model.save({},{success:function(){
			console.log('patient added successfully');
			CDF.vent.trigger('CDF.Views.People.AddPatient:addPatient:success');
		}});

		
	}


});

CDF.Models.Revenue.PaymentOption = Backbone.Model.extend({
	url: 'http://192.168.211.132:8080/paymentOptions' 
});

CDF.Collections.Revenue.PaymentOptions = Backbone.Collection.extend({
	model: CDF.Models.Revenue.PaymentOption,
	url: 'http://192.168.211.132:8080/paymentOptions' 
})


CDF.Models.People.Doctor = Backbone.Model.extend({
	url:'http://192.168.211.132:8080/doctors'
});

CDF.Collections.People.Doctors = Backbone.Collection.extend({
	model: CDF.Models.People.Doctor,
	url:'http://192.168.211.132:8080/doctors'				
});


CDF.Views.People.AddDoctor = Backbone.View.extend({
	model: new  CDF.Models.People.Doctor(),
	events: {
		'click #add-doctor-button' : 'addDoctor'
	},
	initialize: function(){
		this.template = _.template($('#add-doctor-template').html());
		this.$el.html(this.template({}));
		this.$('#firstname').val(this.model.get("firstName"));
		this.$('#lastname').val(this.model.get("lastName"));
	},
	render: function(){
		return this;
	},
	addDoctor: function(ev){
		ev.preventDefault();
		this.model.set("firstName",this.$('#firstname').val());
		this.model.set("lastName",this.$('#lastname').val());

		this.model.save({},{success:function(){
			console.log('doctor added successfully');
			CDF.vent.trigger('CDF.Views.People.AddDoctor:addDoctor:success');

		}});

		
	}


});
