'use strict';

const storage = require('node-persist');
const debug = require('debug')('MercedesPlatform'); 

const meApp = require('../app/app.js');
const meApi = require('../lib/mercedesme.js');
const packageFile = require('../package.json');

const batteryService = require('./accessories/batteryService.js');
const lightbulbService = require('./accessories/lightbulbService.js');
const lockService = require('./accessories/lockService.js');
const windowService = require('./accessories/windowService.js');

const pluginName = 'homebridge-mercedesme';
const platformName = 'MercedesPlatform';

var Accessory, Service, Characteristic, UUIDGen;

module.exports = function (homebridge) {

  Accessory = homebridge.platformAccessory;
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  UUIDGen = homebridge.hap.uuid;
  
  return MercedesPlatform;

};

function MercedesPlatform (log, config, api) {
  
  if (!api||!config) 
    return;
  
  if(config.cars && config.cars.length)
    for(const car in config.cars)
      if(!config.cars[car].name||!config.cars[car].clientID||!config.cars[car].clientSecret||!config.cars[car].vin||!config.cars[car].port){ 
        log('No or incorrect config.json!');
        return;
      }       
  
  this.log = log;  
  this.accessories = [];
  this.config = config;
  this.config.polling = config.polling * 1000 || 60000;
  this.config.cars = config.cars || [];
  
  if(this.config.polling < 60000)
    this.config.polling = 60000;

  this.configPath = api.user.storagePath();
  
  this.storage = storage.create({dir: this.configPath + '/storage', forgiveParseErrors: true});
  
  if (api) {
  
    this.log('**************************************************************');
    this.log('MercedesPlatform v'+packageFile.version+' by SeydX');
    this.log('GitHub: https://github.com/SeydX/'+pluginName);
    this.log('Email: seyd55@outlook.de');
    this.log('**************************************************************');
    
    this.api = api;
    
    this.api.on('didFinishLaunching', this.checkConfigAccesorries.bind(this));
  
  }
}

MercedesPlatform.prototype = {
  
  checkConfigAccesorries: function(){
  
    for(const accessory in this.accessories){
        
      let inConfig = false;
        
      for(const car in this.config.cars)   
        if(this.accessories[accessory].displayName === this.config.cars[car].name)   
          inConfig = true;
        
      if(!inConfig)
        this.removeAccessory(this.accessories[accessory]);
          
    }
    
    this.init();
    
  },

  init: async function(){
  
    try {
    
      await this.storage.init();
      
      for(const car in this.config.cars){                 
      
        let accessToken = await this.storage.getItem(this.config.cars[car].name);
        
        if(!accessToken){
        
          this.log(this.config.cars[car].name + ': Initializing API with given credentials for ' + this.config.cars[car].name);         
                
          this.meApi = await new meApp(this, this.config.cars[car]);
            
          await this.storage.setItem(this.config.cars[car].name, { token: this.meApi._accessToken.token });
            
          this.log(this.config.cars[car].name + ': Token stored for further access');
          
        }
        
        let inAccessories = false;
        
        for(const accessory in this.accessories)
          if(this.config.cars[car].name === this.accessories[accessory].displayName)
            inAccessories = true;
            
        if(!inAccessories && accessToken){
          
          this.log(this.config.cars[car].name + ': Initializing API with stored token..');          
          this.meApi = new meApi(this, accessToken, this.config.cars[car]);   
          
        }
        
        this.addAccessory(this.config.cars[car]);
        
      }
     
    } catch(error) {
     
      this.log('[ERROR] An error occurred during initialising the API!');
      this.log(error);
    
    }
  
  },

  addAccessory: async function(configAccessory){
    
    try{
      
      const uuid = this.api.hap.uuid.generate(configAccessory.name);   
            
      if (!this.accessories.find(accessory => accessory.UUID === uuid)) {
        
        this.log('Adding new accessory ' + configAccessory.name);
  
        const newAccessory = new this.api.platformAccessory(configAccessory.name, uuid);
  
        this.api.registerPlatformAccessories(pluginName, platformName, [newAccessory]);
          
        newAccessory.context.config = {
          name: newAccessory.displayName,
          clientID: configAccessory.clientID,
          clientSecret: configAccessory.clientSecret,
          vin: configAccessory.vin,
          model: configAccessory.model || 'Mercedes',
          data: []
        };
        
        this.pollApi(newAccessory);   
        
        let informationService = newAccessory.getService(this.api.hap.Service.AccessoryInformation);
    
        if(!informationService){
          informationService = newAccessory.addService(this.api.Service.AccessoryInformation);
        }
    
        informationService
          .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'Mercedes')
          .setCharacteristic(this.api.hap.Characteristic.Model, newAccessory.context.config.model)
          .setCharacteristic(this.api.hap.Characteristic.SerialNumber, newAccessory.context.config.vin)
          .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, '1.0');
        
        new batteryService(this, newAccessory);
        new lockService(this, newAccessory);
        new windowService(this, newAccessory);
        new lightbulbService(this, newAccessory);
          
      }
      
    } catch(error) {
      
      this.log(configAccessory.name + ': An error occured during configuring accessory!');
      debug(error);
      
    }

  },
  
  pollApi: async function(accessory) {
    
    try {
      
      let responseVehicle= await this.meApi.vehicleStatus(accessory.context.config.vin);
      let responseFuel = await this.meApi.fuelStatus(accessory.context.config.vin);
      
      accessory.context.config.data = responseVehicle.concat(responseFuel);
      
    } catch(error) {
      
      this.log(accessory.displayName + ': An error occured!');
      error = this.meApi.errorHandler(accessory.context.config, 'Vehicle Status', error);
      this.log(error);
      
    } finally {
      
      setTimeout(this.pollApi.bind(this,accessory), this.config.polling);
      
    }
    
  },

  configureAccessory: async function(accessory){
    
    debug('Loading accessory from cache...', accessory.displayName);
    this.accessories.push(accessory);
  
    try {
      
      let inConfig = false;
      
      for(const car in this.config.cars)
        if(accessory.displayName === this.config.cars[car].name)
          inConfig = true;
          
      if(inConfig){
        
        await this.storage.init();
        let accessToken = await this.storage.getItem(accessory.displayName);     
        
        this.log(accessory.displayName + ': Initializing API with stored token..');
             
        this.meApi = new meApi(this, accessToken, accessory.context.config);
        
        this.pollApi(accessory);
        
        new batteryService(this, accessory);
        new lockService(this, accessory);
        new windowService(this, accessory);
        new lightbulbService(this, accessory);
        
      }
    
    } catch(error) {
    
      this.log(accessory.displayName + ': An error occured during configuring accessory!');
      debug(error);
      
      this.log(accessory.displayName + ': Trying again configuring accessory in 30s!');
      setTimeout(this.configureAccessory.bind(this, accessory), 30000);
    
    }

  },

  removeAccessory: function (accessory) {
  
    this.log('Removing accessory: ' + accessory.displayName + '. No longer configured.');

    let accessories = this.accessories.map( cachedAccessory => {
      if(cachedAccessory.displayName !== accessory.displayName){
        return cachedAccessory;
      }
    });
    
    this.accessories = accessories.filter(function (el) {
      return el != null;
    });

    this.api.unregisterPlatformAccessories(pluginName, platformName, [accessory]);
  
  }

};