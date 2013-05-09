CDF.Models.Revenue.RevenueRow = Backbone.Model.extend({
	url: 'http://192.168.211.132:8080/revenue',
	defaults: function() {
		return {
			patientName: '',
			patientId:CDF.CONSTANTS.NULL,
			doctorName: '',
			doctorId:CDF.CONSTANTS.NULL,
			amount:0,
			paymentTypeName:"CASH",
			paymentTypeId:CDF.CONSTANTS.NULL,
			rowId:0,
			clinicId:"",
			date:"09.05.2013",
		}
	},
	validate: function(attrs, options) {
		var isValid = true;
		this.validationError = "";


	    if(!isValid)
	     return this.validationError;
	},
	
});

CDF.Collections.Revenue.RevenueRowList = Backbone.Collection.extend({
	url: 'http://192.168.211.132:8080/revenue',
	model: CDF.Models.Revenue.RevenueRow,
	total: function() {
		this._total = 0;
		var self = this;
		_.each(this.models,function(row, i) {
			 self._total+= parseInt(row.get("amount"),10);
		});
		return this._total;
	},
	totalCash: function(){
		this._total = 0;
		var self = this;
		_.each(this.models,function(row, i) {
			if(row.get("paymentTypeName")==="CASH")
			 self._total+= parseInt(row.get("amount"),10);
		});
		return this._total;
	},
	totalCard: function(){
		this._total = 0;
		var self = this;
		_.each(this.models,function(row, i) {
			if(row.get("paymentTypeName")==="CARD")
			 self._total+= parseInt(row.get("amount"),10);
		});
		return this._total;
	},
	rowCount: function(){
		return this.models.length;
	}
});



