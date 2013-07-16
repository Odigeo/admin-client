# require 'spec_helper'

# describe "start" do

#   after do
#     teardown_browser(@b)
#   end
  
#   def do_login
#     @b = setup_browser URL
#     @b.text_field(:id, "login-input").exists?
#       @b.text_field(:id, "login-input").set("front_end_test")
#       @b.text_field(:id, "password-input").set("test123")
#       #@b.send_keys :enter
#       @b.div(:id, "login-confirm-button").click
#   end

#   it "should be able to go to cms application" do
#     do_login
#     #@b.wait_until{@b.title.include? "Admin Client"}
#     @b.div(:id, "cms-button").click
#     @b.title.include? "CMS"
#   end

# end