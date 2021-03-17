'use strict';

const Logger = require('./helper/logger.js');
const packageFile = require('../package.json');

//Accessories
const carAccessory = require('./accessories/accessory.js');

const PLUGIN_NAME = 'homebridge-mercedesme';
const PLATFORM_NAME  = 'MercedesPlatform';

var Accessory, UUIDGen;

module.exports = function (homebridge) {

  Accessory = homebridge.platformAccessory;
  UUIDGen = homebridge.hap.uuid;
  
  return MercedesPlatform;

};

function MercedesPlatform (log, config, api) {
  
  if (!api||!config) 
    return;
    
  Logger.init(log, config.debug); 
  
  this.api = api;
  this.accessories = [];
  this.config = config;
  
  this.devices = new Map();

  if(this.config.cars && this.config.cars.length) {
  
    this.config.cars.forEach(car => {
    
      let error = false;

      if (!car.name) {
        Logger.warn('One of the cars has no name configured. This car will be skipped.');
        error = true;
      } else if (!car.clientID) {
        Logger.warn('There is no clientID configured for this car. This car will be skipped.', car.name);
        error = true;
      } else if (!car.clientSecret) {
        Logger.warn('There is no clientSecret configured for this car. This car will be skipped.', car.name);
        error = true;
      } else if (!car.vin) {
        Logger.warn('There is no VIN configured for this car. This car will be skipped.', car.name);
        error = true;
      } else if (!car.token || (car.token && !car.token.access_token)) {
        Logger.warn('There is no access token configured for this car. This car will be skipped.', car.name);
        error = true;
      } else if (!car.token || (car.token && !car.token.refresh_token)) {
        Logger.warn('There is no refresh token configured for this car. This car will be skipped.', car.name);
        error = true;
      }

      if (!error) {
      
        const uuid = UUIDGen.generate(car.name);
        
        if (this.devices.has(uuid)) {
     
          Logger.warn('Multiple cars are configured with this name. Duplicate cars will be skipped.', car.name);
     
        } else {

          car.electricVehicle = car.hybridVehicle
            ? false
            : car.electricVehicle;
          car.polling = Number.isInteger(car.polling) 
            ?  car.polling < 60 
              ? 60 * 1000 
              : car.polling * 1000
            :  60 * 1000;
          
          this.devices.set(uuid, car);
          
        }
    
      }
      
    });
    
  }
  
  this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this));
}

MercedesPlatform.prototype = {

  didFinishLaunching: async function(){

    for (const entry of this.devices.entries()) {
    
      let uuid = entry[0];
      let device = entry[1];
      
      const cachedAccessory = this.accessories.find(curAcc => curAcc.UUID === uuid);
      
      if (!cachedAccessory) {
      
        const accessory = new Accessory(device.name, uuid);

        Logger.info('Configuring accessory...', accessory.displayName); 
        
        this.setupAccessory(accessory, device);
        
        Logger.info('Configured!', accessory.displayName);
        
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        
        this.accessories.push(accessory);
        
      }
      
    }

    this.accessories.forEach(accessory => {
    
      const device = this.devices.get(accessory.UUID);
      
      try {
      
        if (!device)
          this.removeAccessory(accessory);
    
      } catch(err) {

        Logger.info('It looks like the device has already been removed. Skip removing.');
        Logger.debug(err);
     
      }
      
    });
  
  },
  
  setupAccessory: async function(accessory, device){
    
    accessory.on('identify', () => {
      Logger.info('Identify requested.', accessory.displayName);
    });
    
    const manufacturer = device.manufacturer 
      ? device.manufacturer 
      : 'Mercedes';
      
    const model = device.model
      ? device.model 
      : 'Car';
    
    const serialNumber = device.vin;
    
    const AccessoryInformation = accessory.getService(this.api.hap.Service.AccessoryInformation);
    
    AccessoryInformation
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, manufacturer)
      .setCharacteristic(this.api.hap.Characteristic.Model, model)
      .setCharacteristic(this.api.hap.Characteristic.SerialNumber, serialNumber)
      .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, packageFile.version);
    
    accessory.context.config = device;
    
    new carAccessory(this.api, accessory);
    
    return;

  },

  configureAccessory: async function(accessory){

    const device = this.devices.get(accessory.UUID);

    if (device){
      Logger.info('Configuring accessory...', accessory.displayName);                                                                                            
      this.setupAccessory(accessory, device);
    }
    
    this.accessories.push(accessory);
  
  },
  
  removeAccessory: function(accessory) {
  
    Logger.info('Removing accessory...', accessory.displayName);
    
    let accessories = this.accessories.map( cachedAccessory => {
      if(cachedAccessory.displayName !== accessory.displayName){
        return cachedAccessory;
      }
    });
    
    this.accessories = accessories.filter(function (el) {
      return el != null;
    });

    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
  
  }

};
