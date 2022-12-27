const { HomebridgePluginUiServer } = require('@homebridge/plugin-ui-utils');
const { RequestError } = require('@homebridge/plugin-ui-utils');

const { AuthorizationCode } = require('simple-oauth2');

class UiServer extends HomebridgePluginUiServer {
  constructor () { 

    super();

    this.onRequest('/authCode', this.authCode.bind(this));
    this.onRequest('/authToken', this.authToken.bind(this));
    
    this.client = false;
    
    this.ready();
  }

  async authCode(config){
  
    this.client = false;

    const params = {
      client: {
        id: config.clientID,
        secret: config.clientSecret
      },
      auth: {
        tokenHost: 'https://ssoalpha.dvb.corpinter.net',
        tokenPath: '/v1/token',
        authorizePath: '/v1/auth'
      }
    };
    
    const redirect_uri = config.origin;
    const scopes = 'openid offline_access mb:vehicle:mbdata:vehiclestatus mb:vehicle:mbdata:fuelstatus mb:vehicle:mbdata:evstatus mb:vehicle:mbdata:vehiclelock mb:vehicle:mbdata:payasyoudrive';

    this.client = new AuthorizationCode(params);
    
    const authorizationUri = this.client.authorizeURL({       
      redirect_uri: redirect_uri,
      scope: scopes
    });
    
    return authorizationUri;
  
  }
  
  async authToken(config){
  
    const code = config.autherization_code;

    const options = {
      code,
      redirect_uri: config.origin,
      scope: 'openid offline_access mb:vehicle:mbdata:vehiclestatus mb:vehicle:mbdata:fuelstatus mb:vehicle:mbdata:evstatus mb:vehicle:mbdata:vehiclelock mb:vehicle:mbdata:payasyoudrive'
    };
    
    try {
    
      const accessToken = await this.client.getToken(options);    
      
      return accessToken;
      
    } catch (err) {
    
      throw new RequestError(err.message);
      
    }
  
  }

}

(() => {
  return new UiServer;
})();
