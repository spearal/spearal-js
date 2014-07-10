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
		this.coderProviders = [];
		this._codersCache = new Map();
	}
	
	normalize(value) {

		function isArrayBufferView(value) {
			if (ArrayBuffer.isView instanceof Function)
				return ArrayBuffer.isView(value);
			return (value.buffer instanceof ArrayBuffer) && (value.byteLength !== undefined);
		}
		
		if (isArrayBufferView(value))
			value = value.buffer;
		
		return value;
	}
	
	getCoder(value) {
		var coder = this._codersCache.get(value.constructor);

		if (coder == null) {
			var length = this.coderProviders.length;
			for (var i = 0; i < length; i++) {
				coder = this.coderProviders[i].getCoder(value);
				if (coder != null)
					break;
			}
			if (coder == null)
				throw "No coder for value: " + value;
			this._codersCache.set(value.constructor, coder);
		}
		
		return coder;
	}
}
