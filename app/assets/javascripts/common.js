var PAPI = PAPIBase.extend({
  init: function() {
    this.user_authentication = null;
    this._super();
  },
  api_domain: function() {
    return config.OCEAN_API_URL;
  },
  api_version: function(key) {
    switch(key) {
      case "texts_version": 
        return config.API_VERSIONS.texts || config.API_VERSIONS._default
        break;
      case "media_version": 
        return config.API_VERSIONS.media || config.API_VERSIONS._default
        break;
      default: 
        return config.API_VERSIONS._default;
    }
  },
  getHeaders: function(custom_headers) {
    // Use custom token (user login) first, otherwise clients initial token
    if(!custom_headers) {
      var token = "";
      if($.cookie('token')) {
        token = decodeURIComponent($.cookie('token'));
      } else {
        token = config.INITIAL_API_TOKEN; // Currently not retrieved in the controllers on Rails app
      }

      // Add extra headers specified in data hash
      return {"Accept": "application/json",
                "X-API-Token": token
                };
    } else {
      var headers_list = {"Accept": "application/json"};
      if(custom_headers && typeof custom_headers === "object") {
        for(var obj in custom_headers) {
          headers_list[obj] = custom_headers[obj];
        }
        return headers_list;
      } else {
        if(console) console.warn("custom_headers in PAPI seem like not a correct object!!");
      }
    }
  },
  apiCall: function(link, data, method, success_callback, error_callback, headers, extras, retries) {
    var self = this;

    var error_callback_extra = function(xhr) {
      var counter_retries = retries || 0;
      counter_retries++;

      if(counter_retries > 3) {
        // Stop retrying and fire failed
        error_callback(xhr);
      } else if(xhr.status == 419 || xhr.status == 400) {
        // Need to refresh authentication token
        if($.cookie('credentials')) {
          var creds = {'credentials': decodeURIComponent($.cookie('credentials'))};
          PAPI.login(creds, function(res) {
            // Success
            // Redo the initial call that failed
            PAPI.apiCall(link, data, method, success_callback, error_callback, self.getHeaders(), extras, counter_retries);
          },
          function(xhr) {
            console.warn("Could not auto authenticate user");
            error_callback(xhr);
          });
        } else {
          if(window.mainFlow) {
            // Login view
            window.mainFlow.fadeToWidget(0);
          }
        }
      } else if(xhr.status == 503 || xhr.status == 500) {
        // Try to redo the call with a cooldown of 1000ms
        console.warn("Recalling because of 503 or 500");
        setTimeout(function(){PAPI.apiCall(link, data, method, success_callback, error_callback, headers, extras, counter_retries);}, 1000);
      } else {
        console.warn("Error PAPI call");
        console.log(xhr);
        error_callback(xhr);
      }
    }
    
    // Make the actual API call in PAPIBase
    this._super(link, data, method, success_callback, error_callback_extra, headers, extras);
  },
  collect: function(link, data, method, success_callback, error_callback) {
    var urlCms = this.api_domain() + '/' + this.api_version("texts_version") + '/texts' + link;
    var urlMedia = this.api_domain() + '/' + this.api_version("media_version") + '/media' + link;

    var count = 0;
    var result = [];
    var collector = function(res) {
      count++;
      res = res._collection.resources;
      if(count === 1) {
        result = res;
      } else if(count === 2) {
        var tmp = result.concat(res);
        success_callback(tmp);
      }
    };

    this.apiCall(urlCms, data, method, collector, error_callback, this.getHeaders());
    this.apiCall(urlMedia, data, method, collector, error_callback, this.getHeaders());
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
      //Fix for structure so everything is sorted on app/context/name
      var result = {};
      for(var i=0; i<res.length; i++) {
        var arrayObj = res[i].text || res[i].medium;
        result[arrayObj.app + '/' + arrayObj.context + '/' + arrayObj.name] = result[arrayObj.app + '/' + arrayObj.context + '/' + arrayObj.name] || {};
        result[arrayObj.app + '/' + arrayObj.context + '/' + arrayObj.name][arrayObj.locale] = arrayObj;
      }
      success(result);
    }, null);
  },
  login: function(data, success_callback, error_callback) {
    var self = this;
    var data2 = {};
    if(data.login && data.password) {
      data2.credentials = $.base64.encode(data.login + ':' + data.password);
    } else if(data.credentials) {
      // Re authentication where data = PAPI.user_authentication
      data2.credentials = data.credentials;
    } else {
      if(console) console.warn("Either no login or password in data!! Could not make login!");
    }

    // Save token and credentials if needing to reauthenticate
    var succs = function(res) {
      $.cookie("credentials", encodeURIComponent(data2.credentials), { expires: 7, path: '/'});
      $.cookie("token", encodeURIComponent(res.authentication.token), { expires: 7, path: '/'});
      success_callback(res);
    }
    
    var version = this.api_version("authentications_version");
    var url = this.api_domain() + "/" + version + "/authentications";

    this.apiCall(url, data2, 'POST', succs, error_callback, this.getHeaders({
      'X-API-Authenticate': data2.credentials
    }));
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
    this.apiCall(link, null, "GET", success, error, this.getHeaders());
  },
  getBroadcasts: function(success, error) {
    var link = this.api_domain() + "/" + this.api_version("broadcasts_version") + "/broadcasts";
    this.apiCall(link, null, "GET", success, error, this.getHeaders());
  },
  createSwarm: function(data, success, error, extras) {
    var link = this.api_domain() + "/" + this.api_version("swarms_version") + "/swarms/";
    this.apiCall(link, data, "POST", success, error, this.getHeaders(), extras);
  },
  createBroadcast: function(data, success, error, extras) {
    var link = this.api_domain() + "/" + this.api_version("broadcast_version") + "/broadcasts/";
    this.apiCall(link, data, "POST", success, error, this.getHeaders(), extras);
  },
  createRight: function(right_link, data, success, error, extras) {
    // right_link should be the rights link of a resource object that you want to create the right for, according to documentation
    this.apiCall(right_link, data, "POST", success, error, this.getHeaders(), extras);
  },
  connect: function(link1, link2, success, error) {
    link1 += '?href=' + encodeURI(link2);
    this.apiCall(link1, {}, "PUT", success, error, this.getHeaders());
  },
  disconnect: function(link1, link2, success, error) {
    link1 += '?href=' + encodeURI(link2);
    this.apiCall(link1, {}, "DELETE", success, error, this.getHeaders());
  },
  _save: function(link, data, success, error, extras) {
    this.apiCall(link, data, "PUT", success, error, this.getHeaders(), extras);
  },
  _delete: function(link, success, error, extras) {
    this.apiCall(link, null, "DELETE", success, error, this.getHeaders(), extras);
  },
  _get: function(data_or_link, success, error, extras) {
    var link = "";
    link = this.construct_link(data_or_link, true);
    this.apiCall(link, null, "GET", success, error, this.getHeaders(), extras);
  },
  _create: function(data, success, error, extras) {
    var link = "";
    link = this.construct_link(data, false);
    this.apiCall(link, data, "POST", success, error, this.getHeaders(), extras);
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
            var date = new Date();
            date.setTime(date.getTime() + (30 * 60 * 1000));
            $.cookie('user-login-name', data.login, {'expires':date, 'path': '/'});
            // Clear password input field
            $('#password-input', self.getElement()).val("");
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
      if($.cookie('token')) {
        mainFlow.showWidget(1);
        return;
      } else {
        if($.cookie('user-login-name')) {
          this.pswI.getElement().focus();
          this.loginI.setText($.cookie('user-login-name'));
        } else {
          this.loginI.getElement().focus();
        }
        this.cube.start();
        document.title = "Login";
      }
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

    this.loginI = new TextBox();
    this.pswI = new PasswordTextBox();
    var headerL = new Header2("Admin Tool");
    var confirmB = new GradientButton("Confirm");
    var errorP = new FlowPanel();
    var errorL = new Text("Your password or login name is incorrect. Please try again!", true);
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
    this.loginI.setId("login-input");
    this.pswI.setId("password-input");
    footer.setId("login-footer");

    this.loginI.setAttributes({"placeholder": "Login"});
    this.pswI.setAttributes({"placeholder": "Password"});

    grid.setWidget(0,0, this.loginI);
    grid.setWidget(1,0, this.pswI);
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
    if(name) {
      this.name = name;
    } else {
      this.name = "";
    }
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
          html.div({'class':'cube-side cube-top'}, 'ۻ'),
          html.div({'class':'cube-side cube-bottom'}, 'ת'),
          html.div({'class':'cube-side cube-front'}, 'ऎ'),
          html.div({'class':'cube-side cube-back'}, 'S'),
          html.div({'class':'cube-side cube-left'}, 'ਈ'),
          html.div({'class':'cube-side cube-right'}, 'ઔ')
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
    var label = new TextButton("OceanFront ", function() {
      window.location = '/';
    });
    var label2 = new TextButton("ADMIN TOOL / " + appname.toUpperCase(), function() {
      window.location = '/';
    });
    var logoutB = new Button("Logout", function(e){
      // Erase login cookie
      $.removeCookie('token', { path: '/' });
      // Go to LoginView
      mainFlow.fadeToWidget(0);
    });

    label.setStyleName("inline r20");
    label2.setStyleName("inline r20");
    logoutB.setId("topBar-logout-button");

    this.add(label);
    this.add(label2);
    this.add(logoutB);
  }
});