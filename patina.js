/*!
 * Patina.js 
 * @itorr <https://lab.magiconch.com/>
 * 2022-03-31
 */





let randRange =(a,b)=>Math.round(Math.random()*(b-a)+a);
let randRange2 = randRange;


const clamp = x => x >= 0 ? x <= 255 ? x : 255 : 0;
const clampuv = x => x >= -128 ? x <= 127 ? x : 127 : -128;


const rgb2yuv = (r,g,b)=>{
	var y, u, v;

	y = r *  .299000 + g *  .587000 + b *  .114000;
	u = r * -.168736 + g * -.331264 + b *  .500000 + 128;
	v = r *  .500000 + g * -.418688 + b * -.081312 + 128;

	y = Math.floor(y);
	u = Math.floor(u);
	v = Math.floor(v);

	return [y,u,v];
};

const yuv2rgb = (y,u,v)=>{
	var r,g,b;

	r = y + 1.4075 * (v - 128);
	g = y - 0.3455 * (u - 128) - (0.7169 * (v - 128));
	b = y + 1.7790 * (u - 128);

	r = Math.floor(r);
	g = Math.floor(g);
	b = Math.floor(b);

	r = (r < 0) ? 0 : r;
	r = (r > 255) ? 255 : r;

	g = (g < 0) ? 0 : g;
	g = (g > 255) ? 255 : g;

	b = (b < 0) ? 0 : b;
	b = (b > 255) ? 255 : b;

	return [r,g,b];
};


const convolute = (pixels, weights)=>{
	const side = Math.round(Math.sqrt(weights.length));
	const halfSide = Math.floor(side/2);

	const src = pixels.data;
	const sw = pixels.width;
	const sh = pixels.height;

	const w = sw;
	const h = sh;
	const output = ctx.createImageData(w, h);
	const dst = output.data;


	for (let y=0; y<h; y++) {
		for (let x=0; x<w; x++) {
			const sy = y;
			const sx = x;
			const dstOff = (y*w+x)*4;
			let r=0, g=0, b=0;
			for (let cy=0; cy<side; cy++) {
				for (let cx=0; cx<side; cx++) {
					const scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
					const scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
					const srcOff = (scy*sw+scx)*4;
					const wt = weights[cy*side+cx];
					r += src[srcOff  ] * wt;
					g += src[srcOff+1] * wt;
					b += src[srcOff+2] * wt;
				}
			}
			dst[dstOff  ] = r;
			dst[dstOff+1] = g;
			dst[dstOff+2] = b;
			dst[dstOff+3] = 255;
		}
	}


	// for (let y=0; y<h; y++) {
	// 	for (let x=0; x<w; x++) {
	// 		const srcOff = (y*w+x)*4;
	// 		src[srcOff] = dst[srcOff];
	// 	}
	// }
	return output;
};

const Convolutes = {
	'右倾':[
		0, -1,  0,
		-1, 2,  2,
		0, -1,  0
	],
	'左倾':[
		0, -1,  0,
		3,  2, -2,
		0, -1,  0
	],
	'桑拿':[
		1/9, 1/9, 1/9,
		1/9, 1/9, 1/9,
		1/9, 1/9, 1/9
	],
	// '桑拿':[
	// 	1/25,1/25,1/25,1/25,1/25,
	// 	1/25,1/25,1/25,1/25,1/25,
	// 	1/25,1/25,1/25,1/25,1/25,
	// 	1/25,1/25,1/25,1/25,1/25,
	// 	1/25,1/25,1/25,1/25,1/25,
	// ],
	'浮雕':[
		1,1,1,
		1,1,-1,
		-1,-1,-1
	]
}


const convoluteNames = Object.keys(Convolutes);




const randName = userNames=>{
	let k = '-_+~!^&、.。”“"\'|'[randRange(0,14)];
    return userNames[randRange2(0,userNames.length-1)].replace(/\d\d\d\d/,_=>randRange(0,9999)).replace(/_/g,_=>k)
}


let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')
// document.body.appendChild(canvas)


let popCanvas = document.createElement('canvas')
let popCtx = popCanvas.getContext('2d')
// document.body.appendChild(popCanvas)




