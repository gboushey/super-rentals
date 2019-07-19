# super-rentals

This repository contains my code for the super-rentals tutorial on the ember website.  I set it up to try a few things out with Ember, such as getting mirage-cli up and running and setting up a rails-api backend.  This is in no way an official implementation and has nothing to do with the Ember site, this is just my notes and code.  I made it public since it might be useful.

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

If you want to run this with the rails backend, 
*checkout super-rentals-api and start the rails app. 
* start the ember app with `ember serve --env=proxy --proxy=http://localhost:3000`

## Blog Notes

This repository was originally accompanied by a blog entry on the UCSF library CKM blog. That's going away, so for now, here's an unformatted copy and paste of that article. Hope to come back and reformat it at some time so it's more legible on git markdown vs wordpress. 

EMBER AND RAILS SCAFFOLDING FOR SIMPLE CRUD
OCTOBER 28, 2015 GEOFF BOUSHEY
Like many developers who use Rails, I haven’t thought about scaffolding for a while, but I found myself wanting something like it when I started looking into Ember as a front end for Rails. As with Rails, my guess is that I won’t use Ember scaffolding for long, but I wanted a way to get that initial Ember application up and running, with Rails as a backend.

It turns out that there are easy to use scaffolding generators for an Ember front end and a Rails API backend, with just a few minor gotchas you need to be aware of when integrating the two.

For this tutorial, we’re going to do the simplest thing possible for a crud app. We will create a single model (User), with one field (name), and we will create a web app with Create, Retrieve, Update, and Delete operations. Ember will supply the front end, Rails will handle the back end.

One quick note – while there are ways to integrate Rails with Ember in the same application, this tutorial will build the Ember frontend out as a completely separate, stand-alone app from the Rails backend. This way, the front end can be integrated with any backend that provides the API that Rails provides.

Here we go…

Part 1 – Create an Ember front end

We’ll create a client side, front end application that provides an interface for CRUD operations.

Step 0 – Install ember and ember-cli.

This will also require installing node, npm. I’m pretty sure you’ll need git as well. I’m not going to cover all this (or the process for installing Ruby or Rails). There are plenty of guides on the web to getting all this installed. Just make sure you can execute the following command

ember -v

I’m using ember 1.13.8, node 0.12.6, and npm 2.13.4 (on Mac OS X).

Step 1 – Create an ember app

ember new ember-crud

Step 2 – Install the ember-cli-scaffold package

cd into ember-crud and run

ember install ember-cli-scaffold

