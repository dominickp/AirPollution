


## Setup
- Install Node
- Clone this repo and navigate to the repo directory in terminal
- Install gulp globally (npm install -g gulp)
- Install bower globally (npm install -g bower)
- Install browserify globally (npm install -g browserify)
- Install local dependencies (npm install)

You should be able to run "gulp". Navigate to http://localhost:8080/ in your browser.

Running gulp does this:
- Build the vendors file (jquery, d3, bootstrap js) into dist/vendors.js
- Build the css file (all CSS) into dist/styles.css
- Build the app file (all of our JS code) into dist/app.js
- Move a copy of src/index.html into dist/html
- Start a live-reload server on http://localhost:8080/. Every time you make any code changes, it will update in this window without you having to refresh.
- Run all tests in Karma and output to the terminal window
- Minify all of the files