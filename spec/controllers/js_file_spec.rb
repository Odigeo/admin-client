require 'spec_helper'

describe JsFileController do
  
  render_views      # We could also use separate view tests (better)
  
  before do
    # Stub away the authentication call, return a fake token
    allow(Api).to receive(:authenticate).and_return("a-token-for-our-tests")
  end
  

  it "should return a 200" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    expect(response.status).to be(200)
  end
  
  it "should have a Content-Type of application/javascript" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    expect(response.status).to be(200)
    expect(response.content_type).to eq("application/javascript")
  end
  
  it "should always contain an entry for OCEAN_API_HOST" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    expect(response.status).to be(200)
    expect(response.body).to match(/"OCEAN_API_HOST":"/)
  end
  
  it "should always contain an entry for OCEAN_API_URL" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    expect(response.status).to be(200)
    expect(response.body).to match(/"OCEAN_API_URL":"/)
  end
  
  it "should always contain an entry for INTERNAL_OCEAN_API_URL" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    expect(response.status).to be(200)
    expect(response.body).to match(/"INTERNAL_OCEAN_API_URL":"/)
  end
  
  it "should always contain an entry for APP_NAME" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    expect(response.status).to be(200)
    expect(response.body).to match(/"APP_NAME":"/)
  end
    
  it "should always contain an entry for INITIAL_API_TOKEN" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    expect(response.status).to be(200)
    expect(response.body).to match(/"INITIAL_API_TOKEN":"/)
  end
  
  it "should always contain an entry for API_USER" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    expect(response.status).to be(200)
    expect(response.body).to match(/"API_USER":"/)
  end
  
  it "should always contain an entry for API_PASSWORD" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    expect(response.status).to be(200)
    expect(response.body).to match(/"API_PASSWORD":"/)
  end
  
  it "should always contain an entry for API_VERSIONS" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    expect(response.status).to be(200)
    expect(response.body).to match(/"API_PASSWORD":"/)
  end
  
  it "should always contain an entry for _default in API_VERSIONS" do
    get :index, :js_app_name => "foo-app", :locale => "sv-SE"
    expect(response.status).to be(200)
    expect(response.body).to match(/"_default":"/)
  end
  
end
