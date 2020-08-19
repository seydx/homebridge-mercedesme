'use strict';

class windowAccessory {

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
  
    accessory.on('identify', function(paired, callback) {
      that.log(accessory.displayName + ': Identify!!!');
      callback();
    });
    
    let service = accessory.getService(this.api.hap.Service.ContactSensor);
    
    if (!service) {
      service = accessory.addService(this.api.hap.Service.ContactSensor, 'Windows', 'window');
    }
    
    service
      .getCharacteristic(this.api.hap.Characteristic.ContactSensorState)
      .on('change', function(value) {
        accessory.context.windowOldValue = value.oldValue;
      });
      
    this.getState(accessory, service);

  }
  
  getState (accessory, service){ 
    
    let response = accessory.context.config.data;
    let value = []; //0=detected; 1=not detected
    
    if(response.length){
      for(const key in response){
        if(response[key].windowstatusfrontleft && (response[key].windowstatusfrontleft.value === '1')){
          
          value.push(1);
          
        } else if(response[key].windowstatusfrontright && (response[key].windowstatusfrontright.value === '1')){
          
          value.push(1);
          
        } else if(response[key].windowstatusrearleft && (response[key].windowstatusrearleft.value === '1')){
          
          value.push(1);
          
        } else if(response[key].windowstatusrearright && (response[key].windowstatusrearright.value === '1')){
          
          value.push(1);
          
        }
      }
      
    }
    
    value = value.includes(1) ? 1 : 0;
    
    service.getCharacteristic(this.api.hap.Characteristic.ContactSensorState).updateValue(value);
    
    setTimeout(this.getState.bind(this, accessory, service), 5000);
    
  }
  
}

module.exports = windowAccessory;