
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


const data = {
	src:'totoro-avatar.jpg',
	output:null,
	img:null,
	runing:false,
	current:0,
	debug:false,
	config:deepCopy(defaultConfig),
	width:400
};


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
		}
	},
	watch:{
		config:{
			deep:true,
			handler(){
				this._patina()
			}
		}
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