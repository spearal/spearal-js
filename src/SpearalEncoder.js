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
class _SpearalEncoderBuffer {

	constructor(blockSize = 128) {
		this._view = new DataView(new ArrayBuffer(blockSize));
		this._blockSize = blockSize;
		this._size = 0;
	}
	
	get size() {
		return this._size;
	}
	
	getBuffer(trim = true) {
		if (!trim || this._size === this._view.buffer.byteLength)
			return this._view.buffer;
		return this._view.buffer.slice(0, this._size);
	}

	writeInt8(value) {
		this._ensureCapacity(1);
		this._view.setInt8(this._size++, value);
	}

	writeUint8(value) {
		this._ensureCapacity(1);
		this._view.setUint8(this._size++, value);
	}

	writeInt16(value) {
		this._ensureCapacity(2);
		this._view.setInt16(this._size, value);
		this._size += 2;
	}

	writeUint16(value) {
		this._ensureCapacity(2);
		this._view.setUint16(this._size, value);
		this._size += 2;
	}

	writeInt32(value) {
		this._ensureCapacity(4);
		this._view.setInt32(this._size, value);
		this._size += 4;
	}

	writeUint32(value) {
		this._ensureCapacity(4);
		this._view.setUint32(this._size, value);
		this._size += 4;
	}
	
	writeFloat32(value) {
		this._ensureCapacity(4);
		this._view.setFloat32(this._size, value);
		this._size += 4;
	}
	
	writeFloat64(value) {
		this._ensureCapacity(8);
		this._view.setFloat64(this._size, value);
		this._size += 8;
	}
	
	writeUintN(value, length0) {
		if (length0 < 0 || length0 > 3)
			throw "Illegal length0: " + length0;
	
		this._ensureCapacity(length0 + 1);

		switch (length0) {
		case 3:
			this._view.setUint32(this._size, value);
			this._size += 4;
			break;
		case 2:
			this._view.setUint8(this._size++, value >>> 16);
		case 1:
			this._view.setUint16(this._size, value);
			this._size += 2;
			break;
		case 0:
			this._view.setUint8(this._size++, value);
			break;
		}
	}
	
	writeUTF(utf) {
		this._ensureCapacity(utf.length);
		for (var i = 0; i < utf.length; i++)
			this._view.setUint8(this._size++, utf.charCodeAt(i));
	}
	
	writeByteArray(buffer) {
		this._ensureCapacity(buffer.byteLength);
		new Uint8Array(this._view.buffer, this._size).set(new Uint8Array(buffer));
		this._size += buffer.byteLength;
	}
	
	_ensureCapacity(length) {
		if (this._view.buffer.byteLength - this._size < length) {
			var newCapacity = (
				this._view.buffer.byteLength +
				(((length / this._blockSize) | 0) * this._blockSize) +
				this._blockSize
			);
			var tmp = new Uint8Array(newCapacity);
			tmp.set(new Uint8Array(this._view.buffer), 0, this._size);
			this._view = new DataView(tmp.buffer);
		}
	}
}

class _IndexedMap extends Map {
	
	constructor(iterable) {
		super(iterable);
	}
	
	setIfAbsent(key) {
		var index = this.get(key);
		if (index !== undefined)
			return index;
		this.set(key, this.size);
	}
}

class SpearalPropertyFilter {
	
	constructor() {
		this._filters = new Map();
	}
	
	set(className, ...propertyNames) {
		if (!(propertyNames instanceof Set))
			propertyNames = new Set(propertyNames);
		this._filters.set(className, propertyNames);
	}
	
	get(className) {
		return this._filters.get(className);
	}
}
SpearalPropertyFilter.ACCEPT_ALL = {
	has: function(value) {
		return true;
	}
};

class SpearalEncoder {

