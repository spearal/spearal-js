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

	get NULL() { return 0x00; }

	get TRUE() { return 0x01; }
	get FALSE() { return 0x02; }
	
	get INTEGRAL() { return 0x10; }
	get BIG_INTEGRAL() { return 0x20; }
	
	get FLOATING() { return 0x30; }
	get BIG_FLOATING() { return 0x40; }

	get STRING() { return 0x50; }
	
	get BYTE_ARRAY() { return 0x60; }

	get DATE_TIME() { return 0x70; }
	
	get COLLECTION() { return 0x80; }
	get MAP() { return 0x90; }
	
	get ENUM() { return 0xa0; }
	get CLASS() { return 0xb0; }
	get BEAN() { return 0xc0; }
	
	typeOf(parameterizedType) {
		if (parameterizedType < 0x10)
			return parameterizedType;
		return (parameterizedType & 0xf0);
	}
}
