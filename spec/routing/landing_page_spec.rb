require 'spec_helper'

describe "Routing to the root path" do
  
  # it "accepts GET requests" do
  #   { :get => "/" }.should route_to(:controller => "landing_page", :action => "index")
  # end
  
  # it "routes /<landing-app-name> to landing_page#index" do
  #   { :get => "/whatever" }.should route_to(:controller => "landing_page", 
  #                                         :action => "index",
  #                                         :js_app_name => "whatever")
  # end
  
  
  # it "routes / as /start" do
  #   { :get => "/" }.should route_to(:controller => "landing_page", 
  #                                   :action => "index",
  #                                   :js_app_name => "start")
  # end
  
  it "should not accept POST requests" do
    expect({ :post => "/"}).not_to be_routable
    expect({ :post => "/something"}).not_to be_routable
  end
  
  
  it "should not accept PUT requests" do
    expect({ :put => "/"}).not_to be_routable
    expect({ :put => "/something"}).not_to be_routable
  end
  
  
  it "should not accept DELETE requests" do
    expect({ :delete => "/"}).not_to be_routable
    expect({ :delete => "/something"}).not_to be_routable
  end
  
end
