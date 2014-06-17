require 'spec_helper'

describe "cms" do

   after do
     teardown_browser(@b)
   end
  
   def do_login
     @b = setup_browser URL+"/cms"
     assert(@b.text_field(:id, "login-input"))
       @b.text_field(:id, "login-input").wait_until_present
       @b.text_field(:id, "login-input").set(TEST_API_USER)
       @b.text_field(:id, "password-input").set(TEST_API_PASSWORD)
       #@b.send_keys :enter
       @b.div(:id, "login-confirm-button").click
       # Wait until we can see input elements for search
       @b.text_field(:id, "app").wait_until_present
     rescue => e
   end

   it "should be able to search for a application" do
     do_login
     @b.text_field(:id, "app").set("test")
     @b.send_keys :enter
     @b.div(:class, "cms-card-panel").wait_until_present
     @b.div(:class, "cms-card-panel").div(:class, "closeButton").exists?
       @b.div(:class, "cms-card-panel").div(:class, "closeButton").click
   end

  # it "should be able to search and read a text object" do
  #   do_login
  #   @b.text_field(:id, "app").set("test")
  #   @b.text_field(:id, "context").set("testWidget")
  #   @b.text_field(:id, "name").set("test1")
  #   @b.send_keys :enter
  #   @b.div(:class, "cms-card-panel").wait_until_present
  #   @b.textarea(:class => "cms-object-textarea", :index => 1).value.should == "This is a test for test agent, RSpec!"
  # end

  # it "should be able to search and read a link object" do
  #   do_login
  #   @b.text_field(:id, "app").set("test")
  #   @b.text_field(:id, "context").set("testWidget")
  #   @b.text_field(:id, "name").set("test2")
  #   @b.send_keys :enter
  #   @b.div(:class, "cms-card-panel").wait_until_present
  #   @b.div(:class => "cms-object", :index => 1).text_field(:placeholder, "Text").value.should == "blahonga link"
  #   @b.div(:class => "cms-object", :index => 1).text_field(:placeholder, "Link").value.should == "#!test=hej"
  # end

  # it "should be able to search and read a markdown object" do
  #   do_login
  #   @b.text_field(:id, "app").set("test")
  #   @b.text_field(:id, "context").set("testWidget")
  #   @b.text_field(:id, "name").set("test3")
  #   @b.send_keys :enter
  #   @b.div(:class, "cms-card-panel").wait_until_present
  #   @b.textarea(:class => "cms-object-textarea", :index => 1).value.should == "# Header1"
  # end

  # it "should be able to search and read a image object" do
  #   do_login
  #   @b.text_field(:id, "app").set("test")
  #   @b.text_field(:id, "context").set("testWidget")
  #   @b.text_field(:id, "name").set("test4")
  #   @b.send_keys :enter
  #   @b.div(:class, "cms-card-panel").wait_until_present
  #   @b.div(:class => "cms-object", :index => 1).img(:class, "fileWidgetImage").exists?
  #   @b.div(:class => "cms-object", :index => 1).text_field(:placeholder, "Image tags").value.should == "blond, woman"
  # end

end
