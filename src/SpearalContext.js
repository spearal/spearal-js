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
	
	getEncoder(value) {
		var type = value.constructor,
			encoder = this._encodersCache.get(type);

		if (encoder == null) {
			for (var i = 0; i < this._configurables.length; i++) {
				if (this._configurables[i].encoder !== undefined) {
					if ((encoder = this._configurables[i].encoder(value)) != null)
						break;
				}
			}
			if (encoder == null)
				throw "No encoder for type: " + type;
			this._encodersCache.set(type, encoder);
		}
		
		return encoder;
	}
	
	getDecoder(type) {
		var decoder = this._decodersCache.get(type);

		if (decoder == null) {
			for (var i = 0; i < this._configurables.length; i++) {
				if (this._configurables[i].decoder !== undefined) {
					if ((decoder = this._configurables[i].decoder(type)) != null)
						break;
				}
			}
			if (decoder == null)
				throw "No decoder for type: " + type;
			this._decodersCache.set(type, decoder);
		}
		
		return decoder;
	}
}
