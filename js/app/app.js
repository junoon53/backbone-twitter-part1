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
        router:null,

        CONSTANTS: {
            NULL: "null",
        },
        //isModalVisible: false,
        loggedIn: false,
        vent: _.extend({}, Backbone.Events)

    };
}


/*******************Unbind the bound events to ensure that the views get garbage collected*********/

Backbone.View.prototype.close = function(){
  this.remove();
  this.off();
  this.undelegateEvents();
  this.stopListening();
  this.model.off();
  this.model.stopListening();

  if (this.onClose){
    this.onClose();
    if(this.model.onClose){
        this.model.onClose();
    }
  }
};


/********************Top Level View***********************/

CDF.Views.MainView = Backbone.View.extend({
    el:  $('#main'),
    initialize: function(){
        this.listenTo(CDF.vent,'CDF.Router:index',this.addView);
        this.listenTo(CDF.vent,'CDF.Models.Auth:login:success',this.createAndAddAppView);
    },
    addView: function(view){
        if (this.currentView){
          this.currentView.close();
    }
     
        this.currentView = view;
        this.currentView.render();
     
        this.$el.html(this.currentView.el);
    },
    createAndAddAppView: function(authModel){
        var application = new CDF.Models.Application();
            application.set({"clinicName":authModel.get('primaryClinicName'),
            "clinicId":authModel.get('clinics')[0],
            "userFullname":authModel.get('firstName')+" "+authModel.get('lastName'),
            "doctorId":authModel.get('doctorId'),
            "userId":authModel.get('_id'),
            "date":new Date()
        });

       var appView = new CDF.Views.AppView({model: application});
       this.addView(appView);
    }


});


/*********************************************************/

CDF.Models.Application = Backbone.Model.extend({
    url: 'http://192.168.211.132:8080/feedback',
    defaults: {
        date: new Date(),
        userFullname: "",
        doctorId: "",
        userId: "",
        clinicName: "",
        clinicId: ""
    },
    events: {
        //'change:date' : 'checkReportStatus'
    },
    initialize: function(){
        var self = this;

       this.listenTo(this,'change:date',this.checkReportStatus);
       this.listenTo(CDF.vent,'CDF.Views.AppView:click:submit',this.checkReportStatusAndSubmit);
       this.listenTo(CDF.vent,'CDF.Collections.RevenueRowList:submitReport',this.processSuccessfulSubmissions);

    },
    onClose: function(){
    },
    submitReport: function(){
        var self = this;

        // save revenue 
        CDF.vent.trigger('CDF.Models.Application:submitReport', {date:this.get('date'),clinicId:this.get('clinicId')});
        
        // save bank deposits 

        //....

    },
    processSuccessfulSubmissions: function(reportName){
        console.log(reportName+" report submitted successfully");

        if(/*all reports successfully submitted*/true){
            this.postReportStatus();    
         }
        
    },
    postReportStatus: function(){
        var self = this;
        this.save({},{
            success: function(model,response,options){
             self.set('date', new Date());
             console.log("report posted successfully");
             CDF.vent.trigger("CDF.Models.Application:postReportStatus","success");
            },
            error: function(model, response,options){
             console.log("report post error");
             CDF.vent.trigger("CDF.Models.Application:postReportFailed","fail");
            }

        });
    },
    checkReportStatus: function(){
        var self = this;
        this.fetch({data:{date:this.get('date'),clinicId:this.get('clinicId')},success: function(model, response, options){
                    
            if(response.length > 0 ) {
                CDF.vent.trigger("CDF.Models.Application:checkReportStatus",true);
            } else {
                CDF.vent.trigger("CDF.Models.Application:checkReportStatus",false);
            }
                
        }});
    },
    checkReportStatusAndSubmit: function(){
        var self = this;
        this.fetch({data:{date:this.get('date'),clinicId:this.get('clinicId')},success: function(model, response, options){
                    
            if(response.length > 0 ) {
                CDF.vent.trigger('CDF.Models.Application:checkReportStatusAndSubmit:failed','reportExistsModal');

                console.log("Not saving: today's report exists");
            } else {
                self.submitReport();
            }
                
        }});
    },


});



