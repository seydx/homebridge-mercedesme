/*global $, window, location, homebridge, schema*/

const GLOBAL = {
  pluginConfig: false,
  customSchema: false,
  carOptions: false,
  currentContent: false,
  previousContent: [],
};

function toggleContent(){

  $('#header').hide();
  $('#main').show();
  
  return;
  
}

function transPage(cur, next, removed, showSchema) {

  if(showSchema){
 
    cur.hide();
    next.show();
    
    //GLOBAL.previousContent.push($('#isConfigured'));
    GLOBAL.previousContent.push(cur);
    GLOBAL.currentContent = next;
 
    return;
 
  } else {
  
    toggleContent();
  
  }
  
  if(cur){

    cur.fadeOut(500, () =>{
      
      next.fadeIn(500);
      
      if(!removed)
        GLOBAL.previousContent.push(cur);
      
      GLOBAL.currentContent = next;
    
    });

  } else {

    next.fadeIn(500);
   
    if(!removed)
      GLOBAL.previousContent.push(next);
    
    GLOBAL.currentContent = next;
    
  }

  if(GLOBAL.customSchema)
    GLOBAL.customSchema.end();
    
  homebridge.hideSchemaForm();
    
  return;

}

function goBack(index) {

  if(GLOBAL.previousContent.length && GLOBAL.currentContent){

    index = index === undefined 
      ? GLOBAL.previousContent.length - 1
      : index;

    transPage(GLOBAL.currentContent, GLOBAL.previousContent[index], true);
    //GLOBAL.currentContent = GLOBAL.previousContent[index];
    GLOBAL.previousContent.splice(index, 1);
    
    if(GLOBAL.customSchema)
      GLOBAL.customSchema.end();

  }

  return;

}

async function createCustomSchema(car){
  
  GLOBAL.carOptions = {
    name: car.name,
    clientID: car.clientID,
    clientSecret: car.clientSecret,
    vin: car.vin,
    origin: location.origin
  };

  GLOBAL.customSchema = homebridge.createForm(schema, {
    name: GLOBAL.pluginConfig[0].name,
    debug: GLOBAL.pluginConfig[0].debug,
    cars: car
  });
  
  GLOBAL.customSchema.onChange(async config => {
    
    GLOBAL.pluginConfig[0].name = config.name;
    GLOBAL.pluginConfig[0].debug = config.debug;
    GLOBAL.pluginConfig[0].cars = GLOBAL.pluginConfig[0].cars.map(car => {
      if(car.name === config.cars.name){
        car = config.cars;
      }
      return car;
    });
    
    try {
   
      await homebridge.updatePluginConfig(GLOBAL.pluginConfig);
  
    } catch(err) {
   
      homebridge.toast.error(err.message, 'Error');
  
    }
  
  });
  
  return;

}

function resetUI(){

  resetForm();
  resetSchema();
  
  return;

}

function resetForm(){

  $('#carName').val('');
  $('#carClientID').val('');
  $('#carClientSecret').val('');
  $('#carVIN').val('');
  $('#authCode').val('');
  $('#authToken').val('');
  $('#authRefreshToken').val('');
  $('#authTokenType').val('');
  $('#authExpiresIn').val('');
  $('#authExpiresAt').val('');
  
  $('#codeInput').hide();
  $('#tokenInput').hide();

  GLOBAL.carOptions = false;

  return;

}

function resetSchema(){

  if(GLOBAL.customSchema){
    GLOBAL.customSchema.end();
    GLOBAL.customSchema = false;
  }
  
  return;

}

function addCarToList(car){

  let name = typeof car === 'string' ? car : car.name;
  $('#carSelect').append('<option value="' + name + '">'+ name + '</option>');

  return;

}

function removeCarFromList(car){

  let name = typeof car === 'string' ? car : car.name;
  $('#carSelect option[value=\'' + name + '\']').remove();

  return;

}

