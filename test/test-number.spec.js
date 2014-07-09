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
describe('Spearal Number Coding', function() {
	
	function encodeDecode(value, expectedSize) {
		var encoder = new SpearalEncoder();
		encoder.writeAny(value);

		var buffer = encoder.buffer;
		if (expectedSize)
			expect(buffer.byteLength).toEqual(expectedSize);
		
		var copy = new SpearalDecoder(buffer).readAny();
		if (Number.isNaN(value))
			expect(copy).toBeNaN();
		else if (value === 0 && (1/value) === Number.NEGATIVE_INFINITY)
			expect(1/copy).toEqual(Number.NEGATIVE_INFINITY);
		else
			expect(copy).toEqual(value);
	}
	
	it('Test special number values', function() {
		encodeDecode(Number.NEGATIVE_INFINITY, 9);
		encodeDecode(-Number.MAX_VALUE, 9);
		encodeDecode(-Math.PI, 9);
		encodeDecode(-Math.E, 9);
		encodeDecode(-Number.MIN_VALUE, 9);
		encodeDecode(-0.0, 9);
		encodeDecode(Number.NaN, 9);
		encodeDecode(0.0, 2);
		encodeDecode(Number.MIN_VALUE, 9);
		encodeDecode(Math.E, 9);
		encodeDecode(Math.PI, 9);
		encodeDecode(Number.MAX_VALUE, 9);
		encodeDecode(Number.POSITIVE_INFINITY, 9);
	});
	
	it('Test [-0xff, 0xff] number values', function() {
		for (var i = 0x01; i <= 0xff; i++) {
			encodeDecode(-i, 2);
			encodeDecode(i, 2);
		}
	});
	
	it('Test some integral number values', function() {
		encodeDecode(0x100, 3);
		encodeDecode(0xffff, 3);
		encodeDecode(0x10000, 4);
		encodeDecode(0xffffff, 4);
		encodeDecode(0x1000000, 5);
		encodeDecode(0xffffffff, 5);
		encodeDecode(0x100000000, 6);
		encodeDecode(0xffffffffff, 6);
		encodeDecode(0x10000000000, 7);
		encodeDecode(0xffffffffffff, 7);
	});
	
	it('Test some number values', function() {
		encodeDecode(-0.1, 2);
		encodeDecode( 0.1, 2);
		
		encodeDecode(-0.2, 2);
		encodeDecode( 0.2, 2);
		
		encodeDecode(-0.255, 2);
		encodeDecode( 0.255, 2);
		
		encodeDecode(-0.256, 3);
		encodeDecode( 0.256, 3);
		
		encodeDecode(-0.3, 3);
		encodeDecode( 0.3, 3);
		
		encodeDecode(-0.4, 3);
		encodeDecode( 0.4, 3);
		
		encodeDecode(-0.9, 3);
		encodeDecode( 0.9, 3);
		
		encodeDecode(-0.999, 3);
		encodeDecode( 0.999, 3);
		
		encodeDecode(-4294967.295, 5);
		encodeDecode( 4294967.295, 5);
	});
});