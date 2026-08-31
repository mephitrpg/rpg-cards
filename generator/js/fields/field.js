const UI_FIELDS = new Map();
const UI_FIELDS_CONFIGURATION_PREPARE = new Map();
const UI_FIELDS_CONFIGURATION = new Map();

/**
 * Represents a data-bound form field that synchronizes DOM input elements
 * with global state objects.
 *
 * Supports:
 * - Inputs referenced by `id` or groups referenced by `name`
 * - Default value resolution via `"Object.key"` or `default_Object()`
 * - Automatic syncing on `input` and `change` events
 * - Optional custom value getters and event listeners
 */
class Field {

    /**
     * Returns the identifier of an options object (id or name).
     * @param {{id?: string, name?: string}} x
     * @returns {string}
     */
    static identifier(x) {
        return x.id || x.name;
    }

    #preventInternalEvents = false;

    /**
     * Resolve a property description such as `"object.key"` or `[fn, "key"]`
     * into: { dataName, key, data, value }
     *
     * @private
     * @param {string | [Function,string]} property
     * @returns {{dataName: string|Function, key: string, data: Object|Function, value: any}}
     * @throws {Error}
     */
    #getPropertyData(property) {
        let _property = property;

        if (typeof _property === 'string') {
            _property = _property.split('.');
        }

        if (Array.isArray(_property) && _property.length === 2) {
            const [dataName, key] = _property;

            // function returning a data object
            if (typeof dataName === 'function') {
                const data = dataName;
                const result = data();
                return { dataName, key, data, value: result?.[key] ?? null };
            }

            if (typeof dataName === 'string') {
                // name of a function returning a data object
                if (typeof window[dataName] === 'function') {
                    const data = window[dataName];
                    const result = data();
                    return { dataName, key, data, value: result?.[key] ?? null };
                }
                // "objectName.key"
                const data = window[dataName];
                return { dataName, key, data, value: data?.[key] ?? null };
            }
        }