(for more information, see https://www.npmjs.com/package/ember-cli-scaffold)

Step 3 – Generate scaffolding for a Model (User) with one field (Name)

ember generate scaffold user name:string --pod

The “pod” option creates a different organizational structure for your files than the standard ember defaults. I prefer it and will be using it here, but the differences are very minimal.

Step 4 – Verify that your app is working

ember serve

and go to http://localhost:4200/users

You should see a very Rails-ish interface with full CRUD for a user with a single input field, name. Go ahead and create, edit, delete a few to verify that it is all working.

The ember CRUD app is using a local dev storage provided by mirage. In the next step, we’ll swap this out for a Rails backend.

Part 2 – Provide a Rails API for CRUD operations

Ember is already providing the view, so rather than creating a full blown rails app, we will limit the Rails app to providing an API for persistence.

Step 0: Install Ruby and Rails

As with Ember, there are lots of resources on the web for getting Ruby and Rails installed. Make sure that you can run

ruby -v

(I’m using 2.1.0)

and

rails -v

(I’m using Rails 4.2.0. You will need this version or later for Rails to use the rails-api gem, which I believe will be included in Rails 5).

Step 1 – Create a rails API only application

Install the rails-api gem

gem install rails-api

And generate a new Rails application

rails-api new rails-crud

Step 2 – Create an API scaffold for CRUD operations for a User

cd into rails-crud and type

rails-api g scaffold user name:string

While I promised not to go into a lot of detail here, you may notice that no view tier is created, and if you look at the user controller, you’ll see that it is set up for rendering json, not html.

Step 3 – Seed with a bit of data

Technically, you don’t need to do this step, since you’ll populate from your Ember app, but it can help to verify everything is working properly on the Rails side before integrating with your Ember app.

in db/seeds.rb, create something like this

[code language=”ruby”]
user1 = User.create(name: ‘user1’)
user2 = User.create(name: ‘user2’)
[/code]

and run

rake db:migrate
rake db:seeds

Step 4 – Check out the Rails API

run:

rails server

go to localhost:3000/users

and you should see a json representation of the two users you created in the seeds.rb file.

Part 3 – Use the Rails API service as a backend for the Ember application

This is relatively straightforward, though there are a few wrinkles.

Step 1 – Modify the way Rails is rendering JSON for a list of objects

Take another look at the json returned from http://localhost:300/users

[code language=”json”][{"id":1,"name":"user1","created_at":"2015-10-21T22:17:32.778Z","updated_at":"2015-10-21T22:17:32.778Z"},{"id":2,"name":"user2","created_at":"2015-10-21T22:17:32.783Z","updated_at":"2015-10-21T22:17:32.783Z"}]
[/code]

You may notice that Rails has flattened this into a single array. Ember, by default, expects a slightly different formatting where the json array of User objects is stored in a hash with the model type as a key.

One approach to this problem is to use a serializer to establish the format for JSON output from the rails api.

Add the serializer to your Gemfile

gem 'active_model_serializers', '~>; 0.8.3'

and run

bundle update

and create a new serializer for the user model

rails g serializer user

This will create a user_serializer.rb file in app/serializers.

[code language=”ruby”]
class UserSerializer < ActiveModel::Serializer
embed :ids, embed_in_root: true
attributes :id, :name
end
[/code]

This code will format users the way Ember expects it at the defaults, and will include only the id and name that are expected by the Ember model we created earlier (the various Rails additions like created_at or updated_at will not be serialized and sent to Ember as JSON).

NOTE:

I recently tried this with ember-cli 2.11.0, and it looks like the formatting for JSON may have changed since I wrote this. To get this working, I had to create a new file named json_api.rb in the initializers folder containing the following code (per this tutorial from EmberIgniter).

[code language=”ruby”]
ActiveSupport.on_load(:action_controller) do
require ‘active_model_serializers/register_jsonapi_renderer’
end

ActiveModelSerializers.config.adapter = :json_api
[/code]

Once you’ve made these changes, reload http://localhost:3000/users Or go to one of the individual users http://localhost:3000/users/1 You should see the following change to the json representation

{"users":[{"id":1,"name":"user1"},{"id":2,"name":"user2"},{"id":3,"name":"user1"},{"id":4,"name":"user2"}]}

Step 2 – Tell Rails to allow Ember to use the API

For security reasons, Rails by default won’t allow an application running on a different port to access the API. To solve this, add the following to your Gemfile

gem 'rack-cors', :require => 'rack/cors'

And add the following configuration to your Rails config/application.rb file

[code language=”ruby”]
class Application < Rails::Application

config.middleware.use Rack::Cors do
allow do
origins ‘*’
resource ‘*’, headers: :any, methods: [:get, :post, :put, :delete, :options]
end
end
[/code]

and run

bundle update

and restart the rails server

This is the minimal configuration to get this example working – for more information on how to allow cross-origin JSON properly check out the rack-cors documentation at https://github.com/cyu/rack-cors

Step 3 – Point Ember at the Rails API

In your Ember application, open the application.js file in app/user/adapter.js (if you didn’t use the –pod structure, this will be in app/adapters instead). You should see a line

namespace: 'api'

change this to

host: ‘http://localhost:3000’

You will also need to disable mirage so that it won’t intercept Ember communications with the rails app. In the config directory of the ember-crud application, open the environments.js file and add

[code language=”ruby”]
if (environment === ‘development’) {
ENV[’ember-cli-mirage’] = {
enabled: false
};
…
[/code]

Step 4 – Turn off Ember’s cli security policy

Like Rails, ember comes with configuration defaults to protect against cross domain security problems. To get this example running quickly, you can remove this line from package.json in your Ember app.

“ember-cli-content-security-policy”: “0.4.0”,

As with other config options in this tutorial, this is something you’ll want to read about and understand rather than just disabling.

Step 5 – Verify that the changes to the Ember UI are directed to and properly handled by the Rails application

Restart ember by typing

ember serve

(you may need to stop and restart the server if it is still running), and navigate to

http://localhost:4200/users

You should see a list of the users you created in the Rails database seed.

Try adding, editing, or deleting a few users. You can verify the changes at the Rails back end by rendering the list of Users in the database as JSON by going to

localhost:3000/users

Step 6 – Fix the duplicates problem

You may have noticed that when you create a new record, two new items are added to your list – but if you look at the rails service, only one record was persisted and one of the records in the ember list has a null id. If you refresh the page, the record with the null id will disappear.

I’ve been looking around for a real solution to this. If you just want to make the null id record to disappear, you can hack it in the index route:

[code language=”ruby”]
model: function() {
return this.store.find(‘user’, {id: true});
}
[/code]

Postscript

I wrote this as part of my notes on getting up and running on Ember and Rails. I’ve found that if I don’t do these write ups when I’m learning something (figuring I’ll do it later when I understand it all better), there’s a good chance I’ll never do it at all. However, I figured it would be a good idea to run it by a colleague here at the UCSF CKM, Jon Johnson, who has some Ember experience. He said no problem posting his reply:


There are a couple of things you might do a little bit differently, but they aren’t wrong. I’m not sure if its a drop in but https://github.com/fotinakis/jsonapi-serializers looks like a better serializer to use in rails. Active record will work and continue to be supported, but if I were going at this from scratch I would start with that.

For Ember you might want to setup the adapter globally to talk to rails instead of just for the user model. You can do that with `ember g adapter application` It looks like that paragraph might be stuck between these two things as you reference application.js being in the user pod.

Instead of killing mirage in development you could also restart the server in production mode. Thats what we do to talk to the real API. Something like `ember s –env=production` will not go through mirage at all. I’m not sure if that is easier or harder than your way.
