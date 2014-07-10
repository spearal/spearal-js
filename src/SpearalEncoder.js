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

class SpearalEncoder {

	constructor(context) {
		if (!(context instanceof SpearalContext))
			throw "Parameter 'context' must be a SpearalContext instance";
		this._context = context;
		this._buffer = new _SpearalEncoderBuffer();
		this._sharedStrings = new Map();
		this._sharedObjects = new Map();
	}
	
	get buffer() {
		return this._buffer.getBuffer();
	}
	
	writeAny(value) {
		value = this._context.normalize(value);
		
		if (value == null)
			this.writeNull();
		else
			this._context.getCoder(value)(this, value);
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

		var length0;
		if (value <= 0xffffffff) {
			length0 = SpearalEncoder._unsignedIntLength0(value);
			this._buffer.writeUint8(SpearalType.INTEGRAL | inverse | length0);
			this._buffer.writeUintN(value, length0);
		}
		else {
			var high32 = ((value / 0x100000000) | 0x00);
			length0 = SpearalEncoder._unsignedIntLength0(high32);
			this._buffer.writeUint8(SpearalType.INTEGRAL | inverse | (length0 + 4));
			this._buffer.writeUintN(high32, length0);
			this._buffer.writeUintN(value & 0xffffffff, 3);
		}
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

					var length0 = SpearalEncoder._unsignedIntLength0(value1K);
					this._buffer.writeUint8(SpearalType.FLOATING | 0x08 | inverse | length0);
					this._buffer.writeUintN(value1K, length0);

					return;
				}
			}
		}

		this._buffer.writeUint8(SpearalType.FLOATING);
		this._buffer.writeFloat64(value);
	}
	
	writeString(value) {
		this._writeStringData(SpearalType.STRING, value);
	}
	
	writeByteArray(value) {
		var index = this._sharedObjects.get(value),
			length0;

		if (index !== undefined) {
			length0 = SpearalEncoder._unsignedIntLength0(index);
	    	this._buffer.writeUint8(SpearalType.BYTE_ARRAY | 0x08 | length0);
	    	this._buffer.writeUintN(index, length0);
		}
		else {
			this._sharedObjects.set(value, this._sharedStrings.size);
		
			length0 = SpearalEncoder._unsignedIntLength0(value.byteLength);
			this._buffer.writeUint8(SpearalType.BYTE_ARRAY | length0);
			this._buffer.writeUintN(value.byteLength, length0);
			this._buffer.writeByteArray(value);
		}
	}
	
	writeDate(value) {
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
	
	writeClass(value) {
		this._writeStringData(SpearalType.CLASS, value.name);
	}
	
	writeBean(value) {
		var index = this._sharedObjects.get(value);
		
		if (index !== undefined) {
			var length0 = SpearalEncoder._unsignedIntLength0(index);
	    	this._buffer.writeUint8(SpearalType.BEAN | 0x08 | length0);
	    	this._buffer.writeUintN(index, length0);
		}
		else {
			this._sharedObjects.set(value, this._sharedStrings.size);
		
			var className = value._class;
			var propertyNames = [];
			for (var property in value) {
				if (property !== '_class' && value.hasOwnProperty(property))
					propertyNames.push(property);
			}
			
			var description = className + '#' + propertyNames.join(',');
			this._writeStringData(SpearalType.BEAN, description);
			
			for (var i = 0; i < propertyNames.length; i++)
				this.writeAny(value[propertyNames[i]]);
		}
	}
	
	_writeStringData(type, value) {
		if (value.length === 0) {
			this._buffer.writeUint8(type);
			this._buffer.writeUint8(0);
			return;
		}
		
		var index = this._sharedStrings.get(value),
			length0;
		if (index !== undefined) {
			length0 = SpearalEncoder._unsignedIntLength0(index);
        	this._buffer.writeUint8(type | 0x04 | length0);
        	this._buffer.writeUintN(index, length0);
		}
		else {
			this._sharedStrings.set(value, this._sharedStrings.size);
			
			value = unescape(encodeURIComponent(value));
		
			length0 = SpearalEncoder._unsignedIntLength0(value.length);
			this._buffer.writeUint8(type | length0);
			this._buffer.writeUintN(value.length, length0);
			this._buffer.writeUTF(value);
		}
	}
	
	static _unsignedIntLength0(value) {
		if (value <= 0xffff)
			return (value <= 0xff ? 0 : 1);
		return (value <= 0xffffff ? 2 : 3);
	}
}
