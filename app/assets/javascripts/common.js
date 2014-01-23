var PAPI = PAPIBase.extend({
  init: function() {
    this._super();
  },
  collect: function(link, data, method, success_callback, error_callback) {
    var urlCms = this.api_domain() + '/' + this.api_version("texts_version") + '/texts' + link;
    var urlMedia = this.api_domain() + '/' + this.api_version("media_version") + '/media' + link;

    var count = 0;
    var result = [];
    var collector = function(res) {
      count++;
      if(count === 1) {
        result = res;
      } else if(count === 2) {
        var tmp = result.concat(res);
        success_callback(tmp);
      }
    };

    PAPI.apiCall(urlCms, data, method, collector, error_callback);
    PAPI.apiCall(urlMedia, data, method, collector, error_callback);
  },
  construct_link: function(data_or_link, iterateObject) {
    var link = "";
    if(typeof data_or_link === "string") {
      // Link
      link = data_or_link;
    } else if(typeof data_or_link === "object") {
      // Data object
      if(data_or_link.service) {
        var version = this.api_version(data_or_link.service + "_version");
        link = this.api_domain() + "/" + version + "/" + data_or_link.service;
        if(Object.keys(data_or_link).length > 1 && iterateObject) {
          link += '?';
          for(var obj in data_or_link) {
            // Dont add the service as a query parameter
            if(obj != 'service') {
              link += obj + '=' + data_or_link[obj] + '&';
            }
          }
        }
      } else {
        if(console) console.warn('Tried to do PAPI.get with a data object but missing "service" data to call!!');
        return null;
      }
    } else {
      // Error, we got something else
      if(console) console.warn("Tried to do PAPI.get with unknown object type!");
      return null;
    }
    return link;
  },
  search: function(data, success) {
    var url = "";
    if(data.result) {
      // Search all
      url += '?search=' + data.result + '&group=locale';
    } else if(data.app && !data.context && !data.name) {
      // App search
      url += '?app=' + data.app;
    } else if(data.app && data.context && !data.name) {
      // Context search
      url += '?app=' + data.app + '&context=' + data.context;
    } else if(data.app && data.context && data.name) {
      // Name search
      url += '?app=' + data.app + '&context=' + data.context + '&name=' + data.name;
    }
    PAPI.collect(url, null, "GET", function(res) {
      //Fix for structure so everything is sorted on name
      var result = {};
      for(var i=0; i<res.length; i++) {
        var arrayObj = res[i].text || res[i].medium;
        result[arrayObj.name] = result[arrayObj.name] || {};
        result[arrayObj.name][arrayObj.locale] = arrayObj;
      }
      success(result);
    }, null);
  },
  login: function(data, success_callback, error_callback) {
    var data2 = {};
    if(data.login && data.password) {
      data2.credentials = $.base64.encode(data.login + ':' + data.password);
    } else {
      if(console) console.warn("Either no login or password in data!! Could not make login!");
    }
    
    var version = this.api_version("authentications_version");
    var url = this.api_domain() + "/" + version + "/authentications";
    data2.headers = {
      'X-API-Authenticate': data2.credentials
    };

    PAPI.apiCall(url, data2, 'POST', success_callback, error_callback);
  },
  getKeys: function(data, success) {
    var url = "";
    if(data.app && !data.contexts && !data.name) {
      //GET context keys
      url += '?app='+data.app+'&group=context';
    } else if(data.app && data.contexts && !data.name) {
      //GET name keys
      url += '?app='+data.app+'&context='+data.contexts+'&group=name';
    } else if(!data.app && !data.contexts && !data.name) {
      //GET app keys
      url += '?group=app';
    }
    PAPI.collect(url, null, "GET", success, null);
  },
  getLogs: function(fromdate, todate, success, error) {
    var link = this.api_domain() + "/" + this.api_version("log_excerpts_version") + "/log_excerpts/" + fromdate + "/" + todate;
    this.apiCall(link, null, "GET", success, error);
  },
  connect: function(link1, link2, success, error) {
    link1 += '?href=' + encodeURI(link2);
    this.apiCall(link1, {}, "PUT", success, error);
  },
  disconnect: function(link1, link2, success, error) {
    link1 += '?href=' + encodeURI(link2);
    this.apiCall(link1, {}, "DELETE", success, error);
  }
});

