"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _MqttTopic_instances, _MqttTopic_timeout, _MqttTopic_cb, _MqttTopic_state, _MqttTopic_updated, _MqttTopic_message, _MqttTopic_skipped, _MqttTopic_setMessage;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttLogger = exports.MqttTopic = void 0;
const mqtt_1 = require("mqtt");
const mqtt_match_1 = __importDefault(require("mqtt-match"));
var SIGNALS;
(function (SIGNALS) {
    SIGNALS["SIGINT"] = "SIGINT";
    SIGNALS["SIGTERM"] = "SIGTERM";
    SIGNALS["SIGQUIT"] = "SIGQUIT";
})(SIGNALS || (SIGNALS = {}));
class MqttTopic {
    constructor(config) {
        var _a;
        _MqttTopic_instances.add(this);
        _MqttTopic_timeout.set(this, void 0);
        _MqttTopic_cb.set(this, void 0);
        _MqttTopic_state.set(this, void 0);
        _MqttTopic_updated.set(this, void 0);
        _MqttTopic_message.set(this, void 0);
        _MqttTopic_skipped.set(this, 0);
        this.topic = config.topic;
        this.qos = (_a = config.qos) !== null && _a !== void 0 ? _a : 0;
        __classPrivateFieldSet(this, _MqttTopic_timeout, config.timeout || 20000, "f");
        __classPrivateFieldSet(this, _MqttTopic_cb, config.cb, "f");
    }
    skippedCount() {
        return __classPrivateFieldGet(this, _MqttTopic_skipped, "f");
    }
    resetSkippedCount() {
        __classPrivateFieldSet(this, _MqttTopic_skipped, 0, "f");
    }
    hasCallback() {
        return typeof __classPrivateFieldGet(this, _MqttTopic_cb, "f") !== 'undefined' && __classPrivateFieldGet(this, _MqttTopic_cb, "f").length > 0;
    }
    waiting() {
        return !!(__classPrivateFieldGet(this, _MqttTopic_state, "f") || (typeof __classPrivateFieldGet(this, _MqttTopic_state, "f") === typeof setTimeout && __classPrivateFieldGet(this, _MqttTopic_state, "f").hasRef()));
    }
    match(incomingTopic) {
        return (0, mqtt_match_1.default)(this.topic, incomingTopic);
    }
    onMessage(incomingTopic, message) {
        var _a;
        if (!this.match(incomingTopic))
            return;
        console.log(`incoming: ${incomingTopic}`);
        __classPrivateFieldGet(this, _MqttTopic_instances, "m", _MqttTopic_setMessage).call(this, message);
        if (this.waiting()) {
            console.log(`skipping ${incomingTopic.toString().trim()}`);
            __classPrivateFieldSet(this, _MqttTopic_skipped, (_a = __classPrivateFieldGet(this, _MqttTopic_skipped, "f"), _a++, _a), "f");
            return;
        }
        if (this.hasCallback()) {
            __classPrivateFieldGet(this, _MqttTopic_cb, "f").forEach(cb => {
                cb(incomingTopic, this);
            });
        }
        __classPrivateFieldSet(this, _MqttTopic_state, setTimeout(() => {
            __classPrivateFieldSet(this, _MqttTopic_state, undefined, "f");
        }, __classPrivateFieldGet(this, _MqttTopic_timeout, "f")), "f");
    }
    getMessage() {
        return __classPrivateFieldGet(this, _MqttTopic_message, "f");
    }
    toInt() {
        return parseInt(this.toString());
    }
    toString() {
        if (__classPrivateFieldGet(this, _MqttTopic_message, "f") instanceof Buffer) {
            return __classPrivateFieldGet(this, _MqttTopic_message, "f").toString('utf-8');
        }
        return '';
    }
    toFloat() {
        return parseFloat(this.toString());
    }
    getLastUpdate() {
        return __classPrivateFieldGet(this, _MqttTopic_updated, "f");
    }
    getTimeout() {
        return __classPrivateFieldGet(this, _MqttTopic_timeout, "f");
    }
}
exports.MqttTopic = MqttTopic;
_MqttTopic_timeout = new WeakMap(), _MqttTopic_cb = new WeakMap(), _MqttTopic_state = new WeakMap(), _MqttTopic_updated = new WeakMap(), _MqttTopic_message = new WeakMap(), _MqttTopic_skipped = new WeakMap(), _MqttTopic_instances = new WeakSet(), _MqttTopic_setMessage = function _MqttTopic_setMessage(message) {
    __classPrivateFieldSet(this, _MqttTopic_updated, new Date(), "f");
    __classPrivateFieldSet(this, _MqttTopic_message, message, "f");
    return this;
};
class MqttLogger {
    constructor(config) {
        this.topics = [];
        this.assignSignalToLogger = (signals) => {
            const self = this;
            signals.forEach(signal => process.on(signal, () => {
                console.log('Catch exit signal');
                self.exit();
            }));
        };
        this.config = config;
    }
    init(defaultCallbacks = []) {
        var _a, _b;
        this.assignSignalToLogger([SIGNALS.SIGINT, SIGNALS.SIGTERM, SIGNALS.SIGQUIT]);
        const subscribers = (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.subscribe) !== null && _b !== void 0 ? _b : [];
        subscribers.forEach((topicConfig) => {
            const topicConfigWithCallbacks = topicConfig;
            topicConfigWithCallbacks.cb = (topicConfigWithCallbacks.cb || []).concat(defaultCallbacks);
            const Topic = new MqttTopic(topicConfigWithCallbacks);
            this.appendTopic(Topic);
        });
    }
    connect() {
        if (typeof this.connection === 'undefined') {
            this.connection = (0, mqtt_1.connect)(this.getConnectionUrl().href, this.config.broker);
            this.connection.on('connect', this.onConnect());
            this.connection.on('message', this.onMessage());
            this.connection.on('error', this.onExit());
        }
    }
    appendTopic(topic) {
        const topics = (this === null || this === void 0 ? void 0 : this.topics) || [];
        if (!(topic.topic in topics)) {
            this.topics.push(topic);
        }
    }
    exit(code) {
        if (this.connection) {
            this.connection.end();
            this.connection = undefined;
        }
        process.exit(code);
    }
    getConnectionUrl() {
        var _a, _b;
        return new URL((_b = (_a = this.config.broker) === null || _a === void 0 ? void 0 : _a.path) !== null && _b !== void 0 ? _b : '', `${this.config.broker.protocol}://${this.config.broker.host}:${this.config.broker.port}`);
    }
    onMessage() {
        const topics = this.topics;
        return (topic, message) => {
            Object.keys(topics).forEach(function (key, index) {
                const mqttTopic = this[key];
                mqttTopic.onMessage(topic, message);
            }, topics);
        };
    }
    onConnect() {
        const connection = this.connection;
        const subscribes = this.topics;
        return () => {
            subscribes.forEach((subscribeTopic) => {
                console.log(`Subscribing to topic "${subscribeTopic.topic}"`);
                connection.subscribe(subscribeTopic.topic, { qos: subscribeTopic.qos });
            });
        };
    }
    onExit() {
        const self = this;
        return (error) => {
            if (error) //console.error('MQTT Client Error:', error)
                self.exit(error ? 1 : 0);
        };
    }
}
exports.MqttLogger = MqttLogger;
__exportStar(require("./callbacks"), exports);
