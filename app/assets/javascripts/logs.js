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
	onDirectionKey: function(direction) {
		var self = this;

		console.log("Getting logs...");
		var from_value = $('input[data=fromdate]', self.getElement()).val();
		var from = new Date(from_value);
		var to_value = $('input[data=todate]', self.getElement()).val();
		var to = new Date(to_value);

		if(from_value != "" && to_value != "" && from != "Invalid Date" && to != "invalid Date") {
			// Save values in cookie
			var date = new Date();
      		date.setTime(date.getTime() + (356 * 24 * 60 * 60 * 1000));
			$.cookie('logs-fromdate', from_value, {'expires':date, 'path': '/'});
			$.cookie('logs-todate', to_value, {'expires':date, 'path': '/'});

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
	onTailButton: function() {
		var self = this;
		if(!this.tailtoggle) {
			this.tail.addStyleName("selected");
			this.tailtoggle = true;
			this.tailInterval = setInterval(function(){self.onHourButton(0.5, true);}, 1000); // Update with 30min back in time as window
		} else {
			this.tail.removeStyleName("selected");
			this.tailtoggle = false;
			clearInterval(this.tailInterval);
		}
	},
	onHourButton: function(hours, hide_loader) {
		var now = new Date();
		var then = new Date(now - hours * 60 * 60 * 1000); // set time backwards number of hours

		this.fromdate.setText(new Date(then.valueOf() - then.getTimezoneOffset()*60*1000).toISOString().replace("T", " ").replace("Z", ""));
		this.todate.setText(new Date(now.valueOf() - now.getTimezoneOffset()*60*1000).toISOString().replace("T", " ").replace("Z", ""));
		this.onSearch(hide_loader);
	},
	onSearch: function(hide_loader) {
		// Make PAPI call
		var self = this;
		var from_epoch = new Date(this.fromdate.getText()).getTime();
		var to_epoch = new Date(this.todate.getText()).getTime();
		if(!hide_loader) {
			self.loader.show();
		}
		PAPI.getLogs(from_epoch, to_epoch, function(res) {
			window.logpanel.clearLog();
			window.logpanel.setNewLogResult(res);
			self.loader.hide();
		},
		function(res) {
			// Fail
			self.loader.hide();
		});
	},
	render: function() {
		var self = this;
		this.fromdate = new TextBox();
		this.todate = new TextBox();
		var arrow = new Label("➜");
		var searchI = new SearchBox();
		this.tail = new TextButton("Tail", function() {
			self.onTailButton();
		});
		var one = new TextButton("1h", function() {
			self.onHourButton(1);
		});
		var three = new TextButton("3h", function() {
			self.onHourButton(3);
		});
		var six = new TextButton("6h", function() {
			self.onHourButton(6);
		});
		var forwardButton = new GradientButton("≫", function(e){
			/* Not fired because Table Listener in Grid */
		});
		var backButton = new GradientButton("≪", function(e){
			/* Not fired because Table Listener in Grid */
		});
		var grid = new Grid(1,5);

		var cookie_fromdate = $.cookie('logs-fromdate');
		var cookie_todate = $.cookie('logs-todate');

		this.fromdate.setAttributes({'type':'text', 'data':'fromdate', 'placeholder':'From date and/or time'}).setStyleName('date-field').setText(cookie_fromdate);
		this.todate.setAttributes({'type':'text', 'data':'todate', 'placeholder':'To date and/or time'}).setStyleName('date-field').setText(cookie_todate);
		searchI.setAttributes({'placeholder':'Filter..', 'type':'search', 'autocomplete':'on', 'results':'5', 'autosave':'filter_history'});
		backButton.setAttributes({'name':'back'}).setStyleName("date-panel-navigate-button");
		forwardButton.setAttributes({'name':'forward'}).setStyleName("date-panel-navigate-button");
		arrow.setId("date-panel-arrow");
		grid.setId("date-grid");
		searchI.setId("date-panel-search");
		one.setStyleName("small-button gradientButton");
		three.setStyleName("small-button gradientButton");
		six.setStyleName("small-button gradientButton");
		this.tail.setStyleName("small-button gradientButton");

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
		grid.setWidget(0,1,this.fromdate);
		grid.setWidget(0,2,arrow);
		grid.setWidget(0,3,this.todate);
		grid.setWidget(0,4,forwardButton);

		grid.addTableListener(function(table, e) {
			var target = e.target;

			if(e.keyCode == 13) {
				//Enter key pressed
				self.onDirectionKey();
			} else if(e.type === "click" && ($(target).attr('name') === "forward" || $(target).attr('name') === "back")) {
				// Forward/Backwards button pressed
				self.onDirectionKey($(target).attr('name'));
			}
		});

		this.add(this.tail);
		this.add(one);
		this.add(three);
		this.add(six);
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
			// Assumes JSON object, should validate more!
			this.data = data;
		}
		this.service_name_tab_length = 2;
		this._super(this.render());
	},
	getMsg: function() {
		if(this.data.msg) {
			return this.data.msg + " ";
		} else {
			return "";
		}
	},
	getMethod: function() {
		if(this.data.method) {
			return this.data.method + " ";
		} else {
			return "";
		}
	},
	getStatus: function() {
		if(this.data.status) {
			return this.data.status + " ";
		} else {
			return "";
		}
	},
	getPath: function() {
		if(this.data.path) {
			return this.data.path + " ";
		} else {
			return "";
		}
	},
	getRemoteIP: function() {
		if(this.data.remote_ip) {
			return "from " + this.data.remote_ip + " ";
		} else {
			return "";
		}
	},
	getIP: function() {
		if(this.data.ip) {
			return this.data.ip + " ";
		} else {
			return "";
		}
	},
	getUsername: function() {
		if(this.data.username) {
			return this.data.username + " ";
		} else {
			return "";
		}
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
		if(this.getLevel() == 0) {
			level = "DEBUG";
		} else if(this.getLevel() == 1) {
			level = "INFO";
		} else if(this.getLevel() == 2) {
			level = "WARN";
		} else if(this.getLevel() == 3) {
			level = "ERROR";
		} else if(this.getLevel() == 4) {
			level = "FATAL";
		} else {
			level = "UKNOWN";
		}
		// Adjust the number of tabs inserted after Service name depending on its length. 1 tab is 8 characters long in JavaScript strings
		var tabs = Math.floor((this.getService().length / 8));
		var final_tabs = this.service_name_tab_length - tabs;
		final_tabs = (final_tabs < 0) ? 0 : final_tabs; // Make sure we don't have negative final_tabs for very long Service names.
		var tab_string = "";
		for(var i=0;i<final_tabs;i++) {
			tab_string += "\t";
		}
		// Make it ISO string with the time offset and remove T and Z character that indicate time is in UTC (we form it in local time)
		var datestring = new Date(dateobj.valueOf() - dateobj.getTimezoneOffset()*60*1000).toISOString().replace("T", " ").replace("Z", "");
		var row = this.getService() + tab_string + datestring + "  " + level + "\t" + this.getMethod() + this.getStatus() + this.getPath() + this.getUsername() + this.getMsg() + this.getIP() + this.getRemoteIP() + "\n";
		return row;
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
		console.log(log);
		if(log && log.log_excerpt) {
			// Clear
			this.clearLog();
			this.log = log.log_excerpt;
			// Entries as in the log_excerpt object v1
			var entries = this.log.entries;
			if(console) console.log("Setting new log with number of rows: " + entries.length);
			// Loop reverse over array of entries because they are in decending order of datetime
			for(var i=(entries.length-1);i>=0;i--) {
				// Create RowItem objects for each entry and add them to the array holder
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