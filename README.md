# Getting Started
1. Clone the repo  
`git clone http://git.dominitech.com/lee/inkskill-koa.git ./inkskill-koa`  
2. Make sure your node version is v8.1 and above  
`node -v`  
3. Install dependencies  
`yarn install`  
4. Make sure you have mongodb installed and running on the port specified in .env file   
5. Make sure you have [ffmpeg](http://www.ffmpeg.org/download.htm) [installed](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/wiki) on your system
5. Copy _example.env_ file to _.env_ and fill it  
6. Run the app  
`yarn dev`  (linux environments)
`yarn windev`  (windows environments)

# Deployment
Deployment is automatic when you commit to staging or master. with the following exceptions:
1. When pushing staging, no database update is performed (development in progress) 
2. After pushing, there is one manual step to run on the server:
   - Staging: run `pm2 restart InkControl-stage` as root
   - Master: run `pm2 restart InkControl` as root

(Give the automatic system a couple of minutes to deploy before running the command)

# Configuring
A _.env_ file is used for general configuration. There is a example file named _example.env_ in the repository that can be used as a starting point.
The current example file is good for development environment.

Parameters are pretty self explanatory, just make sure to correctly configure mongo port and database name. 

# Seeding data
After a new install, mongo database can be populate with test data using seeding system (database defined in _.env_ must exist on mongo before seeding it).

Running `yarn seed-dev` (`yarn seed-windev` on windows) will create enough data for development environment.
 
# Possible issues
## Get 5xx HTTP error while seeding
Sometimes [images mocking service](http://unsplash.it) is unavailable and it can lead to 
some 5xx HTTP errors. Just try to run seed again in 1-2 minutes. 
