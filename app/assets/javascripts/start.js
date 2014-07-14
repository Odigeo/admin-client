var TopMenu = FlowPanel.extend({
	init: function() {
		this._super();
		this.render();
	},
	render: function() {
		var cmsB = new GradientButton("CMS", function(e){
			var url = "http://" + window.location.host + "/cms";
			window.location.href = url;
		});
		var authB = new GradientButton("Authentication/Users", function(e){
			var url = "http://" + window.location.host + "/users";
			window.location.href = url;
		});
		var logB = new GradientButton("Logs", function(e){
			var url = "http://" + window.location.host + "/logs";
			window.location.href = url;
		});

		cmsB.setId("cms-button");
		authB.setId("auth-button");
		logB.setId("log-button");

		this.add(cmsB);
		this.add(authB);
		this.add(logB);
	}
});

var ChoiceView = FlowPanel.extend({
	init: function() {
		this._super();
		this.render();

		this.setId("choice-menu");
	},
	setVisible: function(bool) {
		if(bool) {
		  document.title = "Admin Client";
		}
		this._super(bool);
	},
	render: function() {
		var topBar = new TopBar();
		var topMenu = new TopMenu();

		this.add(topBar);
		this.add(topMenu);
	}
});

////////////////////////////////////////////////////

$(document).ready(function() {
	var root = new RootPanel("bootstrap");
	var wrapper = new FlowPanel();
	mainFlow = new DeckPanel();
	var login = new LoginView();
	var hf = new HashFactory();
	var choiceView = new ChoiceView();
	
	window.hf = hf;

	wrapper.setStyleName("d10");

	mainFlow.add(login);
	mainFlow.add(choiceView);
	mainFlow.showWidget(0);

	wrapper.add(mainFlow);
	root.add(wrapper);

	//TEST
	//mainFlow.showWidget(1);

});