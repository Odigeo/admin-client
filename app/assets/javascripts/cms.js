var APIData = Class.extend({
	init: function(data) {
		this.data = data;
	},
	app: function() {
		return this.data.app.link[0];
	}
});

var CMSSearchBox = SearchBox.extend({
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
		var data = {};
		if(self.search == 'context' && $('#app', '#console-search-holder').val()) {
			data["app"] = $('#app', '#console-search-holder').val();
		} else if (self.search == 'name' && $('#app', '#console-search-holder').val() && $('#context', '#console-search-holder').val()) {
			data["app"] = $('#app', '#console-search-holder').val();
			data["contexts"] = $('#context', '#console-search-holder').val();
		} 
		if(data['app'] || data['context'] || self.search === 'app') {
			PAPI.getKeys(data, function(res){
				//if(console) console.log("getKeys result: ");
				//if(console) console.log(res);
				var list = [];

				if($.isArray(res)) {
					var length = res.length;
					for(var i=0; i<length; i++) {
						//Collection is a mixed list
						var tmp = res[i].text || res[i].medium;
						//Make sure we dont add duplicates (sinces keys will come from 2 sources)
						if(data['contexts']) {
							if(!list.some(function(obj){return obj === tmp.name;})) {
								list.push(tmp.name);
							}
						} else if(data['app']) {
							if(!list.some(function(obj){return obj === tmp.context;})) {
								list.push(tmp.context);
							}
						} else {
							if(!list.some(function(obj){return obj === tmp.app;})) {
								list.push(tmp.app);
							}
						}
					}
				}
				/* update list */
				self.list = list;
				self.updateList();
			});
		}
	},
	updateList: function() {
		$(this.getElement()).html(
			html.datalist({'id':'list_' + this.search},
				this.list.map(function(item) {
					return html.option({'value':item});
				})
			)
		);
	}
});

