# Changelog


## v2.0.3 - 2021-03-03
- Added Humidity Sensor to show remaining tank/battery
- Battery Bugfix

## v2.0.2 - 2021-03-02
- Fixed window contact state & other improvements

**NOTE: ** Not on Version 2? Please check the changelog and new instructions before update!

## v2.0.1 - 2021-03-02
- Fixed issues with electric vehicle
- Better error handling

**NOTE:** If you have an electric vehicle and had issues with "Electric Vehicle" enabled in the config, please refresh your access token via Config UI X after the update and restart homebridge

1. Update plugin
2. Restart homebridge
3. Refresh Token
4. Restart Homebridge

<img src="https://github.com/SeydX/homebridge-mercedesme/blob/master/images/hb_mercedesme_ui_refreshToken.gif" align="center" alt="CustomUI Refresh Token">

## v2.0.0 - 2021-03-02
- Refactored
- Added plugin ui utils
- Bugfix
- Support HB 1.3.x

**NOTE:** If you are using **v1.x** of this plugin, i recommend you to remove it and add a new car via Config UI X! The Version 2 is completely new designed. It supports [Config UI X Plugin UI Utils](https://github.com/homebridge/plugin-ui-utils) and is full integrated in your homebridge system via Config UI X. The custom config will guide you through the process! Generating or refreshing access token was never easier! Below you can see how easy it is to create, edit or delete a new car for the config.json using the custom user interface. To use the custom user interface you need at least **homebridge-config-ui-x v4.34.0**!

### Important
Add your Config UI X ip address with port as your **Redirect Url** (eg http://192.168.178.11:8080). If you have multiple ip addresses to your config ui x, please add them all as **redirect uri** !

<img src="https://github.com/SeydX/homebridge-mercedesme/blob/beta/images/hb_mercedesme_ui.gif" align="center" alt="CustomUI">

## v1.1.3 - 2020-10-25
- Fixed refresh_token

**Note:** Please remove the storage folder under your config path (eg /var/lib/homebridge)

## v1.1.2 - 2020-10-25
- Added new oAuth Route
- Bugfixes

## v1.1.1 - 2020-08-22
- Added "polling" into config.schema.json
- Updated config.schema.json

## v1.1.0 - 2020-08-22
- Added remote authentication
- Bugfixes

## v1.0.9 - 2020-08-21
- BUGFIX: added simple-oauth2 as dependencie

## v1.0.8 - 2020-08-21
- Removed Node warning

## v1.0.7 - 2020-08-21
- Adjusted polling
- Bugfix
- Bump dependencies

## v1.0.6 - 2020-08-21
- Fixed typo (doors)

## v1.0.5 - 2020-08-21
- Avoid reset cached data

## v1.0.4 - 2020-08-20
- Separated doors and lock

## v1.0.3 - 2020-08-20
- Added "fuel state" as battery
- Refactoring
- Bugfixes

## v1.0.2 - 2020-08-20
- Better debugging

## v1.0.1 - 2020-08-19
- Fixed config.schema.json

## v1.0.0 - 2020-08-18
- Initial work
