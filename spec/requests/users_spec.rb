require 'spec_helper'

describe "users" do

  after do
    teardown_browser(@b)
  end
  
  def do_login
    @b = setup_browser URL+"/users"
    assert(@b.text_field(:id, "login-input"))
      @b.text_field(:id, "login-input").wait_until_present
      @b.text_field(:id, "login-input").set(TEST_API_USER)
      @b.text_field(:id, "password-input").set(TEST_API_PASSWORD)
      #@b.send_keys :enter
      @b.div(:id, "login-confirm-button").click
    rescue => e
  end

  it "should be able to filter on a api_user" do
    do_login
    @b.div(:id => "USERS-container").div(:class => "box-item user-item").wait_until_present
    @b.div(:id => "USERS-container").text_field(:placeholder => "Search").set("god")
    expect(@b.div(:id => "USERS-container").div(:class => "box-item-label").text).to eq("god")
  end

  it "should be able to click on a api_user" do
    do_login
    @b.div(:id => "USERS-container").div(:class => "box-item user-item").wait_until_present
    @b.div(:id => "USERS-container").text_field(:placeholder => "Search").set("god")
    @b.div(:id => "USERS-container").div(:class => "box-item-label").click
    @b.text_field(:name => "username").wait_until_present
    expect(@b.text_field(:name => "username").value).to eq("god")
  end

  it "should be possible to open create popup" do
    do_login
    @b.div(:id => "USERS-container").div(:class => "box-item user-item").wait_until_present
    @b.div(:id => "USERS-container").div(:class => "create-boxitem-button").click
    @b.div(:class => "popup-box").h2().wait_until_present
    expect(@b.div(:class => "popup-box").h2().text).to eq("Create new user")
  end

  it "should be able to show connections for a api_user" do
    do_login
    @b.div(:id => "USERS-container").div(:class => "box-item user-item").wait_until_present
    @b.div(:id => "USERS-container").text_field(:placeholder => "Search").set("god")
    @b.div(:id => "USERS-container").div(:class => "box-item-label").click
    @b.div(:id => "to-container").div(:class => "role-item").wait_until_present
    @b.div(:id => "to-container").div(:class => "role-item").div(:class => "box-item-label").exist?
  end

  it "should be able to drag a role item and connect to a api_user item" do
    do_login
    @b.div(:id => "USERS-container").div(:class => "box-item user-item").wait_until_present
    @b.div(:id => "USERS-container").text_field(:placeholder => "Search").set("admin_client_testuser")
    @b.div(:id => "USERS-container").div(:class => "box-item-label").click
    @b.div(:id => "to-container").div(:class => "role-item").wait_until_present

    @b.div(:id => "ROLES-container").div(:class => "box-item role-item").wait_until_present
    @b.div(:id => "ROLES-container").text_field(:placeholder => "Search").set("AdminClientLoggedIn")
    @b.div(:id => "ROLES-container").div(:class => "box-item role-item").drag_and_drop_on(@b.div(:id => "to-container"))
  end

end
