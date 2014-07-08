describe('Spearal Class Coding', function() {
	
	function encodeDecode(value, expectedSize) {
		var encoder = new SpearalEncoder();
		encoder.writeAny(value);

		var buffer = encoder.buffer;
		if (expectedSize)
			expect(buffer.byteLength).toEqual(expectedSize);
		
		var copy = new SpearalDecoder(buffer).readAny();
		expect(copy).toBeNull();
	}
	
	it('Test some Class', function() {
		encodeDecode(null, 1);
		encodeDecode(undefined, 1);
	});
});