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

function Apple(color, size) {
	this.color = color;
	this.size = size;
}

describe('Spearal Bean Coding', function() {
	
	var factory = new SpearalFactory();
	
	function encodeDecode(value, filter) {
		var encoder = factory.newEncoder(filter);
		encoder.writeAny(value);

		return factory.newDecoder(encoder.buffer).readAny();
	}
	
	it('Test _class bean', function() {
		var bean = {
			_class: 'org.test.MyBean',
			name: 'John Doo'
		};
		var copy = encodeDecode(bean);
		expect(copy).toEqual(bean);
		
		bean.self = bean;
		copy = encodeDecode(bean);
		expect(copy).toEqual(bean);
		expect(copy.self === copy).toBeTruthy();
	});
	
	it('Test Apple bean', function() {
		var bean = new Apple("green", 3);
		
		var copy = encodeDecode(bean);
		expect(copy).toEqual(bean);
		
		bean.self = bean;
		copy = encodeDecode(bean);
		expect(copy instanceof Apple).toBeTruthy();
		expect(copy).toEqual(bean);
		expect(copy.self === copy).toBeTruthy();
	});
	
	it('Test partial _class bean', function() {
		var bean = {
			_class: 'org.test.MyBean',
			name: 'John Doo',
			nickname: 'Johnny',
			age: 12,
			height: 1.2
		};
		
		var filter = new SpearalPropertyFilter();
		filter.set(bean._class, 'name', 'age');
		
		var copy = encodeDecode(bean, filter);
		expect(copy._class).toEqual(bean._class);
		expect(copy.name).toEqual(bean.name);
		expect(copy.age).toEqual(bean.age);
		expect(copy.nickname).toBeUndefined();
		expect(copy.height).toBeUndefined();
		
		bean.self = bean;
		filter.set(bean._class, 'name', 'age', 'self');
		copy = encodeDecode(bean, filter);
		expect(copy._class).toEqual(bean._class);
		expect(copy.name).toEqual(bean.name);
		expect(copy.age).toEqual(bean.age);
		expect(copy.nickname).toBeUndefined();
		expect(copy.height).toBeUndefined();
		expect(copy.self === copy).toBeTruthy();
	});
	
	it('Test partial Apple bean', function() {
		var bean = new Apple("green", 3);
		
		var encoder = factory.newEncoder();
		encoder.filter.set(bean.constructor.name, "color");
		encoder.writeAny(bean);

		var copy = factory.newDecoder(encoder.buffer).readAny();
		expect(copy instanceof Apple).toBeTruthy();
		expect(copy.color).toEqual(bean.color);
		expect(copy.size).toBeUndefined();
	});
});