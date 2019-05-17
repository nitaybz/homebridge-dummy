
# Homebridge-Delay-Switch

With this plugin, you can create any number of fake switches that will start a timer when turned ON, when the delay time is reached the switch will automatically turn OFF and trigger a dedicated motion sensor for a configurable duration (default is 3 seconds). This can be very useful for advanced automation with HomeKit scenes - when delayed actions are required.

## How to install

 * ```sudo npm install -g homebridge-delay-switch```
* Create an accessory in your config.json file
* Restart homebridge

## Example config.json:

 ```
    "accessories": [
        {
          "accessory": "DelaySwitch",
          "name": "DelaySwitch",
          "disableSensor": false,
          "delay": 5000,
          "sensorActiveDuration": 3000
        }   
    ]

```

## Why Adding Motion Sensor?

A Motion sensor is created for each accessory in order to be able to cancel the timer and the attached automations.
How it works? you can set the automation to be triggered from the motion sensor instead of the switch OFF command and therefore you can turn OFF the switch and prevent the motion sensor from being triggered or any attached automations.
If you have no use of the sensor you can remove it by adding `"disableSensor": true` to your config.

## How it works

Basically, all you need to do is:
1. Set the desired delay time in the config file (in milliseconds).
2. The plugin will create one switch and one motion sensor for this plugin.
3. Use this switch in any scene or automation.
4. Set an automation to trigger when this switch is turned ON or the motion sensor is triggers - "EVE" app is very recommended to set this automation.



## Why do we need this plugin?


For example, when using smart wall switch (to turn ON) and RGB light bulb (to switch color) together on the same scene can cause no action on the bulb since the bulb might not even be ON when the command has been sent from homebridge.
For that, we need to set an automation to change the bulb color a few seconds after the wall switch ON command.

Another great example is using this plugin to turn ON/OFF lights based on a motion/door sensor. This can be achieved by setting an automation to turn ON a light when the delay swich is turned ON and turn OFF the light when the dedicated delay motion sensor is triggers.

Also it can be use with any device that require a certain delay time from other devices (TV + RPi-Kodi  /  PC + SSH / etc...)


## Good to know

* **When manualy turning OFF the switch, the timer will stop and the motion sensor will NOT be triggered.**

* **When the delay switch is getting ON command while it's already ON, the timer will restart and the motion sensor trigger will be delayed.**


_________________________________________
#### Creating and maintaining Homebridge plugins consume a lot of time and effort, if you would like to share your appreciation, feel free to "Star" or donate. 

<a target="blank" href="https://www.paypal.me/nitaybz"><img src="https://img.shields.io/badge/Donate-PayPal-blue.svg"/></a>
<a target="blank" href="https://blockchain.info/payment_request?address=18uuUZ5GaMFoRH5TrQFJATQgqrpXCtqZRQ"><img src="https://img.shields.io/badge/Donate-Bitcoin-green.svg"/></a>

[Click here](https://github.com/nitaybz?utf8=%E2%9C%93&tab=repositories&q=homebridge) to review more of my plugins.
_________________________________________
