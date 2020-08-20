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
  
    const that = this;

    let service = accessory.getService(this.api.hap.Service.BatteryService);
    
    if (!service) {
      service = accessory.addService(this.api.hap.Service.BatteryService);
    }
      
    this.getState(accessory, service);

  }
  
  getState (accessory, service){ 
    
    let response = accessory.context.config.data;
    let value = 100; //%
    
    if(response.length){
    
      for(const key in response){
      
        if(response[key].tanklevelpercent){
          
          value = parseInt(response[key].tanklevelpercent.value);
          
        } 
        
      }
      
    }
    
    let status = 0;
    
    if(value <= 20)
      status = 1;
    
    service.getCharacteristic(this.api.hap.Characteristic.BatteryLevel).updateValue(value);
    service.getCharacteristic(this.api.hap.Characteristic.ChargingState).updateValue(0);
    service.getCharacteristic(this.api.hap.Characteristic.StatusLowBattery).updateValue(status);
    
    
    setTimeout(this.getState.bind(this, accessory, service), 5000);
    
  }
  
}

module.exports = batteryService;
