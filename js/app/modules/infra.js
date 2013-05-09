CDF.Models.Infra.Clinic = Backbone.Model.extend({
	url:'http://192.168.211.132:8080/clinics'
});

CDF.Collections.Infra.Clinics = Backbone.Collection.extend({
	model: CDF.Models.Infra.Clinic,
	url: 'http://192.168.211.132:8080/clinics'
});


