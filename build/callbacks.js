"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttConsoleCallback = void 0;
function MqttConsoleCallback(incomingTopic, mqttTopic) {
    console.log(`${mqttTopic.getLastUpdate().toLocaleString()}|${incomingTopic}|${mqttTopic.topic}|${mqttTopic.toString()} (skipped ${mqttTopic.skippedCount()})`);
}
exports.MqttConsoleCallback = MqttConsoleCallback;
