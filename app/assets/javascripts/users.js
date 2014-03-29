var TopConsole = FlowPanel.extend({
	init: function() {
		this._super();
		this.loader = new WidgetLoader();
		this.render();
		this.items = [];
		this.setId("top-console");
	},
	render_item: function(itemWidget) {
		var self = this;
		var fp = new FlowPanel();
		var itemIcon = new FocusWidget(DOM.createDiv());
		// Default labels and inputs
		var nameL = new Text("Name");
		var descriptionL = new Text("Description");
		var createdL = new Text("Created");
		var updatedL = new Text("Last updated");
		var nameI = new TextBox();
		nameI.setAttributes({
			'name':'name'
		});
		var descriptionI = new TextBox();
		descriptionI.setAttributes({
			'name':'description'
		});
		var createdI = new Text(itemWidget.data.created_at);
		$(createdI.getElement()).attr('name', 'created_at');
		var updatedI = new Text(itemWidget.data.updated_at);
		$(updatedI.getElement()).attr('name', 'update_at');
		// User special label inputs
		var usernameL = new Text("Username");
		var realnameL = new Text("Real name");
		var emailL = new Text("Email");
		var usernameI = new TextBox();
		var realnameI = new TextBox();
		var emailI = new TextBox();

		var deleteB = new BonBonButton("Delete", function(){
			PAPI._delete(self.currentSelectedItem.getLink("self"), function(res) {
				// Success
				if(self.currentSelectedItem.getType() === "api_user") {
					window.users.refresh();
				} else if(self.currentSelectedItem.getType() === "group") {
					window.groups.refresh();
				} else if(self.currentSelectedItem.getType() === "role") {
					window.roles.refresh();
				} else if(self.currentSelectedItem.getType() === "right") {
					window.rights.refresh();
				}
				self.mainFlow.fadeToWidget(0);
			});
		}, "✗");

		deleteB.setId("top-console-delete-button").setStyleName("bbPink relief-shadow");
		usernameI.setText(itemWidget.data.username || "").setStyle("font-weight", "bold").setAttributes({
			'name':'username'
		});
		realnameI.setText(itemWidget.data.real_name || "").setAttributes({
			'name':'real_name'
		});
		emailI.setText(itemWidget.data.email || "").setAttributes({
			'name':'email'
		});
		nameI.setText(itemWidget.data.name || "").setStyle("font-weight", "bold");
		descriptionI.setText(itemWidget.data.description || "");

		nameL.setStyleName("align-right");
		descriptionL.setStyleName("align-right");
		createdL.setStyleName("align-right");
		updatedL.setStyleName("align-right");
		usernameL.setStyleName("align-right");
		realnameL.setStyleName("align-right");
		emailL.setStyleName("align-right");
		createdI.setStyleName("align-left");
		updatedI.setStyleName("align-left");

		var grid = new Grid(5, 2);
		grid.setId("selected-item-grid");

		if(itemWidget.getType() === "api_user") {
			grid.setWidget(0,0,usernameL);
			grid.setWidget(0,1,usernameI);
			grid.setWidget(1,0,realnameL);
			grid.setWidget(1,1,realnameI);
			grid.setWidget(2,0,emailL);
			grid.setWidget(2,1,emailI);
			grid.setWidget(3,0,createdL);
			grid.setWidget(3,1,createdI);
			grid.setWidget(4,0,updatedL);
			grid.setWidget(4,1,updatedI);
		} else {
			grid.setWidget(0,0,nameL);
			grid.setWidget(0,1,nameI);
			grid.setWidget(1,0,descriptionL);
			grid.setWidget(1,1,descriptionI);
			grid.setWidget(2,0,createdL);
			grid.setWidget(2,1,createdI);
			grid.setWidget(3,0,updatedL);
			grid.setWidget(3,1,updatedI);
		}

		grid.addTableListener(function(table, event) {
			var name = $(event.target).attr('name');
			if(event.type === 'mouseover' && name === 'created_at') {
				// Implement fetching of creator link and show it in hover popup next to mouse

				// Show CreatorPopup if it's not currently showing (avoiding super spam)
				if(!window.creatorPopup.isShowing) {
					PAPI._get(self.currentSelectedItem.getLink("creator").replace("https", "http"), function(res) {
						// Success
						window.creatorPopup.setUser(res["api_user"]);
					},
					function(res) {
						// Fail
						if(console) console.log("Failed to get ApiUser for creator");
					});
				}
				
			} else if(event.type === "blur" && event.target.nodeName == "INPUT") {
				// Save object because possible new data from user
				var new_value = $(event.target).val();
				var value_name = $(event.target).attr('name');
				var data = self.currentSelectedItem.data;
				data[value_name] = new_value;
				self.loader.show();
				PAPI._save(self.currentSelectedItem.getLink("self"), data, function(res) {
					// Just save the data in current object rather than instantiate a new one, because then we would loose reference pointers etc
					var type = self.currentSelectedItem.getType();
					self.currentSelectedItem.data = res[type];
					self.loader.hide();
				});
			}
		});

		itemIcon.setStyleName(itemWidget.getType() + "-icon item-icon");

		fp.add(deleteB);
		fp.add(itemIcon);
		fp.add(grid);

		return fp;
	},
	render_item_view: function() {
		var self = this;
		var holder = new FlowPanel();
		this.container = new ToBucketContainer(true);
		var dragHook = new FlowPanel();
		var dragHookI = new FocusWidget(DOM.createDiv());
		var navigationPanel = new FlowPanel();
		this.selectedItemHolder = new FlowPanel();

		var searchI = new SearchBox();
		searchI.setId("search-filter");
		$(searchI.getElement()).attr('placeholder', 'Search').attr('type', 'search').attr('autocomplete', 'on').attr('results', '5').attr('autosave', name + '_history');
		searchI.addKeyboardListener(function(that, e) {
			var type = e.type;
			if(type === "keyup" && that.getText().length > -1) {
				// Filter
				var result = [];
				var itemlist = self.items;
				for(var i=0; i<itemlist.length; i++) {
					if(itemlist[i].valueExist(that.getText()))
						result.push(itemlist[i]);
				}
				self.container.clear();
				self.showItems(result);
			}
		});
		searchI.addSearchListener(function(that, e) {
			var type = e.type;
			if(type === "search" && that.getText().length > -1) {
				// Filter
				var result = [];
				var itemlist = self.items;
				for(var i=0; i<itemlist.length; i++) {
					if(itemlist[i].valueExist(that.getText()))
						result.push(itemlist[i]);
				}
				self.container.clear();
				self.showItems(result);
			}
		});

		this.selectedItemHolder.setId("selected-item-holder");
		this.container.setId("to-container");
		dragHook.setStyleName("drag-hook");
		dragHookI.setId("drag-hook-image");
		navigationPanel.setId("navigation-panel");

		$(dragHook.getElement()).on('mousedown', function(e) {
			self.isRezising = true;
		});
		$('body').on('mouseup', function(e) {
			if(self.isRezising) {
				self.isRezising = false;
			}
		});
		$('body').on('mousemove', function(e) {
			if(self.isRezising) {
				var newSize = $(self.getElement()).height()+e.originalEvent.webkitMovementY;
				if(newSize >= 190) {
					// Resize TopConsole
					$(self.getElement()).css('height', newSize);
					// Move dragHook to follow
					var draghook_top = $(dragHook.getElement()).position().top + e.originalEvent.webkitMovementY;
					$(dragHook.getElement()).css('top', draghook_top);
					// Move bucketHolder
					var bucketholder_top = parseInt($(window.bh.getElement()).css('margin-top')) + e.originalEvent.webkitMovementY;
					$(window.bh.getElement()).css('margin-top', bucketholder_top);
					// Resize container
					var resize_height = $(self.container.getElement()).height() + e.originalEvent.webkitMovementY;
					$(self.container.getElement()).css('height', resize_height);
					/*
					if(console) console.log("-----------------");
					if(console) console.log("MouseY: " + e.originalEvent.webkitMovementY);
					if(console) console.log("TopBar: " + newSize);
					if(console) console.log("DragHook: " + draghook_top);
					if(console) console.log("BucketHolder: " + bucketholder_top);
					if(console) console.log("Drop Container: " + resize_height);
					*/
				}
			}
		});
		$(dragHook.getElement()).on('mousemove', function(e) {
			//Just to make object mouse-able
		});

		this.container.add(this.render_empty_container());
		dragHook.add(dragHookI);

		holder.add(navigationPanel);
		holder.add(searchI);
		holder.add(this.selectedItemHolder);
		holder.add(this.container);
		holder.add(dragHook);

		return holder;
	},
	render_empty_container: function() {
		var holder = new FlowPanel();
		var label = new Text("Drag and drop items here");
		var image = new FocusWidget(DOM.createDiv());

		image.setStyleName("drag-drop-icon");
		label.setStyle("margin", "30px 0px 0px 0px");
		holder.add(label);
		holder.add(image);

		return holder;
	},
	render_start_view: function() {
		var holder = new FlowPanel();
		var navigationPanel = new FlowPanel();
		var label = new Text("Click on a item below to select. Or create a new.");
		var dragHook = new FlowPanel();

		navigationPanel.setId("navigation-panel-start");
		label.setStyle("padding", "60px 0px 0px 0px");
		dragHook.setStyleName("drag-hook");
		dragHook.setStyle("cursor", "default");

		holder.add(navigationPanel);
		holder.add(label);
		holder.add(dragHook);

		return holder;
	},
	render: function() {
		this.mainFlow = new DeckPanel();

		this.mainFlow.add(this.render_start_view());
		this.mainFlow.add(this.render_item_view());
		this.mainFlow.showWidget(0);

		this.add(this.mainFlow);
	},
	refresh: function() {
		// Refresh current selected item if there is any by just setting it again
		if(this.currentSelectedItem) {
			this.selectedItem(this.currentSelectedItem);
		}
	},
	selectedItem: function(itemWidget) {
		// Set new selected item

		var self = this;

		// Change selected-item DOM class
		if(this.currentSelectedItem)
			$(this.currentSelectedItem.getElement()).removeClass("selected-item");
		this.currentSelectedItem = itemWidget;
		$(itemWidget.getElement()).addClass("selected-item");

		// Cleanup
		this.selectedItemHolder.clear();
		this.selectedItemHolder.add(this.loader);
		this.items = [];
		this.selectedItemHolder.add(this.render_item(itemWidget));
		this.clearContainer();

		// Get all connections
		var counter = 0;
		var number_of_calls = 0;
		this.container.showLoader(true);
		// Start loading the connections for this object to display
		var rightsLink = itemWidget.getLink("rights");
		var groupsLink = itemWidget.getLink("groups");
		var rolesLink = itemWidget.getLink("roles");
		var usersLink = itemWidget.getLink("api_users");
		// Get collection of wanted links
		if(itemWidget.getType() === "right") {
			// Doesnt contain any of the above 4 links so just remove Loader
			self.container.hideLoader();
		}
		if(usersLink) {
			number_of_calls++;
			PAPI._get(usersLink, function(res) {
				res = res._collection.resources;
				if(typeof res === "object" && res["api_user"]) {
					// Single object
					self.addItem(new UserItem(res.api_user));
				} else if(typeof res === "object" && res.length > 0) {
					for(var i=0;i<res.length;i++) {
						self.addItem(new UserItem(res[i].api_user));
					}
				}
				counter++;
				if(counter >= number_of_calls)
					self.container.hideLoader();
			},
			function(res) {
				// Error
				counter++;
				if(counter >= number_of_calls)
					self.container.hideLoader();
			});
		}
		if(groupsLink) {
			number_of_calls++;
			PAPI._get(groupsLink, function(res) {
				res = res._collection.resources;
				if(typeof res === "object" && res["group"]) {
					// Single object
					self.addItem(new GroupItem(res.group));
				} else if(typeof res === "object" && res.length > 0) {
					for(var i=0;i<res.length;i++) {
						self.addItem(new GroupItem(res[i].group));
					}
				}
				counter++;
				if(counter >= number_of_calls)
					self.container.hideLoader();
			},
			function(res) {
				// Error
				counter++;
				if(counter >= number_of_calls)
					self.container.hideLoader();
			});
		}
		if(rolesLink) {
			number_of_calls++;
			PAPI._get(rolesLink, function(res) {
				res = res._collection.resources;
				if(typeof res === "object" && res["role"]) {
					// Single object
					self.addItem(new RoleItem(res.role));
				} else if(typeof res === "object" && res.length > 0) {
					for(var i=0;i<res.length;i++) {
						self.addItem(new RoleItem(res[i].role));
					}
				}
				counter++;
				if(counter >= number_of_calls)
					self.container.hideLoader();
			},
			function(res) {
				// Error
				counter++;
				if(counter >= number_of_calls)
					self.container.hideLoader();
			});
		}
		if(rightsLink) {
			number_of_calls++;
			PAPI._get(rightsLink, function(res) {
				res = res._collection.resources;
				if(typeof res === "object" && res["role"]) {
					// Single object
					self.addItem(new RightItem(res.right));
				} else if(typeof res === "object" && res.length > 0){
					for(var i=0;i<res.length;i++) {
						self.addItem(new RightItem(res[i].right));
					}
				}
				counter++;
				if(counter >= number_of_calls)
					self.container.hideLoader();
			},
			function(res) {
				// Error
				counter++;
				if(counter >= number_of_calls)
					self.container.hideLoader();
			});
		}
	},
	addItem: function(widget) {
		// Add to the complete list
		this.items.push(widget);
		// Render item
		if(this.container.getWidgetCount() < 50) {
			this.container.addFirst(widget);
		} else {
			// Disconnect widget so it doesnt render in old parent
			widget.removeFromParent();
		}
	},
	removeItem: function(widget) {
		// Remove item from complete list
		this.items.remove(widget);
	},
	showItem: function(widget) {
		// Render item
		this.container.addFirst(widget);
	},
	showItems: function(list) {
		// Render items
		var length;
		list.length > 50 ? length = 50 : length = list.length;
		for(var i=0; i < length; i++) {
			this.container.addFirst(list[i]);
		}
	},
	clearContainer: function() {
		var self = this;
		this.container.clear();
		var clearAllButton = new GradientButton("Clear all", function(e) {
			console.log("clear");
			self.container.clear();
			self.container.add(self.render_empty_container());
		});
		clearAllButton.setStyleName("clear-all-button");
		this.container.add(this.container.loader);
		this.container.add(clearAllButton);
	}
});

