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
class _SpearalDecoderBuffer {

	constructor(arrayBuffer) {
		this._view = new DataView(arrayBuffer);
		this._pos = 0;
	}
	
	readInt8() {
		try {
			return this._view.getInt8(this._pos++);
		}
		catch (e) {
			throw "EOF: " + e;
		}
	}
	
	readUint8() {
		try {
			return this._view.getUint8(this._pos++);
		}
		catch (e) {
			throw "EOF: " + e;
		}
	}
	
	readInt16() {
		try {
			var value = this._view.getInt16(this._pos);
			this._pos += 2;
			return value;
		}
		catch (e) {
			throw "EOF: " + e;
		}
	}
	
	readUint16() {
		try {
			var value = this._view.getUint16(this._pos);
			this._pos += 2;
			return value;
		}
		catch (e) {
			throw "EOF: " + e;
		}
	}
	
	readInt32() {
		try {
			var value = this._view.getInt32(this._pos);
			this._pos += 4;
			return value;
		}
		catch (e) {
			throw "EOF: " + e;
		}
	}
	
	readUint32() {
		try {
			var value = this._view.getUint32(this._pos);
			this._pos += 4;
			return value;
		}
		catch (e) {
			throw "EOF: " + e;
		}
	}
	
	readFloat32() {
		try {
			var value = this._view.getFloat32(this._pos);
			this._pos += 4;
			return value;
		}
		catch (e) {
			throw "EOF: " + e;
		}
	}
	
	readFloat64() {
		try {
			var value = this._view.getFloat64(this._pos);
			this._pos += 8;
			return value;
		}
		catch (e) {
			throw "EOF: " + e;
		}
	}
	
	readUintN(length0) {
		if (length0 < 0 || length0 > 3)
			throw "Illegal length0: " + length0;

		try {
			var value = 0;
			
			switch (length0) {
			case 3:
				value = this._view.getUint32(this._pos);
				this._pos += 4;
				break;
			case 2:
				value = this._view.getUint8(this._pos++) << 16;
			case 1:
				value |= this._view.getUint16(this._pos);
				this._pos += 2;
				break;
			case 0:
				value = this._view.getUint8(this._pos++);
				break;
			}
			
			return value;
		}
		catch (e) {
			throw "EOF: " + e;
		}
	}
	
	readUTF(length) {
		try {
			var utf = String.fromCharCode.apply(null, new Uint8Array(this._view.buffer, this._pos, length));
			this._pos += length;
			return utf;
		}
		catch (e) {
			throw "EOF: " + e;
		}
	}
	
	readByteArray(length) {
		if (!length)
			return new ArrayBuffer(0);
		
		var end = this._pos + length;
		if (end > this._view.buffer.byteLength)
			throw "EOF: cannot read " + length + " bytes";
		
		var array = this._view.buffer.slice(this._pos, end);
		this._pos = end;
		return array;
	}
}

class SpearalDecoder {

	constructor(context, buffer) {
		if (!(context instanceof SpearalContext))
			throw "Parameter 'context' must be a SpearalContext";
		if (!(buffer instanceof ArrayBuffer))
			throw "Parameter 'buffer' must be an ArrayBuffer";
		
		this._context = context;
		this._buffer = new _SpearalDecoderBuffer(buffer);
		this._sharedStrings = [];
		this._sharedObjects = [];
	}
	
	readAny() {
		return this._readAny(this._buffer.readUint8());
	}
	
	_readAny(parameterizedType) {
		var type = SpearalType.typeOf(parameterizedType),
			value = null;
		
		switch(type) {
		
		case SpearalType.NULL:
			value = null; break;
		
		case SpearalType.TRUE:
			value = true; break;
		case SpearalType.FALSE:
			value = false; break;
		
		case SpearalType.INTEGRAL:
			value = this._readIntegral(parameterizedType); break;
		case SpearalType.BIG_INTEGRAL:
			value = this._readBigIntegral(parameterizedType); break;
		
		case SpearalType.FLOATING:
			value = this._readFloating(parameterizedType); break;
		case SpearalType.BIG_FLOATING:
			value = this._readBigFloating(parameterizedType); break;
		
		case SpearalType.STRING:
			value = this._readString(parameterizedType); break;
			
		case SpearalType.BYTE_ARRAY:
			value = this._readByteArray(parameterizedType); break;
			
		case SpearalType.DATE_TIME:
			value = this._readDateTime(parameterizedType); break;
			
		case SpearalType.COLLECTION:
			value = this._readCollection(parameterizedType); break;
		case SpearalType.MAP:
			value = this._readMap(parameterizedType); break;
		
		case SpearalType.ENUM:
			value = this._readEnum(parameterizedType); break;
		case SpearalType.CLASS:
			value = this._readClass(parameterizedType); break;
		case SpearalType.BEAN:
			value = this._readBean(parameterizedType); break;
		
		default:
			throw new "Unknown data type: " + parameterizedType + "/" + SpearalType.typeOf(parameterizedType);
		}
		
		return this._context.getDecoder(type)(value);
	}
	
