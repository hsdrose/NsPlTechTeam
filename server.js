#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
//
// gINSERT BEGIN
var DEFAULT_IP = '127.0.0.1';    // local host
var DEFAULT_PORT = '5555';
var XML_DOCUMENT_DECLARATION = '<?xml version="1.0" encoding="utf-8"?>\n';
// gINSERT END


/**
 *  Define the sample application.
 */
var gNsPlTechTeamApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        // gINSERT
        if (typeof process.env.IP === "undefined") {
            self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
            self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;}
        // gINSERT BEGIN
            else {
            // c9 environment
            self.ipaddress = process.env.IP;
            self.port      = process.env.PORT;}
        // gINSERT END
        
        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            // gMODIFY BEGIN
            //console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            //self.ipaddress = "127.0.0.1";}
            console.warn('using default IP and PORT: ' + DEFAULT_IP + ':' + DEFAULT_PORT);
            self.ipaddress = DEFAULT_IP;
            // gMODIFY END
            // gINSERT BEGIN
            self.port = DEFAULT_PORT;}
            else {
                console.info('using IP: ' + self.ipaddress + ' and PORT: ' + self.port);}
        // gINSERT END
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./client/index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
        
        /* gINSERT BEGIN */
        self.routes['/calendar/add'] = function(req, res) {
            var varHostDomainUrl = req.protocol + '://' + req.host;
            res.set('Content-Type', 'text/xml');
            if (typeof(req.query.dateStart) === 'undefined' || typeof(req.query.countWeek) === 'undefined')  {
                res.send(XML_DOCUMENT_DECLARATION + "<response>" 
                    + "ERROR: Incorrectly formatted parameters -- see <![CDATA[" 
                    + varHostDomainUrl + "]]> for proper usage.</response>\n");
            }
                else {
                    res.send("https://api.teamup.com/ks69e45ed09a1b4374/events");
                }
/*            if (typeof(req.query.date) === 'undefined' || typeof(req.query.delimiter) === 'undefined') {
                res.send(XML_DOCUMENT_DECLARATION + "<response>" + "ERROR: Incorrectly formatted parameters -- see <![CDATA[" + varHostDomainUrl + "]]> for proper usage.</response>\n");
            }
                else {*/
                    /*var stringArraySource = req.query.string.split(req.query.delimiter);
                    var stringArrayTarget = new Array();*/
                    // if (stringArraySource.length > 0) {
                    //     stringArrayTarget[0] = stringArraySource[0].toLowerCase();
                    //     if (stringArraySource.length > 1) {
                    //         for (var i = 1; i < stringArraySource.length; i++) {
                    //             stringArrayTarget[i] = stringArraySource[i].charAt(0).toUpperCase() + stringArraySource[i].slice(1).toLowerCase();
                    //         }
                    //     }
                    // res.send(XML_DOCUMENT_DECLARATION + "<response>" + stringArrayTarget.join('') + "</response>\n");
/*                    res.send("https://api.teamup.com/ks69e45ed09a1b4374/events" 
                        -XPOST  -H 'Teamup-Token: 52a98a3924b916c35eacce041cb0517ba89da4a48fa219f4cd093442501cdf0e' 
                        -H 'Content-type: application/json' 
                        --data '{"subcalendar_id":1235427, "start_dt":"2015-12-05T16:45:00-0800"
                            , "end_dt":"2015-12-12T17:45:00-0800",  "all_day":false, "rrule": ""
                            , "title": "NsPlTech", "who": "?", "location": ""
                            , "notes":"\u003Cp\u003Eview/modify Calendar: \u003Ca href=\u0022http:\/\/teamup.com\/ks3d24758d31125c97\/\u0022 target=\u0022_blank\u0022 \u003Ehttp:\/\/teamup.com\/ks3d24758d31125c97\/\u003C\/a\u003E\u003C\/p\u003E"}');
                    }*/
                /*}*/
        };
        self.routes['*'] = function(req, res) {
            var varHostDomainUrl = req.protocol + '://' + req.host;
            res.set('Content-Type', 'text/xml');
            // res.send(XML_DOCUMENT_DECLARATION + "<response>" + "ERROR: Cannot GET: <![CDATA[" + req.originalUrl + "]]></response>\n");
           
            // res.send(XML_DOCUMENT_DECLARATION + "<response>" + "<![CDATA[ERROR: Cannot GET " + req.originalUrl + "]]></response>\n");
            //res.send(XML_DOCUMENT_DECLARATION + "<response>" + "<!--ERROR: Cannot GET " + req.path + "--><![CDATA[ERROR: Cannot GET " + req.path + "]]</response>\n");
            res.send(XML_DOCUMENT_DECLARATION + "<response>" + "ERROR: Cannot GET <![CDATA[" + req.path + "]]> -- see <![CDATA[" + varHostDomainUrl + "]]> for proper usage.</response>\n");
        }
        /* gINSERT END */
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        // gMODIFY
        //self.app = express.createServer();
        self.app = express();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  gNsPlTechTeamApp Application.  */



/**
 *  main():  Main code.
 */
var zapp = new gNsPlTechTeamApp();
zapp.initialize();
zapp.start();