async function addNewDeviceToConfig(car){
  
  let found = false;

  try {
    
    const config = {
      name: car.name,
      clientID: car.clientID,
      clientSecret: car.clientSecret,
      vin: car.vin,
      electricVehicle: false,
      tankBatteryType: 'HUMIDITY',
      token: {
        access_token: car.token.access_token,
        refresh_token: car.token.refresh_token,
        token_type: car.token.token_type,
        expires_in: car.token.expires_in,
        expires_at: car.token.expires_at
      }
    };
    
    for(const carr in GLOBAL.pluginConfig[0].cars){
      if(GLOBAL.pluginConfig[0].cars[carr].name === car.name){
        found = true;
        GLOBAL.pluginConfig[0].cars[carr].token = {
          access_token: car.token.access_token,
          refresh_token: car.token.refresh_token,
          token_type: car.token.token_type,
          expires_in: car.token.expires_in,
          expires_at: car.token.expires_at
        };
        homebridge.toast.success(car.name + ' refreshed!', 'Success');
      }
    }
    
    if(!found){
      
      GLOBAL.pluginConfig[0].cars.push(config);
      addCarToList(config);
      
      homebridge.toast.success(config.name + ' added to config!', 'Success');
  
    }
    
    await homebridge.updatePluginConfig(GLOBAL.pluginConfig);
    await homebridge.savePluginConfig();

  } catch(err) {

    homebridge.toast.error(err.message, 'Error');

  }
  
  return;

}

async function removeDeviceFromConfig(){
    
  let foundIndex;
  let pluginConfigBkp = GLOBAL.pluginConfig;
  let selectedCar = $( '#carSelect option:selected' ).text();
  
  GLOBAL.pluginConfig[0].cars.forEach((car, index) => {
    if(car.name === selectedCar){
      foundIndex = index;
    }
  });
  
  if(foundIndex !== undefined){
    
    try {
      
      GLOBAL.pluginConfig[0].cars.splice(foundIndex, 1);
      
      await homebridge.updatePluginConfig(GLOBAL.pluginConfig);
      await homebridge.savePluginConfig();
      
      removeCarFromList(selectedCar);
      
      homebridge.toast.success(selectedCar + ' removed from config!', 'Success');
      
    } catch(err) {
      
      GLOBAL.pluginConfig = pluginConfigBkp;
      
      throw err; 
 
    }

  } else {
    
    throw new Error('No car found in config to remove!');
    
  }
    
  return;
  
}

(async () => {
                                       
  try {
    
    GLOBAL.pluginConfig = await homebridge.getPluginConfig();
    
    if(!GLOBAL.pluginConfig.length){
    
      GLOBAL.pluginConfig = [{
        platform: 'MercedesPlatform',
        name: 'MercedesPlatform',
        cars: [] 
      }];
      
      transPage(false, $('#notConfigured'));
      
    } else {
    
      if(!GLOBAL.pluginConfig[0].cars || (GLOBAL.pluginConfig[0].cars && !GLOBAL.pluginConfig[0].cars.length)){
        GLOBAL.pluginConfig[0].cars = [];
        return transPage(false, $('#notConfigured'));
      }
      
      GLOBAL.pluginConfig[0].cars.forEach(car => {
        $('#carSelect').append('<option value="' + car.name + '">'+ car.name + '</option>');
      });
      
      transPage(false, $('#isConfigured'));
    
    }
  
  } catch(err) {
  
    homebridge.toast.error(err.message, 'Error');
  
  }

})();

//jquery listener

$('.back').on('click', () => {
  goBack();
});

$('#addCar, #start').on('click', () => {
  
  resetUI();
  
  let activeContent = $('#notConfigured').css('display') !== 'none' ? $('#notConfigured') : $('#isConfigured');
  
  transPage(activeContent, $('#configureCar'));

});