var BoxItem = DragAndDropWidget.extend({
	init: function(data) {
		this._super();
		var self = this;
		if(data) this.data = data;
		$(this.getElement()).attr("draggable", "true");
		this.setStyleName("box-item");

		this.addDragStartListener(function(that, e) {
			//console.log("Drag Start");

			window.dragSrcElement = self;

			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('application/x-boxitem', self);
		});
		this.addClickListener(function(that, e) {
			window.tc.selectedItem(self);
			window.tc.mainFlow.fadeToWidget(1);
		});
		$(self.getElement()).on('webkitAnimationEnd', function(e) {
			// Stop animation when done
			$(self.getElement()).css('-webkit-animation-play-state', 'paused');
		});
	},
	valueExist: function(searchValue) {
		// Replace all * with \* to be able to search for the character and not RegEx *
		searchValue = searchValue.replace(/\*/g, '\\*');
		// If searchValue has sapces it means AND, pipe OR and semicolon attribute
		// "api_user GET name:kalle" is same as search for "api_user AND GET AND HAS ATTRIBUTE name=kalle"

		searchValue = searchValue.split(" ");
		for(var i=0; i<searchValue.length; i++) {
			var match = false;
			for(var obj in this.data) {
				var value = this.data[obj];
				if(typeof value !== "object") {
					// So dont search in arrays or objects (like "links")

					if(typeof value === "number") {
						// Search data value as a number
					} else if(typeof value === "string") {
						// Search data value as a string
						if(value.toLowerCase().match(searchValue[i].toLowerCase())) {
							match = true;
							break; // Step out of for-loop
						}
					}
				}
			}
			if(!match) {
				// Stop searching since we didn't find this explicit record and we search with AND logic
				return false;
			}
		}
		return true;
	},
	getLink: function(rel) {
		if(typeof this.data._links === "object" && this.data["_links"][rel]) {
			return this.data["_links"][rel].href;
		} else {
			return null;
		}
	},
	getType: function() {
		return this.itemType;
	},
	animateError: function() {
		$(this.getElement()).css('-webkit-animation-play-state', 'running');
	}
});

