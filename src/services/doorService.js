'use strict';

class lockService {

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
  
    let service = accessory.getService('Doors');
    
    if (!service) {
      service = accessory.addService(this.api.hap.Service.ContactSensor, 'Doors', 'door');
    }
    
    service
      .getCharacteristic(this.api.hap.Characteristic.ContactSensorState)
      .on('change', function(value) {
        accessory.context.doorOldValue = value.oldValue;
      });
      
    this.getState(accessory, service);

  }
  
  getState (accessory, service){ 
    
    let response = accessory.context.config.vehicleData;
    let value = []; //0=detected; 1=not detected
    
    accessory.context.doorValue = accessory.context.doorValue ? accessory.context.doorValue : 0;
    
    if(response.length){
    
      for(const key in response){
      
        if(response[key].doorstatusfrontleft && (response[key].doorstatusfrontleft.value === 'true')){
          
          value.push(1);
          
        } else if(response[key].doorstatusfrontright && (response[key].doorstatusfrontright.value === 'true')){
          
          value.push(1);
          
        } else if(response[key].doorstatusrearleft && (response[key].doorstatusrearleft.value === 'true')){
          
          value.push(1);
          
        } else if(response[key].doorstatusrearright && (response[key].doorstatusrearright.value === 'true')){
          
          value.push(1);
          
        } else if(response[key].decklidstatus && (response[key].decklidstatus.value === 'true')){
          
          value.push(1);
          
        }
        
      }
      
    }
    
    accessory.context.doorValue = value.includes(1) ? 1 : 0;
    
    service.getCharacteristic(this.api.hap.Characteristic.ContactSensorState).updateValue(accessory.context.doorValue);
    
    setTimeout(this.getState.bind(this, accessory, service), 5000);
  
  }

}

module.exports = lockService;