	constructor(context, filter) {
		if (!(context instanceof SpearalContext))
			throw "Parameter 'context' must be a SpearalContext instance: " + context;
		if (filter != null && !(filter instanceof SpearalPropertyFilter))
			throw "Parameter 'filter' must be a SpearalPropertyFilter instance: " + filter;
		
		this._context = context;
		this._filter = (filter != null ? filter : new SpearalPropertyFilter());
		
		this._buffer = new _SpearalEncoderBuffer();
		this._sharedStrings = new _IndexedMap();
		this._sharedObjects = new _IndexedMap();
	}
	
	get context() {
		return this._context;
	}
	
	get filter() {
		return this._filter;
	}
	
	get buffer() {
		return this._buffer.getBuffer();
	}
	
	writeAny(value) {
		value = this._context.normalize(value);
		
		if (value == null)
			this.writeNull();
		else
			this._context.getEncoder(value)(this, value);
	}
	
	writeNull() {
		this._buffer.writeUint8(SpearalType.NULL);
	}

	writeBoolean(value) {
		this._buffer.writeUint8(value ? SpearalType.TRUE : SpearalType.FALSE);
	}

	writeIntegral(value) {
		var inverse = 0x00;
		if (value < 0) {
			value = -value;
			inverse = 0x08;
		}

		if (value <= 0xffffffff)
			this._writeTypeUintN(SpearalType.INTEGRAL | inverse, value);
		else {
			var high32 = ((value / 0x100000000) | 0x00),
				length0 = SpearalEncoder._unsignedIntLength0(high32);
			this._buffer.writeUint8(SpearalType.INTEGRAL | inverse | (length0 + 4));
			this._buffer.writeUintN(high32, length0);
			this._buffer.writeUintN(value & 0xffffffff, 3);
		}
	}
	
	writeBigIntegral(value) {
		this._writeBigNumberData(SpearalType.BIG_INTEGRAL, this._exponentize(value));
	}

	writeFloating(value) {
		if (Number.isFinite(value) && !(value === 0 && (1/value) === Number.NEGATIVE_INFINITY)) {
			if (Number.isInteger(value)) {
				if (value >= -0x00ffffffffffffff && value <= 0x00ffffffffffffff) {
					this.writeIntegral(value);
					return;
				}
			}
			else {
				var value1K = value * 1000.0;
				
				if (Number.isInteger(value1K)
					&& (
						value === (value1K / 1000.0) ||
						value === ((value1K += (value1K < 0 ? -1 : 1)) / 1000.0)
					)
					&& value1K >= -0xffffffff
					&& value1K <= 0xffffffff) {
					
					var inverse = 0x00;
					if (value1K < 0) {
						value1K = -value1K;
						inverse = 0x04;
					}
					
					this._writeTypeUintN(SpearalType.FLOATING | 0x08 | inverse, value1K);
					return;
				}
			}
		}

		this._buffer.writeUint8(SpearalType.FLOATING);
		this._buffer.writeFloat64(value);
	}
	
	writeBigFloating(value) {
		this._writeBigNumberData(SpearalType.BIG_FLOATING, value);
	}
	
	writeString(value) {
		this._writeStringData(SpearalType.STRING, value);
	}
	
	writeByteArray(value) {
		if (!this._setAndWriteObjectReference(SpearalType.BYTE_ARRAY, value)) {
			this._writeTypeUintN(SpearalType.BYTE_ARRAY, value.byteLength);
			this._buffer.writeByteArray(value);
		}
	}
	
	writeDateTime(value) {
		if (Number.isNaN(value.getTime())) {
			this.writeNull();
			return;
		}
		
		var year = value.getUTCFullYear() - 2000,
			millis = value.getUTCMilliseconds();
		
		this._buffer.writeUint8(SpearalType.DATE_TIME | 0x0C | (millis !== 0 ? 0x03 : 0x00));
		
		var inverse = 0x00;
		if (year < 0) {
			inverse = 0x80;
			year = -year;
		}
		
		var length0 = SpearalEncoder._unsignedIntLength0(year);
		this._buffer.writeUint8(inverse | (length0 << 4) | (value.getUTCMonth() + 1));
		this._buffer.writeUint8(value.getUTCDate());
		this._buffer.writeUintN(year, length0);
		
		if (millis === 0) {
			this._buffer.writeUint8(value.getUTCHours());
			this._buffer.writeUint8(value.getUTCMinutes());
			this._buffer.writeUint8(value.getUTCSeconds());
		}
		else {
			length0 = SpearalEncoder._unsignedIntLength0(millis);
			this._buffer.writeUint8((length0 << 5) | value.getUTCHours());
			this._buffer.writeUint8(value.getUTCMinutes());
			this._buffer.writeUint8(value.getUTCSeconds());
			this._buffer.writeUintN(millis, length0);
		}
	}
	
