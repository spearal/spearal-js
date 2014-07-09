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
class SpearalContext {
	
	constructor() {
		this._codersCache = new Map();
	}
	
	getCoder(value) {
		
		var coder = this._codersCache.get(value.constructor);

		if (coder === undefined) {
			switch (value.constructor) {
			case Boolean:
				coder = function(encoder, value) {
					encoder.writeBoolean(value);
				}
				break;
			case Number:
				coder = function(encoder, value) {
					encoder.writeFloating(value);
				}
				break;
			case String:
				coder = function(encoder, value) {
					encoder.writeString(value);
				}
				break;
			case Function:
				if (this.isClass(value)) {
					coder = function(encoder, value) {
						encoder.writeClass(value);
					}
				}
				else
					coder = this.getCoder(value());
				break;
			case Date:
				coder = function(encoder, value) {
					encoder.writeDate(value);
				}
				break;
			case ArrayBuffer:
				coder = function(encoder, value) {
					encoder.writeByteArray(value);
				}
				break;
			default:
				if (this.isArrayBufferView(value)) {
					coder = function(encoder, value) {
						encoder.writeByteArray(value.buffer);
					}
				}
				else {
					coder = function(encoder, value) {
						encoder.writeBean(value);
					}
				}
				break;
			}
			
			this._codersCache.set(value.constructor, coder);
		}
		
		return coder;
	}
	
	isBoolean(value) {
		return (typeof value === 'boolean');
	}
	
	isIntegral(value) {
		return false;
	}
	
	isBigIntegral(value) {
		return false;
	}
	
	isFloating(value) {
		return (value instanceof Number);
	}
	
	isBigFloating(value) {
		return false;
	}
	
	isString(value) {
		return (value instanceof String);
	}
	
	isArrayBufferView(value) {
		if (ArrayBuffer.isView instanceof Function)
			return ArrayBuffer.isView(value);
		return (value.buffer instanceof ArrayBuffer) && (value.byteLength !== undefined );
	}
	
	isDateTime(value) {
		return (value instanceof Date);
	}
	
	isCollection(value) {
		return (value instanceof Array || value instanceof Set);
	}
	
	isMap(value) {
		return (value instanceof Map);
	}
	
	isEnum(value) {
		return (value instanceof Symbol);
	}
	
	isClass(value) {
		return (value.name !== undefined && window[value.name] instanceof Function);
	}
}
