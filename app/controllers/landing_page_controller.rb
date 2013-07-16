class LandingPageController < ApplicationController
  
  before_action :ensure_js_app_exists
  before_action :determine_locale
  before_action :determine_layout
  
  def index
    render @layout
  end
  
  
  private
  
  def ensure_js_app_exists
    @js_app_name = params[:js_app_name]
    return true if JS_APPS.include? @js_app_name
    raise ActionController::RoutingError.new('404 Not Found')
  end
  
  def determine_layout
    @layout = @js_app_name != 'checkout' ? 'index' : 'checkout'
    true
  end
  
  def determine_locale
    # THIS IS TEMPORARY - DETERMINE FROM REQUEST HOST
    @locale = 'sv-SE'
  end
  
end
