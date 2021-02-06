

var Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-delay-switch", "DelaySwitch", delaySwitch);
}


function delaySwitch(log, config, api) {
    let UUIDGen = api.hap.uuid;

    this.log = log;
    this.name = config['name'];
    this.delay = config['delay'];
    this.disableSensor = config['disableSensor'] || false;
    this.startOnReboot = config['startOnReboot'] || false;
    this.actAsBulb = config['actAsBulb'] || false;
    this.timer;
    this.switchOn = false;
    this.brightness = 0;
    this.motionTriggered = false;
    this.uuid = UUIDGen.generate(this.name)
}

delaySwitch.prototype.createMainService = function (name) {
    if (this.mainService) return this.mainService;
    if (this.actAsBulb) return this.createLightBulb(name);
    return new Service.Switch(name);
}

delaySwitch.prototype.createLightBulb = function (name) {
    const service = new Service.Lightbulb(name);

    service.getCharacteristic(Characteristic.Brightness)
        .on('get', cb => cb(null, this.brightness))
        .on('set', this.setBrightness.bind(this));

    return service;
}

delaySwitch.prototype.getServices = function () {
    var informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Manufacturer, "Delay Switch")
        .setCharacteristic(Characteristic.Model, `Delay-${this.delay}ms`)
        .setCharacteristic(Characteristic.SerialNumber, this.uuid);


    this.mainService = this.createMainService(this.name);

    this.mainService.getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));

    if (this.startOnReboot)
        this.mainService.setCharacteristic(Characteristic.On, true)

    var services = [informationService, this.mainService]

    if (!this.disableSensor) {
        this.motionService = new Service.MotionSensor(this.name + ' Trigger');

        this.motionService
            .getCharacteristic(Characteristic.MotionDetected)
            .on('get', this.getMotion.bind(this));
        services.push(this.motionService)
    }

    return services;

}

delaySwitch.prototype.update = function () {
    const unit = Math.min(Math.floor(this.delay / 1000 / 20), 5);
    this.timer = setTimeout(() => {
        this.brightness = (Math.floor(this.brightness / unit) - 1) * unit;

        this.mainService.getCharacteristic(Characteristic.Brightness).updateValue(this.brightness);
        this.log(`${this.brightness}s remains`);

        if (this.brightness <= 0) {
            this.timeout();
        } else {
            this.update();
        }
    }, unit * 1000);
}

delaySwitch.prototype.setBrightness = function (brightness, callback) {
    this.log(`Set the Timer with ${brightness}%`);
    
    this.brightness = brightness;
    
    clearTimeout(this.timer);

    if (0 < brightness) {
        this.update();
    }

    callback();
}

delaySwitch.prototype.timeout = function () {
    this.log('Time is Up!');
    this.mainService.getCharacteristic(Characteristic.On).updateValue(false);
    this.switchOn = false;

    if (!this.disableSensor) {
        this.motionTriggered = true;
        this.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(true);
        this.log('Triggering Motion Sensor');
        setTimeout(function () {
            this.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(false);
            this.motionTriggered = false;
        }.bind(this), 3000);
    }
}

delaySwitch.prototype.setOn = function (on, callback) {
    if (!on) {
        this.log('Stopping the Timer');

        this.switchOn = false;
        clearTimeout(this.timer);
        this.motionTriggered = false;
        if (!this.disableSensor) this.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(false);
    } else {
        this.log('Starting the Timer');
        this.switchOn = true;

        if (!this.actAsBulb) {
            clearTimeout(this.timer);
            this.timer = setTimeout(function () {
                this.timeout();
            }.bind(this), this.delay);
        }
    }

    callback();
}



delaySwitch.prototype.getOn = function (callback) {
    callback(null, this.switchOn);
}

delaySwitch.prototype.getMotion = function (callback) {
    callback(null, this.motionTriggered);
}
