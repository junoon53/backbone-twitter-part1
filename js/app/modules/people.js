
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
		console.log("adding patient");
		ev.preventDefault();
		this.model.set("firstName",this.$('#firstname').val());
		this.model.set("lastName",this.$('#lastname').val());

		this.model.save({success:function(){
			console.log('patient added successfully');
			// close modal
		}});

		CDF.modal.hide();
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
	modelA: new  CDF.Models.People.Doctor(),
	modelB: CDF.clinics,
	events: {
		'click #add-doctor-button' : 'addDoctor'
	},
	initialize: function(){
		this.template = _.template($('#add-doctor-template').html());
	},
	render: function(){
		this.$el.html(this.template({selectedClinicName:"Choose a Clinic"}));
			_.each(this.modelB,function(element,index,data){

				var menuItemTemplate = _.template($('<li role="presentation"><a role="menuitem" tabindex="-1" value= <%=  _id %> href="#"><%= name %></a></li>').html());

				this.$('.dropdown-menu').append(menuItemTemplate(element.toJSON()));

			});
		return this;

	},
	addDoctor: function(){
		this.modelA.set("firstName",this.$('#firstname').val());
		this.modelA.set("lastName",this.$('#lastname').val());

		this.modelA.save({success:function(){
			console.log('doctor added successfully');
			// close modal
		}});

	}


});