var UserItem = BoxItem.extend({
	init: function(data) {
		this._super(data);
		this.itemType = "api_user";
		this.setStyleName("user-item");
		this.render(data.username);
	},
	render: function(name) {
		var label = new Text(name, true);

		label.setStyleName("box-item-label");

		this.add(label);
	}
});

var GroupItem = BoxItem.extend({
	init: function(data) {
		this._super(data);
		this.itemType = "group";
		this.setStyleName("group-item");
		this.render(data.name);
	},
	render: function(name) {
		var label = new Text(name, true);

		label.setStyleName("box-item-label");

		this.add(label);
	}
});

var RoleItem = BoxItem.extend({
	init: function(data) {
		this._super(data);
		this.itemType = "role";
		this.setStyleName("role-item");
		this.render(data.name);
	},
	render: function(name) {
		var label = new Text(name, true);

		label.setStyleName("box-item-label");

		this.add(label);
	}
});

var RightItem = BoxItem.extend({
	init: function(data) {
		this._super(data);
		this.itemType = "right";
		this.setStyleName("right-item");
		this.render(data.name);
	},
	render: function(name) {
		var label = new Text(name, true);

		label.setStyleName("box-item-label");

		this.add(label);
	}
});

var ToBucketContainer = DragAndDropWidget.extend({
	init: function(addReverseOrder) {
		this._super();

		this.loader = new WidgetLoader();
		this.add(this.loader);

		if(addReverseOrder) this.addReverseOrder = true;
		this.setStyleName("bucket-container");

		this.addDropListener(function(self, e) {
			//e.stopPropagation();

			var boxItem = e.dataTransfer.getData("application/x-boxitem");
			var selectedItem = window.tc.currentSelectedItem;

			if(boxItem) {
				// Dont drop item if it's the selected item (aka dropping itself in itself)
				if(selectedItem != window.dragSrcElement) {
					//console.log(selectedItem.getLink("connect"));
					// Show loader on ToContainer
					window.tc.container.showLoader();
					PAPI.connect(selectedItem.getLink("connect"), window.dragSrcElement.getLink("self"), function(res) {
						// Success
						// Update content of selected item
						window.tc.selectedItem(selectedItem);

						// Remove Loader on ToContainer
						window.tc.container.hideLoader();
					}, function(res) {
						// Error
						if(console) console.log("Failed to connect");
						if(console) console.log(res);
						window.dragSrcElement.animateError();
						// Remove Loader on ToContainer
						window.tc.container.hideLoader();
					});

				} else {
					if(console) console.log("Tried to drop object in itself or wrong bucket!!!!");
				}
			}

		});

		// DragEnter and DragOver is needed to fire on object for the HTML5 drag-n-drop API to trigger Drop event
		this.addDragEnterListener(function(self, e) {
			//console.log("Bucket Enter");
		});
		this.addDragOverListener(function(self, e) {
			e.preventDefault();
		});
	},
	showLoader: function(adapt) {
		this.loader.show(adapt);
	},
	hideLoader: function() {
		this.loader.hide();
	}
});

