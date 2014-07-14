source 'https://rubygems.org'

group :default do
  gem "rails", "~> 4.0.0"
  gem "ocean-rails", ">= 2.11.2 "
  gem "ocean-dynamo", ">= 0.3.1"
  gem 'net-purge'          # For Varnish purges
  gem 'rack-attack'        # HTTP Whitelist/Blacklist and Request Rate Limiter for Rack Applications
  gem 'faraday'            # We use Faraday to make JSON requests
  gem 'faraday_middleware' # Useful for parsing JSON responses, etc.
  gem 'bcrypt'
  gem 'uglifier', '>= 1.3.0'
  gem 'oj'
end 

group :test, :development do
  gem "rspec-rails", "~> 2.0"
  gem "simplecov", :require => false
  gem "selenium-webdriver"
  gem "watir-webdriver-rails"
  gem "ffi"
  gem "factory_girl_rails", "~> 4.0"
end

group :windows do
  gem "ffi"
  gem "selenium-webdriver"
  gem "watir-webdriver"
  gem "rspec"
  gem "rake"
end
