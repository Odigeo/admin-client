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
		if(data) {
			this.data = data;
		} else {
			this.data = {};
		}
		this.render();
		this.setStyleName("card");
		this.setCl
	},
	render_broadcast: function() {
		var grid = new FormGrid(2,1);
		var nameI = new TextBox();
		var descriptionI = new TextBox();
		var holder = new FlowPanel();
		var buttonHolder = new VerticalPanel();
		var deleteButton = new BonBonButton("Delete", function() {
			// Delete
			if(confirm("This will permanently delete this Broadcast resource along with its Swarm resources!!")) {
				// User clicked Yes
				console.log("Deleting Broadcast and swarms");
			} else {
				// User clicked No
			}
		}, "✗");

		grid.setStyleName("card-input-grid");
		nameI.setAttributes({placeholder:"Name", data:"name"}).setText(this.data.name).setStyleName("input-full-card textBlue align-center textLarge");
		descriptionI.setAttributes({placeholder:"Description", data:"description"}).setText(this.data.description).setStyleName("input-full-card align-center");
		buttonHolder.setStyleName("broadcast-button-holder");
		deleteButton.setStyleName("bbCard bbPink");
		holder.setStyleName("u20")

		buttonHolder.add(deleteButton);

		grid.setWidget(0,0,nameI);
		grid.setWidget(1,0,descriptionI);

		holder.add(buttonHolder);
		holder.add(grid);

		return holder;
	},
	render_swarm: function(data, resolution) {
		if(!data) {
			data = {};
		}
		var grid = new FormGrid(4,3)
		var header = new TextBox();
		var input_stream_uri = new TextBox();
		var nr_of_sources = new TextBox();
		var nr_of_boosters = new TextBox();
		var nr_of_trackers = new TextBox();
		var sources = new Text("# of Sources");
		var boosters = new Text("# of Boosters");
		var trackers = new Text("# of Trackers");
		var holder = new FlowPanel();
		var buttonHolder = new VerticalPanel();
		var deleteButton = new BonBonButton("Delete", function() {
			// Delete
			if(confirm("This will permanently delete this Broadcast resource along with its Swarm resources!!")) {
				// User clicked Yes
				console.log("Deleting Broadcast and swarms");
			} else {
				// User clicked No
			}
		}, "✗");

		grid.setStyleName("card-input-grid");
		header.setAttributes({placeholder:"Resolution", data:"resolution"}).setText(resolution).setStyleName("align-center");
		input_stream_uri.setAttributes({placeholder:"Input URL", data:"input_stream_uri"}).setStyleName("input-full-row align-center").setText(data.input_stream_uri);
		nr_of_sources.setAttributes({placeholder:"#", data:"nr_of_sources"}).setText(data.nr_of_sources).setStyleName("align-center");
		nr_of_boosters.setAttributes({placeholder:"#", data:"nr_of_boosters"}).setText(data.nr_of_boosters).setStyleName("align-center");
		nr_of_trackers.setAttributes({placeholder:"#", data:"nr_of_trackers"}).setText(data.nr_of_trackers).setStyleName("align-center");
		buttonHolder.setStyleName("swarm-button-holder");
		deleteButton.setStyleName("bbCard bbPink");

		buttonHolder.add(deleteButton);
		
		grid.setWidget(0,1,header);
		grid.setWidget(1,0,input_stream_uri, 3);
		grid.setWidget(2,0,sources);
		grid.setWidget(2,1,boosters);
		grid.setWidget(2,2,trackers);
		grid.setWidget(3,0,nr_of_sources);
		grid.setWidget(3,1,nr_of_boosters);
		grid.setWidget(3,2,nr_of_trackers);

		holder.add(buttonHolder);
		holder.add(grid);

		return holder;
	},
	render: function() {
		var self = this;
		var swarms_holder = new FlowPanel();
		var click_header = new Text("Click to toggle Swarms");

		swarms_holder.setStyleName("swarms-holder").setHeight("0px");
		click_header.setStyleName("swarms-click-header");

		this.add(this.render_broadcast());
		this.add(new Delimiter());
		this.add(click_header);
		this.add(new Delimiter());
		this.add(swarms_holder);

		click_header.addClickListener(function(e) {
			// Toggle holder
			if(swarms_holder.getHeight() == "0px") {
				swarms_holder.setHeight("100%");
			} else {
				swarms_holder.setHeight("0px");
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
						swarms_holder.add(self.render_swarm(res.swarm, extras));
					}
				},
				function(res) {
					// Failed
				}, extras); // Send key as extras, meaning we get the resolution to keep track
			}
		} else {
			// Add an empty rendering of swarm
			swarms_holder.add(self.render_swarm());
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
		var ip = new InstrumentPanel();
		this.holder = new FlowPanel();

		this.holder.setId("card-holder");

		this.add(tb);
		this.add(ip);
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