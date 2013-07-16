require 'spec_helper'

describe JsFileController do
  
  render_views      # We could also use separate view tests (better)
  
  before do
    # Stub away the authentication call, return a fake token
    Api.stub(:authenticate).and_return("a-token-for-our-tests")
  end
  

  it "should return a 200" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    response.status.should be(200)
  end
  
  it "should have a Content-Type of application/javascript" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    response.status.should be(200)
    response.content_type.should == "application/javascript"
  end
  
  it "should always contain an entry for OCEAN_API_HOST" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    response.status.should be(200)
    response.body.should =~ /"OCEAN_API_HOST":"/
  end
  
  it "should always contain an entry for OCEAN_API_URL" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    response.status.should be(200)
    response.body.should =~ /"OCEAN_API_URL":"/
  end
  
  it "should always contain an entry for INTERNAL_OCEAN_API_URL" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    response.status.should be(200)
    response.body.should =~ /"INTERNAL_OCEAN_API_URL":"/
  end
  
  it "should always contain an entry for APP_NAME" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    response.status.should be(200)
    response.body.should =~ /"APP_NAME":"/
  end
    
  it "should always contain an entry for INITIAL_API_TOKEN" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    response.status.should be(200)
    response.body.should =~ /"INITIAL_API_TOKEN":"/
  end
  
  it "should always contain an entry for API_USER" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    response.status.should be(200)
    response.body.should =~ /"API_USER":"/
  end
  
  it "should always contain an entry for API_PASSWORD" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    response.status.should be(200)
    response.body.should =~ /"API_PASSWORD":"/
  end
  
  it "should always contain an entry for API_VERSIONS" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    response.status.should be(200)
    response.body.should =~ /"API_PASSWORD":"/
  end
  
  it "should always contain an entry for _default in API_VERSIONS" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    response.status.should be(200)
    response.body.should =~ /"_default":"/
  end
  
end