var FromBucketContainer = DragAndDropWidget.extend({
	init: function(addReverseOrder) {
		this._super();

		if(addReverseOrder) this.addReverseOrder = true;
		this.setStyleName("bucket-container");

		// DragEnter and DragOver is needed to fire on object for the HTML5 drag-n-drop API to trigger Drop event
		this.addDragEnterListener(function(self, e) {

		});
		this.addDragOverListener(function(self, e) {
			e.preventDefault();
		});
	}
});

var ContainerWidget = DragAndDropWidget.extend({
	init: function(name) {
		this._super();
		this.setId(name + "-container");

		this.loader = new WidgetLoader();
		this.add(this.loader);
		this.items = [];
		this.render(name);
	},
	render: function(name) {
		var self = this;

		var header = new FlowPanel();
		var headerL = new Text(name);
		var createB = new GradientButton("+", function(e) {window.createBox.show(name);});
		var searchI = new SearchBox();
		this.container = new FromBucketContainer();

		var filter_fn = function(that, e) {
			// Filter
			var result = [];
			var itemlist = self.items;

			for(var i=0; i<itemlist.length; i++) {
				if(itemlist[i].valueExist(that.getText()))
					result.push(itemlist[i]);
			}
			self.container.clear();
			self.showItems(result);
		};

		searchI.addKeyboardListener(function(that, e) {
			var type = e.type;
			if(type === "keyup" && that.getText().length > -1) {
				filter_fn(that, e);
			}
		});
		searchI.addSearchListener(function(that, e) {
			var type = e.type;
			if(type === "search" && that.getText().length > -1) {
				filter_fn(that, e);
			}
		});

		this.container.setStyleName("from-container");
		header.setStyleName("container-widget-header");
		headerL.setStyleName("container-widget-header-label");
		createB.setStyleName("create-boxitem-button");
		searchI.setStyleName("search-filter-input");

		$(searchI.getElement()).attr('placeholder', 'Search').attr('type', 'search').attr('autocomplete', 'on').attr('results', '5').attr('autosave', name + '_history');

		header.add(headerL);
		header.add(createB);
		header.add(searchI);
		this.add(header);
		this.add(this.container);
	},
	showLoader: function() {
		this.loader.show();
	},
	hideLoader: function() {
		this.loader.hide();
	},
	addItem: function(widget) {
		// Add to the complete list
		this.items.push(widget);
		// Render item
		if(this.container.getWidgetCount() < 50) {
			this.container.add(widget);
		} else {
			// Disconnect widget so it doesnt render in old parent
			widget.removeFromParent();
		}
	},
	addItems: function() {
		// This method must be overridden upon inheritence, since refresh() need it
		if(console) console.warn("addItems in ContainerWidget is not overridden!!! Fix this!");
	},
	removeItem: function(widget) {
		// Remove item from complete list
		this.items.remove(widget);
	},
	showItem: function(widget) {
		// Render item
		this.container.add(widget);
	},
	showItems: function(list) {
		// Render items
		var length;
		list.length > 50 ? length = 50 : length = list.length;
		for(var i=0; i < length; i++) {
			this.container.add(list[i]);
		}
	},
	refresh: function() {
		this.items = [];
		this.container.clear();
		this.addItems();
	}
});

