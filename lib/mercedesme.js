'use strict';  

const axios = require('axios');  
const { AuthorizationCode } = require('simple-oauth2'); 
const debug = require('debug')('MercedesApi');                                                                                                                                         'use strict';

const EXPIRATION_WINDOW_IN_SECONDS = 300;

class MercedesMe {

  constructor(platform, accessToken, config) {  
  
    this.log = platform.log;
    this.config = config;  
    this.storage = platform.storage; 
    this.configPath = platform.configPath;     
    
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
      
    const client = new AuthorizationCode(params); 
    
    if(accessToken.token)
      accessToken = accessToken.token;          
          
    this._accessToken = client.createToken(accessToken);
    
    this.log(this.config.name + ': API successfull initialized');
    
    if(this._accessToken.token && this._accessToken.token.token){
      this._accessToken.token = this._accessToken.token.token;
      this._accessToken.token.expires_at = new Date(this._accessToken.token.expires_at);
    }
    
  }

  async _refreshToken() {
  
    try {
    
      let { token } = this._accessToken;
      
      const expirationTimeInSeconds = token.expires_at.getTime() / 1000;
      const expirationWindowStart = expirationTimeInSeconds - EXPIRATION_WINDOW_IN_SECONDS;
  
      // If the start of the window has passed, refresh the token
      const nowInSeconds = (new Date()).getTime() / 1000;
      const shouldRefresh = nowInSeconds >= expirationWindowStart;
      
      if (shouldRefresh) {
      
        debug(this.config.name + ': Token expired. Refreshing..');
        
        this._accessToken = await this._accessToken.refresh();
        
        debug(this.config.name + ': Token successfull refreshed! Storing refreshed token..');
        
        await this.storage.setItem(this.config.name, { token: this._accessToken.token });
        
        return this._accessToken;
          
      } else {
      
        return this._accessToken;
        
      }
    
    } catch(error) {
    
      debug(this.config.name + ': An error occured during refreshing token!');
      
      console.log(error);
      
      throw error;
    
    }
    
  }

  async apiCall(url) {
  
    try {
    
      if (this._accessToken) {
        
        debug(this.config.name + ': GET [PENDING] ' + url);
      
        await this._refreshToken();
        
        let config = {
          url: url,
          method: 'GET',
          headers: {
            'authorization': 'Bearer ' + this._accessToken.token.access_token,
            'accept': 'application/json'
          }
        };
        
        let response = await axios(config);
        
        debug(this.config.name + ': GET [SUCCESS] ' + url);
        debug(this.config.name + ': GET [RESPONSE] ' + JSON.stringify(response.data));
        
        return response.data;
        
      } else {
      
        throw (this.config.name + ': Not yet logged in');
        
      }
    
    } catch(err) {
    
      debug(this.config.name + ': An error occured during calling the API!');
       
      throw err;
    
    }
    
  }
  
  errorHandler(config, source, error){
  
    if(error.response && (error.response.status === 401 || error.response.status === 403)){
      debug(error.response.data);
      return (source + ': It seems that is not possible anymore to grant access with your stored token! Please remove the storage folder under ' + this.configPath + ', restart the plugin and authorize the plugin again!');
    }
      
    if(error.response && error.response.status === 404){
      debug(error.response.data);
      return (source + ': Your car does not support this!');
    }
      
    if(error.response && (error.response.status === 429 || error.response.status === 500)){
      debug(error.response.data);
      return (source + ': Received too many request. Try later again!');
    }
      
    if(error.response && (error.response.status === 503 || error.response.status == 504)){
      debug(error.response.data);
      return (source + ': Mercedes API currently not available. Try later again!');
    }
    
    if(error.response && error.response.data)
      error = error.response.data;
    
    return error;
  
  }

  async vehicleStatus(vin) {
    
    return this.apiCall('https://api.mercedes-benz.com/vehicledata/v1/vehicles/' + vin + '/containers/vehiclestatus');
    
  }
  
  async fuelStatus(vin) {
    
    return this.apiCall('https://api.mercedes-benz.com/vehicledata/v1/vehicles/' + vin + '/containers/fuelstatus');
    
  }
  
  async lockStatus(vin) {
    
    return this.apiCall('https://api.mercedes-benz.com/vehicledata/v1/vehicles/' + vin + '/containers/vehiclelockstatus');
    
  }
  
  async payDrive(vin) {
   
    return this.apiCall('https://api.mercedes-benz.com/vehicledata/v1/vehicles/' + vin + '/containers/payasyoudrive');
    
  }
  
}

module.exports = MercedesMe;