	writeCollection(value) {
		if (!this._setAndWriteObjectReference(SpearalType.COLLECTION, value)) {
			var size = (value instanceof Set ? value.size : value.length);
			this._writeTypeUintN(SpearalType.COLLECTION, size);
			for (var item of value)
				this.writeAny(item);
		}
	}
	
	writeMap(value) {
		if (!this._setAndWriteObjectReference(SpearalType.MAP, value)) {
			this._writeTypeUintN(SpearalType.MAP, value.size);
			for (var [key, val] of value) {
				this.writeAny(key);
				this.writeAny(val);
			}
		}
	}
	
	writeEnum(kind, name) {
		this._writeStringData(SpearalType.ENUM, kind);
		this.writeString(name);
	}
	
	writeClass(value) {
		this._writeStringData(SpearalType.CLASS, value.name);
	}
	
	writeBean(value) {
		if (!this._setAndWriteObjectReference(SpearalType.BEAN, value)) {
			var descriptor = this._context.getDescriptor(value, this._filter);
			this._writeStringData(SpearalType.BEAN, descriptor.description);
			for (var name of descriptor.propertyNames)
				this.writeAny(value[name]);
		}
	}

	_writeStringData(type, value) {
		if (value.length === 0) {
			this._buffer.writeUint8(type);
			this._buffer.writeUint8(0);
			return;
		}

		if (!this._setAndWriteStringReference(type, value)) {
			value = unescape(encodeURIComponent(value));
			this._writeTypeUintN(type, value.length);
			this._buffer.writeUTF(value);
		}
	}
	
	_exponentize(value) {
		var length = value.length;
		if (length > 3) {
			var trailingZeros = 0;
			for (var i = length - 1; i > 0 && value.charAt(i) == '0'; i--)
				trailingZeros++;
			if (trailingZeros > 2)
				value = value.substring(0, length - trailingZeros) + "E" + trailingZeros;
		}
		return value;
	}
	
	_writeBigNumberData(type, value) {
		if (!this._setAndWriteStringReference(type, value)) {
			var length = value.length;
			this._writeTypeUintN(type, length);
			for (var i = 0; i < length; ) {
				var b = (SpearalBigNumber.indexOf(value.charCodeAt(i++)) << 4);
				if (i < length)
					b |= SpearalBigNumber.indexOf(value.charCodeAt(i++));
				this._buffer.writeUint8(b);
			}
		}
	}
	
	_setAndWriteObjectReference(type, value) {
		var index = this._sharedObjects.setIfAbsent(value);
		if (index !== undefined) {
			this._writeTypeUintN(type | 0x08, index);
        	return true;
		}
		return false;
	}
	
	_setAndWriteStringReference(type, value) {
		var index = this._sharedStrings.setIfAbsent(value);
		if (index !== undefined) {
			this._writeTypeUintN(type | 0x04, index);
        	return true;
		}
		return false;
	}
	
	_writeTypeUintN(type, value) {
		var length0 = SpearalEncoder._unsignedIntLength0(value);
		this._buffer.writeUint8(type | length0);
		this._buffer.writeUintN(value, length0);
	}
	
	static _unsignedIntLength0(value) {
		if (value <= 0xffff)
			return (value <= 0xff ? 0 : 1);
		return (value <= 0xffffff ? 2 : 3);
	}
}
