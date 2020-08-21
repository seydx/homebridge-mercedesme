'use strict';

class batteryService {

  constructor (platform, accessory) {
    
    this.platform = platform;
    this.log = platform.log;
    this.api = platform.api;
    this.config = platform.config;
    
    this.meApi = platform.meApi;
    
    this.getService(accessory);

  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  // Services
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  getService (accessory) {
  
    let service = accessory.getService(this.api.hap.Service.BatteryService);
    
    if (!service) {
      service = accessory.addService(this.api.hap.Service.BatteryService);
    }
      
    this.getState(accessory, service);

  }
  
  getState (accessory, service){ 
    
    let response = accessory.context.config.fuelData;
    accessory.context.batteryValue = accessory.context.batteryValue ? accessory.context.batteryValue : 100;
    
    if(response.length){
    
      for(const key in response){
      
        if(response[key].tanklevelpercent){
          
          accessory.context.batteryValue = parseInt(response[key].tanklevelpercent.value);
          
        } else if(response[key].rangeliquid && accessory.context.maxRange) {
          
          accessory.context.batteryValue = (100/accessory.context.maxRange) * parseInt(response[key].rangeliquid.value);
          
        }
        
      }
      
    }
    
    accessory.context.batteryState = accessory.context.batteryState ? accessory.context.batteryState : 0;
    
    if(accessory.context.batteryValue <= 20){
      
      this.log(accessory.displayName + ': Tank from the car tends to end (' + Math.round(accessory.context.batteryValue) + '%)');
      
      accessory.context.batteryState = 1;
   
    }
    
    service.getCharacteristic(this.api.hap.Characteristic.BatteryLevel).updateValue(accessory.context.batteryValue);
    service.getCharacteristic(this.api.hap.Characteristic.ChargingState).updateValue(0);
    service.getCharacteristic(this.api.hap.Characteristic.StatusLowBattery).updateValue(accessory.context.batteryState);
    
    
    setTimeout(this.getState.bind(this, accessory, service), 5000);
    
  }
  
}

module.exports = batteryService;