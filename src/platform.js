'use strict';

const storage = require('node-persist');
const debug = require('debug')('MercedesPlatform'); 

const meApp = require('../app/app.js');
const meApi = require('../lib/mercedesme.js');
const packageFile = require('../package.json');

const batteryService = require('./services/batteryService.js');
const lightbulbService = require('./services/lightbulbService.js');
const lockService = require('./services/lockService.js');
const doorService = require('./services/doorService.js');
const windowService = require('./services/windowService.js');

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
  
    let name;
  
    try {
    
      await this.storage.init();
      
      for(const car in this.config.cars){  
      
        name = this.config.cars[car].name;               
      
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
     
      this.log(name + ': An error occurred during initialising the API!');
      this.log(error);
    
    }
  
  },
  
  configure: function(accessory) {
    
    const that = this;
  
    accessory.on('identify', function(paired, callback) {
      that.log(accessory.displayName + ': Identify!!!');
      callback();
    });
    
    let informationService = accessory.getService(this.api.hap.Service.AccessoryInformation);
    
    if(!informationService){
      informationService = accessory.addService(this.api.Service.AccessoryInformation);
    }
    
    informationService
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'Mercedes')
      .setCharacteristic(this.api.hap.Characteristic.Model, accessory.context.config.model)
      .setCharacteristic(this.api.hap.Characteristic.SerialNumber, accessory.context.config.vin)
      .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, '1.0');
          
    this.pollApi(accessory, {errorLock: false, errorVehicle: false, errorFuel: false, lock: false, vehicle: false, fuel: false, rePoll: this.config.polling});   

    new batteryService(this, accessory);
    new lockService(this, accessory);
    new doorService(this, accessory);
    new windowService(this, accessory);
    new lightbulbService(this, accessory);
    
  },
  
  pollApi: async function(accessory, polled) {
    
    try {
      
      if((polled.errorLock && polled.lock) || (!polled.errorLock && !polled.lock)){
        
        polled.lock = true;
        let data = await this.meApi.lockStatus(accessory.context.config.vin); 
        polled.errorLock = false;
        accessory.context.config.lockData = data;
        
      }
      
      if((polled.errorVehicle && polled.vehicle) || (!polled.errorVehicle && !polled.vehicle)){
        
        polled.vehicle = true;
        let dataVehicle = await this.meApi.vehicleStatus(accessory.context.config.vin);
        polled.errorVehicle = false;
        accessory.context.config.vehicleData = dataVehicle;
        
      }
      
      if((polled.errorFuel && polled.fuel) || (!polled.errorFuel && !polled.fuel)){
        
        polled.fuel = true;
        let dataFuel = await this.meApi.fuelStatus(accessory.context.config.vin);
        polled.errorFuel = false;
        accessory.context.config.fuelData = dataFuel;
        
      }
      
    } catch(error) {
      
      polled.rePoll = 10000;
      
      error = this.meApi.errorHandler(accessory.context.config, error);

      let endpoint = error[1];
      error = error[0];
      
      if(endpoint === 'vehiclelockstatus'){
        
        polled.errorLock = true;
        
      } else if(endpoint === 'vehiclestatus'){
        
        polled.errorVehicle = true;
        
      } else if(endpoint === 'fuelstatus'){
        
        polled.errorFuel = true;
        
      }
      
      this.log(error);
      
    } finally {
      
      if(polled.lock && polled.vehicle && polled.fuel && !polled.errorLock && !polled.errorVehicle && !polled.errorFuel){
        
        debug(accessory.displayName + ': Endpoints polled successfully.');
        
        polled = {
          errorLock: false,
          errorVehicle: false,
          errorFuel: false,
          lock: false,
          vehicle: false,
          fuel: false,
          rePoll: this.config.polling
        };
        
      } else {
        
        let endpoint;
        
        if(polled.errorLock)
          endpoint = 'Lock Status';
          
        if(polled.errorVehicle)
          endpoint = 'Vehicle Status';
          
        if(polled.errorFuel)
          endpoint = 'Fuel Status';
        
        debug(accessory.displayName + ': ' + endpoint + ' could not be polled successfully! Trying again in 10s');
     
      }
      
      debug(accessory.displayName + ': ' + JSON.stringify(polled));
      
      setTimeout(this.pollApi.bind(this,accessory,polled), polled.rePoll);
      
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
          maxRange: configAccessory.maxRange,
          remoteAuth: configAccessory.remoteAuth || false,
          lockData: [],
          vehicleData: [],
          fuelData: []
        };
        
        this.configure(newAccessory);
          
      }
      
    } catch(error) {
      
      this.log(configAccessory.name + ': An error occured during configuring accessory!');
      debug(error);
      
    }

  },

  configureAccessory: async function(accessory){
    
    debug('Loading accessory from cache...', accessory.displayName);
    this.accessories.push(accessory);
  
    try {
      
      let inConfig = false;
      
      for(const car in this.config.cars){
        if(accessory.displayName === this.config.cars[car].name){
          inConfig = true;
          accessory.context.model = this.config.cars[car].model;
          accessory.context.maxRange = this.config.cars[car].maxRange;
          accessory.context.config.lockData = accessory.context.config.lockData || [];
          accessory.context.config.vehicleData = accessory.context.config.vehicleData || [];
          accessory.context.config.fuelData = accessory.context.config.fuelData || [];
        }
      }
          
      if(inConfig){
        
        await this.storage.init();
        let accessToken = await this.storage.getItem(accessory.displayName);     
        
        if(accessToken){   
        
          this.log(accessory.displayName + ': Initializing API with stored token..');
             
          this.meApi = new meApi(this, accessToken, accessory.context.config);
        
          this.configure(accessory);
          
        } else {
        
          this.log(accessory.displayName + ': Can not configure Accessory, stored credentials have been removed from storage folder!');
          this.log(accessory.displayName + ': Please generate new token and restart homebridge!');
        
        }
        
      }
    
    } catch(error) {
    
      this.log(accessory.displayName + ': An error occured during configuring accessory!');
      debug(error);
      
    }

  },

  removeAccessory: async function (accessory) {
  
    this.log('Removing accessory: ' + accessory.displayName + '. No longer configured. Checking for stored credentials...');
    
    try {
    
      let credentials = await this.storage.getItem(accessory.displayName);
      
      if(credentials){
        this.log(accessory.displayName + ': Removing stored credentials..');
        await this.storage.removeItem(accessory.displayName);
        this.log(accessory.displayName + ': Removed!');
      }
      
      let accessories = this.accessories.map( cachedAccessory => {
        if(cachedAccessory.displayName !== accessory.displayName){
          return cachedAccessory;
        }
      });
      
      this.accessories = accessories.filter(function (el) {
        return el != null;
      });
  
      this.api.unregisterPlatformAccessories(pluginName, platformName, [accessory]);
    
    } catch(error) {
    
      this.log(accessory.displayName + ': An error occured during removing the accessory!');
      debug(error);
    
    }
  
  }

};
