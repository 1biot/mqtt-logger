import { MqttTopic } from "./"

export type MqttCallback = (incomingTopic:string, mqttTopic: MqttTopic) => void

export interface OnMessageCallback
{
    (topic: string, message: Buffer): void
}

export function MqttConsoleCallback(incomingTopic: string, mqttTopic: MqttTopic)
{
    console.log(`${mqttTopic.getLastUpdate().toLocaleString()}|${incomingTopic}|${mqttTopic.topic}|${mqttTopic.toString()} (skipped ${mqttTopic.skippedCount()})`)
}
