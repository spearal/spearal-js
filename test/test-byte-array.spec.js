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
describe('Spearal Byte Array Coding', function() {
	
	function encodeDecode(value, expectedSize) {
		var encoder = new SpearalEncoder();
		encoder.writeAny(value);
		
		var buffer = encoder.buffer;
		if (expectedSize)
			expect(buffer.byteLength).toEqual(expectedSize);
		
		var copy = new SpearalDecoder(buffer).readAny();
		expect(copy instanceof ArrayBuffer).toBeTruthy();
		
		if (SpearalEncoder._isArrayBufferView(value))
			expect(copy).toEqual(value.buffer);
		else
			expect(copy).toEqual(value);
	}
	
	it('Test some ArrayBuffer', function() {
		encodeDecode(new ArrayBuffer(0));
		encodeDecode(new ArrayBuffer(48));
		
		var array = new Uint8Array(new ArrayBuffer(2048));
		for (var i = 0; i < array.byteLength; i++)
			array[i] = i;
		encodeDecode(array.buffer);
	});
	
	it('Test some ArrayBufferView', function() {
		encodeDecode(new Float64Array(new ArrayBuffer(0)));
		encodeDecode(new Uint16Array(new ArrayBuffer(48)));

		var array = new Uint8Array(new ArrayBuffer(2048));
		for (var i = 0; i < array.byteLength; i++)
			array[i] = i;
		encodeDecode(array);
	});
	
	it('Test some DataView', function() {
		encodeDecode(new DataView(new ArrayBuffer(0)));
		
		var array = new DataView(new ArrayBuffer(2048));
		for (var i = 0; i < array.byteLength; i++)
			array.setUint8(i, i);
		encodeDecode(array);
	});
});