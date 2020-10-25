'use strict';

//express
const express = require('express');
const path = require('path');
const { AuthorizationCode } = require('simple-oauth2');
const debug = require('debug')('MercedesServer'); 
const networkInterfaces = require('os').networkInterfaces();

const meApi = require('../lib/mercedesme.js');

class MeApp {
  
  constructor (platform, config) {
  
    this.platform = platform; 
    this.log = platform.log;
    this.config = config;
    this.configPath = platform.configPath;
    
    return (async () => {
      
      try {
      
        const authenticate = await this.startApp();
        
        return authenticate;
      
      } catch(error) {
      
        throw error;
      
      }
   
    }).call(this);
 
  }
  
  startApp() {
  
    const that = this;
    
    const params = {
      client: {
        id: this.config.clientID,
        secret: this.config.clientSecret
      },
      auth: {
        tokenHost: 'https://id.mercedes-benz.com',
        tokenPath: '/as/token.oauth2',
        authorizePath: '/as/authorization.oauth2'
      }
    };
    
    const redirect_uri = `http://localhost:${this.config.port}/callback`;
    const scopes = 'mb:vehicle:mbdata:vehiclestatus mb:vehicle:mbdata:fuelstatus mb:vehicle:mbdata:vehiclelock mb:vehicle:mbdata:payasyoudrive offline_access';

    const client = new AuthorizationCode(params);
      
    const authorizationUri = client.authorizeURL({       
      redirect_uri: redirect_uri,
      scope: scopes
    });
   
    return new Promise((resolve, reject) => {
    
      if(this.config.remoteAuth && this.config.remoteAuth.active && this.config.remoteAuth.code){   
      
        (async function() {
        
          try {
          
            const options = {
              code: that.config.remoteAuth.code,
              redirect_uri: redirect_uri,
              scope: scopes
            };
                 
            const accessToken = await client.getToken(options);
                 
            that.meApi = new meApi(that.platform, accessToken.token, that.config);           
                  
            resolve(that.meApi);
          
          } catch(error) {
            
            if(error.output && error.output.statusCode === 400)
              debug(that.config.name + ': Authentication failed!');
            
            reject(error.message);
          
          }
          
        })();
      
      } else {
      
        debug(this.config.name + ': Starting server..');
      
        const app = express();  
        
        const getLocalExternalIP = () => [].concat(...Object.values(networkInterfaces))
          .filter(details => details.family === 'IPv4' && !details.internal)
          .pop().address;
  
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'pug');
        app.set('view options', { layout: false });
        app.use(express.static(path.join(__dirname, 'public')));
        
        app.get('/auth', async (req, res) => {     
        
          debug(this.config.name + ': [GET] /auth.html');
          debug(this.config.name + ': [REDIRECT] to ' + authorizationUri);     
        
          res.redirect(authorizationUri);
          
          if(this.config.remoteAuth && this.config.remoteAuth.active && !this.config.remoteAuth.code){
             
            this.log(this.config.name + ': Authentication with CODE active!');
            this.log(this.config.name + ': You should see an url like this one \'http://localhost:' + this.config.port + '/callback?code=1234abcd-12ab-12ab-12ab-123456abcdefg\' in your browser');
            this.log(this.config.name + ': Copy the code after "/callback?code=" and paste it into the field under "Remote Authentication" in your UI and restart Homebridge');
          
          }
          
        });
      
        app.get('/callback', async (req, res) => {
        
          debug(this.config.name + ': [GET] /callback.html');
        
          const { code } = req.query;
          
          const options = {
            code,
            redirect_uri: redirect_uri,
            scope: scopes
          };
      
          try {
          
            debug(this.config.name + ': Generating token..');
          
            const accessToken = await client.getToken(options);
            
            res.render('callback', { accessToken: accessToken.token, path: this.configPath + '/storage'});
            
            this.meApi = new meApi(this.platform, accessToken.token, this.config); 
            
            server.close(function() { debug(that.config.name + ': Closing server!'); });             
            
            resolve(this.meApi);
            
          } catch (error) {
          
            reject(error.message);
            
          }
          
        });
        
        app.get('/', (req, res) => {
        
          debug(this.config.name + ': [GET] /index.html');
        
          res.render('index');
          
        });
        
        const server = app.listen(that.config.port, function() {
        
          that.log(`${that.config.name} listening at http://localhost:${that.config.port} (Remote: http://${getLocalExternalIP()}:${that.config.port})`);
          
        });
      
      }
      
    
    });
    
  }

}

module.exports = MeApp;
