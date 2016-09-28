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
			dict.withtone = pinyin_dict_withtone.split(',');
		}
	}

	/**
	 * 根据汉字获取拼音，不支持多音字处理，如果不是汉字直接返回原字符
	 * @param str 要处理的汉字
	 * @param splitter 分割字符，默认空格
	 * @param withtone 是否包含声调
	 * @param polyphone 是否支持多音字
	 */
	pinyin.getPinyin = function(str, splitter, withtone, polyphone)
	{
		splitter = splitter == undefined ? ' ' : splitter;
		withtone = withtone == undefined ? false : withtone;
		polyphone = polyphone == undefined ? false : polyphone;
		var result = [];
		if(dict.withtone) // 优先使用带声调的字典文件
		{
			for (var i=0, len = str.length; i < len; i++)
			{
				var unicode = str.charCodeAt(i);
				var temp = dict.withtone[unicode-19968];
				if(temp)
				{
					if(!withtone) temp = temp.replace(/\d/g, ''); // 如果不需要声调
					if(!polyphone) temp = temp.replace(/ .*$/g, ''); // 如果不需要多音字
				}
				result.push(temp || str.charAt(i)); 
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
		if(!str) return;
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
			if(!polyphone) result[0];
			else return result;
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
		return result;
	}

	pinyin.parseDict();
	window.pinyinUtil = pinyin;
})();