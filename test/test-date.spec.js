describe('Spearal Date Coding', function() {
	
	function encodeDecode(value, expectedSize) {
		var encoder = new SpearalEncoder();
		encoder.writeAny(value);

		var buffer = encoder.buffer;
		if (expectedSize)
			expect(buffer.byteLength).toEqual(expectedSize);
		
		var copy = new SpearalDecoder(buffer).readAny();
		if (Number.isNaN(value.getTime()))
			expect(copy).toBeNull();
		else
			expect(copy).toEqual(value);
	}
	
	it('Test some Date', function() {
		encodeDecode(new Date());
		encodeDecode(new Date(0));
		encodeDecode(new Date(Number.NaN));
		encodeDecode(new Date(0x7fffffffffffffff));
	});
});