var CreateCardPanel = FlowPanel.extend({
	init: function() {
		this.choice = null;
		this._super();
		this.render();
		this.setId("flip-console");
		this.dp.showWidget(0);

		// Setup this create card depending on hash state (if we came to cms app from portal or similar)
		if(hf.getUsage()) {
			this.gotoUsage(hf.getUsage());
		}
		// Copy values from search bar
		if($('#app').val()) {
			$('input[data="app"]', this.getElement()).val($('#app').val());
		} else {
			$('input[data="app"]', this.getElement()).val("portal-client"); // Default value
		}
		$('input[data="context"]', this.getElement()).val($('#context').val());
		$('input[data="name"]', this.getElement()).val($('#name').val());
		$('input[data="locale"]', this.getElement()).val("en-GB"); // Default value
	},
	gotoUsage: function(usage) {
		if(usage === 'link') {
			this.dp.showWidget(1);
			this.choice = 'link';
		} else if(usage === 'text') {
			this.dp.showWidget(2);
			this.choice = 'text';
		} else if(usage === 'image') {
			this.dp.showWidget(3);
			this.choice = 'image';
		} else if(usage === 'markdown') {
			this.dp.showWidget(4);
			this.choice = 'markdown';
		}
	},
	onSave: function() {
		var self = this;
		var data = {};

		/* Mandatory data */
		data['app'] = $('input[data="app"]', self.dp.visibleWidget.getElement()).val();
		data['context'] = $('input[data="context"]', self.dp.visibleWidget.getElement()).val();
		data['name'] = $('input[data="name"]', self.dp.visibleWidget.getElement()).val();
		data['locale'] = $('input[data="locale"]', self.dp.visibleWidget.getElement()).val();
		data['usage'] = this.choice;

		/* Special Type of Data */
		if(this.choice == "text") {
			data['result'] = $('textarea[data="text"]', self.dp.visibleWidget.getElement()).val();
			data['mime_type'] = "text/plain";
		} else if(this.choice == "link") {
			data['result'] = '<a href="' + $('input[data="href"]', self.dp.visibleWidget.getElement()).val() + '">' + $('input[data="text"]', self.dp.visibleWidget.getElement()).val() + '</a>';
			data['mime_type'] = "text/plain";
		} else if(this.choice == "image") {
			data['file_name'] = encodeURI(self.fileArea.getFileName());
			data['bytesize'] = self.fileArea.getByteSize();
			data['content_type'] = self.fileArea.getMimeType();
			data['payload'] = self.fileArea.getResult();
			data['tags'] = $('input[data="tags"]', self.dp.visibleWidget.getElement()).val();
		} else if(this.choice == "markdown") {
			data['result'] = $('textarea[data="markdown"]', self.dp.visibleWidget.getElement()).val();
			data['mime_type'] = "text/x-markdown";
			data['markdown'] = true;
		} else {
			console.warn("ERROR: Tried to save without any choice of type");
		}

		/* Check that no values are empty */
		for(obj in data) {
			if(data[obj] == "") {
				self.showError("Error Saving because " + obj.toString() + " is empty!");
				return;
			}
		}

		/* Everything looks good. Saving! */
		self.showError("");

	    data.service = 'texts';
	    if(data.usage === 'image') {
	      data.service = 'media';
	    }

		PAPI._create(data, function(res){
			if(console) console.log("Successfully created a new post!");
			if(console) console.log(data);
			self.showSuccess("Successfully created post!!");
		}, function(error) {
			// Failed
			self.showError(error.getErrorText());
		});
	},
	onClear: function() {
		this.dp.showWidget(0);
		$(".flip-console-error-label", this.getElement()).text(" ");
		//$('input', '#flip-console').val("");
		$('textarea', this.getElement()).val("");
		this.imageFileArea.clear();
	},
	onClose: function(self) {
		this.getParent().remove(this);
	},
	showSuccess: function(text) {
		$(".flip-console-error-label", this.dp.getVisibleWidget().getElement()).removeClass("error-text").addClass("success-text").text(text);
	},
	showError: function(text) {
		console.log()
		$(".flip-console-error-label", this.dp.getVisibleWidget().getElement()).removeClass("success-text").addClass("error-text").text(text);
	},
	render_create_markdown_view: function() {
		var self = this;
		/* Mandatory fields */
		var fp2 = new FlowPanel();
		fp2.setStyle("padding", "10px");
		var inputApp = new TextBox();
		var inputContext = new TextBox();
		var inputName = new TextBox();
		var inputLang = new TextBox();
		$(inputApp.getElement()).attr("placeholder", "Application").attr("data", "app");
		$(inputContext.getElement()).attr("placeholder", "Widget").attr("data", "context");
		$(inputName.getElement()).attr("placeholder", "Name").attr("data", "name");
		$(inputLang.getElement()).attr("placeholder", "Locale").attr("data", "locale");
		fp2.add(inputApp);
		fp2.add(inputContext);
		fp2.add(inputName);
		fp2.add(inputLang);

		var fp = new FlowPanel();
		fp.setStyle("min-height", "200px");
		fp.setStyle("padding", "20px");

		var inputText = new TextArea();
		$(inputText.getElement()).attr("placeholder", "Markdown").attr('data', 'markdown');

		var saveB = new BonBonButton("Save", function(){self.onSave(self)}, "✓");
		var clearB = new BonBonButton("Cancel", function(){self.onClear(self)}, "✗");
		var buttonHolder = new FlowPanel();

		buttonHolder.setId("flip-button-holder");
		saveB.setId("flip-save-button");
		saveB.setStyleName("bbGreen bbSmall");
		clearB.setId("flip-clear-button");
		clearB.setStyleName("bbPink bbSmall");

		var errorText = new Text(" ", true);
		errorText.setStyleName("error-text flip-console-error-label");

		buttonHolder.add(errorText);
		buttonHolder.add(clearB);
		buttonHolder.add(saveB);

		fp.add(fp2);
		fp.add(inputText);
		fp.add(buttonHolder);
		return fp;
	},
	render_create_image_view: function() {
		var self = this;
		/* Mandatory fields */
		var fp2 = new FlowPanel();
		fp2.setStyle("padding", "10px");
		var inputApp = new TextBox();
		var inputContext = new TextBox();
		var inputName = new TextBox();
		var inputLang = new TextBox();
		var inputTags = new TextBox();
		$(inputApp.getElement()).attr("placeholder", "Application").attr("data", "app");
		$(inputContext.getElement()).attr("placeholder", "Widget").attr("data", "context");
		$(inputName.getElement()).attr("placeholder", "Name").attr("data", "name");
		$(inputLang.getElement()).attr("placeholder", "Locale").attr("data", "locale");
		$(inputTags.getElement()).attr("placeholder", "Image tags").attr("data", "tags");
		fp2.add(inputApp);
		fp2.add(inputContext);
		fp2.add(inputName);
		fp2.add(inputLang);

		var fp = new FlowPanel();
		fp.setStyle("min-height", "200px");
		fp.setStyle("padding", "20px");

		this.fileArea = new FileWidget();
		this.fileArea.setStyleName("fileWidget fileWidgetEmpty automargin");
		this.imageFileArea = this.fileArea;

		this.fileArea.addDropListener(function(self, e) {
			e.stopPropagation();
			e.preventDefault();

			var files = e.dataTransfer.files;
			for (var i = 0, f; f = files[i]; i++) {

				
				// Only process image files.
				if (!f.type.match('image.*')) {
					continue;
				}

				if(console) console.log("Reading file:");
				if(console) console.log(f);

				var reader = new FileReader();

				reader.onload = (function(file) {
					return function(e) {
						//src in WImage should have value: "data:image/jpg;base64,DATA"
						self.setMimeType(file.type);
						self.setResult(btoa(e.target.result));
						self.setFileName(file.name);
						self.setByteSize(file.size);
						self.setImgSrc("data:"+file.type +";base64," + btoa(e.target.result));
					};
				})(f);
				reader.readAsBinaryString(f);
			}
			  
		});

		var saveB = new BonBonButton("Save", function(){self.onSave()}, "✓");
		var clearB = new BonBonButton("Cancel", function(){self.onClear()}, "✗");
		var buttonHolder = new FlowPanel();

		buttonHolder.setId("flip-button-holder");
		saveB.setId("flip-save-button");
		saveB.setStyleName("bbGreen bbSmall");
		clearB.setId("flip-clear-button");
		clearB.setStyleName("bbPink bbSmall");

		var errorText = new Text(" ", true);
		errorText.setStyleName("error-text flip-console-error-label");

		buttonHolder.add(errorText);
		buttonHolder.add(clearB);
		buttonHolder.add(saveB);

		fp.add(fp2);
		fp.add(inputTags);
		fp.add(this.fileArea);
		fp.add(buttonHolder);
		return fp;
	},
	render_create_link_view: function() {
		var self = this;
		/* Mandatory fields */
		var fp2 = new FlowPanel();
		fp2.setStyle("padding", "10px");
		var inputApp = new TextBox();
		var inputContext = new TextBox();
		var inputName = new TextBox();
		var inputLang = new TextBox();
		$(inputApp.getElement()).attr("placeholder", "Application").attr("data", "app");
		$(inputContext.getElement()).attr("placeholder", "Widget").attr("data", "context");
		$(inputName.getElement()).attr("placeholder", "Name").attr("data", "name");
		$(inputLang.getElement()).attr("placeholder", "Locale").attr("data", "locale");
		fp2.add(inputApp);
		fp2.add(inputContext);
		fp2.add(inputName);
		fp2.add(inputLang);

		var fp = new FlowPanel();
		fp.setStyle("min-height", "200px");
		fp.setStyle("padding", "20px");

		var inputHref = new TextBox();
		var inputText = new TextBox();

		$(inputHref.getElement()).attr("placeholder", "Link").attr('data', 'href');
		$(inputText.getElement()).attr("placeholder", "Text").attr('data', 'text');

		var saveB = new BonBonButton("Save", function(){self.onSave()}, "✓");
		var clearB = new BonBonButton("Cancel", function(){self.onClear()}, "✗");
		var buttonHolder = new FlowPanel();

		buttonHolder.setId("flip-button-holder");
		saveB.setId("flip-save-button");
		saveB.setStyleName("bbGreen bbSmall");
		clearB.setId("flip-clear-button");
		clearB.setStyleName("bbPink bbSmall");

		var errorText = new Text(" ", true);
		errorText.setStyleName("error-text flip-console-error-label");

		buttonHolder.add(errorText);
		buttonHolder.add(clearB);
		buttonHolder.add(saveB);

		fp.add(fp2);
		fp.add(inputText);
		fp.add(inputHref);
		fp.add(buttonHolder);
		return fp;
	},
	render_create_text_view: function() {
		var self = this;
		/* Mandatory fields */
		var fp2 = new FlowPanel();
		fp2.setStyle("padding", "10px");
		var inputApp = new TextBox();
		var inputContext = new TextBox();
		var inputName = new TextBox();
		var inputLang = new TextBox();
		$(inputApp.getElement()).attr("placeholder", "Application").attr("data", "app");
		$(inputContext.getElement()).attr("placeholder", "Widget").attr("data", "context");
		$(inputName.getElement()).attr("placeholder", "Name").attr("data", "name");
		$(inputLang.getElement()).attr("placeholder", "Locale").attr("data", "locale");
		fp2.add(inputApp);
		fp2.add(inputContext);
		fp2.add(inputName);
		fp2.add(inputLang);

		var fp = new FlowPanel();
		fp.setStyle("min-height", "200px");
		fp.setStyle("padding", "20px");

		var inputText = new TextArea();
		$(inputText.getElement()).attr("placeholder", "Text").attr('data', 'text');

		var saveB = new BonBonButton("Save", function(){self.onSave()}, "✓");
		var clearB = new BonBonButton("Cancel", function(){self.onClear()}, "✗");
		var buttonHolder = new FlowPanel();

		buttonHolder.setId("flip-button-holder");
		saveB.setId("flip-save-button");
		saveB.setStyleName("bbGreen bbSmall");
		clearB.setId("flip-clear-button");
		clearB.setStyleName("bbPink bbSmall");

		var errorText = new Text(" ", true);
		errorText.setStyleName("error-text flip-console-error-label");

		buttonHolder.add(errorText);
		buttonHolder.add(clearB);
		buttonHolder.add(saveB);

		fp.add(fp2);
		fp.add(inputText);
		fp.add(buttonHolder);
		return fp;
	},
	render_type_view: function() {
		var self = this;
		var fp = new FlowPanel();
		fp.setStyle("min-height", "200px");
		fp.setStyle("padding", "20px");
		var linkB = new GradientButton("Link", function(){self.choice = 'link'; self.dp.fadeToWidget(1);});
		var textB = new GradientButton("Text", function(){self.choice = 'text'; self.dp.fadeToWidget(2);});
		var imageB = new GradientButton("Image", function(){self.choice = 'image'; self.dp.fadeToWidget(3);});
		var markdownB = new GradientButton("Markdown", function(){self.choice = 'markdown'; self.dp.fadeToWidget(4);});

		var createL = new Text("Create item");

		fp.add(createL);
		fp.add(linkB);
		fp.add(textB);
		fp.add(imageB);
		fp.add(markdownB);
		return fp;
	},
	render: function() {
		var self = this;

		this.dp = new DeckPanel();

		var closeHolder = new FlowPanel();
		var closeB = new GradientButton("X", function(){self.onClose(self);});

		closeB.setStyleName("closeButton right");
		closeHolder.setStyleName("close-holder");

		this.dp.setWidth('100%');

		closeHolder.add(closeB);

		this.dp.add(this.render_type_view());
		this.dp.add(this.render_create_link_view());
		this.dp.add(this.render_create_text_view());
		this.dp.add(this.render_create_image_view());
		this.dp.add(this.render_create_markdown_view());

		this.add(closeHolder);
		this.add(this.dp);
	}
});

