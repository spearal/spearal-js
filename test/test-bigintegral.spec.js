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

function BigInteger(value) {
	this._value = value.toString();
}
BigInteger.prototype.toString = function() {
	return this._value;
}

describe('Spearal Big Floating Coding', function() {

	var factory = new SpearalFactory();
	
	factory.configure({
		
		encoder: function(value) {
			if (value instanceof BigInteger) return function(encoder, value) {
				encoder.writeBigIntegral(value.toString());
			};
		},
		
		decoder: function(type) {
			if (type === SpearalType.BIG_INTEGRAL) return function(value) {
				return new BigInteger(value);
			};
		}
	});
	
	function encodeDecode(value, expectedSize) {
		var encoder = factory.newEncoder();
		encoder.writeAny(value);

		var buffer = encoder.buffer;
		if (expectedSize)
			expect(buffer.byteLength).toEqual(expectedSize);
		
		var copy = factory.newDecoder(buffer).readAny();
		expect(copy instanceof BigInteger).toBeTruthy();
		expect(copy).toEqual(value);
		return copy;
	}
	
	it('Test some big floating', function() {
		var big = new BigInteger("1234567890");
		encodeDecode(big);
	});
});