	_readIntegral(parameterizedType) {
		var length0 = (parameterizedType & 0x07),
			value;
		
		if (length0 <= 3)
			value = this._buffer.readUintN(length0);
		else
			value = (this._buffer.readUintN(3) * Math.pow(256, length0 - 3)) + this._buffer.readUintN(length0 - 4);
		
		return (((parameterizedType & 0x08) !== 0) ? -value : value);
	}

	_readBigIntegral(parameterizedType) {
		var indexOrLength = this._buffer.readUintN(parameterizedType & 0x03);
		if ((parameterizedType & 0x04) !== 0)
			return this._sharedStrings[indexOrLength];
		
		var value = this._readBigNumberData(indexOrLength),
			iExp = value.indexOf('E');
		if (iExp === -1)
			return value;
		
		var zeros = parseInt(value.substr(iExp+1));
		value = value.substring(0, iExp);
		for (var i = 0; i < zeros; i++)
			value += '0';
		return value;
	}
	
	_readFloating(parameterizedType) {
		if ((parameterizedType & 0x08) === 0)
			return this._buffer.readFloat64();
		
		var v = this._buffer.readUintN(parameterizedType & 0x03);
		if ((parameterizedType & 0x04) !== 0)
			v = -v;
		return (v / 1000.0);
	}
	
	_readBigFloating(parameterizedType) {
		var indexOrLength = this._buffer.readUintN(parameterizedType & 0x03);
		if ((parameterizedType & 0x04) !== 0)
			return this._sharedStrings[indexOrLength];
		return this._readBigNumberData(indexOrLength);
	}
	
	_readString(parameterizedType) {
		var indexOrLength = this._buffer.readUintN(parameterizedType & 0x03);
		
		if ((parameterizedType & 0x04) !== 0)
			return this._sharedStrings[indexOrLength];
		
		var value = decodeURIComponent(escape(this._buffer.readUTF(indexOrLength)));
		this._sharedStrings.push(value);
		return value;
	}
	
	_readByteArray(parameterizedType) {
		var indexOrLength = this._buffer.readUintN(parameterizedType & 0x03);
		
		if ((parameterizedType & 0x08) != 0)
			return this._sharedObjects[indexOrLength];
		
		var array = this._buffer.readByteArray(indexOrLength);
		this._sharedObjects.push(array);
		return array;
	}
	
	_readDateTime(parameterizedType) {
		var hasDate = ((parameterizedType & 0x08) != 0),
			hasTime = ((parameterizedType & 0x04) != 0),
			year = 0,
			month = 0,
			date = 0,
			hours = 0,
			minutes = 0,
			seconds = 0,
			millis = 0,
			subsecondsType;
		
		if (hasDate) {
			month = this._buffer.readUint8();
			date = this._buffer.readUint8();
			
			year = this._buffer.readUintN((month >>> 4) & 0x03);
			if ((month & 0x80) != 0)
				year = -year;
			year += 2000;

			month &= 0x0f;
			month--;
		}
		
		if (hasTime) {
			hours = this._buffer.readUint8();
			minutes = this._buffer.readUint8();
			seconds = this._buffer.readUint8();
			
			subsecondsType = (parameterizedType & 0x03);
			if (subsecondsType !== 0) {
				millis = this._buffer.readUintN(hours >>> 5);
				if (subsecondsType === 1)
					millis /= 1000000;
				else if (subsecondsType === 2)
					millis /= 1000;
    		}
    		
    		hours &= 0x1f;
		}
		
		return new Date(Date.UTC(year, month, date, hours, minutes, seconds, millis));
	}
	
	_readCollection(parameterizedType) {
		// TODO
	}

	_readMap(parameterizedType) {
		// TODO
	}
	
	_readEnum(parameterizedType) {
		return {
			kind: this._readString(parameterizedType),
			name: this.readAny()
		};
	}
	
	_readClass(parameterizedType) {
		var className = this._readString(parameterizedType),
			cls = window[className];
		return (cls != null ? cls : className);
	}
	
	_readBean(parameterizedType) {
		var indexOrLength = this._buffer.readUintN(parameterizedType & 0x03);
		
		if ((parameterizedType & 0x08) != 0)
			return this._sharedObjects[indexOrLength];

		var description = (
			(parameterizedType & 0x04) !== 0 ?
			this._sharedStrings[indexOrLength] :
			decodeURIComponent(escape(this._buffer.readUTF(indexOrLength)))
		);
		
		var descriptor = _SpearalClassDescriptor.forDescription(description),
			value = this._context.getInstance(descriptor);
		
		this._sharedObjects.push(value);
		
		for (var name of descriptor.propertyNames)
			value[name] = this.readAny();
		
		return value;
	}
	
	_readBigNumberData(length) {
		var count = (length / 2) + (length % 2),
			value = "";
		
		for (var i = 0; i < count; i++) {
			var b = this._buffer.readUint8();
			value += SpearalBigNumber.charAt((b & 0xf0) >>> 4);
			if (value.length === length)
				break;
			value += SpearalBigNumber.charAt(b & 0x0f);
		}
		
		this._sharedStrings.push(value);
		return value;
	}
}
    
