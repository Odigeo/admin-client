# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
AdminClient::Application.initialize!

JS_APPS = %w{start cms users logs test content}