var CMSObject = FlowPanel.extend({
	init: function(locale, obj) {
		this._super();
		this.data = obj;
		this.locale = locale;
		this.setStyleName("cms-object");
		this.render();
	},
	getLocale: function() {
		return this.locale_text.getText();
	},
	getResultString: function() {
		if(this.data.usage === "text") {
			return $('textarea', this.getElement()).val();
		} else if(this.data.usage === "link") {
			var text = $('input[data=text]', this.getElement()).val();
			var href = $('input[data=href]', this.getElement()).val();

			if(text && href) {
				return '<a href="' + href + '">' + text + '</a>';
			} else {
				return null;
			}
			
		} else if(this.data.usage.search('image') > -1) {
			return this.fileArea.getResult();
		} else if(this.data.usage === "markdown") {
			return $('textarea', this.getElement()).val();
		}
	},
	getTags: function() {
		if(this.tagsI) return $(this.tagsI.getElement()).val();
	},
	getFileArea: function() {
		return this.fileArea;
	},
	setNoText: function() {
		this.statusL.setText("");
	},
	setSuccess: function() {
		this.statusL.setText("Saved!");
		$(this.statusL.getElement()).removeClass("error-text").addClass("success-text");
	},
	setError: function(text) {
		this.statusL.setText(text);
		$(this.statusL.getElement()).removeClass("success-text").addClass("error-text");
	},
	setDeleted: function() {
		this.statusL.setText("Deleted!");
		$(this.statusL.getElement()).removeClass("error-text").addClass("success-text");
	},
	render_markdown: function() {
		var text = new TextArea();
		text.setStyleName("cms-object-textarea");
		if(this.data.result) {
			text.setText(this.data.result);
		}
		this.add(text);
	},
	render_text: function() {
		var text = new TextArea();
		text.setStyleName("cms-object-textarea");
		if(this.data.result) {
			text.setText(this.data.result);
		}
		this.add(text);
	},
	render_link: function() {
		var textI = new TextBox();
		var hrefI = new TextBox();

		$(textI.getElement()).attr('placeholder', 'Text').attr('data', 'text');
		$(hrefI.getElement()).attr('placeholder', 'Link').attr('data', 'href');

		if(this.data.result) {
			var result = this.data.result;
			var href = "undefined";
			var text = "undefined";
			// Lousy .match on just a left bracket, but for now only check to try validate correct html format =P
			if(result && result.match(/</)) {
				href = result.split('<a href="')[1].split('">')[0];
				text = result.split('">')[1].split('</a>')[0];
			} else {
				if(console) console.warn("Couldnt render link because not valid result data!!");
				if(console) console.log(this.data);
			}
			textI.setText(text);
			hrefI.setText(href);
		}

		this.add(textI);
		this.add(hrefI);
	},
	render_image: function() {

		this.fileArea = new FileWidget();
		this.tagsI = new TextBox();
		this.selflinkI = new TextBox();
		$(this.tagsI.getElement()).attr('placeholder', 'Image tags').attr('data', 'tags');
		this.fileArea.setStyleName("fileWidget fileWidgetEmpty automargin");

		this.fileArea.addDropListener(function(self, e) {
			e.stopPropagation();
			e.preventDefault();

			var files = e.dataTransfer.files;
			for (var i = 0, f; f = files[i]; i++) {

				// Only process image files.
				if (!f.type.match('image.*')) {
					continue;
				}
				if(console) console.log("Reading file:");
				if(console) console.log(f);

				var reader = new FileReader();

				reader.onload = (function(file) {
					return function(e) {
						//src in WImage should have value: "data:image/jpg;base64,DATA"
						self.setMimeType(file.type);
						self.setResult(btoa(e.target.result));
						self.setFileName(file.name);
						self.setByteSize(file.size);
						self.setImgSrc("data:"+file.type +";base64," + btoa(e.target.result));
					};
				})(f);
				reader.readAsBinaryString(f);
			}
			  
		});

		if(this.data._links && this.data._links.url) {
			// Show current image for locale
			this.fileArea.setImgSrc(this.data._links.url.href);
			this.fileArea.setMimeType(this.data.content_type);
			this.fileArea.setFileName(this.data.file_name);
			this.fileArea.setByteSize(this.data.bytesize);
			this.tagsI.setText(this.data.tags);
			this.selflinkI.setText(this.data._links.url.href);
		} else {
			//No locale did exist
		}
		this.add(this.fileArea);
		this.add(this.tagsI);
		this.add(this.selflinkI);
	},
	render: function() {
		this.locale_text = new TextBox();
		this.statusL = new Text("");

		this.statusL.setStyleName("cms-object-status error-text");
		this.locale_text.setStyleName("cms-object-locale");

		this.locale_text.setText(this.locale);

		this.add(this.locale_text);
		if(this.data) {
			switch(this.data.usage) {
				case "text": this.render_text(); break;
				case "link": this.render_link(); break;
				case "markdown": this.render_markdown(); break;
				default: this.render_image(); break;
			}
		}
		this.add(this.statusL);
	}
});

