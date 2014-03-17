# -*- encoding: utf-8 -*-
# stub: ocean-rails 2.6.2 ruby lib

Gem::Specification.new do |s|
  s.name = "ocean-rails"
  s.version = "2.6.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Peter Bengtson"]
  s.date = "2014-03-16"
  s.description = "== Ocean\n\nOcean is an architecture for creating server-oriented architectures (SOAs) in the cloud. \nIt consists of two separate parts which can be used separately or in conjunction: Ocean and OceanFront.\n\nOcean is a complete and very scalable back end solution for RESTful JSON web services and web applications, \nfeaturing aggressive caching and full HTTP client abstraction. Ocean fully implements HATEOAS principles, \nallowing the programming object model to move fully out onto the net, while maintaining a very high degree \nof decoupling.\n\nOcean is also a development, staging and deployment pipeline featuring continuous integration and testing in a \nTDD and/or BDD environment. Ocean can be used for continuous deployment or for scheduled releases. Front end tests \nare run in parallel using a matrix of operating systems and browser types. The pipeline can very easily be extended \nwith new development branches and quality assurance environments with automatic testing and deployment.\n\nOceanFront is a cross-platform Javascript front end browser client library supporting all major browsers and \nplatforms. OceanFront is object oriented, widget-based and HTML-less.\n\nTogether, Ocean and OceanFront allow you to write front end code completely independent of browser type and client \nOS, and back end code completely agnostic of whether it is called by a client browser or another server system."
  s.email = ["peter@peterbengtson.com"]
  s.files = ["MIT-LICENSE", "README.rdoc", "Rakefile", "app/controllers", "app/controllers/alive_controller.rb", "app/controllers/errors_controller.rb", "app/helpers", "app/helpers/application_helper.rb", "app/models", "app/views", "config/initializers", "config/initializers/api_constants.rb", "config/initializers/aws_config.rb", "config/initializers/ocean_constants.rb", "config/initializers/zeromq_logger.rb", "config/routes.rb", "lib/generators", "lib/generators/ocean_scaffold", "lib/generators/ocean_scaffold/USAGE", "lib/generators/ocean_scaffold/ocean_scaffold_generator.rb", "lib/generators/ocean_scaffold/templates", "lib/generators/ocean_scaffold/templates/controller_specs", "lib/generators/ocean_scaffold/templates/controller_specs/create_spec.rb", "lib/generators/ocean_scaffold/templates/controller_specs/delete_spec.rb", "lib/generators/ocean_scaffold/templates/controller_specs/index_spec.rb", "lib/generators/ocean_scaffold/templates/controller_specs/show_spec.rb", "lib/generators/ocean_scaffold/templates/controller_specs/update_spec.rb", "lib/generators/ocean_scaffold/templates/model_spec.rb", "lib/generators/ocean_scaffold/templates/resource_routing_spec.rb", "lib/generators/ocean_scaffold/templates/view_specs", "lib/generators/ocean_scaffold/templates/view_specs/_resource_spec.rb", "lib/generators/ocean_scaffold/templates/views", "lib/generators/ocean_scaffold/templates/views/_resource.json.jbuilder", "lib/generators/ocean_setup", "lib/generators/ocean_setup/USAGE", "lib/generators/ocean_setup/ocean_setup_generator.rb", "lib/generators/ocean_setup/templates", "lib/generators/ocean_setup/templates/Gemfile", "lib/generators/ocean_setup/templates/application_controller.rb", "lib/generators/ocean_setup/templates/application_helper.rb", "lib/generators/ocean_setup/templates/aws.yml.example", "lib/generators/ocean_setup/templates/config.yml.example", "lib/generators/ocean_setup/templates/gitignore", "lib/generators/ocean_setup/templates/hyperlinks.rb", "lib/generators/ocean_setup/templates/routes.rb", "lib/generators/ocean_setup/templates/spec_helper.rb", "lib/ocean", "lib/ocean-rails.rb", "lib/ocean/api.rb", "lib/ocean/api_resource.rb", "lib/ocean/engine.rb", "lib/ocean/flooding.rb", "lib/ocean/ocean_application_controller.rb", "lib/ocean/ocean_resource_controller.rb", "lib/ocean/ocean_resource_model.rb", "lib/ocean/selective_rack_logger.rb", "lib/ocean/version.rb", "lib/ocean/zero_log.rb", "lib/ocean/zeromq_logger.rb", "lib/tasks", "lib/tasks/ocean_tasks.rake", "lib/templates", "lib/templates/rails", "lib/templates/rails/scaffold_controller", "lib/templates/rails/scaffold_controller/controller.rb"]
  s.homepage = "https://github.com/OceanDev/ocean-rails"
  s.licenses = ["MIT"]
  s.required_ruby_version = Gem::Requirement.new("~> 2")
  s.rubygems_version = "2.2.1"
  s.summary = "This gem implements common Ocean behaviour for Ruby and Ruby on Rails."

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<typhoeus>, [">= 0"])
      s.add_runtime_dependency(%q<net-purge>, [">= 0"])
      s.add_runtime_dependency(%q<ffi>, ["= 1.9.0"])
      s.add_runtime_dependency(%q<ffi-rzmq>, ["~> 1.0"])
      s.add_runtime_dependency(%q<rack-attack>, [">= 0"])
      s.add_runtime_dependency(%q<jbuilder>, [">= 0"])
      s.add_runtime_dependency(%q<rails-patch-json-encode>, [">= 0"])
      s.add_runtime_dependency(%q<oj>, [">= 0"])
      s.add_runtime_dependency(%q<ocean-dynamo>, [">= 0.5.7"])
      s.add_development_dependency(%q<rails>, ["~> 4.0"])
      s.add_development_dependency(%q<sqlite3>, [">= 0"])
      s.add_development_dependency(%q<rspec-rails>, [">= 0"])
      s.add_development_dependency(%q<webmock>, [">= 0"])
      s.add_development_dependency(%q<simplecov>, [">= 0"])
      s.add_development_dependency(%q<factory_girl_rails>, ["~> 4.0"])
    else
      s.add_dependency(%q<typhoeus>, [">= 0"])
      s.add_dependency(%q<net-purge>, [">= 0"])
      s.add_dependency(%q<ffi>, ["= 1.9.0"])
      s.add_dependency(%q<ffi-rzmq>, ["~> 1.0"])
      s.add_dependency(%q<rack-attack>, [">= 0"])
      s.add_dependency(%q<jbuilder>, [">= 0"])
      s.add_dependency(%q<rails-patch-json-encode>, [">= 0"])
      s.add_dependency(%q<oj>, [">= 0"])
      s.add_dependency(%q<ocean-dynamo>, [">= 0.5.7"])
      s.add_dependency(%q<rails>, ["~> 4.0"])
      s.add_dependency(%q<sqlite3>, [">= 0"])
      s.add_dependency(%q<rspec-rails>, [">= 0"])
      s.add_dependency(%q<webmock>, [">= 0"])
      s.add_dependency(%q<simplecov>, [">= 0"])
      s.add_dependency(%q<factory_girl_rails>, ["~> 4.0"])
    end
  else
    s.add_dependency(%q<typhoeus>, [">= 0"])
    s.add_dependency(%q<net-purge>, [">= 0"])
    s.add_dependency(%q<ffi>, ["= 1.9.0"])
    s.add_dependency(%q<ffi-rzmq>, ["~> 1.0"])
    s.add_dependency(%q<rack-attack>, [">= 0"])
    s.add_dependency(%q<jbuilder>, [">= 0"])
    s.add_dependency(%q<rails-patch-json-encode>, [">= 0"])
    s.add_dependency(%q<oj>, [">= 0"])
    s.add_dependency(%q<ocean-dynamo>, [">= 0.5.7"])
    s.add_dependency(%q<rails>, ["~> 4.0"])
    s.add_dependency(%q<sqlite3>, [">= 0"])
    s.add_dependency(%q<rspec-rails>, [">= 0"])
    s.add_dependency(%q<webmock>, [">= 0"])
    s.add_dependency(%q<simplecov>, [">= 0"])
    s.add_dependency(%q<factory_girl_rails>, ["~> 4.0"])
  end
end
