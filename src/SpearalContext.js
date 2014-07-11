/**
 * == @Spearal ==>
 * 
 * Copyright (C) 2014 Franck WOLFF & William DRAI (http://www.spearal.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Franck WOLFF
 */

class _SpearalClassDescriptor {
	
	constructor(className, propertyNames) {
		this.className = className;
		this.propertyNames = propertyNames;
	}
	
	get description() {
		return this.className + '#' + this.propertyNames.join(',');
	}
	
	static forDescription(description) {
		var classProperties = description.split('#');
		return new _SpearalClassDescriptor(classProperties[0], classProperties[1].split(','));
	}
}

class SpearalContext {
	
	constructor() {
		this._configurables = [];
		
		this._encodersCache = new Map();
		this._decodersCache = new Map();
	}
	
	get configurables() {
		return this._configurables;
	}
	
	normalize(value) {
		return value;
	}
	
	_findConfigurable(name, param = undefined) {
		for (var configurable of this._configurables) {
			var configurableFunction = configurable[name];
			if (configurableFunction !== undefined) {
				if (param !== undefined)
					configurableFunction = configurableFunction(param);
				if (configurableFunction !== undefined)
					return configurableFunction;
			}
		}
	}
	
	getDescriptor(value, filter = null) {
		if (this._descriptor == null) {
			if ((this._descriptor = this._findConfigurable('descriptor')) == null)
				throw "No descriptor for value: " + value;
		}
		return this._descriptor(value, filter);
	}
	
	getEncoder(value) {
		var type = value.constructor,
			encoder = this._encodersCache.get(type);

		if (encoder == null) {
			if ((encoder = this._findConfigurable('encoder', value)) == null)
				throw "No encoder for type: " + value;
			this._encodersCache.set(type, encoder);
		}
		
		return encoder;
	}
	
	getInstance(descriptor) {
		if (this._instantiator == null) {
			if ((this._instantiator = this._findConfigurable('instantiator')) == null)
				throw "No instantiator for value: " + value;
		}
		return this._instantiator(descriptor);
	}
	
	getDecoder(type) {
		var decoder = this._decodersCache.get(type);

		if (decoder == null) {
			if ((decoder = this._findConfigurable('decoder', type)) == null)
				throw "No decoder for type: " + type;
			this._decodersCache.set(type, decoder);
		}
		
		return decoder;
	}
}
