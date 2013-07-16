#
# The path /alive is implemented solely for the benefit of Varnish,
# which is set up to use it for health checking. Due to the routing
# implemented in Varnish, /alive can never be reached from the outside.
#

class AliveController < ApplicationController
  
  def index
    render :text => "ALIVE", :status => 200
  end
  
end
