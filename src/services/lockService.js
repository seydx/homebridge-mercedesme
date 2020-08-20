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
  
    const that = this;
  
    accessory.on('identify', function(paired, callback) {
      that.log(accessory.displayName + ': Identify!!!');
      callback();
    });
    
    let service = accessory.getService(this.api.hap.Service.LockMechanism);
    
    if (!service) {
      service = accessory.addService(this.api.hap.Service.LockMechanism, 'Doors', 'lock');
    }
    
    service
      .getCharacteristic(this.api.hap.Characteristic.LockTargetState)
      .on('set', that.setState.bind(this, accessory, service));
      
    this.getState(accessory, service);

  }
  
  getState (accessory, service){ 
    
    let response = accessory.context.config.data;
    let value = []; //0=unsecured; 1=secured
    
    accessory.context.lockValue = accessory.context.lockValue ? accessory.context.lockValue : 1;
    
    if(response.length){
    
      for(const key in response){
      
        if(response[key].doorstatusfrontleft && (response[key].doorstatusfrontleft.value === 'false')){
          
          value.push(1);
          
        } else if(response[key].doorstatusfrontright && (response[key].doorstatusfrontright.value === 'false')){
          
          value.push(1);
          
        } else if(response[key].doorstatusrearleft && (response[key].doorstatusrearleft.value === 'false')){
          
          value.push(1);
          
        } else if(response[key].doorstatusrearright && (response[key].doorstatusrearright.value === 'false')){
          
          value.push(1);
          
        } else if(response[key].decklidstatus && (response[key].decklidstatus.value === 'false')){
          
          value.push(1);
          
        }
        
      }
      
    }
    
    accessory.context.lockValue = value.includes(1) ? 1 : 0;
    service.getCharacteristic(this.api.hap.Characteristic.LockCurrentState).updateValue(accessory.context.lockValue);
    service.getCharacteristic(this.api.hap.Characteristic.LockTargetState).updateValue(accessory.context.lockValue);
    
    setTimeout(this.getState.bind(this, accessory, service), 5000);
  
  }
  
  setState(accessory, service, value, callback){
    
    const that = this;
    
    this.log(accessory.displayName + ': Can not change lock state. Not supported at the moment!');
        
    setTimeout(function(){
      service.getCharacteristic(that.api.hap.Characteristic.LockTargetState).updateValue(value?0:1);
      service.getCharacteristic(that.api.hap.Characteristic.LockCurrentState).updateValue(value?0:1);
      
    }, 500);
        
    service.getCharacteristic(this.api.hap.Characteristic.LockCurrentState).updateValue(value);
  
    service.getCharacteristic(this.api.hap.Characteristic.LockTargetState).updateValue(value);
    
    callback();
    
  }

}

module.exports = lockService;