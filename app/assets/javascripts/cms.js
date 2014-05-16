var APIData = Class.extend({
	init: function(data) {
		this.data = data;
	},
	app: function() {
		return this.data.app.link[0];
	}
});

var SearchList = Class.extend({
	init: function(searchdata) {
		this.data = searchdata;
	},
	getList: function() {
		return this.data;
	}
});

var TranslationObj = Class.extend({
	init: function(data) {
		for(var tmp in data) {
			this[tmp] = data[tmp];
			if(data[tmp].content_type) {
				this["usagedata"] = data[tmp].content_type;
			} else {
				this["usagedata"] = data[tmp].usage;
			}
		}

		//data example for texts (not media)
		/* {sv-SE: {
					app: "exampleappname"
					context: "searchWidget"
					created_at: "2012-11-06T11:13:58Z"
          _links: { self: "http://example.com"}
					locale: "sv-SE"
					lock_version: 0
					mime_type: "text/plain"
					name: "headerMain"
					result: "test "
					updated_at: "2012-11-06T11:13:58Z"
					usage: "text"
					},
			no-NO: {
					app: "exampleappname"
					context: "searchWidget"
					created_at: "2012-11-06T11:13:58Z"
          _links: { self: "http://example.com"}
					locale: "no-NO"
					lock_version: 0
					mime_type: "text/plain"
					name: "headerMain"
					result: "test "
					updated_at: "2012-11-06T11:13:58Z"
					usage: "text"
					}
			}
		*/
	},
	getSaveTemplate: function() {
		return this["sv-SE"] || this["no-NO"] || this["da-DK"] || this["en-GB"];
	},
	usage: function() {
		return this["usagedata"];
	},
	getConName: function() {
		var tmpData = this["sv-SE"] || this["no-NO"] || this["da-DK"] || this["en-GB"];
		if(tmpData) {
			return tmpData.context + " " + tmpData.name;
		} else {
			return "";
		}
	},
  getHyperlink: function(rel, locale) {
		if(!this[locale]) return undefined;
		return this[locale]._links[rel];
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

var FlipConsole = FlowPanel.extend({
	init: function() {
		this.choice = null;
		this._super();
		this.render();
		this.setId("flip-console");
		this.dp.showWidget(0);
	},
	toggle: function() {

		if(hf.getUsage()) {
			this.gotoUsage(hf.getUsage());
		}
		window.bb.toggle();
		//this.reset();
		$(this.getElement()).slideToggle(200);
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
	onSave: function(self) {
		var data = {};
			/*
			'app' : 'exampleappname',
			'context' : 'searchWidget' + i,
			'name' : 'headerMain',
			'locale' : 'en-GB',
			'mime_type' : 'text/plain',
			'result' : "test " + i
			*/

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
		});
	},
	onClear: function(self) {
		self.reset();
	},
	onClose: function(self) {
		self.toggle();
	},
	reset: function() {
		this.dp.showWidget(0);
		$(".flip-console-error-label", '#flip-console').text(" ");
		$('input', '#flip-console').val("");
		$('textarea', '#flip-console').val("");
		this.imageFileArea.clear();
	},
	showSuccess: function(text) {
		$(".flip-console-error-label", this.dp.getWidget(this.dp.getVisibleWidget()).getElement()).removeClass("error-text").addClass("success-text").text(text);
	},
	showError: function(text) {
		$(".flip-console-error-label", this.dp.getWidget(this.dp.getVisibleWidget()).getElement()).removeClass("success-text").addClass("error-text").text(text);
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

		var errorLabel = new Label(" ", true);
		errorLabel.setStyleName("error-text flip-console-error-label");

		buttonHolder.add(errorLabel);
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

		var saveB = new BonBonButton("Save", function(){self.onSave(self)}, "✓");
		var clearB = new BonBonButton("Cancel", function(){self.onClear(self)}, "✗");
		var buttonHolder = new FlowPanel();

		buttonHolder.setId("flip-button-holder");
		saveB.setId("flip-save-button");
		saveB.setStyleName("bbGreen bbSmall");
		clearB.setId("flip-clear-button");
		clearB.setStyleName("bbPink bbSmall");

		var errorLabel = new Label(" ", true);
		errorLabel.setStyleName("error-text flip-console-error-label");

		buttonHolder.add(errorLabel);
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

		var saveB = new BonBonButton("Save", function(){self.onSave(self)}, "✓");
		var clearB = new BonBonButton("Cancel", function(){self.onClear(self)}, "✗");
		var buttonHolder = new FlowPanel();

		buttonHolder.setId("flip-button-holder");
		saveB.setId("flip-save-button");
		saveB.setStyleName("bbGreen bbSmall");
		clearB.setId("flip-clear-button");
		clearB.setStyleName("bbPink bbSmall");

		var errorLabel = new Label(" ", true);
		errorLabel.setStyleName("error-text flip-console-error-label");

		buttonHolder.add(errorLabel);
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

		var saveB = new BonBonButton("Save", function(){self.onSave(self)}, "✓");
		var clearB = new BonBonButton("Cancel", function(){self.onClear(self)}, "✗");
		var buttonHolder = new FlowPanel();

		buttonHolder.setId("flip-button-holder");
		saveB.setId("flip-save-button");
		saveB.setStyleName("bbGreen bbSmall");
		clearB.setId("flip-clear-button");
		clearB.setStyleName("bbPink bbSmall");

		var errorLabel = new Label(" ", true);
		errorLabel.setStyleName("error-text flip-console-error-label");

		buttonHolder.add(errorLabel);
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

		var createL = new Label("Create item");

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
	getResultString: function() {
		if(this.data.usage() === "text") {
			return $('textarea', this.getElement()).val();
		} else if(this.data.usage() === "link") {
			var text = $('input[data=text]', this.getElement()).val();
			var href = $('input[data=href]', this.getElement()).val();

			if(text && href) {
				return '<a href="' + href + '">' + text + '</a>';
			} else {
				return null;
			}
			
		} else if(this.data.usage().search('image') > -1) {
			return this.fileArea.getResult();
		} else if(this.data.usage() === "markdown") {
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
	setError: function() {
		this.statusL.setText("Failed!");
		$(this.statusL.getElement()).removeClass("success-text").addClass("error-text");
	},
	setDeleted: function() {
		this.statusL.setText("Deleted!");
		$(this.statusL.getElement()).removeClass("error-text").addClass("success-text");
	},
	render_markdown: function() {
		var text = new TextArea();
		text.setStyleName("cms-object-textarea");
		if(this.data[this.locale]) {
			text.setText(this.data[this.locale].result);
		}
		this.add(text);
	},
	render_text: function() {
		var text = new TextArea();
		text.setStyleName("cms-object-textarea");
		if(this.data[this.locale]) {
			text.setText(this.data[this.locale].result);
		}
		this.add(text);
	},
	render_link: function() {
		var textI = new TextBox();
		var hrefI = new TextBox();

		$(textI.getElement()).attr('placeholder', 'Text').attr('data', 'text');
		$(hrefI.getElement()).attr('placeholder', 'Link').attr('data', 'href');

		if(this.data[this.locale]) {
			var result = this.data[this.locale].result;
			var href = "undefined";
			var text = "undefined";
			// Lousy .match on just a left bracket, but for now only check to try validate correct html format =P
			if(result && result.match(/</)) {
				href = result.split('<a href="')[1].split('">')[0];
				text = result.split('">')[1].split('</a>')[0];
			} else {
				if(console) console.log("Couldnt render link because not valid result data!!");
				if(console) console.log(this.data[this.locale]);
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

		if(this.data[this.locale] && this.data.getHyperlink("url", this.locale)) {
			// Show current image for locale
			this.fileArea.setImgSrc(this.data[this.locale]._links.url.href);
			this.fileArea.setMimeType(this.data[this.locale].content_type);
			this.fileArea.setFileName(this.data[this.locale].file_name);
			this.fileArea.setByteSize(this.data[this.locale].bytesize);
			this.tagsI.setText(this.data[this.locale].tags);
		} else {
			//No locale did exist
		}
		this.add(this.fileArea);
		this.add(this.tagsI);
	},
	render: function() {
		var nameLabel = new Label(this.locale);
		this.statusL = new Label();

		this.statusL.setStyleName("cms-object-status error-text");
		nameLabel.setStyleName("padding10 relief-shadow");
		this.add(nameLabel);

		if(this.data) {
			switch(this.data.usage()) {
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
		this.translations = new TranslationObj(data);
		this.CMSObjects = [];
		this.render();
	},
	onSave: function(cmsobj, self) {
		if(self.translations[cmsobj.locale]) {
			// Locale post already exist, do a save

			var data = self.translations[cmsobj.locale];

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
			} else if(self.translations.usage() === "markdown") {
				data.markdown = true;
				data.locale = cmsobj.locale;
				data.result = cmsobj.getResultString();
			} else {
				data.locale = cmsobj.locale;
				data.result = cmsobj.getResultString();
			}
			
			cmsobj.setNoText();
			PAPI._save(self.translations[cmsobj.locale].links[0].href, data, function(res) {
				if (console) console.log("Successfully saved for locale: " + cmsobj.locale);
				cmsobj.setSuccess();
			}, function(res) {
				if (console) console.log("Error saving for locale: " + cmsobj.locale);
				cmsobj.setError();
			});
		} else if (cmsobj.getResultString()) {
			// Create a new post for this locale since it got a value but didnt exist previously
			//Take any current translation post
			var data = self.translations.getSaveTemplate();

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
			} else if(self.translations.usage() === "markdown") {
				data.markdown = true;
				data.locale = cmsobj.locale;
				data.result = cmsobj.getResultString();
			} else {
				//Set new locale and result we wanna create
				data.locale = cmsobj.locale;
				data.result = cmsobj.getResultString();
			}

			cmsobj.setNoText();
			PAPI._create(data, function(res) {
				if (console) console.log("Successfully create new locale post!!");
				cmsobj.setSuccess();
				//Should update self.translations with the created locale and its data so a Save will occur on next onSave instead of Create
				//Right now the cms-service doestn return the created object, hence data below is a cop of another locale so the self.link is wrong
				//self.translations[cmsobj.locale] = data;
			}, function(res) {
				if (console) console.log("Error saving for locale: " + cmsobj.locale);
				cmsobj.setError();
			}); 
		}
	},
	onClose: function(self) {
		this.getParent().remove(this);
	},
	onClear: function(self) {

	},
	onDelete: function(cmsobj, self) {
		if(cmsobj.data[cmsobj.locale]) {
			
			PAPI._delete(self.translations.getHyperlink("self", cmsobj.locale).href, function(res) {
				if (console) console.log("Successfully DELETED locale!!");
				cmsobj.setDeleted();
				self.deleteCounter += 1;

				if(self.deleteCounter > 3) {
					self.setStyleName("cms-card-animation");
				}
			}, function(res) {
				if (console) console.log("Failed to DELETE");
				cmsobj.setError();

			});
		} else {
			self.deleteCounter += 1;
		}

		// Since there are 1 or more asynchronous calls that counts, this is just a catch up in rare case
		// that the asynchronous calls would be faster than not doing a call (i.e. should not be possible, but still)
		if(self.deleteCounter > 3) {
			self.setStyleName("cms-card-animation");
		}
	},
	render: function() {
		var self = this;
		var header = new Label(this.translations.getConName());
		var holder = new HorizontalPanel();
		var closeHolder = new FlowPanel();
		//var closeLabel = new Label("Close");
		var closeB = new GradientButton("X", function(){self.setStyleName("cms-card-animation");});
		var deleteB = new BonBonButton("Delete", function(){
			var confirm = window.confirm("This will permanently delete object!");
			if(confirm) {
				self.deleteCounter = 0;
				for (var i = 0; i < self.CMSObjects.length; i++) {
					self.onDelete(self.CMSObjects[i], self);
				}
			}
		}, "✗");
		$(deleteB.getElement()).attr('task', 'delete');

		closeB.setStyleName("closeButton right");
		//closeLabel.setStyleName("close-label right");
		closeHolder.setStyleName("close-holder");
		header.setStyleName("padding10 large strong relief-shadow");
		closeHolder.add(closeB);
		//closeHolder.add(closeLabel);
		this.add(closeHolder);
		this.add(header);

		this.CMSObjects.push(new CMSObject("en-GB", this.translations));
		this.CMSObjects.push(new CMSObject("sv-SE", this.translations));
		this.CMSObjects.push(new CMSObject("no-NO", this.translations));
		this.CMSObjects.push(new CMSObject("da-DK", this.translations));

		holder.add(this.CMSObjects[0]);
		holder.add(this.CMSObjects[1]);
		holder.add(this.CMSObjects[2]);
		holder.add(this.CMSObjects[3]);
		this.add(holder);

		var saveB = new BonBonButton("Save", function(){
			for (var i = 0; i < self.CMSObjects.length; i++) {
				self.onSave(self.CMSObjects[i], self);
			}
		}, "✓");
		var cancelB = new BonBonButton("Cancel", function(){self.setStyleName("cms-card-animation");}, "∅");

		saveB.setStyleName("bbGreen bbSmall relief-shadow");
		cancelB.setStyleName("bbOrange bbSmall relief-shadow");
		deleteB.setStyleName("bbPink bbSmall relief-shadow");

		var buttonPanel = new FlowPanel();
		buttonPanel.add(deleteB);
		buttonPanel.add(cancelB);
		buttonPanel.add(saveB);
		buttonPanel.setStyleName("cms-card-panel-button-panel");
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
	onCreate: function(flip) {
		flip.toggle();
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
			//if (console) console.log(data);
			window.uiview.clear();
			window.uiview.createCards(new SearchList(data));
			self.loader.hide();
		},
		function(res) {
			// Fail
			self.loader.hide();
		});
	},
	render: function() {
		var self = this;
		var holder = new HorizontalPanel();
		var flip = new FlipConsole();
		var createB = new BonBonButton("Create item",  function(){self.onCreate(flip);}, "✎");
		var selectL = new Label("Select");

		selectL.setStyleName("relief-shadow d5 l10");
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
		this.add(flip);
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
		} else {
		  
		}
		this._super(bool);
	},
	createCards: function (searchdata) {
		this.clear();
		var list = searchdata.getList();
		for(var obj in list) {
			this.cardHolder.add(new CMSCardPanel(list[obj]));
		}
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

/*
*	Garbage code for developing and testing code
*
*/

	//window.uiview.createDummies();

	/*
	var link = 'http://master-lb.travelservices.se/v1/apps/exampleappname/contexts/textAreaWidget/names/header/translations/sv-SE';

	var data = {
		link:'hej',
		app:"exampleappname",
		context:"textAreaWidget",
		name:"header",
		locale:"sv-SE",
		mime_type:"text/plain",
		usage:"text",
		result:"Text Area",
		created_at:"2012-11-21T12:50:45Z",
		updated_at:"2012-11-21T12:50:45Z",
		lock_version:0
	};


	PAPI._save(link, data, function(res){
		console.log(res);
		console.log("Succeeded at PUT!!");
	});

	PAPI.apiGET(link, function(res) {
		console.log(res);
		console.log("Succeeded at GET!!");
	});
	*/
	/*
	var testPost = {
			'app' : 'exampleappname',
			'context' : 'searchWidget',
			'name' : 'link1',
			'locale' : 'sv-SE',
			'mime_type' : 'text/plain',
			'result' : '<a href="#!text=blaha">Test Link</a>',
			'usage' : 'link'
		};
		PAPI.apiPOST(testPost, '/v1/apps/exampleappname/contexts/searchWidget/names/link1/translations', function(data, testStatus, xhr) {
			console.log("Success se");
			console.log(data);
			console.log(testStatus);
			console.log(xhr);
		});
	*/
	/*
	for (var i = 1; i < 1000; i++) {
		// se
		var testPost = {
			'app' : 'exampleappname',
			'context' : 'searchWidget' + i,
			'name' : 'headerMain',
			'locale' : 'sv-SE',
			'mime_type' : 'text/plain',
			'result' : "test " + i
		};
		PAPI.apiPOST(testPost, '/apps/exampleappname/contexts/searchWidget'+i+'/names/headerMain/translations', function(data, testStatus, xhr) {
			console.log("Success se");
			//console.log(data);
			//console.log(testStatus);
			//console.log(xhr);
		});

		// no
		var testPost = {
			'app' : 'exampleappname',
			'context' : 'searchWidget' + i,
			'name' : 'headerMain',
			'locale' : 'no-NO',
			'mime_type' : 'text/plain',
			'result' : "test " + i
		};
		PAPI.apiPOST(testPost, '/apps/exampleappname/contexts/searchWidget'+i+'/names/headerMain/translations', function(data, testStatus, xhr) {
			console.log("Success no");
			//console.log(data);
			//console.log(testStatus);
			//console.log(xhr);
		});

		// dk
		var testPost = {
			'app' : 'exampleappname',
			'context' : 'searchWidget' + i,
			'name' : 'headerMain',
			'locale' : 'da-DK',
			'mime_type' : 'text/plain',
			'result' : "test " + i
		};
		PAPI.apiPOST(testPost, '/apps/exampleappname/contexts/searchWidget'+i+'/names/headerMain/translations', function(data, testStatus, xhr) {
			console.log("Success dk");
			//console.log(data);
			//console.log(testStatus);
			//console.log(xhr);
		});

		// en
		var testPost = {
			'app' : 'exampleappname',
			'context' : 'searchWidget' + i,
			'name' : 'headerMain',
			'locale' : 'en-GB',
			'mime_type' : 'text/plain',
			'result' : "test " + i
		};
		PAPI.apiPOST(testPost, '/apps/exampleappname/contexts/searchWidget'+i+'/names/headerMain/translations', function(data, testStatus, xhr) {
			console.log("Success en");
			//console.log(data);
			//console.log(testStatus);
			//console.log(xhr);
		});
	};
	*/
	/*
	PAPI.testQuery("/apps", function(data, testStatus, xhr) {
		console.log("Success");
		console.log(data);
		console.log(testStatus);
		console.log(xhr);
	});
	*/
	
});