var CMSCardPanel = FlowPanel.extend({
	init: function(data) {
		this._super();
		this.setStyleName("cms-card-panel");
		this.data = data;
		// These get populated in render when we loop thru the data
		this.app = "";
		this.context = "";
		this.name = "";
		this.usage = "";
		this.CMSObjects = [];
		this.render();
	},
	onSave: function(cmsobj) {
		var self = this;
		// Check if cmsobject got data set, which means it is an old previous data object from API, otherwise it is a new container opened by user so it is a brand new data for a locale
		if(cmsobj.data._links) {
			// Data already exist, do a save

			var data = cmsobj.data;

			if(cmsobj.getFileArea()) {
				//Image saved
				var fileArea = cmsobj.getFileArea();

				data.tags = cmsobj.getTags();
				data.file_name = encodeURI(fileArea.getFileName());
				data.bytesize = fileArea.getByteSize();
				data.content_type = fileArea.getMimeType();
				data.payload = fileArea.getResult();
				data.usage = 'image';
				data.locale = cmsobj.locale;
			} else if(cmsobj.data.usage === "markdown") {
				data.markdown = true;
				data.locale = cmsobj.locale;
				data.result = cmsobj.getResultString();
			} else {
				data.locale = cmsobj.locale;
				data.result = cmsobj.getResultString();
			}
			
			cmsobj.setNoText();
			PAPI._save(data._links["self"].href, data, function(res) {
				if (console) console.log("Successfully saved for locale: " + cmsobj.locale);
				cmsobj.setSuccess();
			}, function(error) {
				if (console) console.log("Error saving for locale: " + cmsobj.locale);
				if (console) console.log(error.getErrorText());
				cmsobj.setError(error.getErrorText());
			});
		} else  {
			// Create a new post for this locale since it got a value but didnt exist previously
			// Copy same values like app, context, name
			var data = {};
			data.app = this.app;
			data.context = this.context;
			data.name = this.name;
			data.usage = this.usage;
			// Set service for PAPI to know what resource we create
			if(this.usage === "") {
				// TODO Fix so its === "image", but right now media service doesnt save usage attribute =(
				data.service = "media";
			} else {
				data.service = "texts";
			}

			if(data.usage === "") {
				//Image saved
				var fileArea = cmsobj.getFileArea();

				data.tags = cmsobj.getTags();
				data.file_name = encodeURI(fileArea.getFileName());
				data.bytesize = fileArea.getByteSize();
				data.content_type = fileArea.getMimeType();
				data.payload = fileArea.getResult();
				data.mimetype = fileArea.getMimeType();
				data.locale = cmsobj.getLocale();
			} else if(data.usage === "markdown") {
				data.markdown = true;
				data.locale = cmsobj.getLocale();
				data.result = cmsobj.getResultString();
				data.mime_type = "text/x-markdown";
			} else {
				//Set new locale and result we wanna create
				data.locale = cmsobj.getLocale();
				data.result = cmsobj.getResultString();
				data.mime_type = "text/plain";
			}


			cmsobj.setNoText();
			PAPI._create(data, function(res) {
				if (console) console.log("Successfully create new locale post!!");
				cmsobj.setSuccess();
				//Should update self.translations with the created locale and its data so a Save will occur on next onSave instead of Create
				//Right now the cms-service doestn return the created object, hence data below is a cop of another locale so the self.link is wrong
				//self.translations[cmsobj.locale] = data;
			}, function(error) {
				if (console) console.log("Error creating for locale: " + cmsobj.locale);
				if (console) console.log(error.getErrorText());
				cmsobj.setError(error.getErrorText());
			}); 
		}
	},
	onClose: function(self) {
		this.getParent().remove(this);
	},
	onClear: function(self) {

	},
	onDelete: function(cmsobj) {
		var self = this;
		if(cmsobj.data) {
			
			PAPI._delete(cmsobj.data._links.self.href, function(res) {
				if (console) console.log("Successfully DELETED locale!!");
				cmsobj.setDeleted();
				self.deleteCounter -= 1;

				if(self.deleteCounter <= 0) {
					self.setStyleName("cms-card-animation");
				}
			}, function(error) {
				if (console) console.log("Failed to DELETE");
				if (console) console.log(error.getErrorText());
				cmsobj.setError(error.getErrorText());

			});
		} else {
			self.deleteCounter -= 1;
		}
	},
	onAdd: function() {
		var data = {};
		data.app = this.app;
		data.context = this.context;
		data.name = this.name;
		data.usage = this.usage;
		var cmsobj = new CMSObject("enter locale", data);
		this.CMSObjects.push(cmsobj);
		this.holder.add(cmsobj);
	},
	render: function() {
		var self = this;
		this.holder = new FlowPanel();
		var closeHolder = new FlowPanel();
		//var closeText = new Text("Close");
		var closeB = new GradientButton("X", function() {self.setStyleName("cms-card-animation");});
		var deleteB = new BonBonButton("Delete", function() {
			var confirm = window.confirm("This will permanently delete object!");
			if(confirm) {
				self.deleteCounter = self.CMSObjects.length; // For animating when all asynchronous calls are finished
				for (var i = 0; i < self.CMSObjects.length; i++) {
					self.onDelete(self.CMSObjects[i]);
				}
			}
		}, "✗");
		var addB = new BonBonButton("Add locale", function() {
			self.onAdd();
		}, "+");
		var saveB = new BonBonButton("Save", function(){
			for (var i = 0; i < self.CMSObjects.length; i++) {
				self.onSave(self.CMSObjects[i], self);
			}
		}, "✓");
		var cancelB = new BonBonButton("Cancel", function() {self.setStyleName("cms-card-animation");}, "∅");
		var buttonPanel = new FlowPanel();
		// Create CMSObejects and store the pointers in array holder
		for(var key in this.data) {
			this.CMSObjects.push(new CMSObject(key, this.data[key]));
		}
		// Add CMSObjects to DOM tree
		for (var i = 0; i < this.CMSObjects.length; i++) {
			this.holder.add(this.CMSObjects[i]);
		}
		// copy first CMS objects common attribtues for this Card, so it can be used automatically when we Add more locales for the same Card
		this.app = this.CMSObjects[0].data.app;
		this.context = this.CMSObjects[0].data.context;
		this.name = this.CMSObjects[0].data.name;
		this.usage = this.CMSObjects[0].data.usage;
		var header = new Text(" " + this.app + "  -  " +this.context + "  -  " + this.name + " ");

		$(deleteB.getElement()).attr('task', 'delete');

		closeB.setStyleName("closeButton right");
		closeHolder.setStyleName("close-holder");
		saveB.setStyleName("bbGreen bbSmall relief-shadow");
		cancelB.setStyleName("bbOrange bbSmall relief-shadow");
		deleteB.setStyleName("bbPink bbSmall relief-shadow");
		addB.setStyleName("bbBlue bbSmall relief-shadow");
		header.setStyleName("padding10 large relief-shadow");
		buttonPanel.setStyleName("cms-card-panel-button-panel");
		this.holder.setStyleName("cms-card-holder");

		

		buttonPanel.add(deleteB);
		buttonPanel.add(cancelB);
		buttonPanel.add(saveB);
		buttonPanel.add(addB);
		
		closeHolder.add(closeB);

		this.add(closeHolder);
		this.add(header);
		this.add(this.holder);
		this.add(buttonPanel);

		$(this.getElement()).on("webkitTransitionEnd", function(e){
			if($(e.target).hasClass('cms-card-panel')) {
				self.onClose();
			}
		});
	}
});