        throw new Error(`Field's property or defaultProperty invalid value`);
    }

    /**
     * Check if a value is null or undefined.
     * @private
     * @param {*} value - The value to check.
     * @returns {boolean} True if value is null or undefined, false otherwise.
     */
    #isNil(value) {
        return value == null;
    }

    /**
     * @typedef {Object} FieldOptions
     * @property {string|[Function,string]} property
     *      Path such as `"object.key"` or `[() => object, "key"]`.
     *
     * @property {string|[Function,string]} [defaultProperty]
     *      Optional default value path.
     *
     * @property {string} [id]
     *      The element id (for single element fields).
     *
     * @property {string} [name]
     *      The name of the element group (for radios).
     *
     * @property {(field: Field) => void} [init]
     *      Optional callback invoked after setup.
     *
     * @property {Array.<[string, EventListener]>} [events]
     *      Additional listeners: `[["click", handler, options]]`.
     *      If "handler" is a string, then eventListeners[handler] will be used.
     *
     * @property {any} [eventListeners]
     *      Optional map of event handler functions.
     *
     * @property {(value:any)=>any} [valueGetter]
     *      Value parser/transformer. Defaults to:
     *      - Boolean for checkboxes
     *      - String for others
     *
     * @property {boolean} [autoDebounce]
     *      Debounce configured `input`, `keyup`, and `scroll` callbacks. Defaults
     *      to true; internal data synchronization remains immediate.
     */

    /**
     * Create a new Field.
     * @param {FieldOptions} options
     * @throws {Error}
     */
    constructor(options) {
        const {
            property,
            defaultProperty,
            name,
            id,
            init,
            events,
            eventListeners,
            valueGetter,
            valueSetter,
        } = options;

        let {
            autoDebounce,
            initWithDefaultValue
        } = options;

        if (!id && !name) throw new Error(`Field's id or name are required.`);
        if (id && name) throw new Error(`Field's name must be omitted when an id is provided.`);
        if (!property) throw new Error(`Field's property is required.`);

        autoDebounce ??= true;
        initWithDefaultValue ??= true;

        this.options = Object.assign({}, options, {
            autoDebounce,
            initWithDefaultValue
        });
        this.events = events;

        // Property linking
        const propertyData = this.#getPropertyData(property);
        this.key = propertyData.key;
        this.data = propertyData.data;
        this.dataName = propertyData.dataName;


        // DOM element lookup
        let el = null;
        let type = '';
        let isList = false;

        if (id) {
            el = document.getElementById(id);
            if (!el) throw new Error(`Field's element with id="${id}" not found`);
            this.id = id;
            type = el.type;
        } else {
            const list = document.getElementsByName(name);
            if (!list.length) throw new Error(`Field's elements with name="${name}" not found`);
            el = Array.from(list);
            this.name = name;
            isList = true;
            type = 'radioGroup';
        }

        /** @type {HTMLElement|HTMLElement[]} */
        this.el = el;
        /** @type {string} */
        this.type = type;
        /** @type {boolean} */
        this.isList = isList;

        // Value parser
        if (valueGetter) this.valueGetter = valueGetter;
        else if (type === 'checkbox') this.valueGetter = Boolean;
        else this.valueGetter = String;

        // Value setter for bidirectional conversion
        if (valueSetter) this.valueSetter = valueSetter;

        // Initial value
        let _value = this.getData();
        if (initWithDefaultValue && this.#isNil(_value)) _value = this.getDefaultValue();
        // Initialization must not write to storage: fields can be created before
        // all state (for example, the selected card) is available.  Keep the
        // previous in-memory initialization behavior without persisting it.
        this.setValue(_value);
        this.setData(_value);

        // Event listeners
        const elements = isList ? el : [el];
        elements.forEach(element => {
            element.addEventListener('input', () => {
                if (this.#preventInternalEvents) return;
                this.setData(this.getValue());
                this.storeData();
            });
            element.addEventListener('change', () => {
                if (this.#preventInternalEvents) return;
                this.setData(this.getValue());
                this.storeData();
            });
            // Events that should be debounced with their timing
            const debouncedEvents = {
                'input': 250,    // 250ms for complex HTML rendering
                'keyup': 250,    // 250ms for complex HTML rendering
                'scroll': 16     // 16ms for 60fps scrolling
            };

            events?.forEach(args => {
                const [ name, callback, options ] = args || [];
                
                if (typeof callback === 'function') {
                    let finalCallback = callback;
                    if (debouncedEvents[name] && autoDebounce) {
                        finalCallback = debounce(callback, debouncedEvents[name]);
                    }
                    element.addEventListener(name, finalCallback, options);
                } else if (typeof callback ==='string') {
                    let eventCallback = eventListeners?.[callback];
                    if (typeof eventCallback !== 'function') {
                        throw new Error(
                            `Field "${Field.identifier(this)}" event "${name}" references missing handler "${callback}".`
                        );
                    }
                    if (debouncedEvents[name] && autoDebounce) {
                        eventCallback = debounce(eventCallback, debouncedEvents[name]);
                    }
                    element.addEventListener(name, eventCallback, options);
                }
            });
        });

        /** @type {JQuery<HTMLElement>} */
        this.$el = $(el);

        init?.(this);
    }

    /**
     * Persist data (uses global `local_store_save()`).
     * @returns {void}
     */
    storeData() {
        local_store_save();
    }

    /**
     * Get the current value from the bound data object.
     * @returns {*}
     */
    getData() {
        const { data, key } = this;
        if (!data) return null;
        if (typeof data === 'function') {
            const result = data();
            return result?.[key] ?? null;
        }
        return data[key];
    }

    /**
     * Update the underlying data value.
     * @param {*} v
     * @returns {void}
     */
    setData(v) {
        const { data, key } = this;
        if (!data) return;
        if (typeof data === 'function') {
            const result = data();
            if (!result) return;
            result[key] = v;
        } else {
            data[key] = v;
        }
    }

    /**
     * Read the current DOM value and parse it using valueGetter/valueSetter.
     * @returns {*}
     */
    getValue() {
        const { el, valueGetter, valueSetter } = this;
        if (!el) return undefined;

        let result;

        switch (this.type) {
            case 'checkbox':
                result = valueGetter(el.checked);
                break;

            case 'radioGroup':
                for (const radio of el) {
                    if (radio.checked) {
                        result = valueGetter(radio.value);
                        break;
                    }
                }
                break;

            case 'select-multiple':
                result = Array
                    .from(el.options)
                    .filter(o => o.selected)
                    .map(o => valueGetter(o.value));
                break;

            default:
                result = valueGetter(el.value);
        }

        // Apply valueSetter for bidirectional conversion if present
        if (valueSetter) {
            result = valueSetter(result);
        }

        return result;
    }

    /**
     * Update the DOM element's displayed value.
     * @param {*} v
     * @returns {void}
     */
    setValue(v) {
        const { el, valueGetter } = this;
        if (!el) return;

        switch (this.type) {
            case 'checkbox':
                el.checked = !!v;
                break;

            case 'radioGroup':
                for (const radio of el) {
                    if (valueGetter(radio.value) === v) {
                        radio.checked = true;
                        break;
                    }
                }
                break;

            case 'select-multiple':
                const selectedValues = Array.isArray(v) ? v : [];
                for (const opt of el.options) {
                    opt.selected = selectedValues.includes(valueGetter(opt.value));
                }
                break;

            default:
                // Use valueGetter to convert the value for DOM display
                try {
                    const displayValue = valueGetter ? valueGetter(v) : (v ?? '');
                    // Robust null/undefined check
                    if (this.#isNil(displayValue) || (typeof displayValue === 'string' && displayValue.toLowerCase() === 'null')) {
                        el.value = '';
                    } else {
                        el.value = displayValue;
                    }
                } catch (e) {
                    // Fallback for any conversion errors
                    el.value = '';
                }
        }
    }

    // Default value resolution
    getDefaultValue() {
        const defaultProperty = this.options.defaultProperty;
        let dp;
        if (defaultProperty) {
            dp = this.#getPropertyData(defaultProperty);
        } else {
            if (typeof this.dataName !== 'string') {
                throw new Error(
                    `Field "${Field.identifier(this)}" requires defaultProperty when its property uses a function.`
                );
            }
            dp = this.#getPropertyData([`default_${this.dataName}`, this.key]);
        }
        return dp.value;
    }

    /**
     * Returns the empty value for the field based on its type.
     * @returns {*} The empty value: false for checkboxes, [] for lists, '' otherwise.
     */
    getEmptyValue() {
        return this.type === 'checkbox' ? false : (this.isList ? [] : '');
    }

    /**
     * Returns the first non-null value among the field's current value, default value, or empty value.
     * @returns {*} The fallback value for the field.
     */
    getFallbackValue() {
        return this.getValue() ?? this.getDefaultValue() ?? this.getEmptyValue();        
    }

    /**
     * Returns the first non-null value among the field's data value, default value, or empty value.
     * This checks the underlying data object, not the DOM value.
     * @returns {*} The fallback value for the field.
     */
    getFallbackData() {
        return this.getData() ?? this.getDefaultValue() ?? this.getEmptyValue();        
    }

    /**
     * Programmatically change the field value and fire input and change events.
     *
     * @param {*} v
     * @param {{updateData?: boolean}} [options]
     * @returns {void}
     */
    changeValue(v, options) {
        let updateData = options?.updateData ?? true;
        if (!updateData) this.#preventInternalEvents = true;

        this.setValue(v);
        this.trigger();

        if (!updateData) this.#preventInternalEvents = false;
    }

    /**
     * Reset field to its default value (fires events).
     */
    reset() {
        this.changeValue(this.options.initWithDefaultValue ? this.getDefaultValue() : this.getEmptyValue());
    }

    /**
     * Set DOM value, update data, and persist, without firing events.
     * @param {*} v
     */
    update(v) {
        this.setValue(v);
        this.setData(v);
        this.storeData();
    }

    /**
     * Dispatch event(s) on the field element.
     * @param {string|string[]} [eventName] - Event name(s) to dispatch. Defaults to ['input', 'change'] if not provided.
     * @returns {void}
     */
    trigger(eventName) {
        let el = this.el;
        if (this.isList) {
            const firstEl = el[0];
            if (firstEl?.type === 'radio') el = firstEl;
        }
        if (Array.isArray(eventName)) {
            eventName.forEach(e => el.dispatchEvent(new Event(e)));
        } else if (eventName && typeof eventName === 'string') {
            el.dispatchEvent(new Event(eventName));
        } else {
            el.dispatchEvent(new Event('input'));
            el.dispatchEvent(new Event('change'));
        }
    }
}

/**
 * Create and register a new Field.
 * @param {FieldOptions} options
 * @returns {Field}
 */
function initField(options) {
    const identifier = Field.identifier(options);
    if (UI_FIELDS.has(identifier)) {
        throw new Error(`Field with id or name "${identifier}" already exists.`);
    }
    const field = new Field(options);
    UI_FIELDS.set(identifier, field);
    return field;
}

/**
 * Find a field by identifier or by matching a property value.
 *
 * @param {string} identifier - Property name to match: "id", "name", "el", etc.
 * @param {*} [value] - Value to match.
 * @returns {Field|undefined}
 */
function getField(identifier, value) {
    if (value === undefined) {
        return UI_FIELDS.get(identifier);
    }

    for (const [, field] of UI_FIELDS) {
        if (identifier === 'el' && field.isList) {
            if (field.el.some(e => e === value)) return field;
        } else if (field[identifier] === value) {
            return field;
        }
    }

    return undefined;
}

/**
 * Get a group of fields from UI_FIELDS_CONFIGURATION.
 *
 * @param {string} category
 * @returns {Field[]}
 */
function getFieldGroup(category) {
    return UI_FIELDS_CONFIGURATION
        .get(category)
        .reduce((result, conf) => {
            const field = getField(Field.identifier(conf));
            return [...result, field];
        }, []);
}