window.PAPI = new PAPI();

var HashFactory = Class.extend({
	init: function() {
		this.readHash();
	},
	readHash: function() {
		var tmphash = window.location.hash;
		tmphash = tmphash.slice(2, tmphash.length); //removes the #/ chars
		tmphash = tmphash.split("/");
		if(window.location.pathname.match(/cms/)) {
			this.hash = {};
			this.hash["app"] = tmphash[0];
			this.hash["context"] = tmphash[1];
			this.hash["name"] = tmphash[2];
			this.hash["locale"] = tmphash[3];
			this.hash["usage"] = tmphash[4];
		}
	},
	getApp: function() {
		return this.hash.app;
	},
	getContext: function() {
		return this.hash.context;
	},
	getName: function() {
		return this.hash.name;
	},
	getLocale: function() {
		return this.hash.locale;
	},
	getUsage: function() {
		return this.hash.usage;
	}
});

var DragAndDropWidget = FlowPanel.extend({
  init: function() {
    this._super();
    this.clickListeners = [];
    this.focusListeners = [];
    this.keyboardListeners = [];
    this.loadListeners = [];
    this.loadendListeners = [];
    this.loadstartListeners = [];
    this.progressListeners = [];
    this.abortListeners = [];
    this.errorListeners = [];
    this.dragstartListeners = [];
    this.dragListeners = [];
    this.dragenterListeners = [];
    this.dragleaveListeners = [];
    this.dragoverListeners = [];
    this.dropListeners = [];
    this.dragendListeners = [];
    this.sinkEvents(Event.ONCLICK|Event.FOCUSEVENTS|Event.KEYEVENTS|Event.ONLOAD|Event.ONLOADEND|Event.ONLOADSTART|Event.ONPROGRESS|Event.ONABORT|Event.ONERROR|Event.ONDRAGSTART|Event.ONDRAG|Event.ONDRAGENTER|Event.ONDRAGLEAVE|Event.ONDRAGOVER|Event.ONDROP|Event.ONDRAGEND);
  },
  addLoadListener: function(listener) {
    this.loadListeners.push(listener);
    return this;
  },
  addLoadStartListener: function(listener) {
    this.loadstartListeners.push(listener);
    return this;
  },
  addLoadEndListener: function(listener) {
    this.loadendListeners.push(listener);
    return this;
  },
  addProgressListener: function(listener) {
    this.progressListeners.push(listener);
    return this;
  },
  addAbortListener: function(listener) {
    this.abortListeners.push(listener);
    return this;
  },
  addErrorListener: function(listener) {
    this.errorListeners.push(listener);
    return this;
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
  addDragStartListener: function(listener) {
    this.dragstartListeners.push(listener);
    return this;
  },
  addDragListener: function(listener) {
    this.dragListeners.push(listener);
    return this;
  },
  addDragEnterListener: function(listener) {
    this.dragenterListeners.push(listener);
    return this;
  },
  addDragLeaveListener: function(listener) {
    this.dragleaveListeners.push(listener);
    return this;
  },
  addDragOverListener: function(listener) {
    this.dragoverListeners.push(listener);
    return this;
  },
  addDropListener: function(listener) {
    this.dropListeners.push(listener);
    return this;
  },
  addDragEndListener: function(listener) {
    this.dragendListeners.push(listener);
    return this;
  },
  onBrowserEvent: function(event) {
    var type = DOM.eventGetType(event);

    if (type == 'click') {
      for (var i = 0; i < this.clickListeners.length; i++) {
        this.clickListeners[i](this, event);
      }
    }
    else if (type == 'blur' || type == 'focus') {
      for (var i = 0; i < this.focusListeners.length; i++) {
        this.focusListeners[i](this, event);
      }
    }
    else if (type == 'keydown' || type == 'keypress' || type == 'keyup') {
      for (var i = 0; i < this.keyboardListeners.length; i++) {
        this.keyboardListeners[i](this, event);
      }
    }
    else if (type == 'load') {
      for (var i = 0; i < this.loadListeners.length; i++) {
        this.loadListeners[i](this, event);
      }
    }
    else if (type == 'loadend') {
      for (var i = 0; i < this.loadendListeners.length; i++) {
        this.loadendListeners[i](this, event);
      }
    }
    else if (type == 'progress') {
      for (var i = 0; i < this.progressListeners.length; i++) {
        this.progressListeners[i](this, event);
      }
    }
    else if (type == 'abort') {
      for (var i = 0; i < this.abortListeners.length; i++) {
        this.abortListeners[i](this, event);
      }
    }
    else if (type == 'error') {
      for (var i = 0; i < this.errorListeners.length; i++) {
        this.errorListeners[i](this, event);
      }
    }
    else if (type == 'drop') {
      for (var i = 0; i < this.dropListeners.length; i++) {
        this.dropListeners[i](this, event);
      }
    }
    else if (type == 'dragenter') {
      for (var i = 0; i < this.dragenterListeners.length; i++) {
        this.dragenterListeners[i](this, event);
      }
    }
    else if (type == 'dragleave') {
      for (var i = 0; i < this.dragleaveListeners.length; i++) {
        this.dragleaveListeners[i](this, event);
      }
    }
    else if (type == 'dragend') {
      for (var i = 0; i < this.dragendListeners.length; i++) {
        this.dragendListeners[i](this, event);
      }
    }
    else if (type == 'dragstart') {
      for (var i = 0; i < this.dragstartListeners.length; i++) {
        this.dragstartListeners[i](this, event);
      }
    }
    else if (type == 'dragover') {
      for (var i = 0; i < this.dragoverListeners.length; i++) {
        this.dragoverListeners[i](this, event);
      }
    }
  }
});

var FileWidget = DragAndDropWidget.extend({
  init: function() {
    this._super();
    this.setStyleName("fileWidget");
    this.render();
    this.filedata = null;
    this.data = {};
  },
  setText: function(text) {
    // Must add text container that's over image area, since innerHTML will be set thus erasing the IMG tag currently
    //this.droptext = text;
    //DOM.setInnerText(this.imageHolder.getElement(),text);
  },
  showText: function(show) {
    if(show) {
      this.imageLabel.removeStyleName("hide");
    } else {
      this.imageLabel.setStyleName("hide");
    }
  },
  clear: function() {
    if(this.imageHolder.getChildren()[0]) {
      this.imageHolder.remove(this.imageHolder.getChildren()[0]);
      delete this.previewImage;
    }
    $(this.imageHolder.getElement()).removeClass("fileWidgetFull").addClass("fileWidgetEmpty");
    this.imageNameL.setText("No file choosen...");
    this.imageSizeL.setText("---");
    this.showText(true);
  },
  setImgSrc: function(src) {
    var self = this;
    src = src.replace("https", "http");
    if(!this.previewImage) this.createPreview();
    this.showText(false);
    this.previewImage.setUrl(src);

    // Calculate real image size
    var tmpImage = html.img({'src':src});
    $(tmpImage).on('load', function(e) {
      // Set Image size and show it
      self.data.imageWidth = tmpImage.width;
      self.data.imageHeight = tmpImage.height;
      self.imageSizeL.setText(self.data.imageWidth + " x " + self.data.imageHeight);
    });
  },
  createPreview: function() {
    var self = this;
    this.previewImage = new WImage();
    this.previewImage.setStyleName("fileWidgetImage");
    this.imageHolder.setStyleName("fileWidgetFull");
    this.imageHolder.removeStyleName("fileWidgetEmpty");
    this.imageHolder.add(this.previewImage);
  },
  setMimeType: function(data) {
    this.data.dataMimeType = data;
  },
  setResult: function(data) {
    this.data.dataResult = data;
  },
  setFileName: function(data) {
    this.data.dataFileName = data;
    this.imageNameL.setText(data);
  },
  setByteSize: function(data) {
    this.data.dataByteSize = data;
  },
  getMimeType: function() {
    return this.data.dataMimeType;
  },
  getResult: function() {
    if(this.data.dataResult) {
      return this.data.dataResult;
    } else {
      return null;
    }
  },
  getFileName: function() {
    return this.data.dataFileName;
  },
  getByteSize: function() {
    return this.data.dataByteSize;
  },
  getImageSize: function() {
    return {'width': this.data.imageWidth,
            'height': this.data.imageHeight};
  },
  render: function() {
    var self = this;
    this.imageHolder = new FlowPanel();
    this.imageLabel = new Label("Drop image here!");
    this.imageNameL = new Label("No file choosen...");
    this.imageSizeL = new Label("---");
    this.fileB = new FileBox();
    this.fileB.addChangeListener(function(widget, e) {
      e.stopPropagation();
      e.preventDefault();

      var files = e.target.files;
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
    $(this.imageHolder.getElement()).bind('dragenter', function(e) {
      if(!self.previewImage) $(e.target).addClass("fileWidgetFull").removeClass("fileWidgetEmpty");
    });
    $(this.imageHolder.getElement()).bind('dragleave', function(e) {
      if(!self.previewImage) $(e.target).removeClass("fileWidgetFull").addClass("fileWidgetEmpty");
    });

    this.fileB.setStyleName("fileWidgetInputButton");
    
    this.imageHolder.setStyleName("fileWidgetImageHolder fileWidgetEmpty");
    this.imageLabel.setStyleName("fileWidgetImageLabel");
    this.imageNameL.setStyle("margin", "5px 0px 0px 0px");
    this.imageNameL.setStyle("font-size", "12px");
    this.imageNameL.setWidth("200px");

    this.imageSizeL.setStyle("margin", "5px 0px 0px 0px");
    this.imageSizeL.setStyle("font-size", "10px");
    this.imageSizeL.setWidth("200px");

    this.add(this.imageHolder);
    this.add(this.fileB);
    this.add(this.imageLabel);
    this.add(this.imageNameL);
    this.add(this.imageSizeL);
  }
});

var LoginView = FlowPanel.extend({
	init: function() {
		this._super();
		this.render();
		this.setStyleName("login-panel main-panel d50");
		this.setId("login-panel");
    this.loader = new WidgetLoader();
    this.add(this.loader);
	},
	onLogin: function() {
		var self = this;
		var data = {};
		data.login = $('#login-input', this.getElement()).val();
		data.password = $('#password-input', this.getElement()).val();
		
    if(data.login && data.password) {
      self.loader.show(true);
      PAPI.login(data, function(res) {
        // Success
        if(res) {
          if(res.authentication) {
            // Save login name for future autopopulation for 300 days
            $.cookie('user-login-name', data.login, {'expires':300, 'path': '/'});
            // Clear password input field
            $('#password-input', self.getElement()).val("");
            // Makes all json objects serialized/deserialized
            $.cookie.json = true;
            // Expire in 30min (30 forward in time)
            var date = new Date();
            date.setTime(date.getTime() + (30 * 60 * 1000));
            $.cookie('user-login', res.authentication, {'expires':date, 'path': '/'});
            mainFlow.fadeToWidget(1);
          } else {
            if(console) console.warn("Authentication object were not wrapped correctly!");
            if(console) console.log(res);
          }
        } else {
          self.showError();
        }
        self.loader.hide();
      }, function(res) {
        // Failed
        if(res.getStatus() === 403 && res.getErrorText()) {
          // Forbidden
          self.showError();
        } else {

        }
        self.loader.hide();
      });
    } else {
      // Front End error handling for missing input values
    }
	},
  setVisible: function(visible) {
    if(visible) {
      if($.cookie('user-login')) {
        mainFlow.showWidget(1);
        return;
      }
      if($.cookie('user-login-name')) {
        // Set user name for this returning user
        $('#login-input', this.getElement()).val($.cookie('user-login-name'));
      }
      this.cube.start();
      document.title = "Login";
    } else {
      this.cube.stop();
    }
    this._super(visible);
  },
	showError: function() {
		$('#login-error-label', this.getElement()).fadeOut(100, function(){}).fadeIn(200, function(){});
	},
	render: function() {
		var self = this;

    // Use this holder to have padding, otherwise it fucks the loaders size calculations up on the top node
    var fp = new FlowPanel();
    fp.setStyle("padding", "5px 30px 5px 30px");

		var loginI = new TextBox();
		var pswI = new PasswordTextBox();
		var headerL = new Header2("Admin Tool");
		var confirmB = new GradientButton("Confirm");
		var errorP = new FlowPanel();
		var errorL = new Label("Your password or login name is incorrect. Please try again!", true);
		var footer = new FlowPanel();
		var grid = new Grid(3,2);
		this.cube = new Cube();

		headerL.setStyleName("align-left d20");
		grid.setStyleName("align-left");
		grid.setId("grid-login");
		errorL.setId("login-error-label");
		errorP.setHeight("50px");
		errorP.setStyleName("");
		confirmB.setId("login-confirm-button");
		confirmB.setStyleName("gbWhite gbLarge");
		loginI.setId("login-input");
		pswI.setId("password-input");
		footer.setId("login-footer");

    $(loginI.getElement()).attr("placeholder", "Login");
    $(pswI.getElement()).attr("placeholder", "Password");

		grid.setWidget(0,0, loginI);
		grid.setWidget(1,0, pswI);
		grid.setWidget(2,0, confirmB);

		grid.addTableListener(function(table, e) {
			var target = e.target;
			if(e.type === "click" && target.id == "login-confirm-button") {
				self.onLogin();
			} else if(e.keyCode == 13) {
				//Enter key pressed
				self.onLogin();
			}
		});

		errorP.add(errorL);
		fp.add(headerL);
    fp.add(footer);
		fp.add(grid);
    fp.add(errorP);
		fp.add(this.cube);
    this.add(fp);
	}
});

var GradientButton = FocusWidget.extend({
	init: function(name, fn) {
		this.name = name;
		this._super(this.render());

		if(fn) {
			this.addMouseUpListener(fn);
		}
	},
	render: function() {
		return html.div({'class':'clickable gradientButton'}, this.name);
	}
});

var CloseButton = FocusWidget.extend({
  init: function(fn) {
    this.name = "X";
    this._super(this.render());

    if(fn) {
      this.addMouseUpListener(fn);
    }
  },
  render: function() {
    return html.div({'class':'clickable closeButton'}, this.name);
  }
});

var BonBonButton = FocusWidget.extend({
	init: function(name, fn, symbol) {
		this.name = name;
		if(symbol) {
			this.symbol = symbol;
		}

		this._super(this.render());

		if(fn) {
			this.addMouseUpListener(fn);
		}
	},
	render: function() {
		var symbolchar = "";
		if(this.symbol) {symbolchar = this.symbol;}
		return html.button({'class':'clickable bbButton', 'data-icon':symbolchar }, this.name);
	}
});

var Cube = Widget.extend({
	init: function() {
		this._super();
		this.setElement(this.render());
	},
  stop: function() {
    $('#cube', this.getElement()).css("-webkit-animation-play-state", "paused");
  },
  start: function() {
    $('#cube', this.getElement()).css("-webkit-animation-play-state", "running");
  },
	render: function() {
		return html.div({'id':'cube-holder'},
				html.div({'id':'cube'},
					html.div({'class':'cube-side cube-top'}, '✿'),
					html.div({'class':'cube-side cube-bottom'}, '✿'),
					html.div({'class':'cube-side cube-front'}, '✿'),
					html.div({'class':'cube-side cube-back'}, '✿'),
					html.div({'class':'cube-side cube-left'}, '❀'),
					html.div({'class':'cube-side cube-right'}, '❀')
					));
	}
});

var TopBar = FlowPanel.extend({
  init: function() {
    this._super();
    this.setId("topBar");
    this.render();
  },
  render: function() {
    var appname = window.location.pathname.slice(1);
    var label = new Label("resia.com");
    var label2 = new Label("ADMIN TOOL / " + appname.toUpperCase());

    label.setStyleName("inline r20");
    label2.setStyleName("inline r20");

    this.add(label);
    this.add(label2);
  }
});