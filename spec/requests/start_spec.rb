require 'spec_helper'

describe "start" do

  after do
    teardown_browser(@b)
  end
  
  def do_login
    @b = setup_browser URL+"/"
    assert(@b.text_field(:id, "login-input"))
      @b.text_field(:id, "login-input").wait_until_present
      @b.text_field(:id, "login-input").set(TEST_API_USER)
      @b.text_field(:id, "password-input").set(TEST_API_PASSWORD)
      #@b.send_keys :enter
      @b.div(:id, "login-confirm-button").click
    rescue => e
  end

  def do_reoccuring_login
    assert(@b.text_field(:id, "login-input"))
      @b.text_field(:id, "login-input").wait_until_present
      @b.text_field(:id, "login-input").set(TEST_API_USER)
      @b.text_field(:id, "password-input").set(TEST_API_PASSWORD)
      #@b.send_keys :enter
      @b.div(:id, "login-confirm-button").click
    rescue => e
  end

  # it "should be able to go to cms application" do
  #   do_login
  #   #@b.wait_until{@b.title.include? "Admin Client"}
  #   @b.div(:id, "cms-button").click
  #   @b.title.include? "CMS"
  # end

  it "should be able to logout and then login again" do
  	do_login
  	@b.button(:id => "topBar-logout-button").wait_until_present
  	@b.button(:id => "topBar-logout-button").click
  	do_reoccuring_login
  	@b.button(:id => "topBar-logout-button").wait_until_present
  	@b.button(:id => "topBar-logout-button").exist?
  end

end