CDF.Router = Backbone.Router.extend({

  routes: {
    "":                  "index",    
    /*"revenue":          "revenue",
    "submit":           "submit",  
    "logout":           "logout"*/
  },

  index: function(){

    if(CDF.auth.loggedIn === true){
      if(CDF.mainView === null || CDF.mainView === CDF.authView) {
        CDF.clinics.fetch({
          success: function(){
           var clinicId = CDF.auth.clinics[0];
           var clinicName = CDF.clinics.where({_id:clinicId})[0].get("name");
           CDF.application.setClinicName(clinicName);
           CDF.application.setClinicId(clinicId);
           CDF.application.setUser(CDF.auth.firstName+" "+CDF.auth.lastName);
           CDF.application.setDate(new Date());
           CDF.appView = new CDF.Views.AppView({model: CDF.application})
           CDF.revenueView = new CDF.Views.Revenue.RevenueTableView({model: CDF.revenueRowsList}).render();
           CDF.appView.attachView(CDF.revenueView);
           CDF.mainView = CDF.appView;
           $('ul.nav li#revenue').attr("class","active");
        },error: function(){
           $("#main").html("We can't reach the server right now. Please try again in a bit");
        }});
      }  
    } else {
      CDF.authView = new CDF.Views.AuthView({model: CDF.auth});
      CDF.mainView = CDF.authView;
    }
  }
});

