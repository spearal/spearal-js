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
class SpearalFactory {
	
	constructor() {
		this._context = new SpearalContext();
		
		this._context.configurables.push({
			
			encoder: function(value) {
				switch (value.constructor) {

				case Boolean:
					return function(encoder, value) {
						encoder.writeBoolean(value);
					};
				
				case Number:
					return function(encoder, value) {
						encoder.writeFloating(value);
					};
				
				case String:
					return function(encoder, value) {
						encoder.writeString(value);
					};
				
				case Function:
					return function(encoder, value) {
						encoder.writeClass(value);
					};
				
				case Date:
					return function(encoder, value) {
						encoder.writeDateTime(value);
					};
				
				case ArrayBuffer:
					return function(encoder, value) {
						encoder.writeByteArray(value);
					};
				
				case Int8Array:
				case Uint8Array:
				case Int16Array:
				case Uint16Array:
				case Int32Array:
				case Uint32Array:
				case Float32Array:
				case Float64Array:
				case DataView:
					return function(encoder, value) {
						encoder.writeByteArray(value.buffer);
					};
				
				default:
					return function(encoder, value) {
						encoder.writeBean(value);
					};
				}
			},
			
			decoder: function(type) {
				return function(value) {
					return value;
				}
			}
		});
	}
	
	configure(configurable) {
		this._context.configurables.unshift(configurable);
	}
	
	get context() {
		return this._context;
	}
	
	newEncoder() {
		return new SpearalEncoder(this._context);
	}
	
	newDecoder(buffer) {
		return new SpearalDecoder(this._context, buffer);
	}
}
