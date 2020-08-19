'use strict';

//express
const express = require('express');
const path = require('path');
const { AuthorizationCode } = require('simple-oauth2');
const debug = require('debug')('MercedesServer'); 

const meApi = require('../lib/mercedesme.js');

class MeApp {
  
  constructor (platform, config) {
  
    this.platform = platform; 
    this.log = platform.log;
    this.config = config;
    this.configPath = platform.configPath;
    
    return (async () => {
      
      try {
      
        debug(this.config.name + ': Starting server..');
      
        const authenticate = await this.startApp();
        
        return authenticate;
      
      } catch(error) {
      
        debug(this.config.name + ': An error occured during starting server!');
      
        throw error;
      
      }
   
    }).call(this);
 
  }
  
  startApp() {
  
    const that = this;
   
    return new Promise((resolve, reject) => {
    
      const app = express();
    
      const params = {
        client: {
          id: this.config.clientID,
          secret: this.config.clientSecret
        },
        auth: {
          tokenHost: 'https://api.secure.mercedes-benz.com',
          tokenPath: '/oidc10/auth/oauth/v2/token',
          authorizePath: '/oidc10/auth/oauth/v2/authorize',
        }
      };
      
      const redirect_uri = `http://localhost:${this.config.port}/callback`;
      const scopes = 'mb:vehicle:mbdata:vehiclestatus';

      app.set('views', path.join(__dirname, 'views'));
      app.set('view engine', 'pug');
      app.set('view options', { layout: false });
      app.use(express.static(path.join(__dirname, 'public')));
    
      const client = new AuthorizationCode(params);
    
      const authorizationUri = client.authorizeURL({       
        redirect_uri: redirect_uri,
        scope: scopes,
        state: 'getToken'
      });
      
      app.get('/auth', (req, res) => {
      
        debug(this.config.name + ': GET auth.html');
        debug(this.config.name + ': Redirect to ' + authorizationUri);
      
        res.redirect(authorizationUri);
        
      });
    
      app.get('/callback', async (req, res) => {
      
        debug(this.config.name + ': GET callback.html');
      
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
        
          debug(this.config.name + ': An error occured during generating token!');
        
          reject(error.message);
          
        }
      });
      
      app.get('/', (req, res) => {
      
        debug(this.config.name + ': GET index.html');
      
        res.render('index');
        
      });
      
      const server = app.listen(that.config.port, function() {
      
        that.log(`${that.config.name} listening at http://localhost:${that.config.port}`);
        
      });
      
    
    });
    
  }

}

module.exports = MeApp;