let lastConfigString = null;
const patina = (imageEl, _config, app)=>{

    const naturalWidth = imageEl.naturalWidth
    const naturalHeight = imageEl.naturalHeight


	const configString = [
		JSON.stringify(_config),
		imageEl.src,
		naturalWidth,
	].join('-');

	if(!naturalWidth)return;
	if(lastConfigString === configString) return;

	app.runing = true;

	lastConfigString = configString;


    if(_config.rand) {
        randRange = (a,b)=>Math.round(Math.random()*(b-a)+a)
    }else{
        randRange = _=> 0
    }


    let _width = naturalWidth;
    let _height = naturalHeight;

    let scale = naturalWidth / naturalHeight;

    if(_config.preview){

        if(scale > 1){
            if(naturalWidth > _config.maxWidth){
                _width = _config.maxWidth
                _height = _config.maxWidth / scale
            }
        }else{
            if(naturalHeight > _config.maxWidth){
                _width = _config.maxWidth * scale
                _height = _config.maxWidth
            }
        }
    }

    
    // console.log(naturalWidth,naturalHeight,_width,_height)

    _width  = _width  / 100 * _config.zoom
    _height = _height / 100 * _config.zoom

    canvas.width = _width
    canvas.height = _height


    app.width = _width


	let cutLeft = 0;
	let cutTop  = 0;

	let calcWidth  = naturalWidth;
	let calcHeight = naturalHeight;

	let setLeft = 0;
	let setTop  = 0;

	let setWidth  = _width;
	let setHeight = _height;

    //leftShift
    setLeft = setLeft + _config.shiftx;
    setTop = setTop + _config.shifty;

    ctx.rect(0,0,_width,_height);
    ctx.fillStyle='#FFF';
    ctx.fill();


    if(_config.mix === 1){
        ctx.drawImage(
            imageEl,
            cutLeft,cutTop,
            calcWidth,calcHeight,

            setLeft,setTop,
            setWidth,setHeight
        );

    }else{ //像素合并
        let mixedWidth = _width / _config.mix;
        let mixedHeight = _height / _config.mix;


        ctx.drawImage(
            imageEl,
            cutLeft,cutTop,
            calcWidth,calcHeight,

            (_width - mixedWidth)/2,(_height - mixedHeight)/2,
            mixedWidth,mixedHeight
        );

        ctx.drawImage(
            canvas,
            (_width - mixedWidth)/2,(_height - mixedHeight)/2,
            mixedWidth,mixedHeight,

            setLeft,setTop,
            setWidth,setHeight
        );
    }

    let getWatermarkPlan = (shift,i = randRange2(0,2))=>{
        // console.log(/i/,i)
        switch(i){
            case 0:
                return {
                    align: 'right',
                    left: _width - shift*1.2 + randRange(-5,5),
                    top: _height - shift + randRange(-5,5)
                }
            case 1:
                return {
                    align: 'center',
                    left: _width / 2 + randRange(-10,10),
                    top: _height - shift * 1.2 + randRange(-5,5)
                }
            case 2:
                return {
                    align: 'center',
                    left: _width / 2 + randRange(-10,10),
                    top: _height / 2 + shift + randRange(-10,10)
                }
        }
    };

    const watermark = _=>{

        let randSize = randRange(0,7);

        let fontSize = 22 + randSize;


        fontSize = _width / fontSize;

        fontSize = fontSize * _config.watermarkSize

        ctx.shadowColor = 'rgba(0, 0, 0, 1)';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 4;
        ctx.font = `${fontSize}px/400 苹方,微软雅黑,sans-serif`;
        ctx.fillStyle = '#fff';


        const shift = fontSize/2;
        const watermarkPlan = getWatermarkPlan(shift,randRange(0,_config.watermarkPlan));



        ctx.textAlign = watermarkPlan.align;
        ctx.textBaseline='bottom';

        ctx.fillText('@'+randName(_config.userNames),watermarkPlan.left,watermarkPlan.top);
    }
    if(_config.watermark){
        watermark();
    }

    const green =_=>{

        const imageData = ctx.getImageData(0, 0, _width, _height);
        const data = imageData.data;
        for(let p = 0; p < data.length/4; ++p) {
            const r = data[p*4  ];
            const g = data[p*4+1];
            const b = data[p*4+2];
            const y = clamp  ((  77*r + 150*g +  29*b) >> 8);
            const u = clampuv(((-43*r -  85*g + 128*b) >> 8) - 1);
            const v = clampuv(((128*r - 107*g -  21*b) >> 8) - 1);
            const r1 = clamp((65536*y           + 91881*v) >> 16);
            const g1 = clamp((65536*y - 22553*u - 46802*v) >> 16);
            const b1 = clamp((65536*y + 116130*u         ) >> 16);
            data[p*4  ] = r1;
            data[p*4+1] = g1;
            data[p*4+2] = b1;
        }
        ctx.putImageData(imageData, 0, 0);
    }


    if(_config.green){
        green();
    }

   


    if(
        _config.lightNoise 
        || 
        _config.darkNoise 
        || 
        _config.contrast !== 1 
        || 
        _config.light !== 0 
        || 
        _config.g !== 0 
        ||
        _config.convoluteName
        ){
        let pixel = ctx.getImageData(0, 0, _width, _height);
        let pixelData = pixel.data;

		for(let i = 0;i < pixelData.length;i += 4){
			let yuv = rgb2yuv(
				pixelData[i  ],
				pixelData[i+1],
				pixelData[i+2],
			);


			pixelData[ i   ] = yuv[0];
			pixelData[ i+1 ] = yuv[1];
			pixelData[ i+2 ] = yuv[2];

		}

        if(_config.lightNoise){
            let halt = _config.lightNoise/2;
            for (let i = 0; i < pixelData.length; i +=4) {
                pixelData[i] = pixelData[i] + (randRange(0,_config.lightNoise) - halt)// * (255 - pixelData[i])/255;
            }
        }
        if(_config.darkNoise){
            let halt = _config.darkNoise/2;
            for (let i = 0; i < pixelData.length; i +=4) {
                pixelData[i] = pixelData[i] + (randRange(0,_config.darkNoise) - halt) * (255 - pixelData[i])/255;
                //噪声在亮部不那么明显
            }
        }

		//对比度
        if(_config.contrast !== 1){
            for (let i = 0; i < pixelData.length; i +=4) {
                pixelData[i] = ( pixelData[i] - 128 ) * _config.contrast + 128;
            }
        }

		//亮度
        if(_config.light !== 0){
            for (let i = 0; i < pixelData.length; i +=4) {
                pixelData[i] =  pixelData[i] + _config.light * 128;
            }
        }

        //卷积
		if(_config.convoluteName){
			pixel = convolute(
				pixel,
				Convolutes[_config.convoluteName]
			);
			pixelData = pixel.data;
		}

        for(let i = 0;i < pixelData.length;i += 4){

			//绿化
            if(_config.g){
                let gAdd = _config.g * 4;
                pixelData[ i   ] -= gAdd * _config.gy;
                pixelData[ i+1 ] -= gAdd;
                pixelData[ i+2 ] -= gAdd;
            }

            let _rgb = yuv2rgb(
                pixelData[i],
                pixelData[i+1],
                pixelData[i+2],
            );

            pixelData[i   ] = _rgb[0];
            pixelData[i+1 ] = _rgb[1];
            pixelData[i+2 ] = _rgb[2];
        }

        ctx.putImageData(pixel, 0, 0);
    }

    let _round = _config.round
    let i = 1

    app.current = 1

    let isPop = _config.isPop //_config.pop !== 1

    let popWidth = _width
    let popHeight = _height

    popWidth = _width * _config.pop
    popHeight = _height * _config.pop

    if(isPop){
        _round = Math.pow(_config.pop, 2)
        
        if(_config.preview && _width < _config.maxWidth){

            let maxPopWidth =  _config.maxWidth * 2

            if(popWidth > maxPopWidth){
                popWidth =  maxPopWidth
                popHeight =  maxPopWidth * _height / _width
            }
        }

        let maxPopWidth = 4000;
        if(popWidth > maxPopWidth){
            popWidth =  maxPopWidth
            popHeight =  maxPopWidth * _height / _width
        }


        popCanvas.width = popWidth
        popCanvas.height = popHeight
    }
        
    const one = _=>{
        i++;
        app.current++
       
        if(_config.watermark){
            watermark();
        }
        if(_config.green){
            green();
        }

        const _src = canvas.toDataURL('image/jpeg',_config.quality/100 + Math.random()*0.1)
        const _imgEl = new Image()

        _imgEl.onload= _=>{
            // console.log(i)//,randRange)

            let randi = 2;
            let randPix = randRange(-randi,randi);
            let randPiy = randRange(-randi,randi);

            ctx.rect(0,0,_width,_height);
            ctx.fillStyle='#FFF';
            ctx.fill();
                    
            ctx.drawImage(
                _imgEl,
                0,0,
                _width,_height,
                0 - randPix/2,0 - randPiy/2,
                _width + randPix,_height + randPiy,
            )

            if(isPop){
                popCtx.drawImage(
                    _imgEl,
                    (i-1) % _config.pop * popWidth / _config.pop,
                    Math.floor((i-1) / _config.pop) * popHeight / _config.pop,
                    popWidth / _config.pop,
                    popHeight / _config.pop
                )
            }
            
            if(i < _round){
                one();
            }else{
                app.output = _src
                app.runing = false
                app.current = 0

                if(isPop){
                    app.output = popCanvas.toDataURL('image/jpeg',_config.quality/100 + Math.random()*0.05)
                }
            }
        }
        _imgEl.src = _src
        app.output = _src
       
   }

    const _src = canvas.toDataURL('image/jpeg',_config.quality/100 + Math.random()*0.05)
    const _imgEl = new Image()
    
    _imgEl.onload= _=>{
        // console.log(/原本执行那一次质量调整/,i)

        ctx.drawImage(
            _imgEl,
            0,0,
            _width,_height
        );

        if(isPop){
            popCtx.drawImage(
                _imgEl,
                0,0,
                popWidth / _config.pop,
                popHeight / _config.pop
            )
        }

        app.output = _src

        if(_round === 1){
            app.runing = false
            app.current = 0
        }else{
            one();
        }
        

    }
    _imgEl.src = _src
    app.output = _src
}