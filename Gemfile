source 'https://rubygems.org'

group :default do
  gem "rails", "4.1.9"
  gem "ocean-rails"
  gem "ocean-dynamo"
  gem 'net-purge'          # For Varnish purges
  gem 'rack-attack'        # HTTP Whitelist/Blacklist and Request Rate Limiter for Rack Applications
  gem 'faraday'            # We use Faraday to make JSON requests
  gem 'faraday_middleware' # Useful for parsing JSON responses, etc.
  gem 'bcrypt'
  gem 'uglifier', '>= 1.3.0'
  gem "nokogiri", "1.6.3.1"
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
