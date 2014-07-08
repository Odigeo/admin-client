# Set up the host and port of the client app being tested 
client_host = ENV["CLIENT_HOST"] || "http://localhost"
client_port = ENV["CLIENT_PORT"] || 3000 

# Setting CLIENT_HOST indicates that you want to test against
# an external server, and therefore not use rails on windows
if ENV["CLIENT_HOST"]
  require "watir-webdriver"
  require "test/unit"
  include Test::Unit::Assertions
else
  ENV["RAILS_ENV"] ||= 'development'
  require File.expand_path("../../config/environment", __FILE__)
  require 'rspec/rails'
  require 'rspec/autorun'
  require 'watir-webdriver'


  # Custom drag_and_drop method for Watir
  module Watir
    class Element
      def drag_and_drop_on(other)
        assert_exists
        driver.action.drag_and_drop(@element, other.wd).perform
      end
    end
  end

  Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}

  RSpec.configure do |config|
    config.infer_base_class_for_anonymous_controllers = false
    config.order = "random"

    # RSpec 3 compatibility
    config.infer_spec_type_from_file_location!
  end

  # Configure Watir
  WatirWebdriverRails.host = client_host
  WatirWebdriverRails.port = client_port
  WatirWebdriverRails.close_browser_after_finish = true
end

# Set up the user and password of the user used to log in to perform the tests
TEST_API_USER = ENV['TEST_API_USER'] || TEST_API_USER

tapw = ENV['TEST_API_PASSWORD'] || TEST_API_PASSWORD
master, staging = tapw.split(',')
tapw = (ENV['GIT_BRANCH'] == 'staging' ? staging : master) if tapw.split(",").size > 1
TEST_API_PASSWORD = tapw
URL = "#{client_host}:#{client_port}"

def setup_browser(uri)
  if RUBY_PLATFORM =~ /linux/
    @headless = Headless.new
    @headless.start
    b = Watir::Browser.start uri
  else
    b = Watir::Browser.new ENV["browser"] || :chrome
    b.goto uri
  end

  # Make sure that window is maximized to not get viewport errors
  screen_width = b.execute_script("return screen.width;")
  screen_height = b.execute_script("return screen.height;")
  b.driver.manage.window.resize_to(screen_width,screen_height)
  b.driver.manage.window.move_to(0,0)
  b
end


def teardown_browser(browser)
  if RUBY_PLATFORM =~ /linux/
    #@headless.take_screenshot "miffo-#{rand(1000000000)}.jpg"
    browser.close
    @headless.destroy
  else
    browser.close
  end
end
