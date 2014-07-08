describe('Spearal Bean Coding', function() {
	
	function encodeDecode(value, expectedSize) {
		var encoder = new SpearalEncoder();
		encoder.writeAny(value);

		var buffer = encoder.buffer;
		if (expectedSize)
			expect(buffer.byteLength).toEqual(expectedSize);
		
		var copy = new SpearalDecoder(buffer).readAny();
		expect(copy).toEqual(value);
		return copy;
	}
	
	it('Test some bean', function() {
		var bean = {
			_class: 'org.test.MyBean',
			name: 'John Doo'
		};
		encodeDecode(bean);
		
		bean.self = bean;
		var copy = encodeDecode(bean);
		expect(copy.self === copy).toBeTruthy();
	});
});