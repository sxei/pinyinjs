# 一个实现汉字与拼音互转的小巧web工具库

一个实现汉字与拼音互转的小巧web工具库，另外还包含一个非常非常简单的JS版拼音输入法。

演示地址：http://demo.liuxianan.com/pinyinjs
详细介绍：http://blog.liuxianan.com/pinyinjs.html

# 前言

网上关于JS实现汉字和拼音互转的文章很多，但是比较杂乱，都是互相抄来抄去，而且有的不支持多音字，有的不支持声调，有的字典文件太大，还比如有时候我仅仅是需要获取汉字拼音首字母却要引入200kb的字典文件，无法根据实际需要满足需求。

综上，我精心整理并修改了网上几种常见的字典文件并简单封装了一下可以直接拿来用的工具库。

# 拼音字典文件

按照字典文件的大小从小到大依次介绍。

## 字典一：拼音首字母

该[字典文件](https://github.com/liuxianan/pinyinjs/blob/master/pinyin_dict_firstletter.js)的内容大致如下：

```javascript
/**
 * 拼音首字母字典文件
 */
var pinyin_dict_firstletter = {};
pinyin_dict_firstletter.all = "YDYQSXMWZSSXJBYMGCCZQPSSQBYCDSCDQLDYLYBSSJG...";
pinyin_dict_firstletter.polyphone = {"19969":"DZ","19975":"WM","19988":"QJ","20048":"YL",...};
```

该数据字典将Unicode字符中`4E00`(19968)-`9FA5`(40869)共计20902个汉字的拼音首字母拼接在一起得到一个很长的字符串，然后再将有多音字的汉字（共计370个多音字）单独列出来。该字典文件大小为`25kb`。

该字典文件优点是体积小，支持多音字，缺点是只能获取拼音首字母。

## 字典二：常用汉字

该字典文件将汉字按照拼音进行归类，共计401种组合，收录了6763个常用汉字，不支持多音字。由于从网络上收集的，收录字数较少，所以文件体积只有24kb，后续有空看能不能给扩充一下。

字典文件大致内容如下（这里只是示例，所以只展示一小部分）：

```javascript
/**
 * 常规拼音数据字典，收录常见汉字6763个，不支持多音字
 */
var pinyin_dict_notone = 
{
	"a":"啊阿锕",
	"ai":"埃挨哎唉哀皑癌蔼矮艾碍爱隘诶捱嗳嗌嫒瑷暧砹锿霭",
	"an":"鞍氨安俺按暗岸胺案谙埯揞犴庵桉铵鹌顸黯",
	"ang":"肮昂盎",
	"ao":"凹敖熬翱袄傲奥懊澳坳拗嗷噢岙廒遨媪骜聱螯鏊鳌鏖",
	"ba":"芭捌扒叭吧笆八疤巴拔跋靶把耙坝霸罢爸茇菝萆捭岜灞杷钯粑鲅魃",
	"bai":"白柏百摆佰败拜稗薜掰鞴",
	"ban":"斑班搬扳般颁板版扮拌伴瓣半办绊阪坂豳钣瘢癍舨",
	"bang":"邦帮梆榜膀绑棒磅蚌镑傍谤蒡螃",
	"bao":"苞胞包褒雹保堡饱宝抱报暴豹鲍爆勹葆宀孢煲鸨褓趵龅",
	"bo":"剥薄玻菠播拨钵波博勃搏铂箔伯帛舶脖膊渤泊驳亳蕃啵饽檗擘礴钹鹁簸跛",
	"bei":"杯碑悲卑北辈背贝钡倍狈备惫焙被孛陂邶埤蓓呗怫悖碚鹎褙鐾",
	"ben":"奔苯本笨畚坌锛"
	// 省略其它
};
```

后来慢慢发现这个字典文件中存在诸多错误，比如把`虐`的拼音写成了`nue`（正确写法应该是nve）,`躺`写成了`thang`，而且不支持多音字，所以后来我根据其它字典文件自己重新生成了一份这样格式的 [字典文件](https://github.com/liuxianan/pinyinjs/blob/master/pinyin_dict_notone.js)：

* 共有404种拼音组合
* 收录了6763个常用汉字
* 支持多音字
* 不支持声调
* 文件大小为27kb

同时，我根据网上一份[常用6763个汉字使用频率表](http://blog.sina.com.cn/s/blog_5e2ffb490100dnfg.html)，将这6763个汉字按照使用频率进行了排序，这样就可以实现一个差强人意的JS版输入法了。

另外，根据另外一份更完整的字典文件发现其实共有412种拼音组合，上面字典文件中没有出现的8种发音是：

	chua,den,eng,fiao,m,kei,nun,shei

## 字典三：终极字典

首先，从网上找的如下结构字典文件（下面称为字典A），具体是哪不记得了，支持声调和多音字，它将Unicode字符中`4E00`(19968)-`9FA5`(40869)共计20902个汉字（如果算上〇的话那就是20903个）拼音全部列举，该字典文件大小为`280kb`：

```
3007 (ling2)
4E00 (yi1)
4E01 (ding1,zheng1)
4E02 (kao3)
4E03 (qi1)
4E04 (shang4,shang3)
4E05 (xia4)
4E06 (none0)
4E07 (wan4,mo4)
4E08 (zhang4)
4E09 (san1)
4E0A (shang4,shang3)
4E0B (xia4)
4E0C (ji1)
4E0D (bu4,bu2,fou3)
4E0E (yu3,yu4,yu2)
4E0F (mian3)
4E10 (gai4)
4E11 (chou3)
4E12 (chou3)
4E13 (zhuan1)
4E14 (qie3,ju1)
...
```

其中，对于没有或者找不到读音的汉字，统一标注为`none0`，我统计了一下，这样的汉字一共有525个。

本着将字典文件尽可能减小体积的目标，发现上述文件中除了第一个〇(3007)之外，其它都是连续的，所以我把它改成了如下结构，文件体积也从`280kb`减小到了`117kb`：

```javascript
var pinyin_dict_withtone = "yi1,ding1 zheng1,kao3,qi1,shang4 shang3,xia4,none0,wan4 mo4,zhang4,san1,shang4 shang3,xia4,ji1,bu4 bu2 fou3,yu3 yu4 yu2,mian3,gai4,chou3,chou3,zhuan1,qie3 ju1...";
```

该字典文件的缺点是声调是用数字标出的，如果想要得出类似`xiǎo míng tóng xué`这样的拼音的话，需要一个算法将合适位置的字母转换成`āáǎàōóǒòēéěèīíǐìūúǔùüǖǘǚǜńň`。

本来还准备自己尝试写一个转换的方法的，后来又找到了如下[字典文件](http://zi.artx.cn/zi/)(下面称为字典B)，它收录了20867个汉字，也支持声调和多音字，但是声调是直接标在字母上方的，由于它将汉字也列举出来，所以文件体积比较大，有`327kb`，大致内容如下：

```javascript
{
	"吖": "yā,ā",
	"阿": "ā,ē",
	"呵": "hē,a,kē",
	"嗄": "shà,á",
	"啊": "ā,á,ǎ,à,a",
	"腌": "ā,yān",
	"锕": "ā",
	"錒": "ā",
	"矮": "ǎi",
	"爱": "ài",
	"挨": "āi,ái",
	"哎": "āi",
	"碍": "ài",
	"癌": "ái",
	"艾": "ài",
	"唉": "āi,ài",
	"蔼": "ǎi"
	/* 省略其它 */
}
```

但是经过比对，发现有502个汉字是字典A中读音为`none`但是字典B中有读音的，还有21个汉字是字典A中有但是B中没有的：

```javascript
{
	"兙": "shí kè",
	"兛": "qiān",
	"兝": "fēn",
	"兞": "máo",
	"兡": "bǎi kè",
	"兣": "lǐ",
	"唞": "dǒu",
	"嗧": "jiā lún",
	"囍": "xǐ",
	"堎": "lèng líng",
	"猤": "hú",
	"瓩": "qián wǎ",
	"礽": "réng",
	"膶": "rùn",
	"芿": "rèng",
	"蟘": "tè",
	"貣": "tè",
	"酿": "niàng niàn niáng",
	"醸": "niàng",
	"鋱": "tè",
	"铽": "tè"
}
```


还有7个汉字是B中有但是A中没有的：

```javascript
{
	"㘄": "lēng",
	"䉄": "léng",
	"䬋": "léng",
	"䮚": "lèng",
	"䚏": "lèng,lì,lìn",
	"㭁": "réng",
	"䖆": "niàng"
}
```

所以我在字典A的基础上将二者进行了合并，得到了最终的字典文件 [pinyin_dict_withtone.js](https://github.com/liuxianan/pinyinjs/blob/master/pinyin_dict_withtone.js)，文件大小为`122kb`：

```
var pinyin_dict_withtone = "yī,dīng zhēng,kǎo qiǎo yú,qī,shàng,xià,hǎn,wàn mò,zhàng,sān,shàng shǎng,xià,qí jī...";
```


# 如何使用

我将这几种字典文件放在一起并简单封装了一下解析方法，使用中可以根据实际需要引入不同字典文件。

封装好的3个方法：

```javascript
/**
 * 获取汉字的拼音首字母
 * @param str 汉字字符串，如果遇到非汉字则原样返回
 * @param polyphone 是否支持多音字，默认false，如果为true，会返回所有可能的组合数组
 */
pinyinUtil.getFirstLetter(str, polyphone);
/**
 * 根据汉字获取拼音，如果不是汉字直接返回原字符
 * @param str 要转换的汉字
 * @param splitter 分隔字符，默认用空格分隔
 * @param withtone 返回结果是否包含声调，默认是
 * @param polyphone 是否支持多音字，默认否
*/
pinyinUtil.getPinyin(str, splitter, withtone, polyphone);
/**
 * 拼音转汉字，只支持单个汉字，返回所有匹配的汉字组合
 * @param pinyin 单个汉字的拼音，不能包含声调
 */
pinyinUtil.getHanzi(pinyin)；
```

下面分别针对不同场合如何使用作介绍。

## 如果你只需要获取拼音首字母

```javascript
<script type="text/javascript" src="pinyin_dict_firstletter.js"></script>
<script type="text/javascript" src="pinyinUtil.js"></script>

<script type="text/javascript">
pinyinUtil.getFirstLetter('小茗同学'); // 输出 XMTX
pinyinUtil.getFirstLetter('大中国', true); // 输出 ['DZG', 'TZG']
</script>
```

需要特别说明的是，如果你引入的是其它2个字典文件，也同样可以获取拼音首字母的，只是说用这个字典文件更适合。

## 如果拼音不需要声调

```javascript
<script type="text/javascript" src="pinyin_dict_noletter.js"></script>
<script type="text/javascript" src="pinyinUtil.js"></script>

<script type="text/javascript">
pinyinUtil.getPinyin('小茗同学'); // 输出 'xiao ming tong xue'
pinyinUtil.getHanzi('ming'); // 输出 '明名命鸣铭冥茗溟酩瞑螟暝'
</script>
```

## 如果需要声调或者需要处理生僻字

```javascript
<script type="text/javascript" src="pinyin_dict_withletter.js"></script>
<script type="text/javascript" src="pinyinUtil.js"></script>

<script type="text/javascript">
pinyinUtil.getPinyin('小茗同学'); // 输出 'xiǎo míng tóng xué'
pinyinUtil.getPinyin('小茗同学', '-', true, true); // 输出 ['xiǎo-míng-tóng-xué', 'xiǎo-míng-tòng-xué']
</script>
```

# 关于简单拼音输入法

一个正式的输入法需要考虑的东西太多太多，比如词库、用户个人输入习惯等，这里只是实现一个最简单的输入法，没有任何词库（虽然加上也可以，但是web环境不适合引入太大的文件）。

推荐使用第二个字典文件`pinyin_dict_noletter.js`，虽然字典三字数更多，但是不能按照汉字使用频率排序，一些生僻字反而在前面。

```html
<link rel="stylesheet" type="text/css" href="simple-input-method/simple-input-method.css">
<input type="text" class="test-input-method"/>
<script type="text/javascript" src="pinyin_dict_noletter.js"></script>
<script type="text/javascript" src="pinyinUtil.js"></script>
<script type="text/javascript" src="simple-input-method/simple-input-method.js"></script>
<script type="text/javascript">
	SimpleInputMethod.init('.test-input-method');
</script>
```


