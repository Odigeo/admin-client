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
	render_broadcast: function() {
		var self = this;
		var grid = new FormGrid(2,1);
		var nameI = new TextBox();
		var descriptionI = new TextBox();
		var holder = new FlowPanel();
		var buttonHolder = new HorizontalPanel();
		var errorText = new Text("");
		var deleteButton = new BonBonButton("Delete", function() {
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
				}, function() {
					console.warn("Failed to delete Broadcast");
					self.loader.hide();
				});
			}
		}, "✗");
		var saveButton = new BonBonButton("Save", function() {
			self.loader.show();
			if(!self.data.name) {
				// Create new Broadcast and 1 swarm
				var swarm_data = {};
				// Only take first if several Swarms are present when creating
				$.map($(".swarms-holder input", self.getElement()), function(obj, key) {
					console.log(obj);
					var attribute = $(obj).attr("data");
					swarm_data[attribute] = $(obj).val();
				});
				// New Broadcast and Swarm will be created
				PAPI.createSwarm(swarm_data, function(res) {
					console.log("Successfully created Swarm");
					var broadcast_data = {};
					$.map($(".broadcast-holder input", self.getElement()), function(obj, key) {
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
				}, function(xhr, textStatus) {
					console.warn("Failed to save Broadcast");
					errorText.setText("textStatus");
					self.loader.hide();
				});
			}
		}, "✓");
		var createSwarmButton = new BonBonButton("Create new Swarm", function() {
			// Add an empty rendering of swarm
			self.swarms_holder.add(self.render_swarm());
			// Open Swarms section
			self.swarms_holder.setHeight("100%");
		}, "✓");

		grid.setStyleName("card-input-grid");
		nameI.setAttributes({placeholder:"Name", data:"name"}).setText(this.data.name).setStyleName("input-full-card textBlue align-center textLarge");
		descriptionI.setAttributes({placeholder:"Description", data:"description"}).setText(this.data.description).setStyleName("input-full-card align-center");
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

		grid.setWidget(0,0,nameI);
		grid.setWidget(1,0,descriptionI);

		holder.add(errorText);
		holder.add(buttonHolder);
		holder.add(grid);

		this.formgrids.push(grid);

		return holder;
	},
	render_swarm: function(data, resolution_value) {
		if(!data) {
			data = {};
		}
		var grid = new FormGrid(9,2)
		var resolution = new TextBox(function() {
			var value = $(this.getElement()).val();
			if(value.search("x") > -1) {
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
			if(value.search(".") > -1) {
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
		var holder = new FlowPanel();
		var buttonHolder = new HorizontalPanel();
		var deleteButton = new BonBonButton("Delete", function() {
			// Delete
			if(confirm("This will terminate the swarm with its workers!")) {
				// User clicked Yes
				console.log("Deleting swarm");
			} else {
				// User clicked No
			}
		}, "✗");
		var saveButton = new BonBonButton("Save", function() {
			console.log("Saving swarm");
			// Loop over all inputs for Broadcast and update self.data
			$.map($("input", holder.getElement()), function(obj, key) {
				var attribute = $(obj).attr("data");
				data[attribute] = $(obj).val();
			});

			// PAPI save
		}, "✓");
		var errorText = new Text("");

		$(saveButton.getElement()).attr("name", "save").attr("type","submit");
		$(deleteButton.getElement()).attr("name", "cancel").attr("type","button");

		grid.setStyleName("card-input-grid");
		resolution.setAttributes({placeholder:"Resolution", data:"resolution", errormessage:"Must be following syntax: 1024x768"}).setText(resolution_value);
		input_stream_uri.setAttributes({placeholder:"http://10.0.0.116:8090", data:"input_stream_uri", errormessage:"Must be a valid HTTP URL"}).setText(data.input_stream_uri);
		nr_of_sources.setAttributes({placeholder:"1", data:"nr_of_sources", errormessage:"Must be at least 1 source"}).setText(data.nr_of_sources);
		nr_of_boosters.setAttributes({placeholder:"0", data:"nr_of_boosters", errormessage:"Boosters are optional"}).setText(data.nr_of_boosters);
		nr_of_trackers.setAttributes({placeholder:"1", data:"nr_of_trackers", errormessage:"Must be at least 1 tracker"}).setText(data.nr_of_trackers);
		instance_type.setAttributes({placeholder:"t1.micro", data:"instance_type", errormessage:"Must be a valid Amazon instance type"}).setText(data.instance_type);
		holder.setStyleName("swarms-card");
		created_at.setText(data.created_at);
		updated_at.setText(data.updated_at);
		buttonHolder.setStyleName("swarm-button-holder");
		deleteButton.setStyleName("bbCard bbPink");
		saveButton.setStyleName("bbCard bbGreen");
		errorText.setStyleName("error-text");
		idLabel.setStyleName("id-label").setText(data.id);

		if(data.input_stream_uri) {
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
			data.service = "api_users";
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
		grid.setWidget(3,0,nr_of_sourcesLabel);
		grid.setWidget(3,1,nr_of_sources);
		grid.setWidget(4,0,nr_of_boostersLabel);
		grid.setWidget(4,1,nr_of_boosters);
		grid.setWidget(5,0,nr_of_trackersLabel);
		grid.setWidget(5,1,nr_of_trackers);
		grid.setWidget(6,0,created_atLabel);
		grid.setWidget(6,1,created_at);
		grid.setWidget(7,0,update_atLabel);
		grid.setWidget(7,1,updated_at);
		grid.setWidget(8,0,buttonHolder);

		holder.add(errorText);
		holder.add(idLabel);
		holder.add(grid);

		this.formgrids.push(grid);

		return holder;
	},
	render: function() {
		var self = this;
		this.loader = new WidgetLoader();
		this.swarms_holder = new FlowPanel();
		this.click_header = new Text("Click to toggle Swarms");

		this.swarms_holder.setStyleName("swarms-holder").setHeight("0px");
		this.click_header.setStyleName("swarms-click-header");

		this.add(this.loader);
		this.add(this.render_broadcast());
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
						self.swarms_holder.add(self.render_swarm(res.swarm, extras));
					}
				},
				function(res) {
					// Failed
				}, extras); // Send key as extras, meaning we get the resolution to keep track
			}
		} else {
			// Add an empty rendering of swarm
			self.swarms_holder.add(self.render_swarm());
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