# Installation

### react:
react: `npm install`

nodejs: `cd nodejs` then `npm install`

# Troubleshooting
If you encounter errors with nodemon:

Fixes:

Windows: Install it globally using `npm install -g nodemon`

Ubuntu: Install with sudo and save as development package `sudo npm install nodemon --save-dev`

# Run server
react: `npm start`

nodejs: `cd nodejs` then `nodemon server`

# Cloud database
--Set up-- ( Ignore if you have done this)
* Install mongoDBshell
* Add your mongosh's download directory /bin to your $PATH variable
-----------------------------------------------------------------
-- Access --
Paste this to mongoshell to connect: mongosh "mongodb+srv://cluster0.lvi8f.mongodb.net/myFirstDatabase" --username no-name-member 
enter password: Member0Name
Url to config within project: mongodb+srv://no-name-member:Member0Name@cluster0.lvi8f.mongodb.net/<OurDatabaseName>