CDF.Views.Revenue.RevenueRowView = Backbone.View.extend({
	model: new CDF.Models.Revenue.RevenueRow(),
	tagName: 'div',
	className: 'revenueRow',
	//id: this.cid,
	events: {
		'click .column': 'edit',
		'click .delete': 'delete',
		'blur .column': 'close',
		'keypress .column': 'onEnterUpdate'					
	},
	initialize: function() {
		this.template = _.template($('#revenue-row-template').html());
	},
	edit: function(ev) {
		ev.preventDefault();
		switch(ev.currentTarget.className.split(" ")[0]){
			case "patientName":
				//this.$('.removeAttr').patientName('readonly').focus();
				this.$('.patientName').attr("valueId", CDF.CONSTANTS.NULL);
				this.model.set("patientId",CDF.CONSTANTS.NULL);
				this.$('.patientName').val("");
				break;
			case "doctorName":
				//this.$('.doctorName').removeAttr('readonly').focus();
				this.$('.doctorName').attr("valueId", CDF.CONSTANTS.NULL);	
				this.model.set("doctorId",CDF.CONSTANTS.NULL);
				this.$('.doctorName').val("");				
				break;
			case "amount":
				//this.$('.amount').removeAttr('readonly').focus();
				break;
			case "paymentTypeName":
				//this.$('.paymentTypeName').removeAttr('readonly', true).focus();
				this.$('.paymentTypeName').attr("valueId", 0);
				this.model.set("paymentTypeId",0);	
				this.$('.paymentTypeName').val("");			
				break;
		}
	
	},
	close: function(ev) {
		var element = null;
		var propertyName = ev.currentTarget.className.split(" ")[0];
		switch(propertyName){
			case "patientName":
				element = this.$('.patientName');
				setElementValue.call(this,'patientId');
				break;
			case "doctorName":
				element = this.$('.doctorName');
				setElementValue.call(this,'doctorId');
				break;
			case "amount":
				element = this.$('.amount');
				setElementValue.call(this);
				CDF.revenueView.updateTotal();
				break;
			case "paymentTypeName":
				element = this.$('.paymentTypeName');
				setElementValue.call(this,'paymentTypeId');
				break;
		}

		function setElementValue(propertyId){

			if(element !== null){				
				this.model.set(propertyName, element.attr("value"));
				if (!this.model.isValid()) {
				 	element.addClass( 'input-validation-error' );
				 	//this.$('.revenueRow').tooltip({title:this.model.validationError,container:'.revenueRow',trigger:'hover'});
				 	//this.$('.patientName').tooltip('show');
					} else {
						element.removeClass( 'input-validation-error' );
						//element.tooltip('destroy');
					}					
					
				if(typeof propertyId !== "undefined"){
					var propertyValue = element.attr("valueId");
					if(propertyValue !== CDF.CONSTANTS.NULL) {
						this.model.set(propertyId,propertyValue);
						//element.attr('readonly',true);
					} else this.whenValueIsNotSelected(propertyId,element.attr("value"));
				}
											
				

			}
		};

	},
	whenValueIsNotSelected : function(propertyId,propertyName){
		if(!CDF.modal.isVisible()){

		}


		switch(propertyId){
			case "patientId":
				this.addNewPatient(propertyName);
				break;
			case "doctorId":
				break;
			case "paymentTypeId":
				break;
		}
	},
	addNewPatient: function(propertyName){
		if(!CDF.modal.isVisible()){
			var names = propertyName.split(" ");
			var addPatientView = new CDF.Views.People.AddPatient({model: new CDF.Models.People.Patient({firstName:names[0],lastName:names[1]})});		
			var modalModel = new CDF.Models.Utility.Modal({header:"Add Patient",footer:"",body:addPatientView.$el});
			CDF.modal = new CDF.Views.Utility.Modal({model:modalModel});
			CDF.appView.addView(CDF.modal);
			CDF.modal.show();
		}		
	},
	onEnterUpdate: function(ev) {
		var self = this;
		if (ev.keyCode === 13) {
			this.close(ev);

			switch(ev.currentTarget.className.split(" ")[0]){
			case "patientName":
				_.delay(function() { self.$('.patientName').blur() }, 100);
				break;
			case "doctorName":
				_.delay(function() { self.$('.doctorName').blur() }, 100);
				break;
			case "amount":
				_.delay(function() { self.$('.amount').blur() }, 100);
				break;
			case "paymentTypeName":
				_.delay(function() { self.$('.paymentTypeName').blur() }, 100);
				break;
			}
			
		}
	},
	delete: function(ev) {
		ev.preventDefault();
		//CDF.revenueRowsList.remove(this.model);
		this.model.destroy();
	},
	source:function(collection) {

		return function(query,process){
			var map = this.options.map;
			collection.fetch({data:{q:query},success: function(){
				var result = [];
				var data = collection.toJSON();								
				 _.each(data,function(element,index,data){
				 var name = element.firstName+" "+element.lastName+' # '+element._id;
					 result.push(name);
				 map[name] = (element._id);
				});

				process(result);
			}});
		}

	},
	paymentOptionsSource: function(collection) {

		return function(query,process){
			var map = this.options.map;
			collection.fetch({data:{q:query},success: function(){
				var result = [];
				var data = collection.toJSON();								
				 _.each(data,function(element,index,data){
				 var name = element.name;
					 result.push(name);
				 map[name] = (element._id);
				});

				process(result);
			}});
		}

	},
	updater: function(item){
		 
	 	 $( "#"+this.options.id ).attr("valueId", this.options.map[ item ] );
		 return item;
 
	},
	render: function() {
		this.model.set("rowId",this.model.cid,{silent:true});
		this.$el.html(this.template(this.model.toJSON()));

		this.$('.patientName').typeahead({source:this.source(CDF.patients),updater:this.updater,minLength:3,id:"patientId"+this.model.cid,map:CDF.patientMap});
		this.$('.doctorName').typeahead({source:this.source(CDF.doctors),updater:this.updater,minLength:3,id:"doctorId"+this.model.cid,map:CDF.doctorsMap});
		this.$('.paymentTypeName').typeahead({source:this.paymentOptionsSource(CDF.paymentOptions),updater:this.updater,minLength:3,id:"paymentTypeId"+this.model.cid,map:CDF.paymentOptionsMap});
		return this;
	}
	
});	

CDF.Views.Revenue.RevenueTableView = Backbone.View.extend({
	model: CDF.revenueRowsList,
    events: {
		'click .new-row' : 'handleNewRowSubmit'		
    },
	initialize: function() {
		this.template = _.template($('#revenue-table-template').html());
		this.$el.html(this.template(this.model.toJSON()));	
		this.model.on('add', this.render, this);
		this.model.on('remove', this.render, this);
		
		if(this.model.length < 1)
			this.addNewRow();
	},
	handleNewRowSubmit: function(ev){
		ev.preventDefault();
		this.addNewRow();
		return false;
	},	
	addNewRow: function() {
    	var row = new CDF.Models.Revenue.RevenueRow({patientName: "", patientId:CDF.CONSTANTS.NULL, doctorName:"",doctorId:CDF.CONSTANTS.NULL,amount:0,paymentTypeName:"CASH",
    												 paymentTypeId:0,rowId:0,clinicId:CDF.application.get("clinicId"),date:CDF.application.get("date")});

    	row.on("invalid", function(model, error) {
		  alert(error);
		});

		this.model.add(row);
		
		console.log("new row added: "+row.get("rowId"));
	},	
	render: function() {

		var self = this;
		
		this.$('#rows-container').html('');
							
		_.each(this.model.toArray(), function(row, i) {
			self.$('#rows-container').append((new CDF.Views.Revenue.RevenueRowView({model: row})).render().$el);
		});
		this.$('.total').text("Total : Rs. "+this.model.total());
		return this;
	},
	updateTotal: function(){
		this.$('.total').text("Total : Rs. "+this.model.total());
	}
});