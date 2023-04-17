# MQTT Logger
- [Installation](#installation)
- [Usage](#usage)

## Installation
```shell
npm install mqtt-logger
```

## Usage

```javascript
const {MqttConsoleCallback, MqttLogger, MqttTopic} = require('mqtt-logger')
const config = {
    broker: {
        port: 1883,
        host: 'localhost',
        protocol: 'mqtt'
    }
}
const mqttLogger = new MqttLogger(config)
mqttLogger.appendTopic(
    new MqttTopic(
        {
            topic: 'Sensor/+/+',
            timeout: 20000,
            cb: [MqttConsoleCallback]
        }
    )
)

mqttLogger.init()
mqttLogger.connect()
```