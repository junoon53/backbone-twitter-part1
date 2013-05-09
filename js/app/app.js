if(typeof CDF === "undefined"){
    CDF = {
        Views: {
            Revenue: {},
            People:  {},
            Utility: {}
        },
        Collections: {
            Revenue: {},
            People:  {},
            Infra:   {},

        },
        Models: {
            Revenue: {},
            People:  {},
            Infra:   {},
            Utility: {}
        },
        root: "",
        patientMap:  {},
        doctorsMap:  {},
        paymentOptionsMap:{},
        mainView: null,
        authView: null,
        appView: null,
        application: null,
        doctors: null,
        patients: null,
        clinics: null,
        paymentOptions: null,
        auth: null,
        revenueRowsList: null,
        router:null,

        CONSTANTS: {
            NULL: "null",
        },
        modal: {isVisible: function(){return false}}

    };
}



CDF.Models.Application = Backbone.Model.extend({
    defaults: {
        date: new Date(),
        displayDate: "",
        dateString: "",
        userName: "",
        clinicName: "",
        clinicId: ""
    },
    setClinicName: function(clinic){
        this.set({clinicName:clinic}); 
    },
    setClinicId: function(id){
        this.set({clinicId:id});
    },
    setUser: function(user){
        this.set({userName:user});
    },
    setDate: function(date){
        this.set({date:date});
        this.set({displayDate:this.get("date").toDateString()});
        this.set({dateString:this.get("date").toISOString("DD.MM.YYYY")});
    }


});



CDF.Views.AppView  = Backbone.View.extend({
    el: $('#main'),
    events: {
        //'click a': 'handleNavClick'
    },
    initialize: function(){
        this.template = _.template($('#app-template').html());
        this.$el.html(this.template(this.model.toJSON()));   
        this.render();
    },
    render: function(){
        return this;
    },    
    attachView: function(view){
        this.$(".content").html(view.$el);
    },
    addView: function(view){
        this.$el.append(view.$el);
    },

});

CDF.Models.Utility.Modal = Backbone.Model.extend({
    defaults: function(){
        return {
            footer: "",
            body: "",
            header: ""
        }     
    },
});

CDF.Views.Utility.Modal = Backbone.View.extend({
    header: "This is a Modal",
    footer: "",
    initialize: function(){
        var self = this;
        this.template = _.template($('#modal-template').html());
        this.$el.html(this.template({}));
        this.$('.modal-header').html(this.model.get("header"));
        this.$('.modal-body').html(this.model.get("body"));
        this.$('.modal-footer').html(this.model.get("footer"));
        this.$('#myModal').modal();

        this.$('#myModal').on('hidden', function () {
            self._visible = false;
        });

        this._visible = false;
        
    },
    show: function(){
        if(this._visible === false)
            this.$('#myModal').modal('show');
        this._visible = true;
    },
    hide: function(){
        this.$('#myModal').modal('hide');
        this._visible = false;
    },
    render: function(){        
        return this;
    },
    isVisible: function(){
        return this._visible;
    }
});

$(document).ready(function() {
    
    CDF.router =  new CDF.Router();   

    CDF.auth = new CDF.Models.Auth(); 
       
    CDF.doctors = new CDF.Collections.People.Doctors();
    CDF.patients = new CDF.Collections.People.Patients();
    CDF.clinics = new CDF.Collections.Infra.Clinics();
    CDF.paymentOptions = new CDF.Collections.Revenue.PaymentOptions();
    CDF.revenueRowsList = new CDF.Collections.Revenue.RevenueRowList();       
    CDF.application = new CDF.Models.Application();
    

    Backbone.history.start({pushState: true, hashChange: true });

    $(document).on("click", "a[href]:not([data-bypass])", function(evt) {
    // Get the absolute anchor href.
    var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
    // Get the absolute root.
    var root = location.protocol + "//" + location.host + CDF.root;

    // Ensure the root is part of the anchor href, meaning it's relative.
    if (href.prop.slice(0, root.length) === root) {
      // Stop the default event to ensure the link will not cause a page
      // refresh.
      evt.preventDefault();

      // `Backbone.history.navigate` is sufficient for all Routers and will
      // trigger the correct events. The Router's internal `navigate` method
      // calls this anyways.  The fragment is sliced from the root.
      Backbone.history.navigate(href.attr, true);
    }
  });

});