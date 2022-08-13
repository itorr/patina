
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
				// console.log(clipboardData.files[i])
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
chooseFile.input.accept = 'image/*';
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

const isGIF = async (src) => {
  return await fetch(src)
    .then(response => response.arrayBuffer())
    .then(arrBuff => new Uint8Array(arrBuff).map(byte => byte.toString(16).padStart(2, '0')).slice(0, 4).join(''))
    .then(str => str === '47494638')
    .catch(() => null)
}


const isImageRegex = /^image\/(.+)$/;

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
	watermarkPlan:2,
	watermarkShadowAlpha:.6,

};

const userNamesText = `卜卜口
拆家大主教
HomeArchbishop
_Home_Archbishop_
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
樱岛麻衣俺老婆0000
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
琴吹䌷_
中野梓
山中佐和子
凉宫春日
长门有希
_鹤_屋_
泽渡真琴
冈崎朋也
——古河渚
藤林杏_
藤林椋_
坂上智代
春原阳平
长野原美绪
折木奉太郎
千反田爱瑠
伊原摩耶花
富樫勇太
小鸟游六花
丹生谷森夏
五月七日茴香
凸守早苗
北白川玉子
德拉·打糕难吃
冢本秀一
薇尔莉特·伊芙加登
伊吹公子
冈崎汐0000`;


let config = deepCopy(defaultConfig);
config.userNames = userNamesText.trim().split('\n')

const data = {
	src:'totoro-avatar.jpg',
	// src:'hibike-capture.png',
	// src:'IMG_7076.JPG',
  // src: 'chiya.gif',
  // src: 'panda.gif',
	downloadFileName:'[lab.magiconch.com][电子包浆].jpg',
	output:null,
	img:null,
	direction:'vertical',
	runing:false,
	current:0,
	debug:false,
	config,
	width:400,
	userNamesText,
	superMode:false,
	convoluteNames,
	isGIF: false,
	isLoadingGIF: false,
	isPackingGIF: false,
	lastConfig: {}
};




const app = new Vue({
	el:'.app',
	data,
	methods:{
		patina(){
      if (this.isGIF) {
        patinaGIF(this.$refs.img,this.config,app)
      } else {
        patina(this.$refs.img,this.config,app)
      }
		},
		_patina(){

			clearTimeout(this.T)
			this.T = setTimeout(this.patina,300)
		},
		async load(){
			const imageEl = this.$refs.img;
			let _width  = imageEl.naturalWidth;
			let _height = imageEl.naturalHeight;

		
			let scale = _width / _height;
			let direction = scale > 1.2 ? 'horizontal' : 'vertical';

      this.isGIF = await isGIF(imageEl.src)

			app.direction = direction;
			app.patina();
		},
		chooseFileAndSetImageSrc,
		reset(){
			const _config = deepCopy(defaultConfig)
			_config.userNames = this.userNamesText.trim().split('\n')
			this.config = _config
		},
		save(e){
			this.downloadFileName = `[lab.magiconch.com][电子包浆]-${+Date.now()}.jpg`;
			// a.click();
		}
	},
	watch:{
		config:{
			deep:true,
			handler(config){
				console.log(config)
				const maxWidth = config.maxWidth;
				document.documentElement.style.setProperty('--max-width', `${maxWidth}px`);
				if (!this.isGIF) {
          this._patina();
        }
			}
		},
		userNamesText(text){
			this.config.userNames = this.userNamesText.trim().split('\n')
		},
		maxWidth(maxWidth){
			
		}
	},
	computed:{
		isShouldRedoGIF () {
      return JSON.stringify(this.lastConfig) !== JSON.stringify(this.config)
    }
	}
})


if(!/\/$/.test(location.pathname))location.pathname = location.pathname + '/';


const loadScript = (src,onLoad=_=>{},el) =>{
	el = document.createElement('script');
	el.src = src;
	el.onload = onLoad;
	document.body.appendChild(el);
};

window._hmt = [];
const gtmId = 'G-13BQC1VDD8';
window.dataLayer = [
    ['js', new Date()],
    ['config', gtmId]
];
window.gtag = function(){dataLayer.push(arguments)};
setTimeout(_=>{
	loadScript('https://hm.baidu.com/hm.js?f4e477c61adf5c145ce938a05611d5f0');
	loadScript('https://www.googletagmanager.com/gtag/js?id='+gtmId);
	loadScript('https://sdk.51.la/js-sdk-pro.min.js',_=>{
		LA.init({id: "JgPCvOAtY0gH7fbQ",ck: "JgPCvOAtY0gH7fbQ",autoTrack:true,hashMode:true})
	})
},1400);