var InstrumentPanel = FlowPanel.extend({
	init: function() {
		this._super();
		this.setStyleName("align-center");
		this.loader = new WidgetLoader();
		this.data = {};
		this.render();
	},
	onSearch: function() {
		var self = this;
		var data = {};
		var inputs = $('input', '#console-search-holder');
		for (var i = 0; i < inputs.length; i++) {
			if(inputs[i].value != "") {
				data[inputs[i].id] = inputs[i].value;
			}
		};

		//Verify we got enough inputs
		this.loader.show();
		//Do search
		PAPI.search(data, function(data) {
			window.uiview.createCards(data);
			self.loader.hide();
		},
		function(error) {
			// Fail
			if (console) console.log(error.getErrorText());
			self.loader.hide();
		});
	},
	render: function() {
		var self = this;
		var holder = new HorizontalPanel();
		var createB = new BonBonButton("Create item",  function(){window.uiview.addCreateCard()}, "✎");
		var selectL = new Text("Select");

		selectL.setStyleName("relief-shadow console-label");
		createB.setStyleName("bbSmall");
		createB.setId("console-createB");
		holder.setStyleName("automargin");
		holder.setStyle("margin-top", "24px");

		var searchHolder = new FocusPanel();
		var appI = new CMSSearchBox("app");
		var contextI = new CMSSearchBox("context");
		var nameI = new CMSSearchBox("name");
		var valueI = new SearchBox();

		searchHolder.setId('console-search-holder');

		searchHolder.addKeyboardListener(function(obj, e) {
			var target = e.target;
			if(e.keyCode == 13 && e.type === "keypress") {
				//Enter key pressed
				self.onSearch();
			}
		});
		
		appI.setId("app");
		contextI.setId("context");
		nameI.setId("name");
		valueI.setId("result");

		appI.setAttr('placeholder', 'Application');
		contextI.setAttr('placeholder', 'Widget');
		nameI.setAttr('placeholder', 'Name');
		valueI.setAttr('placeholder', 'Free text search');

		searchHolder.add(appI);
		searchHolder.add(contextI);
		searchHolder.add(nameI);
		searchHolder.add(createB);
		searchHolder.add(valueI);

		holder.add(selectL);
		holder.add(searchHolder);

		this.add(this.loader);
		this.add(holder);
	}
});

