require 'spec_helper'

describe "Routing to the root path" do
  
  # it "accepts GET requests" do
  #   { :get => "/" }.should route_to(:controller => "landing_page", :action => "index")
  # end
  
  it "routes /<landing-app-name> to landing_page#index" do
    { :get => "/whatever" }.should route_to(:controller => "landing_page", 
                                          :action => "index",
                                          :js_app_name => "whatever")
  end
  
  
  it "routes / as /start" do
    { :get => "/" }.should route_to(:controller => "landing_page", 
                                    :action => "index",
                                    :js_app_name => "start")
  end
  
  it "should not accept POST requests" do
    { :post => "/"}.should_not be_routable
    { :post => "/something"}.should_not be_routable
  end
  
  
  it "should not accept PUT requests" do
    { :put => "/"}.should_not be_routable
    { :put => "/something"}.should_not be_routable
  end
  
  
  it "should not accept DELETE requests" do
    { :delete => "/"}.should_not be_routable
    { :delete => "/something"}.should_not be_routable
  end
  
end
