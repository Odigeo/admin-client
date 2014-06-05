var ContentSearchBox = SearchBox.extend({
	init: function(search) {
		this._super();
		this.clickListeners = [];
	    this.focusListeners = [];
	    this.keyboardListeners = [];
	    this.sinkEvents(Event.ONCLICK|Event.FOCUSEVENTS|Event.KEYEVENTS);
	    
	    $(this.getElement()).attr('autocomplete', 'on').attr('list', 'list_' + search).attr('results', '5').attr('autosave', search + '_history').attr('name', 's');;
	    this.search = search;
	    this.list = [];
	    this.addFocusListener(this.onFocus);
	},
	addClickListener: function(listener) {
	    this.clickListeners.push(listener);
	    return this;
	},
	addFocusListener: function(listener) {
		this.focusListeners.push(listener);
		return this;
	},
	addKeyboardListener: function(listener) {
		this.keyboardListeners.push(listener);
		return this;
	},
	onBrowserEvent: function(event) {
		var type = DOM.eventGetType(event);
		if (type == 'click') {
		  for (var i = 0; i < this.clickListeners.length; i++) {
		    this.clickListeners[i](this, event);
		  }
		}
		else if (type == 'focus') {
		  for (var i = 0; i < this.focusListeners.length; i++) {
		    this.focusListeners[i](this, event);
		  }
		}
		else if (type == 'keydown' || type == 'keypress' || type == 'keyup') {
		  for (var i = 0; i < this.keyboardListeners.length; i++) {
		    this.keyboardListeners[i](this, event);
		  }
		}
	},
	onFocus: function(self, event) {
		
	}
});

var InstrumentPanel = FlowPanel.extend({
	init: function() {
		this._super();
		this.render();
		this.setStyleName("align-center").setId("instrument-panel");
	},
	setVisible: function(bool) {
		
	},
	onSearch: function() {
		var self = this;
		this.loader.show();
		PAPI.getBroadcasts(function(res) {
			// Success
			self.loader.hide();
			content.addCards(res);
		},
		function(res) {
			// Failed
			self.loader.hide();
			console.warn("Failed to get Broadcasts");
		});
	},
	render: function() {
		var self = this;
		this.loader = new WidgetLoader();
		var holder = new HorizontalPanel();
		var createB = new BonBonButton("New Broadcast",  function(){
			// Create Broadcast content
			content.addCard(new BroadcastCard());
		}, "✎");
		var searchHolder = new FocusPanel();
		var appI = new ContentSearchBox("app");
		var contextI = new ContentSearchBox("context");

		createB.setStyleName("bbSmall");
		createB.setId("console-createB");
		holder.setStyleName("automargin");
		holder.setStyle("margin-top", "24px");
		searchHolder.setId('console-search-holder');
		searchHolder.addKeyboardListener(function(obj, e) {
			var target = e.target;
			if(e.keyCode == 13 && e.type === "keypress") {
				//Enter key pressed
				self.onSearch();
			}
		});

		appI.setId("app").setAttributes({'placeholder':'Application', autofocus:'autofocus'});
		contextI.setId("context").setAttr('placeholder', 'Context');
		
		searchHolder.add(appI);
		searchHolder.add(contextI);
		searchHolder.add(createB);

		holder.add(searchHolder);

		this.add(this.loader);
		this.add(holder);
	}
});

