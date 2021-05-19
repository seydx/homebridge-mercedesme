'use strict';

const Logger = require('./logger.js');

const axios = require('axios');
const { AuthorizationCode } = require('simple-oauth2');
const fs = require('fs-extra');

const EXPIRATION_WINDOW_IN_SECONDS = 300;

class MercedesMe {
  constructor(accessory, api) {
    this.accessory = accessory;
    this.api = api;

    const params = {
      client: {
        id: this.accessory.context.config.clientID,
        secret: this.accessory.context.config.clientSecret,
      },
      auth: {
        tokenHost: 'https://id.mercedes-benz.com',
        tokenPath: '/as/token.oauth2',
        authorizePath: '/as/authorization.oauth2',
      },
    };

    const client = new AuthorizationCode(params);

    this._accessToken = client.createToken(this.accessory.context.config.token);

    Logger.info('API successfull initialized', this.accessory.displayName);
  }

  async syncConfig(token) {
    try {
      const configJSON = await fs.readJson(this.api.user.storagePath() + '/config.json');

      for (const i in configJSON.platforms)
        if (configJSON.platforms[i].platform === 'MercedesPlatform')
          for (const car in configJSON.platforms[i].cars)
            if (configJSON.platforms[i].cars[car].name === this.accessory.displayName)
              configJSON.platforms[i].cars[car].token = token;

      fs.writeJsonSync(this.api.user.storagePath() + '/config.json', configJSON, { spaces: 4 });

      Logger.info('Refreshed token stored in config', this.accessory.displayName);
    } catch (err) {
      Logger.error('Error storing token in config!', this.accessory.displayName);
      Logger.error(err);

      Logger.warn('Please add manually the following token information into your config.json !');
      Logger.warn(token);
    }

    return;
  }

  async _refreshToken() {
    if (this._accessToken.expired(EXPIRATION_WINDOW_IN_SECONDS)) {
      Logger.info('Access Token expired! Refreshing token...', this.accessory.displayName);

      const refreshParams = {
        scope:
          'mb:vehicle:mbdata:vehiclestatus mb:vehicle:mbdata:fuelstatus mb:vehicle:mbdata:evstatus mb:vehicle:mbdata:vehiclelock mb:vehicle:mbdata:payasyoudrive offline_access',
      };

      this._accessToken = await this._accessToken.refresh(refreshParams);

      Logger.info('Access token refreshed!', this.accessory.displayName);

      await this.syncConfig({
        access_token: this._accessToken.token.access_token,
        refresh_token: this._accessToken.token.refresh_token,
        token_type: this._accessToken.token.token_type,
        expires_in: this._accessToken.token.expires_in,
        expires_at: this._accessToken.token.expires_at,
      });
    } else {
      Logger.debug('Access token NOT expired', this.accessory.displayName);
    }

    return;
  }

  async apiCall(vin, endpoint) {
    let url = 'https://api.mercedes-benz.com/vehicledata/v2/vehicles/' + vin + '/containers/' + endpoint;

    let hiddenUrl = 'https://api.mercedes-benz.com/vehicledata/v2/vehicles/<VIN>/containers/' + endpoint;

    if (this._accessToken) {
      Logger.debug('Checking access token for ' + endpoint + ' service.', this.accessory.displayName);

      await this._refreshToken();

      let config = {
        url: url,
        method: 'GET',
        headers: {
          authorization: 'Bearer ' + this._accessToken.token.access_token,
          accept: 'application/json',
        },
      };

      Logger.debug('Get ' + endpoint + ' <pending> ' + hiddenUrl, this.accessory.displayName);

      let response = await axios(config);

      Logger.debug('Get ' + endpoint + ' <success> ' + hiddenUrl, this.accessory.displayName);

      Logger.debug('Get ' + endpoint + ' <response> ' + JSON.stringify(response.data), this.accessory.displayName);

      return response.data;
    } else {
      throw 'Can not fetch API! Not logged in!';
    }
  }

  async vehicleStatus(vin) {
    let response = await this.apiCall(vin, 'vehiclestatus');

    return response;
  }

  async fuelStatus(vin) {
    let response = await this.apiCall(vin, 'fuelstatus');

    return response;
  }

  async electroStatus(vin) {
    let response = await this.apiCall(vin, 'electricvehicle');

    return response;
  }

  async lockStatus(vin) {
    let response = await this.apiCall(vin, 'vehiclelockstatus');

    return response;
  }

  async payDrive(vin) {
    let response = await this.apiCall(vin, 'payasyoudrive');

    return response;
  }
}

module.exports = MercedesMe;
