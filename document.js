
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
黄前久美子
Uahh_
夹去阳间
大吉山放送部
绫波
_绫_波_丽_
_明_日_香_
_久_美_子_
高坂丽奈
Lilin_0000
Seele_0000
EVANGELION
樱岛麻衣
_樱岛麻衣
电脑玩家0000
fps爱好者
千反田爱瑠`;



const data = {
	src:'totoro-avatar.jpg',
	output:null,
	img:null,
	runing:false,
	current:0,
	debug:false,
	config:deepCopy(defaultConfig),
	width:400,
	userNamesText
};


data.config.userNames = userNamesText.trim().split('\n')


const app = new Vue({
	el:'.app',
	data,
	methods:{
		patina(){
			console.log(this.$refs.img)
			patina(this.$refs.img,this.config,app)
		},
		_patina(){
			clearTimeout(this.T)
			this.T = setTimeout(this.patina,100)
		},
		chooseFileAndSetImageSrc,
		reset(){
			this.config = deepCopy(defaultConfig)
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
			this.config.userNames = text.trim().split('\n')
		}
	},
	computed:{
		
	}
})


const loadScript = (src,el) =>{
	el = document.createElement('script');
	el.src = src;
	document.body.appendChild(el);
};

setTimeout(_=>{
	loadScript('//s4.cnzz.com/z_stat.php?id=1278706389&web_id=1278706389');
},400);