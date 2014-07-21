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
describe('Spearal Map Coding', function() {
	
	var factory = new SpearalFactory();
	
	function encodeDecode(value, expectedSize) {
		var encoder = factory.newEncoder();
		encoder.writeAny(value);
		
		var buffer = encoder.buffer;
		if (expectedSize)
			expect(buffer.byteLength).toEqual(expectedSize);
		
		var copy = factory.newDecoder(buffer).readAny();
		expect(copy).toEqual(value);
	}
	
	it('Test some Map', function() {
		encodeDecode(new Map());
		encodeDecode(new Map([["key1", "value1"], ["key2", "value2"]]));
		encodeDecode(new Map([["abc", "def"], [3, "value2"], ["key1", "value1"], ["key2", "value2"]]));
	});
});