var Broadcast = FlowPanel.extend({
	init: function(data) {
		this._super();
		if(data) {
			this.data = data;
		} else {
			this.data = {};
		}
		this.render();
	},
	render: function() {
		var self = this;
		this.loader = new WidgetLoader();
		var name = new TextBox(function() {
			var value = $(this.getElement()).val();
			if(value.length > 5) {
				return true;
			}
			return false;
		});
		var description = new TextBox(function() {
			var value = $(this.getElement()).val();
			if(value.length > 7) {
				return true;
			}
			return false;
		});
		var app = new TextBox(function() {
			var value = $(this.getElement()).val();
			if(value.length > 1) {
				return true;
			}
			return false;
		});
		var price = new TextBox(function() {
			var value = $(this.getElement()).val();
			// Allows any number vid 2 decimals and . as delimiter
			if(value.search(/^\$?\d+?(\.\d{2})?$/) > -1) {
				$(this.getElement()).val(value.toUpperCase());
				return true;
			}
			return false;
		});
		var currency = new TextBox(function() {
			var value = $(this.getElement()).val();
			if(value.length == 3) {
				return true;
			}
			return false;
		});
		var appLabel = new Text("App");
		var priceLabel = new Text("Price");
		var currencyLabel = new Text("Currency");
		var holder = new FlowPanel();
		var buttonHolder = new HorizontalPanel();
		var errorText = new Text("");
		var deleteButton = new BonBonButton("Delete", function() {/* Use Formgrids callbacks instead */}, "✗");
		var saveButton = new BonBonButton("Save", function() {/* Use Formgrids callbacks instead */}, "✓");
		var createSwarmButton = new BonBonButton("Create new Swarm", function() {
			// Add an empty rendering of swarm
			self.swarms_holder.add(self.render_swarm());
			// Open Swarms section
			self.swarms_holder.setHeight("100%");
		}, "✓");
		var grid = new FormGrid(6,2);

		saveButton.setAttributes({name:"save", type:"submit"});
		deleteButton.setAttributes({name:"cancel", type:"button"});

		grid.setStyleName("card-header-input-grid");
		name.setAttributes({placeholder:"Name", data:"name", errormessage:"Must be at least 6 characters long."}).setText(this.data.name).setStyleName("input-full-card textBlue align-center textLarge");
		description.setAttributes({placeholder:"Description", data:"description", errormessage:"Must be at least 8 characters long."}).setText(this.data.description).setStyleName("input-full-card align-center");
		app.setAttributes({placeholder:"app", data:"app", errormessage:"Must be at least 2 character long."}).setText(this.data.app).setStyleName("align-left");
		price.setAttributes({placeholder:"0", data:"price", errormessage:"Allows any positive number with 2 decimals for cents, e.g. 2.25"}).setText(this.data.price).setStyleName("align-left");
		currency.setAttributes({placeholder:"USD", data:"currency", errormessage:"Currency must be 3 letter ISO code, e.g. USD or EUR"}).setText(this.data.currency).setStyleName("align-left");
		buttonHolder.setStyleName("broadcast-button-holder");
		deleteButton.setStyleName("bbCard bbPink");
		saveButton.setStyleName("bbCard bbGreen");
		holder.setStyleName("u20 broadcast-holder");
		createSwarmButton.setStyleName("bbCard bbGreen right");
		errorText.setStyleName("error-text");

		if(self.data.name) {
			// Only render create new additional swarm button when rendering broadcast resource from API
			buttonHolder.add(createSwarmButton);
		}
		buttonHolder.add(saveButton);
		buttonHolder.add(deleteButton);

		grid.addOnSave(function(form,event){
			// Valid form do PAPI call
			console.log("Valid form");
			self.loader.show();
			if(!self.data.name) {
				// POST
				// Create new Broadcast and 1 swarm
				var swarm_data = {};
				// Only take first if several Swarms are present when creating
				$.map($(".swarms-holder input", self.parent.getElement()), function(obj, key) {
					//console.log(obj);
					var attribute = $(obj).attr("data");
					swarm_data[attribute] = $(obj).val();
				});
				// New Broadcast and Swarm will be created
				PAPI.createSwarm(swarm_data, function(res) {
					console.log("Successfully created Swarm");
					var broadcast_data = {};
					$.map($(".broadcast-holder input", self.parent.getElement()), function(obj, key) {
						var attribute = $(obj).attr("data");
						broadcast_data[attribute] = $(obj).val();
					});
					broadcast_data.swarms = {};
					broadcast_data.swarms[swarm_data.resolution] = res.swarm._links.self.href;
					PAPI.createBroadcast(broadcast_data, function() {
						console.log("Successfully created Broadcast");
						// Update list
						self.loader.hide();
						content.ip.onSearch();
					},
					function(xhr, textStatus) {
						// Failed Broadcast
						console.warn("Failed to create Broadcast");
						errorText.setText("textStatus");
						self.loader.hide();
					});
				},
				function(xhr, textStatus) {
					// Failed Swarm
					console.warn("Failed to create Swarm");
					errorText.setText("textStatus");
					self.loader.hide();
				});
			} else {
				console.log("Saving Broadcast");
				// PUT
				// Update self.data from inputs
				// Loop over all inputs for Broadcast and update self.data
				$.map($("input", holder.getElement()), function(obj, key) {
					var attribute = $(obj).attr("data");
					self.data[attribute] = $(obj).val();
				});
				// Save the Broadcast resource
				PAPI._save(self.data._links.self.href, self.data, function(res) {
					console.log("Successfully saved Broadcast");
					// Update list
					self.loader.hide();
					content.ip.onSearch();
				}, function(response) {
					console.warn("Failed to save Broadcast");
					if(response.xhr.status == 422) {
						// Unprocessable Entity
						errorText.setText(response.errorText[0]);
					}
					self.loader.hide();
				});
			}

		});

		grid.addOnCancel(function(form,event){
			// Delete
			if(confirm("This will permanently delete this Broadcast resource along with its Swarm resources!!")) {
				// User clicked Yes
				console.log("Deleting Broadcast and swarms");
				if(!self.data.name) {
					// An empty card from Create Broadcast is deleted, just refresh the list
					content.ip.onSearch();
					return;
				}
				self.loader.show();
				// Delete all Swarm resources
				for(var key in self.data.swarms) {
					console.log("Deleting swarm: " + key);
					var extra = key;
					PAPI._delete(self.data.swarms[key], function(res, extra) {
						// Success delete swarm
						console.log("Successfully deleted swarm: " + extra);
					},
					function() {
						// Failed delete swarm
						console.log("Failed to delete swarm");
					}, extra);
				}
				// Delete the Broadcast resource
				PAPI._delete(self.data._links.self.href, function(res) {
					console.log("Successfully deleted Broadcast");
					// Update list
					self.loader.hide();
					content.ip.onSearch();
				}, function(response) {
					console.warn("Failed to delete Broadcast");
					if(response.errorText && response.errorText === "object") {
						errorText.setText(response.errorText[0]);
					}
					self.loader.hide();
				});
			}
		});

		grid.setWidget(0,0,name,2);
		grid.setWidget(1,0,description,2);
		grid.setWidget(2,0,appLabel);
		grid.setWidget(2,1,app);
		grid.setWidget(3,0,priceLabel);
		grid.setWidget(3,1,price);
		grid.setWidget(4,0,currencyLabel);
		grid.setWidget(4,1,currency);
		grid.setWidget(5,1, buttonHolder);

		holder.add(errorText);
		//holder.add(buttonHolder);
		holder.add(grid);

		this.add(this.loader);
		this.add(holder);
	}
});

