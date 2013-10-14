require "sinatra/activerecord/rake"
require './app/server/feedo'

namespace :feedo do
  desc "Update all the feeds. Run this as a cronjob." 
  task :update_feeds do
    Feedo.update_feeds
  end
end