var Users = ContainerWidget.extend({
	init: function() {
		this._super("USERS");

		this.setStyleName("bucket");
	},
	addItems: function() {
		var self = this;
		var data = {};
		data.service = 'api_users';
		this.showLoader();
		PAPI._get(data, function(res) {
			// Success
			res = res._collection.resources;
			if(res[0]) {
				if(res[0]["api_user"]) {
					for(var i=0;i<res.length;i++) {
						self.addItem(new UserItem(res[i]["api_user"]));
					 }
				}
			}
			self.hideLoader();
		},
		function(res) {
			// Fail
			if(console) console.warn("Failed on GET for Users");
			if(console) console.log(res);
			self.hideLoader();
		});
	}
});

var Groups = ContainerWidget.extend({
	init: function() {
		this._super("GROUPS");

		this.setStyleName("bucket");
	},
	addItems: function() {
		var self = this;
		var data = {};
		data.service = 'groups';
		self.showLoader();
		PAPI._get(data, function(res) {
			// Success
			res = res._collection.resources;
			if(res[0]) {
				if(res[0]["group"]) {
					for(var i=0;i<res.length;i++) {
						self.addItem(new GroupItem(res[i]["group"]));
					 }
				}
			}
			self.hideLoader();
		},
		function(res) {
			// Fail
			if(console) console.warn("Failed on GET for Groups");
			if(console) console.log(res);
			self.hideLoader();
		});
	}
});

var Roles = ContainerWidget.extend({
	init: function() {
		this._super("ROLES");

		this.setStyleName("bucket");
	},
	addItems: function() {
		var self = this;
		var data = {};
		data.service = 'roles';
		self.showLoader();
		PAPI._get(data, function(res) {
			// Success
			res = res._collection.resources;
			if(res[0]) {
				if(res[0]["role"]) {
					for(var i=0;i<res.length;i++) {
						self.addItem(new RoleItem(res[i]["role"]));
					 }
				}
			}
			self.hideLoader();
		},
		function(res) {
			// Fail
			if(console) console.warn("Failed on GET for Roles");
			if(console) console.log(res);
			self.hideLoader();
		});
	}
});

var Rights = ContainerWidget.extend({
	init: function() {
		this._super("RIGHTS");

		this.setStyleName("bucket");
	},
	addItems: function() {
		var self = this;
		var data = {};
		data.service = 'rights';
		self.showLoader();
		PAPI._get(data, function(res) {
			// Success
			res = res._collection.resources;
			if(res[0]) {
				if(res[0]["right"]) {
					for(var i=0;i<res.length;i++) {
						self.addItem(new RightItem(res[i]["right"]));
					 }
				}
			}
			self.hideLoader();
		},
		function(res) {
			// Fail
			if(console) console.warn("Failed on GET for Rights");
			if(console) console.log(res);
			self.hideLoader();
		});
	}
});

