
const readFileToURL = (file,onOver)=>{
	var reader = new FileReader();
	reader.onload = ()=>{
		const src = reader.result;
		onOver(src);
	};
	reader.readAsDataURL(file);
};

const readFileAndSetIMGSrc = file=>{
	readFileToURL(file,src=>{
		app.$refs.img.src = src;
	});
};

function chooseFileAndSetImageSrc(){
    chooseFile(readFileAndSetIMGSrc)
}

document.addEventListener('paste',e=>{
	// console.log(e.clipboardData,e.clipboardData.files);

	const clipboardData = e.clipboardData;
	if(clipboardData.items[0]){
		let file = clipboardData.items[0].getAsFile();

		if(file && isImageRegex.test(file.type)){
			return readFileAndSetIMGSrc(file);
		}
	}

	if(clipboardData.files.length){
		for(let i = 0;i<clipboardData.files.length;i++){
			if(isImageRegex.test(clipboardData.files[i].type)){
				console.log(clipboardData.files[i])
				readFileAndSetIMGSrc(clipboardData.files[i]);
			}
		}
	}
});
document.addEventListener('dragover',e=>{
	e.preventDefault();
});
document.addEventListener('drop',e=>{
	e.preventDefault();

	const file = e.dataTransfer.files[0];

	if(file && file.type.match(isImageRegex)){
		readFileAndSetIMGSrc(file);
	}
});


const chooseFile = callback=>{
	chooseFile.form.reset();
	chooseFile.input.onchange = function(){
		if(!this.files||!this.files[0])return;
		callback(this.files[0]);
	};
	chooseFile.input.click();
};
chooseFile.form = document.createElement('form');
chooseFile.input = document.createElement('input');
chooseFile.input.type = 'file';
chooseFile.form.appendChild(chooseFile.input);

const request = (method,uri,data,callback)=>{
	let body = null;
	if(data){
		body = JSON.stringify(data);
	}
	fetch(uri,{
		method,
		mode: 'cors',
		body,
		credentials: 'include',
		headers: {
			'content-type': 'application/json'
		}
	}).then(res => res.json()).then(data => callback(data)).catch(error => console.error(error))
};



const isImageRegex = /^image\/(jpeg|gif|png|bmp|webp)$/;

const deepCopy = o=>JSON.parse(JSON.stringify(o));

let defaultConfig = {
	isPop:false,
	preview:true,
	pop:4, //波普
	maxWidth:500,
	zoom: 100,
	mix:1, //像素合并
	level: 4, //颜色断层
	lightNoise:0, //明度噪声
	darkNoise:0, //胶片噪声
	shiftx:0,
	shifty:0,
	light:0,//亮度
	contrast:1, //对比度
	convoluteName:null, //convolute
	quality: 60, 
	green:true, //贴吧绿图
	g:0,
	gy:1,
	round: 12,
	rand:true, //随机
	watermark: true,
	watermarkSize:1,
	watermarkPlan:2
};

const userNamesText = `卜卜口
_蒸_気_機_
能不能好好说话
神奇海螺_0000
magiconch.com
电脑玩家海螺
电子包浆
阿卡梦
_阿_卡_梦_
极限天空
_极_限_天_空_
任意门穿梭了时光
干啥都成功的球球
Uahh_
夹去阳间
大吉山放送部
绫波
_绫_波_丽_
_明_日_香_
_久_美_子_
Lilin_0000
Seele_0000
EVANGELION
樱岛麻衣
_樱岛麻衣
电脑玩家0000
fps爱好者
蒙古上单
黄前久美子
高坂丽奈
川岛绿辉
平泽唯
秋山澪
田井中律
琴吹䌷
中野梓
山中佐和子
真锅和
平泽忧
铃木纯
相良宗介
千鸟要
泰蕾莎·泰丝塔罗莎
阿虚
凉宫春日
长门有希
朝比奈实玖瑠
古泉一树
鹤屋
相泽祐一
月宫亚由
水濑名雪
泽渡真琴
美坂栞
川澄舞
仓田佐佑理
水濑秋子
美坂香里
天野美汐
北川润
冈崎朋也
古河渚
藤林杏
藤林椋
坂上智代
伊吹风子
一之濑琴美
春原阳平
古河秋生
古河早苗
芳野祐介
相乐美佐枝
宫泽有纪宁
牡丹
春原芽衣
相生祐子
长野原美绪
水上麻衣
博士
东云名乃
阪本先生
折木奉太郎
千反田爱瑠
福部里志
伊原摩耶花
富樫勇太
小鸟游六花
丹生谷森夏
五月七日茴香
凸守早苗
北白川玉子
德拉·打糕难吃
大路饼藏
常盘绿
牧野神奈
朝雾史织
北白川馅子
栗山未来
神原秋人
可儿江西也
千斗五十铃
加藤叶月
田中明日香
小笠原晴香
中世古香织
冢本秀一
后藤卓也
长濑梨子
中川夏纪
吉川优子
川神舞
泉此方
柊镜
柊司
高良美幸
小神晶
白石稔
小林
托尔
康娜
薇尔莉特·伊芙加登
伊吹公子
冈崎汐`;



const data = {
	src:'totoro-avatar.jpg',
	output:null,
	img:null,
	runing:false,
	current:0,
	debug:false,
	config:null,
	width:400,
	userNamesText
};




const app = new Vue({
	el:'.app',
	data,
	methods:{
		patina(){
			patina(this.$refs.img,this.config,app)

            !window._czc||_czc.push(["_trackEvent", "电子包浆","生成",this.config.round,this.config.quality,"run"]);
		},
		_patina(){
			clearTimeout(this.T)
			this.T = setTimeout(this.patina,100)
		},
		chooseFileAndSetImageSrc,
		reset(){
			const _config = deepCopy(defaultConfig)
			_config.userNames = this.userNamesText.trim().split('\n')
			this.config = _config
		},
		save(){
			const a = document.createElement('a');
			a.href = this.output;
			a.download = `[lab.magiconch.com][电子包浆]-${+Date.now()}.jpg`;
			a.click();
		}
	},
	watch:{
		config:{
			deep:true,
			handler(){
				this._patina()
			}
		},
		userNamesText(text){
			this.config.userNames = this.userNamesText.trim().split('\n')
		}
	},
	computed:{
		
	}
})
app.reset();

const loadScript = (src,el) =>{
	el = document.createElement('script');
	el.src = src;
	document.body.appendChild(el);
};

setTimeout(_=>{
	loadScript('//s4.cnzz.com/z_stat.php?id=1278706389&web_id=1278706389');
},400);