
/**
 * 汉字与拼音互转工具，根据导入的字典文件的不同支持不同
 * 对于多音字目前只是将所有可能的组合输出，准确识别多音字需要完善的词库，而词库文件往往比字库还要大，所以不太适合web环境。
 * @start 2016-09-26
 * @last 2016-09-29
 */
;(function(global, factory) {
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = factory(global);
	} else {
		factory(global);
	}
})(typeof window !== "undefined" ? window : this, function(window) {

	var toneMap = 
	{
		"ā": "a1",
		"á": "a2",
		"ǎ": "a3",
		"à": "a4",
		"ō": "o1",
		"ó": "o2",
		"ǒ": "o3",
		"ò": "o4",
		"ē": "e1",
		"é": "e2",
		"ě": "e3",
		"è": "e4",
		"ī": "i1",
		"í": "i2",
		"ǐ": "i3",
		"ì": "i4",
		"ū": "u1",
		"ú": "u2",
		"ǔ": "u3",
		"ù": "u4",
		"ü": "v0",
		"ǖ": "v1",
		"ǘ": "v2",
		"ǚ": "v3",
		"ǜ": "v4",
		"ń": "n2",
		"ň": "n3",
		"": "m2"
	};

	var dict = {}; // 存储所有字典数据
	var pinyinUtil =
	{
		/**
		 * 解析各种字典文件，所需的字典文件必须在本JS之前导入
		 */
		parseDict: function()
		{
			// 如果导入了 pinyin_dict_firstletter.js
			if(window.pinyin_dict_firstletter)
			{
				dict.firstletter = pinyin_dict_firstletter;
			}
			// 如果导入了 pinyin_dict_notone.js
			if(window.pinyin_dict_notone)
			{
				dict.notone = {};
				dict.py2hz = pinyin_dict_notone; // 拼音转汉字
				for(var i in pinyin_dict_notone)
				{
					var temp = pinyin_dict_notone[i];
					for(var j=0, len=temp.length; j<len; j++)
					{
						if(!dict.notone[temp[j]]) dict.notone[temp[j]] = i; // 不考虑多音字
					}
				}
			}
			// 如果导入了 pinyin_dict_withtone.js
			if(window.pinyin_dict_withtone)
			{
				dict.withtone = {}; // 汉字与拼音映射，多音字用空格分开，类似这种结构：{'大': 'da tai'}
				var temp = pinyin_dict_withtone.split(',');
				for(var i=0, len = temp.length; i<len; i++)
				{
					// 这段代码耗时28毫秒左右，对性能影响不大，所以一次性处理完毕
					dict.withtone[String.fromCharCode(i + 19968)] = temp[i]; // 这里先不进行split(' ')，因为一次性循环2万次split比较消耗性能
				}

				// 拼音 -> 汉字
				if(window.pinyin_dict_notone)
				{
					// 对于拼音转汉字，我们优先使用pinyin_dict_notone字典文件
					// 因为这个字典文件不包含生僻字，且已按照汉字使用频率排序
					dict.py2hz = pinyin_dict_notone; // 拼音转汉字
				}
				else
				{
					// 将字典文件解析成拼音->汉字的结构
					// 与先分割后逐个去掉声调相比，先一次性全部去掉声调然后再分割速度至少快了3倍，前者大约需要120毫秒，后者大约只需要30毫秒（Chrome下）
					var notone = pinyinUtil.removeTone(pinyin_dict_withtone).split(',');
					var py2hz = {}, py, hz;
					for(var i=0, len = notone.length; i<len; i++)
					{
						hz = String.fromCharCode(i + 19968); // 汉字
						py = notone[i].split(' '); // 去掉了声调的拼音数组
						for(var j=0; j<py.length; j++)
						{
							py2hz[py[j]] = (py2hz[py[j]] || '') + hz;
						}
					}
					dict.py2hz = py2hz;
				}
			}
		},
		/**
		 * 根据汉字获取拼音，如果不是汉字直接返回原字符
		 * @param chinese 要转换的汉字
		 * @param splitter 分隔字符，默认用空格分隔
		 * @param withtone 返回结果是否包含声调，默认是
		 * @param polyphone 是否支持多音字，默认否
		 */
		getPinyin: function(chinese, splitter, withtone, polyphone)
		{
			if(!chinese || /^ +$/g.test(chinese)) return '';
			splitter = splitter == undefined ? ' ' : splitter;
			withtone = withtone == undefined ? true : withtone;
			polyphone = polyphone == undefined ? false : polyphone;
			var result = [];
			if(dict.withtone) // 优先使用带声调的字典文件
			{
				var noChinese = '';
				for (var i=0, len = chinese.length; i < len; i++)
				{
					var pinyin = dict.withtone[chinese[i]];
					if(pinyin)
					{
						// 如果不需要多音字，默认返回第一个拼音，后面的直接忽略
						// 所以这对数据字典有一定要求，常见字的拼音必须放在最前面
						if(!polyphone) pinyin = pinyin.replace(/ .*$/g, '');
						if(!withtone) pinyin = this.removeTone(pinyin); // 如果不需要声调
						//空格，把noChinese作为一个词插入
						noChinese && ( result.push( noChinese), noChinese = '' );
						result.push( pinyin ); 
					}
					else if ( !chinese[i] || /^ +$/g.test(chinese[i]) ){
						//空格，把noChinese作为一个词插入
						noChinese && ( result.push( noChinese), noChinese = '' );
					}
					else{
						noChinese += chinese[i];
					}
				}
				if ( noChinese ){
					result.push( noChinese);
					noChinese = '';
				}
			}
			else if(dict.notone) // 使用没有声调的字典文件
			{
				if(withtone) console.warn('pinyin_dict_notone 字典文件不支持声调！');
				if(polyphone) console.warn('pinyin_dict_notone 字典文件不支持多音字！');
				var noChinese = '';
				for (var i=0, len = chinese.length; i < len; i++)
				{
					var temp = chinese.charAt(i),
						pinyin = dict.notone[temp];
					if ( pinyin ){ //插入拼音
						//空格，把noChinese作为一个词插入
						noChinese && ( result.push( noChinese), noChinese = '' );
						result.push( pinyin );
					}
					else if ( !temp || /^ +$/g.test(temp) ){
						//空格，插入之前的非中文字符
						noChinese && ( result.push( noChinese), noChinese = '' );
					}
					else {
						//非空格，关联到noChinese中
						noChinese += temp;
					}
				}

				if ( noChinese ){
					result.push( noChinese );
					noChinese = '';
				}
			}
			else
			{
				throw '抱歉，未找到合适的拼音字典文件！';
			}
			if(!polyphone) return result.join(splitter);
			else
			{
				if(window.pinyin_dict_polyphone) return parsePolyphone(chinese, result, splitter, withtone);
				else return handlePolyphone(result, ' ', splitter);
			}
		},
		/**
		 * 获取汉字的拼音首字母
		 * @param str 汉字字符串，如果遇到非汉字则原样返回
		 * @param polyphone 是否支持多音字，默认false，如果为true，会返回所有可能的组合数组
		 */
		getFirstLetter: function(str, polyphone)
		{
			polyphone = polyphone == undefined ? false : polyphone;
			if(!str || /^ +$/g.test(str)) return '';
			if(dict.firstletter) // 使用首字母字典文件
			{
				var result = [];
				for(var i=0; i<str.length; i++)
				{
					var unicode = str.charCodeAt(i);
					var ch = str.charAt(i);
					if(unicode >= 19968 && unicode <= 40869)
					{
						ch = dict.firstletter.all.charAt(unicode-19968);
						if(polyphone) ch = dict.firstletter.polyphone[unicode] || ch;
					}
					result.push(ch);
				}
				if(!polyphone) return result.join(''); // 如果不用管多音字，直接将数组拼接成字符串
				else return handlePolyphone(result, '', ''); // 处理多音字，此时的result类似于：['D', 'ZC', 'F']
			}
			else
			{
				var py = this.getPinyin(str, ' ', false, polyphone);
				py = py instanceof Array ? py : [py];
				var result = [];
				for(var i=0; i<py.length; i++)
				{
					result.push(py[i].replace(/(^| )(\w)\w*/g, function(m,$1,$2){return $2.toUpperCase();}));
				}
				if(!polyphone) return result[0];
				else return simpleUnique(result);
			}
		},
		/**
		 * 拼音转汉字，只支持单个汉字，返回所有匹配的汉字组合
		 * @param pinyin 单个汉字的拼音，可以包含声调
		 */
		getHanzi: function(pinyin)
		{
			if(!dict.py2hz)
			{
				throw '抱歉，未找到合适的拼音字典文件！';
			}
			return dict.py2hz[this.removeTone(pinyin)] || '';
		},
		/**
		 * 获取某个汉字的同音字，本方法暂时有问题，待完善
		 * @param hz 单个汉字
		 * @param sameTone 是否获取同音同声调的汉字，必须传进来的拼音带声调才支持，默认false
		 */
		getSameVoiceWord: function(hz, sameTone)
		{
			sameTone = sameTone || false
			return this.getHanzi(this.getPinyin(hz, ' ', false))
		},
		/**
		 * 去除拼音中的声调，比如将 xiǎo míng tóng xué 转换成 xiao ming tong xue
		 * @param pinyin 需要转换的拼音
		 */
		removeTone: function(pinyin)
		{
			return pinyin.replace(/[āáǎàōóǒòēéěèīíǐìūúǔùüǖǘǚǜńň]/g, function(m){ return toneMap[m][0]; });
		},
		/**
		 * 将数组拼音转换成真正的带标点的拼音
		 * @param pinyinWithoutTone 类似 xu2e这样的带数字的拼音
		 */
		getTone: function(pinyinWithoutTone)
		{
			var newToneMap = {};
			for(var i in toneMap) newToneMap[toneMap[i]] = i;
			return (pinyinWithoutTone || '').replace(/[a-z]\d/g, function(m) {
				return newToneMap[m] || m;
			});
		}
	};


	/**
	 * 处理多音字，将类似['D', 'ZC', 'F']转换成['DZF', 'DCF']
	 * 或者将 ['chang zhang', 'cheng'] 转换成 ['chang cheng', 'zhang cheng']
	 */
	function handlePolyphone(array, splitter, joinChar)
	{
		splitter = splitter || '';
		var result = [''], temp = [];
		for(var i=0; i<array.length; i++)
		{
			temp = [];
			var t = array[i].split(splitter);
			for(var j=0; j<t.length; j++)
			{
				for(var k=0; k<result.length; k++)
					temp.push(result[k] + (result[k]?joinChar:'') + t[j]);
			}
			result = temp;
		}
		return simpleUnique(result);
	}

	/**
	 * 根据词库找出多音字正确的读音
	 * 这里只是非常简单的实现，效率和效果都有一些问题
	 * 推荐使用第三方分词工具先对句子进行分词，然后再匹配多音字
	 * @param chinese 需要转换的汉字
	 * @param result 初步匹配出来的包含多个发音的拼音结果
	 * @param splitter 返回结果拼接字符
	 */
	function parsePolyphone(chinese, result, splitter, withtone)
	{
		var poly = window.pinyin_dict_polyphone;
		var max = 7; // 最多只考虑7个汉字的多音字词，虽然词库里面有10个字的，但是数量非常少，为了整体效率暂时忽略之
		var temp = poly[chinese];
		if(temp) // 如果直接找到了结果
		{
			temp = temp.split(' ');
			for(var i=0; i<temp.length; i++)
			{
				result[i] = temp[i] || result[i];
				if(!withtone) result[i] = pinyinUtil.removeTone(result[i]);
			}
			return result.join(splitter);
		}
		for(var i=0; i<chinese.length; i++)
		{
			temp = '';
			for(var j=0; j<max && (i+j)<chinese.length; j++)
			{
				if(!/^[\u2E80-\u9FFF]+$/.test(chinese[i+j])) break; // 如果碰到非汉字直接停止本次查找
				temp += chinese[i+j];
				var res = poly[temp];
				if(res) // 如果找到了多音字词语
				{
					res = res.split(' ');
					for(var k=0; k<=j; k++)
					{
						if(res[k]) result[i+k] = withtone ? res[k] : pinyinUtil.removeTone(res[k]);
					}
					break;
				}
			}
		}
		// 最后这一步是为了防止出现词库里面也没有包含的多音字词语
		for(var i=0; i<result.length; i++)
		{
			result[i] = result[i].replace(/ .*$/g, '');
		}
		return result.join(splitter);
	}

	// 简单数组去重
	function simpleUnique(array)
	{
		var result = [];
		var hash = {};
		for(var i=0; i<array.length; i++)
		{
			var key = (typeof array[i]) + array[i];
			if(!hash[key])
			{
				result.push(array[i]);
				hash[key] = true;
			}
		}
		return result;
	}

	pinyinUtil.parseDict();
	pinyinUtil.dict = dict;
	window.pinyinUtil = pinyinUtil;

});