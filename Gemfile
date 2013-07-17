source 'https://rubygems.org'

gem 'rails', '4.0.0'
gem "ocean", git: "git://github.com/OceanDev/ocean.git"

gem 'net-purge'          # For Varnish purges
gem 'rack-attack'        # HTTP Whitelist/Blacklist and Request Rate Limiter for Rack Applications
gem 'faraday'            # We use Faraday to make JSON requests
gem 'faraday_middleware' # Useful for parsing JSON responses, etc.

gem 'bcrypt-ruby', :require => 'bcrypt'       # Password hashing, etc

group :test, :development do
  gem "rspec-rails", "~> 2.0"
  gem "simplecov", :require => false
  gem "multi_json",  "~> 1.0"                 # Needed by selenium-webdriver (but not required??)
  gem "selenium-webdriver"
  gem "watir-webdriver-rails"
  gem "ffi", "~> 1.9.0"
  gem "factory_girl_rails", "~> 4.0"
end

gem 'uglifier', '>= 1.3.0'