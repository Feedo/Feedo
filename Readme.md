#Feedo
Feedo is a pretty simple Feedreader that is currently being developed by two german students.
##but how?
So what is essential for Feedo is the ability to update the feeds. There are 3 ways to handle this:
1. Manually update the FeedItems by calling "/update_feeds". This will be used in the webinterface later on.
2. Execute the rake-task "feedo:update_feeds". Good for Herokus cron. Or every other cron.
3. Use Feedos integrated scheduler. This won't work on services like heroku because there, the web-processes will get killed after some time. But this should work well on your own server.
To start Feedo, simply run "rackup -E production" after having called "bundle install".
To disable the integrated scheduler, set "use_internal_scheduler" in config/feedo.yml to false. There you can also set the interval of the internal scheduler.
You will also need to configure your db in config/database.yml. This uses ActiveRecord so look at it's docs for a guide to configure this file.