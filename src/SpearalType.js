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
class SpearalType {

	static get NULL() { return 0x00; }

	static get TRUE() { return 0x01; }
	static get FALSE() { return 0x02; }
	
	static get INTEGRAL() { return 0x10; }
	static get BIG_INTEGRAL() { return 0x20; }
	
	static get FLOATING() { return 0x30; }
	static get BIG_FLOATING() { return 0x40; }

	static get STRING() { return 0x50; }
	
	static get BYTE_ARRAY() { return 0x60; }

	static get DATE_TIME() { return 0x70; }
	
	static get COLLECTION() { return 0x80; }
	static get MAP() { return 0x90; }
	
	static get ENUM() { return 0xa0; }
	static get CLASS() { return 0xb0; }
	static get BEAN() { return 0xc0; }
	
	static typeOf(parameterizedType) {
		if (parameterizedType < 0x10)
			return parameterizedType;
		return (parameterizedType & 0xf0);
	}
}
