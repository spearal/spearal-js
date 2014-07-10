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
class _SpearalStandardCoderProvider {
	
	getCoder(value) {
		
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
				encoder.writeDate(value);
			};
		case ArrayBuffer:
			return function(encoder, value) {
				encoder.writeByteArray(value);
			};
		default:
			return function(encoder, value) {
				encoder.writeBean(value);
			};
		}
	}
}
class SpearalFactory {
	
	constructor() {
		this._context = new SpearalContext();
		this._context.coderProviders.push(new _SpearalStandardCoderProvider());
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
