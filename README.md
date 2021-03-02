<p align="center">
    <img src="https://github.com/SeydX/homebridge-mercedesme/blob/master/images/mercedesme_logo.png">
</p>



# MercedesMe Plugin

<img src="https://github.com/SeydX/homebridge-mercedesme/blob/master/images/homekit_mercedesme.gif" align="right" alt="Apple Home">

This dynamic platform plugin allows control of **Mercedes Me** capable cars. At the moment it is only possible to get information like vehicle status, lock status, fuel status etc. If in the future the possibility of e.g. locking or unlocking the car becomes possible, this will also be implemented.

Any system capable of running [Homebridge](https://github.com/nfarina/homebridge/) can be used to run **homebridge-mercedesme**. The only need is Mercedes Me capable car.




## Status

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![npm](https://img.shields.io/npm/v/homebridge-mercedesme.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-mercedesme)
[![npm](https://img.shields.io/npm/dt/homebridge-mercedesme.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-mercedesme)
[![GitHub last commit](https://img.shields.io/github/last-commit/SeydX/homebridge-mercedesme.svg?style=flat-square)](https://github.com/SeydX/homebridge-mercedesme)
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square&maxAge=2592000)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=NP4T3KASWQLD8)


**Creating and maintaining Homebridge plugins consume a lot of time and effort, if you would like to share your appreciation, feel free to "Star" or donate.**

[Click here](https://github.com/SeydX) to review more of my plugins.



## Installation instructions

After [Homebridge](https://github.com/nfarina/homebridge) has been installed:

```sudo npm install -g homebridge-mercedesme@latest```



## First steps (obtain Client ID and Client Secret)

In order to use this plugin, you must first log in with your Mercedes Me account on [Mercedes Developer](https://developer.mercedes-benz.com). 
After logging in go to [Console](https://developer.mercedes-benz.com/console/) and press on **Add new app** if you dont have already an existing app for this plugin.

Enter **Application Name** (e.g. Homebridge) **Business Purposes** (e.g. homebridge-mercedesme) and press **Create**

Now we need to add the API endpoints to our App. 

1. Visit [Vehicle Status API](https://developer.mercedes-benz.com/products/vehicle_status) and press **Get access**. 
2. Choose **Bring your own car** and press **Next**
3. Choose **Standard** and press **Next**
4. Choose your existing app and press **Next**
5. On **Edit Application** leave everything as it is and press **Submit**

Congratulation. Now you have added the **Vehicle Status** endpoint to your app. You need also to add **Lock Status** endpoint, **Pay as your drive** endpoint, **Electric Vehicle Status** endpoint and **Fuel status** endpoint to your app by following the above steps. 

Requested endpoints:

- [x] [Vehicle Status](https://developer.mercedes-benz.com/products/vehicle_status/) (added above)
- [ ] [Lock Status](https://developer.mercedes-benz.com/products/vehicle_lock_status/)
- [ ] [Fuel Status](https://developer.mercedes-benz.com/products/fuel_status/)
- [ ] [Electric Vehicle Status](https://developer.mercedes-benz.com/products/electric_vehicle_status/)
- [ ] [Pay as you drive](https://developer.mercedes-benz.com/products/pay_as_you_drive_insurance/)

Once you have added all the API endpoints to your application, visit [Console](https://developer.mercedes-benz.com/console/) again. 
You should see your **Client ID**, **Client Secret** and **Redirect Url**. 

Add your Config UI X ip address with port as your **Redirect Url**. If you have multiple ip addresses to your config ui x, please add them all as **redirect uri** !

Copy your **Client ID** and **Client Secret** and put it in your config.json (``Config UI > Plugins > Homebridge Mercedesme Settings > Client ID/Client Secret``)


## First start

The Version 2 is completely new designed. It supports [Config UI X Plugin UI Utils](https://github.com/homebridge/plugin-ui-utils) and is full integrated in your homebridge system via Config UI X. The custom config will guide you through the process! Generating or refreshing access token was never easier! Below you can see how easy it is to create, edit or delete a new car for the config.json using the custom user interface. To use the custom user interface you need at least **homebridge-config-ui-x v4.34.0**!

<img src="https://github.com/SeydX/homebridge-mercedesme/blob/beta/images/hb_mercedesme_ui.gif" align="center" alt="CustomUI">

 
## Configuration

Please setup your config in Config UI X under ```Plugins > Homebridge Mercedes Me > Settings.``` 
 
 
## Example config.json:

```
{
  "bridge": {
      ...
  },
  "platforms": [
    {
      "platform": "MercedesPlatform",
      "debug": false,
      "cars": [
        {
          "name": "Mercedes A200",
          "clientID": "1b851746-2x58-7y8r-6548-12ft58w159zu",
          "clientSecret": "d896ct55-c85c-6363-9999-25iu6985mo10",
          "vin": "WDD1234567N123456",
          "model": "Mercedes A200",
          "manufacturer": "Mercedes",
          "maxRange": 800,
          "polling": 60
        },
        {
          "name": "Mercedes CLA250",
          "clientID": "1b851746-2x58-7y8r-6548-12ft58w159zu",
          "clientSecret": "d896ct55-c85c-6363-9999-25iu6985mo10",
          "vin": "WDD1234567N123456",
          "model": "Mercedes B180",
          "manufacturer": "Mercedes",
          "maxRange": 600,
          "polling": 120,
          "electricVehicle": true
        }
      ]
    }
  ]
}
```
See [Example Config](https://github.com/SeydX/homebridge-mercedesme/blob/master/example-config.json) for more details.


### Settings

* `platform` - **required** : Must be 'MercedesPlatform'
* `cars.name` - **required** : Name of the Accessory (*unique*)
* `cars.clientID` - **required** : Client ID obtained from https://developer.mercedes-benz.com
* `cars.clientSecret` - **required** : Client Secret obtained from https://developer.mercedes-benz.com
* `cars.vin` - **required** : Vehicle Identification Number (VIN)
* `cars.manufacturer` - **not required** : Car Manufacturer
* `cars.model` - **not required** : Model of the car (Default: Mercedes)
* `cars.maxRange` - **not required** : Maximum distance after full tank load (for calculating range in % for battery state if API doesnt send the percentage)
* `cars.polling` - **not required** : Time in seconds for polling Mercedes API (Default: 60s)
* `cars.electricVehicle` - **not required** : Enable if your car is a electric vehicle (Default: false)


## Supported clients

This plugin has been verified to work with the following apps on iOS 14:

* Apple Home
* All 3rd party apps like Elgato Eve etc.
* Homebridge 1.1.6

## TODO
- [ ] If it should be possible to control the doors in the future > Changing Door (Contact Service) to Door Service
- [ ] If it should be possible to control the windows in the future > Changing Window (Contact Service) to Window Service



## Troubleshooting

If you have any issues with the plugin, you can enable the debug mode, which will provide some additional information. This might be useful for debugging issues. Open your config.json and set ``"debug": true``


## Changelog

See the [changelog](https://github.com/SeydX/homebridge-mercedesme/blob/master/CHANGELOG.md) for changes between versions of this package.



## Contributing

You can contribute to this homebridge plugin in following ways:

- [Report issues](https://github.com/SeydX/homebridge-mercedesme/issues) and help verify fixes as they are checked in.
- Review the [source code changes](https://github.com/SeydX/homebridge-mercedesme/pulls).
- Contribute bug fixes.
- Contribute changes to extend the capabilities
- Pull requests are accepted.



## Licens

**MIT License**

Copyright (c) 2020-2021 **Seyit Bayraktar**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