var Swarm = FlowPanel.extend({
	init: function(data, resolution_value) {
		this._super();
		if(data) {
			this.data = data;
		} else {
			this.data = {};
		}
		this.resolution_value = resolution_value;
		this.render();
	},
	render: function() {
		// Evaluation inputs
		this.loader = new WidgetLoader();
		var resolution = new TextBox(function() {
			var value = $(this.getElement()).val();
			if(value.search(/x/) > -1) {
				return true;
			}
			return false;
		});
		var input_stream_uri = new TextBox(function() {
			var value = $(this.getElement()).val();
			if(value.search("http://") > -1 || value.search("https://") > -1) {
				return true;
			}
			return false;
		});
		var instance_type = new TextBox(function() {
			var value = $(this.getElement()).val();
			// Just check if we got a dot at the right position: m1.small
			if(value.search(/\./) === 2) {
				return true;
			}
			return false;
		});
		var nr_of_sources = new TextBox(function() {
			var value = $(this.getElement()).val();
			if(value >= 1) {
				return true;
			}
			return false;
		});
		var nr_of_boosters = new TextBox(function() {
			var value = $(this.getElement()).val();
			if(value >= 0) {
				return true;
			}
			return false;
		});
		var nr_of_trackers = new TextBox(function() {
			var value = $(this.getElement()).val();
			if(value >= 1) {
				return true;
			}
			return false;
		});
		var app = new TextBox(function() {
			var value = $(this.getElement()).val();
			if(value.length < 255) {
				return true;
			}
			return false;
		});
		var context = new TextBox(function() {
			var value = $(this.getElement()).val();
			if(value.length < 255) {
				return true;
			}
			return false;
		});
		var bitrate = new TextBox(function() {
			// SE team want no pushing to set this value, because if omitted they will make a guess
			// Setting this too wrong can be bad for clients using it
			return true;
			/*
			var value = $(this.getElement()).val();
			if(typeof value === "number") {
				return true;
			}
			return false;*/
		});
		var swarm_id = new Text("", true); // add word wrap since long string
		var created_at = new Text();
		var updated_at = new Text();
		var created_atLabel = new Text("Created at");
		var update_atLabel = new Text("Updated at");
		var nr_of_sourcesLabel = new Text("Sources");
		var nr_of_boostersLabel = new Text("Boosters");
		var nr_of_trackersLabel = new Text("Trackers");
		var input_stream_uriLabel = new Text("Input stream URL");
		var instance_typeLabel = new Text("Instance Type");
		var resolutionLabel = new Text("Resolution");
		var idLabel = new Text();
		var appLabel = new Text("App");
		var contextLabel = new Text("Context");
		var bitrateLabel = new Text("Bitrate");
		var swarm_idLabel = new Text("Swarm Id");
		var holder = new FlowPanel();
		var buttonHolder = new HorizontalPanel();
		var deleteButton = new BonBonButton("Delete", function() {
			// Take care of functionality in Grids eventhandling
		}, "✗");
		var saveButton = new BonBonButton("Save", function() {
			// Take care of functionality in Grids eventhandling
		}, "✓");
		var errorText = new Text("");
		var grid = new FormGrid(13,2)

		$(saveButton.getElement()).attr("name", "save").attr("type","submit");
		$(deleteButton.getElement()).attr("name", "cancel").attr("type","button");

		// When saving we will loop thru all inputs mapping its data attribute value against the resource attributes, so data must be same as attribute name in resource
		grid.setStyleName("card-input-grid");
		resolution.setAttributes({placeholder:"Resolution", data:"resolution", errormessage:"Must be following syntax: 1024x768"}).setText(this.resolution_value);
		input_stream_uri.setAttributes({placeholder:"http://10.0.0.116:8090", data:"input_stream_uri", errormessage:"Must be a valid HTTP URL"}).setText(this.data.input_stream_uri);
		nr_of_sources.setAttributes({placeholder:"1", data:"nr_of_sources", errormessage:"Must be at least 1 source"}).setText(this.data.nr_of_sources);
		nr_of_boosters.setAttributes({placeholder:"0", data:"nr_of_boosters", errormessage:"Boosters are optional"}).setText(this.data.nr_of_boosters);
		nr_of_trackers.setAttributes({placeholder:"1", data:"nr_of_trackers", errormessage:"Must be at least 1 tracker"}).setText(this.data.nr_of_trackers);
		instance_type.setAttributes({placeholder:"t1.micro", data:"instance_type", errormessage:"Must be a valid Amazon instance type"}).setText(this.data.instance_type);
		app.setAttributes({placeholder:"company", data:"app", errormessage:"Any type of 255 char string is allowed"}).setText(this.data.app);
		context.setAttributes({placeholder:"cathegory", data:"context", errormessage:"Any type of 255 char string is allowed"}).setText(this.data.context);
		bitrate.setAttributes({placeholder:"1500 (unit kbps)", data:"bitrate", errormessage:"Supply the integer value in kbps"}).setText(this.data.bitrate);
		swarm_id.setText(this.data.swarm_id);
		holder.setStyleName("swarms-card");
		created_at.setText(this.data.created_at);
		updated_at.setText(this.data.updated_at);
		buttonHolder.setStyleName("swarm-button-holder");
		deleteButton.setStyleName("bbCard bbPink");
		saveButton.setStyleName("bbCard bbGreen");
		errorText.setStyleName("error-text");
		idLabel.setStyleName("id-label").setText(this.data.id);

		if(this.data.input_stream_uri) {
			// Add buttons if valid swarm resource, meaning we wont add buttons when rendering card for new resource
			// Save at Broadcast takes care of creating swarm and broadcast in correct order
			buttonHolder.add(saveButton);
			buttonHolder.add(deleteButton);
		}

		grid.addOnSave(function(form,event){
			// Valid form do PAPI call
			console.log("Valid form");
			// Collect data
			var data = {};
			data.service = "api_users"; // ? should be swarms?
			var inputs = $('input', grid.getElement());
			for(var i=0;i<inputs.length;i++) {
				data[inputs[i].name] = $(inputs[i]).val();
			}
			// save
			/*
			self.loader.show();
			PAPI._save(data, function(res) {
				console.log("Created User");
				window.users.refresh();
				form.clearAll();
				self.loader.hide();
				self.hide();
			},
			function(res) {
				// Failed
				self.loader.hide();
			});*/
		});

		grid.addOnCancel(function(form,event){
			//form.clearAll();
		});
		
		grid.setWidget(0,0,resolutionLabel);
		grid.setWidget(0,1,resolution);
		grid.setWidget(1,0,input_stream_uriLabel);
		grid.setWidget(1,1,input_stream_uri);
		grid.setWidget(2,0,instance_typeLabel);
		grid.setWidget(2,1,instance_type);
		grid.setWidget(3,0,appLabel);
		grid.setWidget(3,1,app);
		grid.setWidget(4,0,contextLabel);
		grid.setWidget(4,1,context);
		grid.setWidget(5,0,bitrateLabel);
		grid.setWidget(5,1,bitrate);
		grid.setWidget(6,0,nr_of_sourcesLabel);
		grid.setWidget(6,1,nr_of_sources);
		grid.setWidget(7,0,nr_of_boostersLabel);
		grid.setWidget(7,1,nr_of_boosters);
		grid.setWidget(8,0,nr_of_trackersLabel);
		grid.setWidget(8,1,nr_of_trackers);
		grid.setWidget(9,0,swarm_idLabel);
		grid.setWidget(9,1,swarm_id);
		grid.setWidget(10,0,created_atLabel);
		grid.setWidget(10,1,created_at);
		grid.setWidget(11,0,update_atLabel);
		grid.setWidget(11,1,updated_at);
		grid.setWidget(12,0,buttonHolder);

		holder.add(errorText);
		holder.add(idLabel);
		holder.add(grid);

		this.add(this.loader);
		this.add(holder);
	}
});

