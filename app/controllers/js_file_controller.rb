class JsFileController < ApplicationController
    
  def index
    @config = {}
    @config["OCEAN_API_HOST"]         = OCEAN_API_HOST
    @config["OCEAN_API_URL"]          = OCEAN_API_URL
    @config["INTERNAL_OCEAN_API_URL"] = INTERNAL_OCEAN_API_URL
    @config["APP_NAME"]             = "admin_client"
    @config["API_USER"]             = API_USER
    @config["API_PASSWORD"]         = API_PASSWORD
    @config["INITIAL_API_TOKEN"]    = "KfYWGYmp1Y12iOQnQNg5nwGWzu_Rk0mY6Utv8I_3VhI" #Api.authenticate
    @config["API_VERSIONS"]         = API_VERSIONS
    expires_in 30.minutes, :public => true
    render :template => "js_file/index.js.erb", :content_type => 'application/javascript'
  end
        
end