$('#auth').on('click', () => {

  try {
      
    GLOBAL.carOptions = {
      name: $('#carName').val(),
      clientID: $('#carClientID').val(),
      clientSecret: $('#carClientSecret').val(),
      vin: $('#carVIN').val(),
      origin: location.origin
    };
    
    let carConfig = GLOBAL.pluginConfig[0].cars.find(car => car && car.name === GLOBAL.carOptions.name);
    
    if(carConfig){
      return homebridge.toast.error('There is already a car configured with the same name!', 'Error');
    } else if(!GLOBAL.carOptions.name){
      return homebridge.toast.error('There is no name configured for this car!', 'Error');
    } else if(!GLOBAL.carOptions.clientID){
      return homebridge.toast.error('There is no client ID configured for this car!', 'Error');
    } else if(!GLOBAL.carOptions.clientSecret){
      return homebridge.toast.error('There is no client secret configured for this car!', 'Error');
    } else if(!GLOBAL.carOptions.vin){
      return homebridge.toast.error('There is no VIN configured for this car!', 'Error');
    }
    
    transPage($('#configureCar'), $('#authentication'));
    
  } catch(err) {
  
    homebridge.toast.error(err.message, 'Error');
  
  }
    
});

$('#startAuth').on('click', async () => {

  try {
  
    homebridge.showSpinner();
    
    GLOBAL.carOptions.authorizationUri = await homebridge.request('/authCode', GLOBAL.carOptions);
    
    const win = window.open(GLOBAL.carOptions.authorizationUri, 'windowname1', 'width=800, height=600');
    
    const pollTimer = window.setInterval(function() { 
      if(win.document.URL.includes('?code=')){
        window.clearInterval(pollTimer);
        GLOBAL.carOptions.autherization_code = win.document.URL.split('?code=')[1];
        $('#authCode').val(GLOBAL.carOptions.autherization_code);
        win.close();
        homebridge.hideSpinner();
        $('#codeInput').fadeIn();
      }
    }, 1000);
    
  } catch(err) {
  
    homebridge.hideSpinner();
  
    homebridge.toast.error(err.message, 'Error');
  
  }
    
});

$('#generateToken').on('click', async () => {

  try {
  
    homebridge.showSpinner();
    
    GLOBAL.carOptions.token = await homebridge.request('/authToken', GLOBAL.carOptions);
    
    $('#authToken').val(GLOBAL.carOptions.token.access_token);
    $('#authRefreshToken').val(GLOBAL.carOptions.token.refresh_token);
    $('#authTokenType').val(GLOBAL.carOptions.token.token_type);
    $('#authExpiresIn').val(GLOBAL.carOptions.token.expires_in);
    $('#authExpiresAt').val(GLOBAL.carOptions.token.expires_at);
    
    homebridge.hideSpinner();
    
    $('#tokenInput').fadeIn();
    
  } catch(err) {
  
    homebridge.hideSpinner();
  
    homebridge.toast.error(err.message, 'Error');
  
  }
    
});

$('#saveAuth').on('click', async () => {

  try {
    
    await addNewDeviceToConfig(GLOBAL.carOptions);
    
    transPage($('#authentication'), $('#isConfigured'));
    
  } catch(err) {
  
    homebridge.toast.error(err.message, 'Error');
  
  }
    
});

$('#editCar').on('click', () => {

  resetUI();
  
  let selectedCar = $( '#carSelect option:selected' ).text();
  let car = GLOBAL.pluginConfig[0].cars.find(car => car.name === selectedCar);

  if(!car)
    return homebridge.toast.error('Can not find the car!', 'Error');

  createCustomSchema(car);
  
  transPage($('#main, #isConfigured'), $('#header'), false, true);

});

$('#refreshCar').on('click', async () => {  
    
  if(GLOBAL.customSchema && GLOBAL.carOptions){
  
    resetSchema();
  
    let car = GLOBAL.pluginConfig[0].cars.find(car => car.name === GLOBAL.carOptions.name);

    if(!car)
      return homebridge.toast.error('Can not find car in config!', 'Error');
    
    transPage($('#isConfigured'), $('#authentication'));
      
  }
  
});

$('#removeCar').on('click', async () => {
  
  try {
    
    await removeDeviceFromConfig();
    
    resetUI();
  
    transPage(false, GLOBAL.pluginConfig[0].cars.length ? $('#isConfigured') : $('#notConfigured'));
    
  } catch (err) {
    
    homebridge.toast.error(err.message, 'Error');
    
  }

});