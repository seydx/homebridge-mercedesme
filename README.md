<p align="center">
    <img src="https://github.com/SeydX/homebridge-mercedesme/blob/master/images/mercedesme_logo.png">
</p>



# MercedesMe Plugin

<img src="https://github.com/SeydX/homebridge-mercedesme/blob/master/images/homekit_mercedesme.gif" align="right" alt="Apple Home">

This dynamic platform plugin allows control of **Mercedes Me** capable cars. At the moment it is only possible to get information like vehicle status, lock status, fuel status etc. If in the future the possibility of e.g. locking or unlocking the car becomes possible, this will also be implemented.

Any system capable of running [Homebridge](https://github.com/nfarina/homebridge/) can be used to run **homebridge-mercedesme**. The only need is Mercedes Me capable car.




## Status

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

1. In order to use this plugin, you must first log in with your Mercedes Me account on https://developer.mercedes-benz.com
2. After logging in, go to https://developer.mercedes-benz.com/products/vehicle_status/ and click on **Subscribe**
3. Select **Bring your own car** and press **Next**
4. Select **Standard** and press **Next**
5. Choose **Create application** and press **Next**
6. Enter **Application Name** (e.g. Homebridge) **Business Purposes** (e.g. homebridge-mercedesme) and press **Submit**
7. Press **View in console**
8. Edit **Redirect URLS** and modify "http://localhost" to "http://localhost:PORTFROMCONFIG/callback" (replace **PORTFROMCONFIG** with your own port from config.json)
9. Copy your **Client ID** and **Client Secret** and put it in your config.json
10. Done
 

 
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
      "polling": 60,
      "cars": [
        {
          "name": "Mercedes A200",
          "clientID": "1b851746-2x58-7y8r-6548-12ft58w159zu",
          "clientSecret": "d896ct55-c85c-6363-9999-25iu6985mo10",
          "vin": "WDD1234567N123456",
          "model": "Mercedes A200",
          "port": 3000,
          "maxRange": 800
        },
        {
          "name": "Mercedes CLA250",
          "clientID": "1b851746-2x58-7y8r-6548-12ft58w159zu",
          "clientSecret": "d896ct55-c85c-6363-9999-25iu6985mo10",
          "vin": "WDD1234567N123456",
          "model": "Mercedes B180",
          "port": 3001,
          "maxRange": 600
        }
      ]
    }
  ]
}
```
See [Example Config](https://github.com/SeydX/homebridge-mercedesme/blob/master/example-config.json) for more details.



### Settings

* `platform` - **required** : Must be 'MercedesPlatform'
* `polling` - **not required** : Time in seconds for polling Mercedes API (Default: 60s)
* `cars.name` - **required** : Name of the Accessory (*unique*)
* `cars.clientID` - **required** : Client ID obtained from https://developer.mercedes-benz.com
* `cars.clientSecret` - **required** : Client Secret obtained from https://developer.mercedes-benz.com
* `cars.vin` - **required** : Vehicle Identification Number (VIN)
* `cars.model` - **not required** : Model of the car (Default: Mercedes)
* `cars.port` - **required** : Server port for authentication process (e.g. 3000)
* `cars.maxRange` - **not required** : Maximum distance after full tank load (for calculating range in % for battery state if API doesnt send the percentage)



## First start

After starting the plugin, visit "**http://localhost:PORTFROMCONFIG**" (from the device where the plugin is running) and click on **Start**. Login screen from mercedes should pop up and after logging in and granting access a Token will be generated and stored in your local storage for further access.



## Supported clients

This plugin has been verified to work with the following apps on iOS 14:

* Apple Home
* All 3rd party apps like Elgato Eve etc.
* Node LTS (12.8.3)
* Homebridge 1.2



## TODO
- [ ] Doors as contact service
- [ ] Vehicle Lock as Lock service



## Troubleshooting

If you have any issues with the plugin, you can run homebridge in debug mode, which will provide some additional information. This might be useful for debugging issues.

***HomeBridge with debug mode:*** ```DEBUG=MercedesPlatform,MercedesApi,MercedesServer``` and ```homebridge -D ```



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

Copyright (c) 2020 **Seyit Bayraktar**

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
