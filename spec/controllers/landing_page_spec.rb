require 'spec_helper'

describe LandingPageController do
  
  describe "GET index" do
    
    it "works for all supported apps" do
      JS_APPS.each do |name|
        get :index, :js_app_name => name
        expect(assigns(:js_app_name)).to eq(name)
      end
    end
    
    
    it "uses the default layout in all cases except for checkout" do
      JS_APPS.each do |name|
        get :index, :js_app_name => name
        if name != 'checkout'
          expect(assigns(:layout)).to eq('index')
        else
          expect(assigns(:layout)).to eq('checkout')
        end
      end
    end
    
    
    it "raises a 404 exception for unsupported apps" do
      expect { get :index, :js_app_name => "NOWAI" }.to raise_error(ActionController::RoutingError)
    end 
        
  end
  
end