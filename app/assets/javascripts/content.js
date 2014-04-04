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

	},
	render: function() {
		var self = this;
		var holder = new HorizontalPanel();
		var createB = new BonBonButton("Create content",  function(){}, "✎");
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

		appI.setId("app").setAttr('placeholder', 'Application');
		contextI.setId("context").setAttr('placeholder', 'Context');
		
		searchHolder.add(appI);
		searchHolder.add(contextI);
		searchHolder.add(createB);

		holder.add(searchHolder);

		this.add(holder);


	}
});

var ContainerPanel = FlowPanel.extend({
	init: function(create) {
		this._super();
		if(create) {
			this.render_create();
		} else {
			this.render();
		}
	},
	render_create: function() {
		var holder = new FlowPanel();

		this.add(holder);
	},
	render: function() {
		var holder = new FlowPanel();

		this.add(holder);
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
	render: function() {
		var tb = new TopBar();
		var ip = new InstrumentPanel();

		this.add(tb);
		this.add(ip);
	}
});



$(document).ready(function() {
	var root = new RootPanel("bootstrap");
	var wrapper = new FlowPanel();
	mainFlow = new DeckPanel();
	wrapper.setStyleName("site-width main-panel");

	var fp = new ContentView();
	var login = new LoginView();

	mainFlow.add(fp);
	mainFlow.add(fp);
	mainFlow.showWidget(0);

	wrapper.add(mainFlow);
	root.add(wrapper);

	//TEST
	//mainFlow.showWidget(1);

});