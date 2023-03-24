import {Client, IClientOptions, connect} from 'mqtt'
import {MqttCallback, OnMessageCallback} from './callbacks'
import match from 'mqtt-match'
import {QoS} from "mqtt-packet";

enum SIGNALS
{
    SIGINT = 'SIGINT',
    SIGTERM = 'SIGTERM',
    SIGQUIT = 'SIGQUIT',
}

interface MqttTopicConfig
{
    topic: string
    qos?: QoS
    timeout?: number
    cb?: Array<MqttCallback>
}

interface MqttLoggerConfig
{
    broker: IClientOptions,
    subscribe?: Array<MqttTopicConfig>
}

export class MqttTopic
{
    readonly topic: string
    readonly qos: QoS
    readonly #timeout?: number
    readonly #cb?: Array<MqttCallback>

    #state?: ReturnType<typeof setTimeout>
    #updated?: Date
    #message?: Buffer
    #skipped: number = 0

    constructor(config: MqttTopicConfig)
    {
        this.topic = config.topic
        this.qos = config.qos ?? 0
        this.#timeout = config.timeout || 20000
        this.#cb = config.cb
    }

    skippedCount(): number
    {
        return this.#skipped
    }

    hasCallback(): boolean
    {
        return typeof this.#cb !== 'undefined' && this.#cb.length > 0
    }

    waiting(): boolean
    {
        return !!(this.#state || (typeof this.#state === typeof setTimeout && this.#state.hasRef()));
    }

    match(incomingTopic: string): boolean
    {
        return match(this.topic, incomingTopic)
    }

    onMessage(incomingTopic: string, message: Buffer): void
    {
        if (!this.match(incomingTopic)) return

        console.log(`incoming: ${incomingTopic}`)
        this.#setMessage(message)
        if (this.waiting()) {
            console.log(`skipping ${incomingTopic.toString().trim()}`)
            this.#skipped++
            return
        }

        if (this.hasCallback()) {
            this.#cb.forEach(cb => {
                cb(incomingTopic, this)
            })
        }

        this.#state = setTimeout(() => {
            this.#state = undefined
        }, this.#timeout)
    }

    getMessage(): Buffer|undefined
    {
        return this.#message
    }

    toInt(): number
    {
        return parseInt(this.toString())
    }

    toString(): string
    {
        if (this.#message instanceof Buffer) {
            return this.#message.toString('utf-8')
        }

        return ''
    }

    toFloat(): number
    {
        return parseFloat(this.toString())
    }

    getLastUpdate(): Date|undefined
    {
        return this.#updated
    }

    getTimeout(): number
    {
        return this.#timeout
    }

    #setMessage(message: Buffer): MqttTopic
    {
        this.#updated = new Date()
        this.#message = message
        return this
    }
}

export class MqttLogger
{

    private readonly config: MqttLoggerConfig
    private topics: Array<MqttTopic> = []
    private connection?: Client

    constructor(config: MqttLoggerConfig)
    {
        this.config = config
    }

    init(defaultCallbacks: Array<MqttCallback> = []): void
    {
        this.assignSignalToLogger([SIGNALS.SIGINT, SIGNALS.SIGTERM, SIGNALS.SIGQUIT])
        const subscribers = this.config?.subscribe ?? []
        subscribers.forEach((topicConfig: MqttTopicConfig) => {
            const topicConfigWithCallbacks = topicConfig
            topicConfigWithCallbacks.cb = (topicConfigWithCallbacks.cb || []).concat(defaultCallbacks)
            const Topic: MqttTopic = new MqttTopic(topicConfigWithCallbacks)
            this.appendTopic(Topic)
        })
    }

    connect(): void
    {
        if (typeof this.connection === 'undefined') {
            this.connection = connect(this.getConnectionUrl().href, this.config.broker)
            this.connection.on('connect', this.onConnect())
            this.connection.on('message', this.onMessage())
            this.connection.on('error', this.onExit())
        }
    }

    appendTopic(topic: MqttTopic)
    {
        const topics = this?.topics || []
        if (!(topic.topic in topics)) {
            this.topics.push(topic)
        }
    }

    assignSignalToLogger = (signals: Array<SIGNALS>) => {
        const self = this
        signals.forEach(signal => process.on(signal, () => {
            console.log('Catch exit signal')
            self.exit()
        }))
    }

    exit(code?: number): void
    {
        if (this.connection) {
            this.connection.end()
            this.connection = undefined
        }

        process.exit(code)
    }

    private getConnectionUrl(): URL
    {
        return new URL(
            this.config.broker?.path ?? '' ,
            `${this.config.broker.protocol}://${this.config.broker.host}:${this.config.broker.port}`
        )
    }

    private onMessage(): OnMessageCallback
    {
        const topics: Array<MqttTopic> = this.topics
        return (topic: string, message: Buffer) => {
            Object.keys(topics).forEach(function(key, index) {
                const mqttTopic: MqttTopic = this[key]
                mqttTopic.onMessage(topic, message)
            }, topics)
        }
    }

    private onConnect()
    {
        const connection = this.connection
        const subscribes = this.topics
        return () => {
            subscribes.forEach((subscribeTopic: MqttTopic) => {
                console.log(`Subscribing to topic "${subscribeTopic.topic}"`)
                connection.subscribe(subscribeTopic.topic, {qos: subscribeTopic.qos})
            })
        }
    }

    private onExit()
    {
        const self = this
        return (error?: Error) => {
            if (error) //console.error('MQTT Client Error:', error)
            self.exit(error ? 1 : 0)
        }
    }
}

export * from './callbacks'
