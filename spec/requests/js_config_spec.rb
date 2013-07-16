require 'spec_helper'

describe "GET of the JS config file" do

  it "should succeed" do
    get "/javascripts/.config/config.js"
    response.status.should be(200)
  end

end