var CreateBox = FlowPanel.extend({
	init: function() {
		this._super();
		this.setStyleName("overlay-box");
		this.render();
	},
	render_user: function() {
		var self = this;
		var holder = new FlowPanel();

		var saveB = new BonBonButton("Save", function(){}, "✓");
		var cancelB = new BonBonButton("Cancel", function(){}, "✗");
		saveB.setStyleName("bbGreen bbSmall");
		cancelB.setStyleName("bbPink bbSmall");
		$(saveB.getElement()).attr('name', 'save').attr('type', 'submit');
		$(cancelB.getElement()).attr('name', 'cancel').attr('type', 'button');
		var header = new Header2("Create new user");

		// User special label inputs
		var usernameL = new Text("Username");
		var passwordL = new Text("Password");
		var repasswordL = new Text("Enter password again");
		var realnameL = new Text("Real name");
		var emailL = new Text("Email");
		var usernameI = new TextBox(function() {
			// Validation
			var value = $(this.getElement()).val();
			if(value && (value.length > 2)) {
				return true;
			} else {
				return false;
			}
		});
		var realnameI = new TextBox(function() {
			// Validation
			var value = $(this.getElement()).val();
			if(value && (value.length > 2)) {
				return true;
			} else {
				return false;
			}
		});
		var emailI = new TextBox(function() {
			// Validation
			var value = $(this.getElement()).val();
			var pattern = /(([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+)/;
			return pattern.test(value);
		});
		var passwordI = new TextBox(function() {
			// Validation
			var value = $(this.getElement()).val();
			if(value.length < 6) {
				// Too short password
				return false;
			} else if (value.search(/\d/) == -1) {
				// No digit
				return false;
			} else if (value.search(/[a-zA-Z]/) == -1) {
				// No letter (well no check for åäö)
				return false;
			}
			return true;
		});
		var repasswordI = new TextBox(function() {
			// Validation
			var value = $(this.getElement()).val();
			var value_ori = $(passwordI.getElement()).val();

			return value == value_ori ? true : false;
		});

		usernameL.setStyleName("align-right");
		realnameL.setStyleName("align-right");
		emailL.setStyleName("align-right");
		passwordL.setStyleName("align-right");
		repasswordL.setStyleName("align-right");

		$(usernameI.getElement()).attr('errorMessage', 'Enter a username!').attr('name', 'username').attr('autofocus', 'on');
		$(realnameI.getElement()).attr('errorMessage', 'Enter your real name!').attr('name', 'real_name');
		$(emailI.getElement()).attr('errorMessage', 'Enter a correct email mofo!').attr('name', 'email');
		$(passwordI.getElement()).attr('errorMessage', 'Enter a password with at least 1 letter, 1 number and length bigger than 5 characters!').attr('name', 'password').attr('type', 'password');
		$(repasswordI.getElement()).attr('errorMessage', 'This is not same as above password!').attr('name', 'repassword').attr('type', 'password');

		// Native HTML5 Validation
		//$(usernameI.getElement()).attr('type', 'text').attr('autofocus', 'on').attr('required', '').attr('title', 'Enter a username!');
		//$(realnameI.getElement()).attr('type', 'text').attr('required', '').attr('title', 'Enter your real name!');
		//$(emailI.getElement()).attr('type', 'email').attr('required', '').attr('title', 'Enter your email!');

		var grid = new FormGrid(6, 2);
		grid.setStyleName("create-grid");
		$(grid.getElement()).attr('autocomplete', 'on');
		
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
			// Create
			self.loader.show();
			PAPI._create(data, function(res) {
				console.log("Created User");
				window.users.refresh();
				form.clearAll();
				self.loader.hide();
				self.hide();
			},
			function(res) {
				// Failed
				self.loader.hide();
			});
		});

		grid.addOnCancel(function(form,event){
			form.clearAll();
			self.onCancel();
		});

		var fp = new FlowPanel();
		fp.add(cancelB);
		fp.add(saveB);

		grid.setWidget(0,0,usernameL);
		grid.setWidget(0,1,usernameI);
		grid.setWidget(1,0,passwordL);
		grid.setWidget(1,1,passwordI);
		grid.setWidget(2,0,repasswordL);
		grid.setWidget(2,1,repasswordI);
		grid.setWidget(3,0,realnameL);
		grid.setWidget(3,1,realnameI);
		grid.setWidget(4,0,emailL);
		grid.setWidget(4,1,emailI);
		grid.setWidget(5,1,fp);

		holder.add(header);
		holder.add(grid);
		//holder.add(cancelB);
		//holder.add(saveB);

		return holder;
	},
	render_group: function() {
		var self = this;
		var holder = new FlowPanel();

		var saveB = new BonBonButton("Save", function(){}, "✓");
		var cancelB = new BonBonButton("Cancel", function(){}, "✗");
		saveB.setStyleName("bbGreen bbSmall");
		cancelB.setStyleName("bbPink bbSmall");
		$(saveB.getElement()).attr('name', 'save').attr('type', 'submit');
		$(cancelB.getElement()).attr('name', 'cancel').attr('type', 'button');
		var header = new Header2("Create a new Group");

		// User special label inputs
		var nameL = new Text("Name");
		var descriptionL = new Text("Description");
		var nameI = new TextBox(function() {
			// Validation
			var value = $(this.getElement()).val();
			if(value) {
				return true;
			} else {
				return false;
			}
		});
		var descriptionI = new TextBox(function() {
			// Validation
			var value = $(this.getElement()).val();
			if(value) {
				return true;
			} else {
				return false;
			}
		});

		nameL.setStyleName("align-right");
		descriptionL.setStyleName("align-right");

		$(nameI.getElement()).attr('errorMessage', 'Enter a name of this item!').attr('name', 'name').attr('autofocus', 'on');
		$(descriptionI.getElement()).attr('errorMessage', 'Enter a description!').attr('name', 'description');

		var grid = new FormGrid(3, 2);
		grid.setStyleName("create-grid");
		$(grid.getElement()).attr('autocomplete', 'on');

		grid.addOnSave(function(form,event){
			// Valid form do PAPI call
			console.log("Valid form");
			// Collect data
			var data = {};
			data.service = "groups";
			var inputs = $('input', grid.getElement());
			for(var i=0;i<inputs.length;i++) {
				data[inputs[i].name] = $(inputs[i]).val();
			}
			// Create
			self.loader.show();
			PAPI._create(data, function(res) {
				console.log("Created Group");
				window.groups.refresh();
				form.clearAll();
				self.loader.hide();
				self.hide();
			},
			function(res) {
				// Failed
				self.loader.hide();
			});
		});
		
		grid.addOnCancel(function(form,event){
			form.clearAll();
			self.onCancel();
		});

		var fp = new FlowPanel();
		fp.add(cancelB);
		fp.add(saveB);

		grid.setWidget(0,0,nameL);
		grid.setWidget(0,1,nameI);
		grid.setWidget(1,0,descriptionL);
		grid.setWidget(1,1,descriptionI);
		grid.setWidget(2,1,fp);

		holder.add(header);
		holder.add(grid);
		return holder;
	},
	render_role: function() {
		var self = this;
		var holder = new FlowPanel();

		var saveB = new BonBonButton("Save", function(){}, "✓");
		var cancelB = new BonBonButton("Cancel", function(){}, "✗");
		saveB.setStyleName("bbGreen bbSmall");
		cancelB.setStyleName("bbPink bbSmall");
		$(saveB.getElement()).attr('name', 'save').attr('type', 'submit');
		$(cancelB.getElement()).attr('name', 'cancel').attr('type', 'button');
		var header = new Header2("Create a new Role");

		// User special label inputs
		var nameL = new Text("Name");
		var descriptionL = new Text("Description");
		var nameI = new TextBox(function() {
			// Validation
			var value = $(this.getElement()).val();
			if(value) {
				return true;
			} else {
				return false;
			}
		});
		var descriptionI = new TextBox(function() {
			// Validation
			var value = $(this.getElement()).val();
			if(value) {
				return true;
			} else {
				return false;
			}
		});

		nameL.setStyleName("align-right");
		descriptionL.setStyleName("align-right");

		$(nameI.getElement()).attr('errorMessage', 'Enter a name of this item!').attr('name', 'name').attr('autofocus', 'on');
		$(descriptionI.getElement()).attr('errorMessage', 'Enter a description!').attr('name', 'description');

		var grid = new FormGrid(3, 2);
		grid.setStyleName("create-grid");
		$(grid.getElement()).attr('autocomplete', 'on');
		
		grid.addOnSave(function(form,event){
			// Valid form do PAPI call
			console.log("Valid form");
			// Collect data
			var data = {};
			data.service = "roles";
			var inputs = $('input', grid.getElement());
			for(var i=0;i<inputs.length;i++) {
				data[inputs[i].name] = $(inputs[i]).val();
			}
			// Create
			self.loader.show();
			PAPI._create(data, function(res) {
				console.log("Created Role");
				window.roles.refresh();
				form.clearAll();
				self.loader.hide();
				self.hide();
			},
			function(res) {
				// Failed
				self.loader.hide();
			});
		});
		
		grid.addOnCancel(function(form,event){
			form.clearAll();
			self.onCancel();
		});

		var fp = new FlowPanel();
		fp.add(cancelB);
		fp.add(saveB);

		grid.setWidget(0,0,nameL);
		grid.setWidget(0,1,nameI);
		grid.setWidget(1,0,descriptionL);
		grid.setWidget(1,1,descriptionI);
		grid.setWidget(2,1,fp);

		holder.add(header);
		holder.add(grid);
		return holder;
	},
	render_right: function() {
		var self = this;
		var holder = new FlowPanel();

		var saveB = new BonBonButton("Save", function(){}, "✓");
		var cancelB = new BonBonButton("Cancel", function(){}, "✗");
		saveB.setStyleName("bbGreen bbSmall");
		cancelB.setStyleName("bbPink bbSmall");
		$(saveB.getElement()).attr('name', 'save').attr('type', 'submit');
		$(cancelB.getElement()).attr('name', 'cancel').attr('type', 'button');
		var header = new Header2("Create a new Right");

		// User special label inputs
		var nameL = new Text("Name");
		var descriptionL = new Text("Description");
		var nameI = new TextBox(function() {
			// Validation
			var value = $(this.getElement()).val();
			if(value) {
				return true;
			} else {
				return false;
			}
		});
		var descriptionI = new TextBox(function() {
			// Validation
			var value = $(this.getElement()).val();
			if(value) {
				return true;
			} else {
				return false;
			}
		});

		nameL.setStyleName("align-right");
		descriptionL.setStyleName("align-right");

		$(nameI.getElement()).attr('errorMessage', 'Enter a name of this item!').attr('name', 'username').attr('autofocus', 'on');
		$(descriptionI.getElement()).attr('errorMessage', 'Enter a description!').attr('name', 'realname');

		var grid = new FormGrid(3, 2);
		grid.setStyleName("create-grid");
		$(grid.getElement()).attr('autocomplete', 'on');
		
		grid.addOnSave(function(form,event){
			// Valid form do PAPI call
			console.log("Valid form");
			// Collect data
			var data = {};
			data.service = "rights";
			var inputs = $('input', grid.getElement());
			for(var i=0;i<inputs.length;i++) {
				data[inputs[i].name] = $(inputs[i]).val();
			}
			// Create
			self.loader.show();
			PAPI._create(data, function(res) {
				console.log("Created Right");
				window.rights.refresh();
				form.clearAll();
				self.loader.hide();
				self.hide();
			},
			function(res) {
				// Failed
				self.loader.hide();
			});
		});
		
		grid.addOnCancel(function(form,event){
			form.clearAll();
			self.onCancel();
		});

		var fp = new FlowPanel();
		fp.add(cancelB);
		fp.add(saveB);

		grid.setWidget(0,0,nameL);
		grid.setWidget(0,1,nameI);
		grid.setWidget(1,0,descriptionL);
		grid.setWidget(1,1,descriptionI);
		grid.setWidget(2,1,fp);

		holder.add(header);
		holder.add(grid);
		return holder;
	},
	hide: function() {
		this.setStyle("display", "none");
	},
	show: function(what) {
		if(what === "USERS") {
			this.mainFlow.showWidget(0);
			this.setStyle("display", "block");
		} else if(what === "GROUPS") {
			this.mainFlow.showWidget(1);
			this.setStyle("display", "block");
		} else if(what === "ROLES") {
			this.mainFlow.showWidget(2);
			this.setStyle("display", "block");
		} else if(what === "RIGHTS") {
			this.mainFlow.showWidget(3);
			this.setStyle("display", "block");
		}
	},
	onSave: function() {
		var inputs = $('input', this.mainFlow.visibleWidget.getElement());

		var valid = true;
		for(var i=0; i<inputs.length; i++) {
			if(!this.validate(inputs[i])) {
				valid = false;
			}
		}

		if(valid) {
			// Do PAPI save
			console.log("Everything valid, saving");
		} else {
			console.log("Something is not right, skipping save!");
		}
	},
	onCancel: function() {
		this.hide();
	},
	render: function() {
		var self = this;
		var fp = new FlowPanel();
		this.mainFlow = new DeckPanel();
		var closeB = new CloseButton(function() {
			self.hide();
		});
		this.loader = new WidgetLoader();

		fp.setStyleName("popup-box");
		closeB.setStyleName("popup-box-close-button");

		this.mainFlow.add(this.render_user());
		this.mainFlow.add(this.render_group());
		this.mainFlow.add(this.render_role());
		this.mainFlow.add(this.render_right());

		this.mainFlow.showWidget(0);
		fp.add(closeB);
		fp.add(this.mainFlow);
		this.add(this.loader);
		this.add(fp);
	}
});

