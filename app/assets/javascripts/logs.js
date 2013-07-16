var LogsView = FlowPanel.extend({
	init: function() {
		this._super()
		this.render();
		this.setId("logs-view");
	},
	setVisible: function(bool) {
		if(bool) {
		  document.title = "Logs";
		}
		this._super(bool);
	},
	render: function() {
		var tb = new TopBar();
		var textarea = new LogPanel();
		var dates = new DatePanel();

		window.logpanel = textarea;

		this.add(tb);
		this.add(dates);
		this.add(textarea);
	}
});

var DatePanel = FlowPanel.extend({
	init: function() {
		this._super();
		this.loader = new WidgetLoader();
		this.add(this.loader);
		this.setId("date-panel");
		this.render();
	},
	getLogs: function(direction) {
		var self = this;

		console.log("Getting logs...");
		var from_value = $('input[data=fromdate]', self.getElement()).val();
		var from = new Date(from_value);
		var to_value = $('input[data=todate]', self.getElement()).val();
		var to = new Date(to_value);

		if(from_value != "" && to_value != "" && from != "Invalid Date" && to != "invalid Date") {
			// Save values in cookie
			$.cookie('logs-fromdate', from_value, {'expires':300, 'path': '/'});
			$.cookie('logs-todate', to_value, {'expires':300, 'path': '/'});

			// Change window if direction
			if(direction === "forward") {
				var window_size = to.valueOf() - from.valueOf();
				from = new Date(to_value);
				to = new Date(to.valueOf() + window_size);
				// Make it ISO string with the time offset and remove T and Z character that indicate time is in UTC (we form it in local time)
				$('input[data=fromdate]', self.getElement()).val(new Date(from.valueOf() - from.getTimezoneOffset()*60*1000).toISOString().replace("T", " ").replace("Z", ""));
				$('input[data=todate]', self.getElement()).val(new Date(to.valueOf() - to.getTimezoneOffset()*60*1000).toISOString().replace("T", " ").replace("Z", ""));
			} else if(direction === "back") {
				var window_size = to.valueOf() - from.valueOf();
				from = new Date(from.valueOf() - window_size);
				to = new Date(from_value);
				// Make it ISO string with the time offset and remove T and Z character that indicate time is in UTC (we form it in local time)
				$('input[data=fromdate]', self.getElement()).val(new Date(from.valueOf() - from.getTimezoneOffset()*60*1000).toISOString().replace("T", " ").replace("Z", ""));
				$('input[data=todate]', self.getElement()).val(new Date(to.valueOf() - to.getTimezoneOffset()*60*1000).toISOString().replace("T", " ").replace("Z", ""));
			}

			// Make PAPI call
			var from_epoch = from.getTime();
			var to_epoch = to.getTime();
			self.loader.show();
			PAPI.getLogs(from_epoch, to_epoch, function(res) {
				window.logpanel.clearLog();
				window.logpanel.setNewLogResult(res);
				self.loader.hide();
			},
			function(res) {
				// Fail
				self.loader.hide();
			});
		}
	},
	render: function() {
		var self = this;
		var fromdate = new TextBox();
		var todate = new TextBox();
		var arrow = new Label("➜");
		var searchI = new SearchBox();
		var forwardButton = new GradientButton("≫", function(e){
			/* Not fired because Table Listener in Grid */
		});
		var backButton = new GradientButton("≪", function(e){
			/* Not fired because Table Listener in Grid */
		});
		var grid = new Grid(1,5);

		var cookie_fromdate = $.cookie('logs-fromdate');
		var cookie_todate = $.cookie('logs-todate');

		$(fromdate.getElement()).attr('type', 'text').attr('data', 'fromdate').attr('placeholder', 'From date and/or time').addClass('date-field').val(cookie_fromdate);
		$(todate.getElement()).attr('type', 'text').attr('data', 'todate').attr('placeholder', 'To date and/or time').addClass('date-field').val(cookie_todate);
		$(searchI.getElement()).attr('placeholder', 'Filter..').attr('type', 'search').attr('autocomplete', 'on').attr('results', '5').attr('autosave',  'filter_history');
		$(backButton.getElement()).attr('name', 'back').addClass("date-panel-navigate-button");
		$(forwardButton.getElement()).attr('name', 'forward').addClass("date-panel-navigate-button");
		arrow.setId("date-panel-arrow");
		grid.setId("date-grid");
		searchI.setId("date-panel-search");

		searchI.addKeyboardListener(function(that, e) {
			var type = e.type;
			if(type === "keyup" && that.getText().length > -1) {
				// Filter
				window.logpanel.filterByWords(that.getText());
			}
		});
		searchI.addSearchListener(function(that, e) {
			var type = e.type;
			if(type === "search" && that.getText().length > -1) {
				// Filter
				window.logpanel.filterByWords(that.getText());
			}
		});

		grid.setWidget(0,0,backButton);
		grid.setWidget(0,1,fromdate);
		grid.setWidget(0,2,arrow);
		grid.setWidget(0,3,todate);
		grid.setWidget(0,4,forwardButton);

		grid.addTableListener(function(table, e) {
			var target = e.target;

			if(e.keyCode == 13) {
				//Enter key pressed
				self.getLogs();
			} else if(e.type === "click" && ($(target).attr('name') === "forward" || $(target).attr('name') === "back")) {
				// Forward/Backwards button pressed
				self.getLogs($(target).attr('name'));
			}
		});

		this.add(searchI);
		this.add(grid);
	}
});

