require "sinatra/activerecord/rake"
require './app/server/feedo'

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