var UsersView = FlowPanel.extend({
	init: function() {
		this._super();
		this.setStyle("box-shadow", "0px 3px 12px rgba(0,0,0,0.4)");
		this.render();
	},
	setVisible: function(visible) {
		if(visible) {
			document.title = "Users and rights";
			window.users.refresh();
			window.groups.refresh();
			window.roles.refresh();
			window.rights.refresh();
		}
		this._super(visible);
	},
	render: function() {
		var tb = new TopBar();
		var tc = new TopConsole();
		var users = new Users();
		var groups = new Groups();
		var roles = new Roles();
		var rights = new Rights();
		var bucketHolder = new HorizontalPanel();
		var stopPanel = new FlowPanel();

		// Share reference pointers to objects for easy acces
		// This is maybe not best solution, but can pretty easily be changed in future to event handling etc
		window.users = users;
		window.groups = groups;
		window.roles = roles;
		window.rights = rights;
		window.bh = bucketHolder;
		window.tc = tc;

		stopPanel.setId("stop-panel");
		bucketHolder.setStyle("margin-top", "206px");

		bucketHolder.add(users);
		bucketHolder.add(groups);
		bucketHolder.add(roles);
		bucketHolder.add(rights);

		// Dropping an object unto the lower area of the gui (whoel table holding all buckets) disconnect items
		$(bucketHolder.getElement()).on('drop', function(e) {
			// Check that current drag item is actually in the ToContainer in TopConsole, compare their reference pointers
			var objects = window.tc.container.children;
			for(i=0; i<objects.length;i++) {
				if(objects[i] == window.dragSrcElement) {
					PAPI.disconnect(window.tc.currentSelectedItem.getLink("connect"), window.dragSrcElement.getLink("self"), function(res) {
						// Success
						window.tc.refresh();
					});
				}
			}
		});

		this.add(tb);
		this.add(tc);
		this.add(bucketHolder);
		this.add(stopPanel);
	}
});

