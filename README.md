Getting started locally
-----------------------

    $ bundle install

Edit `config/database.yml` and then set up the database

    $ rake db:setup

Add some Pusher credentials in `config/initializers/pusher.rb`

Start the server

    $ rails s

Visit <http://localhost:3000/> in two browsers and start chatting.

### Debugging

If something isn't working it's most likely the Pusher credentials:

* Take a look at the Rails log for any Pusher errors
* Enable javascript debugging on line 20 of `app/assets/javascripts/chat.js`
