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
        tokenHost: 'https://id.mercedes-benz.com',
        tokenPath: '/as/token.oauth2',
        authorizePath: '/as/authorization.oauth2'
      }
    };
    
    const redirect_uri = config.origin;
    const scopes = 'mb:vehicle:mbdata:vehiclestatus mb:vehicle:mbdata:fuelstatus mb:vehicle:mbdata:evstatus mb:vehicle:mbdata:vehiclelock mb:vehicle:mbdata:payasyoudrive offline_access';

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
      scope: 'mb:vehicle:mbdata:vehiclestatus mb:vehicle:mbdata:fuelstatus mb:vehicle:mbdata:evstatus mb:vehicle:mbdata:vehiclelock mb:vehicle:mbdata:payasyoudrive offline_access'
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
