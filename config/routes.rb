AdminClient::Application.routes.draw do

  get "/alive" => "alive#index"

  match '/javascripts/.config/config.js' => "js_file#index",
    :via => :get

  match ':js_app_name' => 'landing_page#index', 
    :via => :get

  root :to => 'landing_page#index', 
  	:defaults => { :js_app_name => 'start' }, 
    :via => :get

end