var UIView = FlowPanel.extend({
	init: function() {
		this._super();
		this.setStyleName("main-panel site-width");
		this.setId("ui-panel");
		this.render();
	},
	setVisible: function(bool) {
		if(bool) {
		  document.title = "CMS";

		  // Trigger search if visible since LoginView might have been shown when entering with CMS data
			var app = $('input[id="app"]', '#console-search-holder').val();
			var context = $('input[id="context"]', '#console-search-holder').val();

			if(app && context) {
				uiview.topConsole.onSearch();
			}
		} else {
		  
		}
		this._super(bool);
	},
	createCards: function (data) {
		this.clear();
		for(var obj in data) {
			this.cardHolder.add(new CMSCardPanel(data[obj]));
		}
	},
	addCreateCard: function() {
		this.cardHolder.addFirst(new CreateCardPanel());
	},
	createDummies: function () {
		for (var i = 0; i <= 1000; i++) {
			this.createCard();
		};
	},
	clear: function() {
		this.cardHolder.clear();
	},
	render: function() {
		this.topBar = new TopBar();
		this.topConsole = new InstrumentPanel();
		this.cardHolder = new FlowPanel();

		this.topConsole.setId("topConsole");

		this.add(this.topBar);
		this.add(this.topConsole);
		this.add(this.cardHolder);
	}
});

