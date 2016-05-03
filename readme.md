# The Air We Breath
An exploration of air pollution, its health impacts, and what can be done about it. Please see the project book for more details.

## Class Requirements

### Process Book
- dist/pb_index.html
- http://www.theairwebreathe.org/pb_index.html

### Project URL
- http://www.theairwebreathe.org

### Screencast
- https://youtu.be/aIs5KUbGPaE

## Setup
We're using some build automation tools with our project. To build the application yourself, you'll need to follow the steps below. Otherwise, you can view the final site at our project URL.

- Install Node
- Clone this repo and navigate to the repo directory in terminal
- Install gulp globally (npm install -g gulp)
- Install bower globally (npm install -g bower)
- Install browserify globally (npm install -g browserify)
- Install local dependencies (npm install)
- Run bower (bower install)
- Run Gulp (gulp)

You should be able to run "gulp". Navigate to http://localhost:8080/ in your browser.

Running gulp does this:
- Build the vendors file (jquery, d3, bootstrap js) into dist/vendors.js
- Build the css file (all CSS) into dist/styles.css
- Build the app file (all of our JS code) into dist/app.js
- Move a copy of src/index.html into dist/html
- Start a live-reload server on http://localhost:8080/. Every time you make any code changes, it will update in this window without you having to refresh.
- Run all tests in Karma and output to the terminal window
- Minify all of the files