var BroadcastCard = FlowPanel.extend({
	init: function(data) {
		this._super();
		this.formgrids = [];
		if(data) {
			this.data = data;
		} else {
			this.data = {};
		}
		this.render();
		this.setStyleName("card");
	},
	render: function() {
		var self = this;
		this.loader = new WidgetLoader();
		this.swarms_holder = new FlowPanel();
		this.click_header = new Text("Click to toggle Swarms");

		this.swarms_holder.setStyleName("swarms-holder").setHeight("0px");
		this.click_header.setStyleName("swarms-click-header");

		this.add(this.loader);
		this.add(new Broadcast(this.data));
		this.add(new Delimiter());
		this.add(this.click_header);
		this.add(new Delimiter());
		this.add(this.swarms_holder);

		this.click_header.addClickListener(function(e) {
			// Toggle holder
			if(self.swarms_holder.getHeight() == "0px") {
				self.swarms_holder.setHeight("100%");
			} else {
				self.swarms_holder.setHeight("0px");
			}
		});

		// Add rendered swarms that exist for this broadcast
		if(this.data.swarms) {
			for(key in this.data.swarms) {
				var extras = key;
				PAPI._get(this.data.swarms[key], function(res, extras) {
					// Success
					if(res && res.swarm) {
						// Add rendered swarm to holder
						self.swarms_holder.add(new Swarm(res.swarm, extras));
					}
				},
				function(res) {
					// Failed
				}, extras); // Send key as extras, meaning we get the resolution to keep track
			}
		} else {
			// Add an empty rendering of swarm
			self.swarms_holder.add(new Swarm());
			// Open Swarms section
			self.swarms_holder.setHeight("100%");
		}
	}
});

