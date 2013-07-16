require 'spec_helper'

describe LandingPageController do
  
  describe "GET index" do
    
    it "works for all supported apps" do
      JS_APPS.each do |name|
        get :index, :js_app_name => name
        assigns(:js_app_name).should == name
      end
    end
    
    
    it "uses the default layout in all cases except for checkout" do
      JS_APPS.each do |name|
        get :index, :js_app_name => name
        if name != 'checkout'
          assigns(:layout).should == 'index'
        else
          assigns(:layout).should == 'checkout'
        end
      end
    end
    
    
    it "raises a 404 exception for unsupported apps" do
      lambda { get :index, :js_app_name => "NOWAI" }.should raise_error(ActionController::RoutingError)
    end 
        
  end
  
end