var RowItem = FocusWidget.extend({
	init: function(data) {
		// TODO: Change this to extend from Class instead, since now it dont use widget behavior and only render plain text (getRenderedText)
		if(typeof data === "string") {
			this.data = JSON.parse(data);
		} else {
			this.data = data;
		}
		this._super(this.render());
	},
	getMsg: function() {
		return this.data.msg;
	},
	getService: function() {
		return this.data.service;
	},
	getTimeStamp: function() {
		return this.data.timestamp;
	},
	getLevel: function() {
		return this.data.level;
	},
	valueExist: function(searchValue) {
		for(var obj in this.data) {
			var value = this.data[obj];
			if(typeof value !== "object") {
				// So dont search in arrays or objects (like "links")

				if(typeof value === "number") {
					// Search data value as a number
				} else if(typeof value === "string") {
					// Search data value as a string
					if(value.toLowerCase().match(searchValue.toLowerCase())) {
						return true;
					}
				}
			}
		}
		return false;
	},
	getRenderedText: function() {
		// Renderer method for TextArea that display only rows of text
		var dateobj = new Date(this.getTimeStamp());
		var level = "";
		if(level == 0) {
			level = "DEBUG";
		} else if(level == 1) {
			level = "INFO";
		} else if(level == 2) {
			level = "WARN";
		} else if(level == 3) {
			level = "ERROR";
		} else if(level == 4) {
			level = "FATAL";
		} else {
			level = "UKNOWN";
		}
		// Make it ISO string with the time offset and remove T and Z character that indicate time is in UTC (we form it in local time)
		var datestring = new Date(dateobj.valueOf() - dateobj.getTimezoneOffset()*60*1000).toISOString().replace("T", " ").replace("Z", "");
		return this.getService() + "\t" + datestring + "  " + level + "\t" + this.getMsg() + "\n";
	},
	render: function() {
		return html.div({});
	}
});

var LogPanel = FlowPanel.extend({
	init: function() {
		this._super();
		this.rows = [];
		this.rendered_rows = [];
		this.render();
	},
	filterByWords: function(searchValue) {
		if(typeof searchValue === "string") {
			if(searchValue === "") {
				// Performance tweak to skip actual filtering on empty string
				this.renderRows(this.rows);
			} else {
				// Filter all the rows from date search
				var filter_result = [];
				for(var i=0;i<this.rows.length;i++) {
					if(this.rows[i].valueExist(searchValue)) {
						filter_result.push(this.rows[i]);
					}
				}
				// Render filtered result
				this.renderRows(filter_result);
			}
		}
	},
	setNewLogResult: function(log) {
		// Sets new raw Log result and render it
		if(log && log.log_excerpt) {
			// Clear
			this.clearLog();
			this.log = log.log_excerpt;
			// Entries as in the log_excerpt object v1
			var entries = this.log.entries;
			if(console) console.log("Setting new log with number of rows: " + entries.length);
			for(var i=0;i<entries.length;i++) {
				this.rows.push(new RowItem(entries[i]));
			}
			// Render the new rows
			this.renderRows(this.rows);
		} else {
			if(console) console.warn("Tried to set new Log result but object was not a log_excerpt object!!!");
		}
	},
	renderRows: function(rows_array) {
		// Clear container
		this.container.setText("");
		// Render rows
		var text = "";
		for(var i=0;i<rows_array.length;i++) {
			text += rows_array[i].getRenderedText();
		}
		this.container.setText(text);
	},
	clearLog: function() {
		this.rows = [];
		this.container.setText("");
	},
	render: function() {
		var self = this;
		this.container = new TextArea();
		this.container.setId("logpanel-textarea");

		this.add(this.container);
	}
})


////////////////////////////////////////////////////

$(document).ready(function() {
	var root = new RootPanel("bootstrap");
	var wrapper = new FlowPanel();
	mainFlow = new DeckPanel();
	wrapper.setStyleName("site-width main-panel");
	
	var hf = new HashFactory();
	window.hf = hf;

	var fp = new LogsView();
	var login = new LoginView();

	mainFlow.add(login);
	mainFlow.add(fp);
	mainFlow.showWidget(0);

	wrapper.add(mainFlow);
	root.add(wrapper);

	//TEST
	//mainFlow.showWidget(1);

});