var ContentView = FlowPanel.extend({
	init: function() {
		this._super()
		this.render();
		this.setId("content-view");
	},
	setVisible: function(bool) {
		if(bool) {
		  document.title = "Content";
		  // Make a search
		  this.ip.onSearch();
		}
		this._super(bool);
	},
	addCards: function(res) {
		var self = this;
		this.clearCards();
		if(res._collection && res._collection.resources) {
			for(var i=0; i<res._collection.resources.length; i++) {
				var resource = res._collection.resources[i];
				if(resource.broadcast) {
					self.holder.add(new BroadcastCard(resource.broadcast));
				}
			}
		}
	},
	addCard: function(card) {
		this.holder.insert(card, this.holder.getElement(), 0);
	},
	clearCards: function() {
		this.holder.clear();
	},
	render: function() {
		var tb = new TopBar();
		this.ip = new InstrumentPanel();
		this.holder = new FlowPanel();

		this.holder.setId("card-holder");

		this.add(tb);
		this.add(this.ip);
		this.add(this.holder);
	}
});

$(document).ready(function() {
	var root = new RootPanel("bootstrap");
	var wrapper = new FlowPanel();
	mainFlow = new DeckPanel();
	wrapper.setStyleName("site-width main-panel");

	content = new ContentView(); // Global namespace to easily mainipulate card holder
	var login = new LoginView();

	mainFlow.add(login);
	mainFlow.add(content);
	mainFlow.showWidget(0);

	wrapper.add(mainFlow);
	root.add(wrapper);

	//TEST
	//mainFlow.showWidget(1);

});