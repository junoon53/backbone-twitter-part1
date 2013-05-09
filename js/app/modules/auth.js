CDF.Models.Auth = Backbone.Model.extend({
	url:'http://192.168.211.132:8080/auth',
	defaults:{
		loggedIn:false,
		username:"",
		firstName:"",
		lastName:"",
		password:"",
		clinics:[]
	}
});



CDF.Views.AuthView = Backbone.View.extend({
	model: CDF.auth,
	el: $('#main'),
	events: {
        "click #login": "login"
  	},
	initialize: function(){
		var self = this;
        this.template = _.template($('#login-template').html());
        this.$el.html(this.template({}));           
    },
    render: function(){
        return this;
    },
    login: function(ev){
    	ev.preventDefault();
        var user=  $("#username").val();
        var pword = $("#password").val();
        this.model.save({username:user,password:pword},{
        	success: function(model,response,options){
        		if(response.length){
        			model.loggedIn = true;
        			model.firstName = response[0].firstName;
        			model.lastName = response[0].lastName;
        			model.clinics = response[0].clinics;
        			CDF.router.index();
        		} else {
        			alert("Invalid Credentials!");
        		}
        	},
        	error: function(model,xhr,options){

        	}
    	});
        return false;
  	}
});

