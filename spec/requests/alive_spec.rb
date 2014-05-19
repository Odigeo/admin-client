require 'spec_helper'

describe "/alive (for Varnish health checking)" do

  after do
    teardown_browser(@b)
  end

  it "should return a 200 with a body of OK" do
    @b = setup_browser URL+"/alive"
    assert(@b.text.== "ALIVE")
  end
   
end
