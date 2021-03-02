const schema = {
  'schema': {
    'name': {
      'title': 'Name',
      'type': 'string',
      'default': 'MercedesPlatform',
      'description': 'Name for the log.'
    },
    'debug': {
      'title': 'Debug',
      'type': 'boolean',
      'description': 'Enables additional output in the log.'
    },
    'cars': {
      'type': 'object',
        'properties': {
          'name': {
            'title': 'Name',
            'description': 'The name of your car in HomeKit',
            'type': 'string',
            'required': true
          },
          'clientID': {
            'title': 'Client ID',
            'description': 'Client ID from https://developer.mercedes-benz.com/',
            'type': 'string',
            'required': true
          },
          'clientSecret': {
            'title': 'Client Secret',
            'description': 'Client Secret from https://developer.mercedes-benz.com/',
            'type': 'string',
            'required': true
          },
          'vin': {
            'title': 'Vehicle Identification Number (VIN)',
            'description': 'VIN of the car',
            'type': 'string',
            'required': true
          },
          'electricVehicle': {
            'title': 'Electric Vehicle',
            'type': 'boolean',
            'description': 'Check if your car is a electric vehicle.'
          },
          'manufacturer': {
            'name': 'Manufacturer',
            'type': 'string',
            'description': 'Set the manufacturer name for display in the Home app.'
          },
          'model': {
            'title': 'Model',
            'description': 'Car model',
            'type': 'string',
            'required': false
          },
          'maxRange': {
            'title': 'Max Range',
            'description': 'Maximum distance after full tank load',
            'type': 'integer',
            'required': false
          },
          'polling': {
            'title': 'Polling',
            'description': 'Mercedes Me API Polling in seconds',
            'type': 'integer',
            'required': false,
            'placeholder': 60,
            'minimum': 60
          },
          'token': {
            'titel': 'Token',
            'type': 'object',
            'properties': {
              'access_token': {
                'title': 'Access Token',
                'type': 'string',
                'required': true
              },
              'refresh_token': {
                'title': 'Refresh Token',
                'type': 'string',
                'required': true
              },
              'token_type': {
                'title': 'Token Type',
                'type': 'string',
                'required': true
              },
              'expires_in': {
                'title': 'Expires In',
                'type': 'integer',
                'required': true
              },
              'expires_at': {
                'title': 'Expires at',
                'type': 'string',
                'required': true
              }
            }
          }
        }
    }
  },
  'layout': [
    'name',
    'debug',
    'cars.name',
    'cars.clientID',
    'cars.clientSecret',
    'cars.vin',
    'cars.electricVehicle',
    {
      'key': 'cars',
      'type': 'section',
      'title': 'Branding',
      'expandable': true,
      'expanded': false,
      'orderable': false,
      'items': [
        'cars.manufacturer',
        'cars.model'
      ]
    },
    {
      'key': 'cars',
      'type': 'section',
      'title': 'Extras',
      'expandable': true,
      'expanded': false,
      'orderable': false,
      'items': [
        'cars.maxRange',
        'cars.polling'
      ]
    },
    {
      'key': 'cars.token',
      'type': 'section',
      'title': 'Authorization',
      'expandable': true,
      'expanded': false,
      'orderable': false,
      'items': [
        'cars.token.access_token',
        'cars.token.refresh_token',
        'cars.token.token_type',
        'cars.token.expires_in',
        'cars.token.expires_at'
      ]
    }
  ]
}