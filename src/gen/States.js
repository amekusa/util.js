/**
 * @typedef {object} StateDef
 * State definition.
 */

/**
 * @typedef {string|number|Symbol} StateKey
 * State key. Must be truthy.
 */

/**
 * Finite State Machine implementation.
 * @author Satoshi Soma (github.com/amekusa)
 */
export class States {

	/**
	 * @example
	 * states = new States({
	 *   stateA: {
	 *     // state definition
	 *   },
	 *   stateB: {
	 *     // state definition
	 *   },
	 * });
	 *
	 * @param {object} states - States definitions.
	 */
	constructor(states) {
		this._map = new Map();
		this._curr = undefined;
		this._prev = undefined;
		this._next = undefined;

		// args to pass to `onEnter()` of the next state
		this._nextArgs = undefined;

		// shared context between all states
		this._ctx = null;

		// shared prototype between all states
		let me = this;
		this._stateProto = Object.create(State.prototype, {
			$goto: {
				value(...args) {
					return me.setNext(...args);
				},
			},
			$curr: {
				get() {
					return me.curr;
				},
			},
			$next: {
				get() {
					return me.next;
				},
			},
			$prev: {
				get() {
					return me.prev;
				},
			},
		});

		let keys = Object.keys(states);
		for (let i = 0; i < keys.length; i++) {
			let k = keys[i];
			this.add(k, states[k]);
		}
	}

	/**
	 * The current state.
	 * @type {State}
	 */
	get curr() {
		return this._curr ? this._map.get(this._curr) : undefined;
	}

	/**
	 * The previous state.
	 * @type {State}
	 */
	get prev() {
		return this._prev ? this._map.get(this._prev) : undefined;
	}

	/**
	 * The next state.
	 * @type {State}
	 */
	get next() {
		return this._next ? this._map.get(this._next) : undefined;
	}

	/**
	 * Returns a state by the given key.
	 * @param {StateKey} key
	 * @return {State}
	 */
	get(key) {
		return this._map.get(key);
	}

	/**
	 * Adds a state with the given key.
	 *
	 * @example
	 * states.add('stateA', {
	 *   // state definition
	 * });
	 *
	 * @param {StateKey} key - State id
	 * @param {StateDef} def - State definition.
	 */
	add(key, def) {
		let proto = this._stateProto;

		if (key === '$common') {
			Object.assign(proto, def);
			return;
		}

		let state = Object.create(proto, {
			id: {
				value: key,
			},
		});

		let keys = Object.keys(def);
		for (let i = 0; i < keys.length; i++) {
			let k = keys[i];
			let v = def[k];

			let isPublic = true;
			switch (k.substring(0, 1)) {
			case '_': // private member
				isPublic = false;
				break;
			case '$':
				throw new Error(`ReservedKey`, {cause: k});
			}
			if (Object.hasOwn(state, k)) throw new Error(`ReservedKey`, {cause: k});
			if (isPublic && !Object.hasOwn(proto, k)) proto[k] = toDefault(v);
			state[k] = v;
		}

		this._map.set(key, state);
	}

	/**
	 * Setups this state machine.
	 *
	 * @example
	 * states.setup('stateA', {
	 *   stateA: 'arg1',
	 *   stateB: ['arg1', 'arg2'],
	 *   stateC: [[1, 2, 3], ['a', 'b', 'c']],
	 * });
	 *
	 * @param {StateKey} [initial] - Initial state. Defaults to the first state entry.
	 * @param {object} [args] - Arguments to pass to `setup()` of each state.
	 * @return {Promise}
	 */
	setup(initial = undefined, args = {}) {
		if (!this._ctx) this.setContext();

		let map = this._map;
		if (this._curr) throw new Error(`AlreadyDone`, {cause: 'setup'});
		if (!initial) this._curr = map.keys().next().value; // 1st key
		else if (!map.has(initial)) throw new Error(`NoSuchKey`, {cause: initial});
		else this._curr = initial;

		let tasks = [];
		for (let k of map.keys()) {
			let v = map.get(k);
			if (v.setup) tasks.push(v.setup(...arr(args[k])));
		}
		return tasks.length ? Promise.all(tasks) : Promise.resolve();
	}

	/**
	 * Creates and sets a new context.
	 * @param {object} [data] - Data to set
	 * @return {StateContext} New context
	 */
	setContext(data = undefined) {
		if (this._ctx) throw new Error(`AlreadyExists`, {cause: this._ctx});
		let ctx = this._ctx = new StateContext(data);
		Object.defineProperties(this._stateProto, {
			$: {
				value: ctx,
			},
		});
		return ctx;
	}

	/**
	 * Sets the next state.
	 * @param {StateKey} state
	 * @param {...any} [args] - Arguments to pass to `onEnter()` of `state`.
	 */
	setNext(state, ...args) {
		if (this._next) {
			console.error(`[States] setNext(): The old request has been overriden.`, {
				old: this._next,
				new: state,
			});
		}
		this._next = state;
		this._nextArgs = args;
	}

	/**
	 * Performs a transition to the next state.
	 * @return {Promise}
	 */
	update() {
		if (!this._next) return Promise.resolve(false);
		let next = this._map.get(this._next);
		if (!next) throw new Error(`NoSuchKey`, {cause: this._next});
		let curr = this.curr;

		return prom(next.onEnter ? next.onEnter(curr, ...arr(this._nextArgs)) : undefined).then(res => {
			prom(curr.onLeave ? curr.onLeave(next, res) : undefined).then(() => {
				this._prev = this._curr;
				this._curr = this._next;
				this._next = undefined;
			});

		}).catch(err => {
			console.error(`[States] update(): TransitionFailure`, err);
			return Promise.reject(err);
		});
	}

}

/**
 * A state context.
 */
class StateContext {
	constructor(data = undefined) {
	}
}

/**
 * A state object.
 */
class State {
}

function toDefault(x) {
	switch (typeof x) {
	case 'function':
		return function () {};
	case 'object':
		return null;
	case 'boolean':
		return false;
	case 'number':
		return 0;
	case 'string':
		return '';
	}
	return undefined;
}

function arr(x) {
	return Array.isArray(x) ? x : [x];
}

function prom(x) {
	return x instanceof Promise ? x
		: (x instanceof Error ? Promise.reject(x) : Promise.resolve(x));
}

