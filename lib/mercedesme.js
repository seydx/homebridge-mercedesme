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
        authorizePath: '/oidc10/auth/oauth/v2/authorize'
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
      
      throw error;
    
    }
    
  }

  async apiCall(vin,endpoint) {
    
    let url = 'https://api.mercedes-benz.com/vehicledata/v1/vehicles/' + vin + '/containers/' + endpoint;
    let hiddenUrl = 'https://api.mercedes-benz.com/vehicledata/v1/vehicles/<VIN>/containers/' + endpoint;
    
    try {
    
      if (this._accessToken) {
        
        debug(this.config.name + ': GET [PENDING] ' + hiddenUrl);
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
        
        debug(this.config.name + ': GET [SUCCESS] ' + hiddenUrl);
        debug(this.config.name + ': GET [RESPONSE] ' + JSON.stringify(response.data));
        
        return response.data;
        
      } else {
      
        throw [this.config.name + ': Not yet logged in!!', endpoint];
        
      }
    
    } catch(err) {
    
      throw [err,endpoint];
    
    }
    
  }
  
  errorHandler(config, error){
    
    let endpoint = error[1];
    error = error[0];
    
    if(error.response && error.response.data){
      debug(this.config.name + ': GET [ERROR] ' + JSON.stringify(error.response.data));
    } else {
      debug(this.config.name + ': GET [ERROR]');
    }
  
    if(error.response && (error.response.status === 401 || error.response.status === 403)){
      return ['It seems that it is not possible anymore to grant access with your stored token! Please remove the storage folder under ' + this.configPath + ', restart the plugin and authorize the plugin again!', endpoint]();
    }
      
    if(error.response && error.response.status === 404){
      return ['Your car does not support this!', endpoint];
    }
      
    if(error.response && (error.response.status === 429 || error.response.status === 500)){
      return ['Received too many requests.', endpoint];
    }
      
    if(error.response && (error.response.status === 503 || error.response.status == 504)){
      return ['Mercedes API currently not available.', endpoint];
    }
    
    if(error.response && error.response.data){
      error = error.response.data;
    }
    
    return [error,endpoint];
  
  }

  async vehicleStatus(vin) {
    
    return this.apiCall(vin,'vehiclestatus');
    
  }
  
  async fuelStatus(vin) {
    
    return this.apiCall(vin,'fuelstatus');
    
  }
  
  async lockStatus(vin) {
    
    return this.apiCall(vin,'vehiclelockstatus');
    
  }
  
  async payDrive(vin) {
   
    return this.apiCall(vin,'payasyoudrive');
    
  }
  
}

module.exports = MercedesMe;