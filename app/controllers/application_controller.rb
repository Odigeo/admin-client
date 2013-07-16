class ApplicationController < ActionController::Base
  
  before_action :set_everything_public
  
  def set_everything_public
    #expires_in 3600.seconds, public: true
    true
  end
  
end