var CreatorPopup = FlowPanel.extend({
	init: function() {
		// Shows creator User on mouse hover of selected items creator-datetime
		this._super();
		var self = this;
		this.isShowing = false;
		this.setId("creatorPopup");
		$(document).on('mousemove', function(e){
		    $(self.getElement()).css({
		       left:  e.pageX,
		       top:   e.pageY - 200
		    });
		});
	},
	setUser: function(user) {
		this.isShowing = true;
		var self = this;
		this.add(new UserItem(user));
		setTimeout(function() {self.clearAll();}, 1000);
	},
	clearAll: function() {
		this.clear();
		//$(document).unbind('mousemove');
		this.isShowing = false;
	}
});

$(document).ready(function() {
	var root = new RootPanel("bootstrap");
	var wrapper = new FlowPanel();
	mainFlow = new DeckPanel();
	wrapper.setStyleName("site-width main-panel");
	
	var hf = new HashFactory();
	window.hf = hf;

	var fp = new UsersView();
	var createBox = new CreateBox();
	var creatorPopup = new CreatorPopup();
	var login = new LoginView();
	window.createBox = createBox;
	window.creatorPopup = creatorPopup;

	mainFlow.add(login);
	mainFlow.add(fp);
	mainFlow.showWidget(0);

	wrapper.add(mainFlow);
	root.add(creatorPopup);
	root.add(wrapper);
	root.add(createBox);

});
