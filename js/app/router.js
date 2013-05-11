CDF.Router = Backbone.Router.extend({

  routes: {
    "":                  "index",    
    /*"revenue":          "revenue",
    "submit":           "submit",  
    "logout":           "logout"*/
  },

  index: function(){

    var authView =  new CDF.Views.AuthView({model: new CDF.Models.Auth()});     
      
    CDF.vent.trigger('CDF.Router:index',authView);

    }
});