var BlackBox = Widget.extend({
	init: function() {
		this._super();
		this.setElement(DOM.createDiv());
		this.setId("blackBox");
		this.setStyleName("show");
		this.hide();
		this.hidden = true;
	},
	toggle: function() {
		if(this.hidden === true) {
			this.show();
		} else {
			this.hide();
		}
	},
	show: function() {
		this.hidden = false;
		$(this.getElement()).removeClass("hide").addClass("show");
	},
	hide: function() {
		this.hidden = true;
		$(this.getElement()).removeClass("show").addClass("hide");
	}
});


////////////////////////////////////////////////////

$(document).ready(function() {
	var root = new RootPanel("bootstrap");
	var wrapper = new FlowPanel();
	mainFlow = new DeckPanel();
	var login = new LoginView();
	var ui = new UIView();
	var hf = new HashFactory();
	var bb = new BlackBox();
	window.hf = hf;
	window.uiview = ui;
	window.bb = bb;

	wrapper.setStyleName("d10");

	mainFlow.add(login);
	mainFlow.add(ui);
	mainFlow.showWidget(0);

	wrapper.add(mainFlow);
	root.add(wrapper);
	root.add(bb);

	$('body').on('dragover drop', function(e){
		// Prevents that browser takes over and shows local file
	    e.preventDefault();
	});

	//TEST
	//mainFlow.showWidget(1);


	/* Special App functionality */
	var hashFunc = function() {
		hf.readHash();
		//CMS object from another client
		//Search it up for editing
		//Array: ["app", "context", "name"];
		$('input[id="app"]', '#console-search-holder').val(hf.getApp());
		$('input[id="context"]', '#console-search-holder').val(hf.getContext());
		$('input[id="name"]', '#console-search-holder').val(hf.getName());
		uiview.topConsole.onSearch();

		//Populate fields from search fields in case of Create
		var app = $('input[id="app"]', '#console-search-holder').val();
		var context = $('input[id="context"]', '#console-search-holder').val();
		var name = $('input[id="name"]', '#console-search-holder').val();

		$('input[data="app"]').val(app);
		$('input[data="context"]').val(context);
		$('input[data="name"]').val(name);
		$('input[data="locale"]').val(hf.getLocale());
	};

	$(window).bind('hashchange', function() {
		// Takes care of changes in hash state during App usage 
		hashFunc();
	});
	if(window.location.hash != "") {
		// Takes care of initial load and initialisation in hash state
		hashFunc();
	}	
});