CDF.Views.AppView  = Backbone.View.extend({
    events: {
        'click li#revenue a': 'addRevenueTableView',
        'click li#submit a': 'handleSubmitClick',
        'click li#logout a': 'handleLogoutClick',
        'changeDate #datetimepicker' : 'changeDate'

    },
    initialize: function(){
        var self = this;
        this.template = _.template($('#app-template').html());
        this.$el.html(this.template(this.model.toJSON()));   
        this.$('#datetimepicker').datetimepicker({
          pickTime: false
        });

        this.dateTimePicker = this.$('#datetimepicker').data('datetimepicker');
        this.listenTo(CDF.vent,"CDF.Models.Application:checkReportStatus", this.showReportExistsWarning);
        this.listenTo(CDF.vent,'CDF.Views.Revenue.RevenueRowView:addNewPatient', this.displayAddPatientModal);
        this.listenTo(CDF.vent,'CDF.Views.Revenue.RevenueRowView:addNewDoctor', this.displayAddDoctorModal);
        this.listenTo(CDF.vent,'CDF.Views.Utility.Modal:hide', this.displayModal);
    },
    onClose: function(){
        this.dateTimePicker.destroy();
        if(this.currentView) this.currentView.close();
        if(this.currentAlertView) this.currentAlertView.close();        
        
    },
    showReportExistsWarning: function(msg){
        if(msg) {

                console.log('report exists!');
        }
    },
    render: function(){
        
        this.dateTimePicker.setLocalDate(this.model.get("date"));
        return this;
    },
    displayModal: function(modalType){
        switch(modalType){
            case 'reportExistsModal':
                this.displayReportExistsModal();
                break;
        }
    },
    displayAddDoctorModal: function(msg){
        var names = msg.doctorNameString.split(" ");
        var addDoctorView = new CDF.Views.People.AddDoctor({model: new CDF.Models.People.Doctor({firstName:names[0],lastName:names[1],active:1,clinics:[this.model.get("clinicId")]})});       
        var modalModel = new CDF.Models.Utility.Modal({header:"Add Doctor",footer:"",body:addDoctorView.$el});
        var modal = new CDF.Views.Utility.Modal({model:modalModel});
        this.addAlertView(modal);
        modal.show();
    },
    displayAddPatientModal: function(msg){
        var names = msg.patientNameString.split(" ");
        var addPatientView = new CDF.Views.People.AddPatient({model: new CDF.Models.People.Patient({firstName:names[0],lastName:names[1]})});       
        var modalModel = new CDF.Models.Utility.Modal({header:"Add Patient",footer:"",body:addPatientView.$el});
        var modal = new CDF.Views.Utility.Modal({model:modalModel});
        this.addAlertView(modal);
        modal.show();
    },
    displayReportExistsModal: function(msg){
        var modalModel = new CDF.Models.Utility.Modal({header:"Report Exists",footer:"",body:"A report for the selected date has already been submitted. Please choose a different date. To modify an earlier report, contact an administrator."});
        var modal = new CDF.Views.Utility.Modal({model:modalModel});
        this.addAlertView(modal);
        modal.show();
    },
    changeDate : function(ev) {
        ev.preventDefault();
        this.model.set("date",ev.localDate);
        this.dateTimePicker.hide();
    },    
    addView: function(view){
        if (this.currentView){
          this.currentView.close();
        }
     
        this.currentView = view;
        this.currentView.render();
     
        this.$("#content").html(this.currentView.el);
    },
    addAlertView: function(view){
        if (this.currentAlertView){
          this.currentAlertView.close();
        }
     
        this.currentAlertView = view;
        this.currentAlertView.render();

        this.$("#alert").html(view.$el);             
    },
    addRevenueTableView: function() {
        this.$('ul.nav li#revenue').attr("class","active");
        var revenueTableView = new CDF.Views.Revenue.RevenueTableView({model: new CDF.Collections.Revenue.RevenueRowList()});
        this.addView(revenueTableView);
    },
    handleSubmitClick: function(){
          var modalModel = new CDF.Models.Utility.Modal({header:"Submit Report",footer:(new CDF.Views.Submit()).$el,body:"Phew! That was a lot of work! Well, looks like we're ready to submit! Do check if your inputs are correct before pressing the button."});
          var modal = new CDF.Views.Utility.Modal({model:modalModel});
          this.addAlertView(modal);
          modal.show();
    },
    handleLogoutClick: function(){
         CDF.vent.trigger('CDF.Views.AppView:handleLogoutClick');
         CDF.router.index();
    },

});

CDF.Views.Submit = Backbone.View.extend({
    events: {
        'click .submit' : 'submit'
    },
    initialize: function(){
       this.template =  _.template($("#submit-template").html());
       this.$el.html(this.template({})); 
    },
    onClose: function(){

    },
    submit: function(ev){
        ev.preventDefault();
        CDF.vent.trigger("CDF.Views.AppView:click:submit");
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
        

        this.listenTo(this.$('#myModal'),'hidden',this.setVisibleFlag);

        this.listenTo(CDF.vent,'CDF.Models.Application:postReportStatus', this.hide);
        this.listenTo(CDF.vent,'CDF.Views.People.AddDoctor:addDoctor:success', this.hide);
        this.listenTo(CDF.vent,'CDF.Views.People.AddPatient:addPatient:success', this.hide);
        this.listenTo(CDF.vent,'CDF.Models.Application:checkReportStatusAndSubmit:failed', this.hide);

        this.visible = false;
        
    },
    setVisibleFlag: function(value){
        if(value) this.visible = value;           
            else {this.visible = false;
        this.$('#myModal').removeData('modal');
        $("#myModal").remove();}
            
    },
    onClose: function(){
        $("#myMmodal").remove();
        $('#myModal').data('modal', null);
    },
    show: function(){
        if(this.visible === false){
            this.$('#myModal').modal('show');
            this.visible = true;
        }            
    },
    hide: function(msg){
        this.$('#myModal').modal('hide');
        this.visible = false;
        CDF.vent.trigger('CDF.Views.Utility.Modal:hide',msg);
        this.remove();
    },
    render: function(){   

        this.$el.html(this.template({}));
        this.$('.modal-header').html(this.model.get("header"));
        this.$('.modal-body').html(this.model.get("body"));
        this.$('.modal-footer').html(this.model.get("footer"));
        this.$('#myModal').modal();   

        return this;
    },

});

$(document).ready(function() {
    
    CDF.router =  new CDF.Router();   
    var mainView = new CDF.Views.MainView();

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
