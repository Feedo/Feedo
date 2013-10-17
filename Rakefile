APP_FILE  = 'feedo.rb'
APP_CLASS = 'Feedo'

require "sinatra/activerecord/rake"
require './feedo'
require 'sinatra/assetpack/rake'

task(:environment) do
  env = ENV["RACK_ENV"] ? ENV["RACK_ENV"] : "development"
  ActiveRecord::Base.establish_connection(YAML::load_file('config/database.yml')[env])
end

namespace :feedo do
  desc "Update all the feeds. Run this as a cronjob." 
  task :update_feeds do
    Feedo.update_feeds
  end
end

namespace :assets do
  desc "Precompile CSS and JS into public folder."
  task :precompile do
    Rake::Task["assetpack:build"].reenable
    Rake::Task["assetpack:build"].invoke
  end
end