;(function()
{
	var pinyin = {};
	var dict = {}; // 存储所有字典数据
	/**
	 * 解析各种字典文件，所需的字典文件必须在本JS之前导入
	 */
	pinyin.parseDict = function()
	{
		if(window.pinyin_dict_firstletter)
		{
			dict.firstletter = pinyin_dict_firstletter;
		}
		if(window.pinyin_dict_notone)
		{
			dict.notone = {};
			dict.py2hz = pinyin_dict_notone; // 拼音转汉字
			for(var i in pinyin_dict_notone)
			{
				var temp = pinyin_dict_notone[i];
				for(var j=0, len=temp.length; j<len; j++)
				{
					dict.notone[temp[j]] = i; // 不考虑多音字
				}
			}
		}
		if(window.pinyin_dict_withtone)
		{
			// 由于一次性将2万多个汉字拼音全部解析出来非常消耗性能，所以这里并不做处理，等到实际转换时按需解析。
			dict.withtone = pinyin_dict_withtone.split(',');
			return; // 由于将字典文件解析成拼音->汉字的结构非常耗时（大约需要1-2秒），所以暂时屏蔽
			var py2hz = {};
			for(var i=0; i<dict.withtone.length; i++)
			{
				var ch = eval('"\\u'+(i+19968).toString(16)+'"');
				var temp = pinyin.removeTone(dict.withtone[i]).split(' ');
				for(var j=0; j<temp.length; j++)
				{
					py2hz[temp[j]] = (py2hz[temp[j]] || '') + ch;
				}
			}
			dict.py2hz = py2hz;
		}
	}

	/**
	 * 根据汉字获取拼音，不支持多音字处理，如果不是汉字直接返回原字符
	 * @param str 要处理的汉字
	 * @param splitter 分割字符，默认空格
	 * @param withtone 是否包含声调，默认是
	 * @param polyphone 是否支持多音字，默认否
	 */
	pinyin.getPinyin = function(str, splitter, withtone, polyphone)
	{
		if(!str || /^ +$/g.test(str)) return;
		splitter = splitter == undefined ? ' ' : splitter;
		withtone = withtone == undefined ? true : withtone;
		polyphone = polyphone == undefined ? false : polyphone;
		var result = [];
		if(dict.withtone) // 优先使用带声调的字典文件
		{
			for (var i=0, len = str.length; i < len; i++)
			{
				var unicode = str.charCodeAt(i);
				var py = dict.withtone[unicode-19968];
				if(py)
				{
					if(!polyphone) py = py.replace(/ .*$/g, ''); // 如果不需要多音字
					if(!withtone) py = this.removeTone(py); // 如果不需要声调
				}
				result.push(py || str.charAt(i)); 
			}
		}
		else if(dict.notone) // 使用没有声调的字典文件
		{
			if(withtone) console.warn('pinyin_dict_notone 字典文件不支持声调！');
			if(polyphone) console.warn('pinyin_dict_notone 字典文件不支持多音字！');
			for (var i=0, len = str.length; i < len; i++)
			{
				var temp = str.charAt(i);
				result.push(dict.notone[temp] || temp); 
			}
		}
		else
		{
			throw '抱歉，未找到合适的拼音字典文件！';
		}
		if(!polyphone) return result.join(splitter);
		else return handlePolyphone(result, ' ', splitter);
	};

	/**
	 * 根据拼音获取所有可能的汉字组合
	 */
	pinyin.getHanzi = function(str)
	{
		var result = [];
		for(var i=0; i<str.length; i++)
		{
			//if(!/\w/g.test(str[i]))
		}
		var result = dict.py2hz[str];
		if(result) return result;
		for(var i in dict.py2hz)
		{
			if(i.indexOf(str) === 0)
				return dict.py2hz[i];
		}
		return result || '';
	};

	/**
	 * 获取汉字的拼音首字母
	 * str 汉字字符串，如果遇到非汉字则原样返回
	 * @param polyphone 是否支持多音字，默认false，如果为true，会返回所有可能的组合数组
	 */
	pinyin.getFirstLetter = function(str, polyphone)
	{
		polyphone = polyphone == undefined ? false : polyphone;
		if(!str || /^ +$/g.test(str)) return;
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
	};

	/**
	 * 处理多音字，将类似['D', 'ZC', 'F']转换成['DZF', 'DCF']
	 * 或者将 ['chang zhang', 'cheng'] 转换成 ['chang cheng', 'zhang cheng']
	 */
	function handlePolyphone(array, splitter, joinChar)
	{
		console.log(array)
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

	// 去除声调
	pinyin.removeTone = function(py)
	{
		var toneObj = 
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
		return py.replace(/[āáǎàōóǒòēéěèīíǐìūúǔùüǖǘǚǜńň]/g, function(m){ return toneObj[m][0]; });
	};

	pinyin.parseDict();
	window.pinyinUtil = pinyin;
})();