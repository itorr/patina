;((window) => {
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
  }


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

  window.convoluteNames = Object.keys(Convolutes)

  const randName = userNames=>{
    let k = '-_+~!^&、.。”“"\'|'[randRange(0,14)];
      return userNames[randRange2(0,userNames.length-1)].replace(/\d\d\d\d/,_=>randRange(0,9999)).replace(/_/g,_=>k)
  }


  let lastConfigString = null;
  let lastConfig = {};
  let lastGIFInfo = {
    gifSrc: '',
    gapTime: NaN,
    srcList: []
  }
  /**
   * 包浆 GIF 的入口函数
   * @param {HTMLImageElement} imageEl
   * @param {*} _config
   * @param {Vue} app
   * @returns {void | undefined}
   */
  const patinaGIF = async (imageEl, _config, app) => {
    console.time('p')
    // ======== DEBOUNCE ========
    if (app.runing) {
      app.config = lastConfig
      return
    }

    const configString = [
      JSON.stringify(_config),
      imageEl.src,
      imageEl.naturalWidth
    ].join('-')
    if (!imageEl.naturalWidth) return
    if (lastConfigString === configString) return
    lastConfigString = configString
    lastConfig = deepCopy(_config)
    app.lastConfig = deepCopy(_config)

    app.runing = true

    // ======== INIT ========
    if (_config.rand) {
      randRange = (a, b) => Math.round(Math.random() * (b - a) + a)
    } else {
      randRange = _ => 0
    }

    const naturalWidth = imageEl.naturalWidth
    const naturalHeight = imageEl.naturalHeight

    let _width = naturalWidth
    let _height = naturalHeight

    const scale = naturalWidth / naturalHeight

    if (_config.preview) {
      if (scale > 1) {
        if (naturalWidth > _config.maxWidth) {
          _width = _config.maxWidth
          _height = _config.maxWidth / scale
        }
      } else {
        if (naturalHeight > _config.maxWidth) {
          _width = _config.maxWidth * scale
          _height = _config.maxWidth
        }
      }
    }

    _width = Math.floor(_width / 100 * _config.zoom)
    _height = Math.floor(_height / 100 * _config.zoom)

    app.width = _width

    app.current = 0
    app.output = imageEl.src

    // ======== def FUNCTIONS ========
    // 抽象一些复用函数

    /**
     * 渲染包浆一轮，即对整个 GIF 包浆一次
     * @param {string[]} srcList
     * @return {string[]}
     */
    const patinaOneRound = async (srcList) => {
      // warp the renderer of watermark
      let watermarkRenderer = () => null
      if (_config.watermark) {
        const getWatermarkPlan = (shift, i = randRange2(0, 2)) => {
          // console.log(/i/,i)
          switch (i) {
            case 0:
              return {
                align: 'right',
                left: _width - shift * 1.2 + randRange(-5, 5),
                top: _height - shift + randRange(-5, 5)
              }
            case 1:
              return {
                align: 'center',
                left: _width / 2 + randRange(-10, 10),
                top: _height - shift * 1.2 + randRange(-5, 5)
              }
            case 2:
              return {
                align: 'center',
                left: _width / 2 + randRange(-10, 10),
                top: _height / 2 + shift + randRange(-10, 10)
              }
          }
        }
        const randSize = randRange(0, 7)
        let fontSize = 22 + randSize
        fontSize = _width / fontSize
        fontSize = fontSize * _config.watermarkSize
        const shift = fontSize / 2
        const watermarkPlan = getWatermarkPlan(shift, randRange2(0, _config.watermarkPlan))
        const atName = randName(_config.userNames)
        watermarkRenderer = (ctx) => {
          ctx.shadowColor = `rgba(0, 0, 0, ${_config.watermarkShadowAlpha})`
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 1
          ctx.shadowBlur = 4
          ctx.font = `${fontSize}px/400 苹方,微软雅黑,sans-serif`
          ctx.fillStyle = '#fff'
      
          ctx.textAlign = watermarkPlan.align
          ctx.textBaseline = 'bottom'
      
          ctx.fillText('@' + atName, watermarkPlan.left, watermarkPlan.top)
        }
      }

      // wrap `randPix` and `randPiy`
      const randi = 2
      const randPix = randRange(-randi, randi)
      const randPiy = randRange(-randi, randi)

      app.output = srcList[app.current % srcList.length]

      // patina each image
      const srcListPatina = await Promise.all(
        srcList.map((src) => new Promise((resolve) => {
          const imgEl = new Image()
          imgEl.onload = resolve(patinaOneImageOnce(imgEl, watermarkRenderer, { randPix, randPiy }))
          imgEl.src = src
        }))
      )

      app.current++

      // return the list
      return srcListPatina
    }

    /**
     * 包浆一张图片一次
     * @param {HTMLImageElement} imgEl
     * @param {function} watermarkRenderer
     * @param {{ randPix: number, randPiy: number }} randPi
     * @returns {string} srcPatina
     */
    const patinaOneImageOnce = async (imgEl, watermarkRenderer, { randPix, randPiy }) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = _width
      canvas.height = _height

      let renderFlagResolver
      const renderFlag = new Promise((resolve) => { renderFlagResolver = resolve })
      let patinaSrc
      requestAnimationFrame(() => {
        const cutLeft = 0
        const cutTop = 0

        const calcWidth = imgEl.width
        const calcHeight = imgEl.height

        let setLeft = 0
        let setTop = 0

        const setWidth = _width
        const setHeight = _height

        // leftShift
        setLeft = setLeft + _config.shiftx
        setTop = setTop + _config.shifty

        ctx.rect(0, 0, _width, _height)
        ctx.fillStyle = '#FFF'
        ctx.fill()

        if (_config.mix === 1) {
          ctx.drawImage(
            imgEl,
            cutLeft, cutTop,
            calcWidth, calcHeight,

            setLeft, setTop,
            setWidth, setHeight
          )
        } else { // 像素合并
          const mixedWidth = _width / _config.mix
          const mixedHeight = _height / _config.mix

          ctx.drawImage(
            imgEl,
            cutLeft, cutTop,
            calcWidth, calcHeight,

            (_width - mixedWidth) / 2, (_height - mixedHeight) / 2,
            mixedWidth, mixedHeight
          )

          ctx.drawImage(
            canvas,
            (_width - mixedWidth) / 2, (_height - mixedHeight) / 2,
            mixedWidth, mixedHeight,

            setLeft, setTop,
            setWidth, setHeight
          )
        }

        if (_config.watermark) {
          watermarkRenderer(ctx)
        }

        const green = _ => {
          const imageData = ctx.getImageData(0, 0, _width, _height)
          const data = imageData.data
          for (let p = 0; p < data.length / 4; ++p) {
            const r = data[p * 4]
            const g = data[p * 4 + 1]
            const b = data[p * 4 + 2]
            const y = clamp((77 * r + 150 * g + 29 * b) >> 8)
            const u = clampuv(((-43 * r - 85 * g + 128 * b) >> 8) - 1)
            const v = clampuv(((128 * r - 107 * g - 21 * b) >> 8) - 1)
            const r1 = clamp((65536 * y + 91881 * v) >> 16)
            const g1 = clamp((65536 * y - 22553 * u - 46802 * v) >> 16)
            const b1 = clamp((65536 * y + 116130 * u) >> 16)
            data[p * 4] = r1
            data[p * 4 + 1] = g1
            data[p * 4 + 2] = b1
          }
          ctx.putImageData(imageData, 0, 0)
        }

        if (_config.green) {
          green()
        }

        if (
          _config.lightNoise ||
          _config.darkNoise ||
          _config.contrast !== 1 ||
          _config.light !== 0 ||
          _config.g !== 0 ||
          _config.convoluteName
        ) {
          let pixel = ctx.getImageData(0, 0, _width, _height)
          let pixelData = pixel.data

          for (let i = 0; i < pixelData.length; i += 4) {
            const yuv = rgb2yuv(
              pixelData[i],
              pixelData[i + 1],
              pixelData[i + 2]
            )

            pixelData[i] = yuv[0]
            pixelData[i + 1] = yuv[1]
            pixelData[i + 2] = yuv[2]
          }

          if (_config.lightNoise) {
            const halt = _config.lightNoise / 2
            for (let i = 0; i < pixelData.length; i += 4) {
              pixelData[i] = pixelData[i] + (randRange(0, _config.lightNoise) - halt)// * (255 - pixelData[i])/255;
            }
          }
          if (_config.darkNoise) {
            const halt = _config.darkNoise / 2
            for (let i = 0; i < pixelData.length; i += 4) {
              pixelData[i] = pixelData[i] + (randRange(0, _config.darkNoise) - halt) * (255 - pixelData[i]) / 255
              // 噪声在亮部不那么明显
            }
          }

          // 对比度
          if (_config.contrast !== 1) {
            for (let i = 0; i < pixelData.length; i += 4) {
              pixelData[i] = (pixelData[i] - 128) * _config.contrast + 128
            }
          }

          // 亮度
          if (_config.light !== 0) {
            for (let i = 0; i < pixelData.length; i += 4) {
              pixelData[i] = pixelData[i] + _config.light * 128
            }
          }

          // 卷积
          if (_config.convoluteName) {
            pixel = convolute(
              pixel,
              Convolutes[_config.convoluteName]
            )
            pixelData = pixel.data
          }

          for (let i = 0; i < pixelData.length; i += 4) {
            // 绿化
            if (_config.g) {
              const gAdd = _config.g * 4
              pixelData[i] -= gAdd * _config.gy
              pixelData[i + 1] -= gAdd
              pixelData[i + 2] -= gAdd
            }

            const _rgb = yuv2rgb(
              pixelData[i],
              pixelData[i + 1],
              pixelData[i + 2]
            )

            pixelData[i] = _rgb[0]
            pixelData[i + 1] = _rgb[1]
            pixelData[i + 2] = _rgb[2]
          }

          ctx.putImageData(pixel, 0, 0)
        }

        const _src = canvas.toDataURL('image/jpeg', _config.quality / 100 + Math.random() * 0.1)
        const _imgEl = new Image()
        _imgEl.onload = _ => {
          
          ctx.rect(0, 0, _width, _height)
          ctx.fillStyle = '#FFF'
          ctx.fill()

          ctx.drawImage(
            _imgEl,
            0, 0,
            _width, _height,
            0 - randPix / 2, 0 - randPiy / 2,
            _width + randPix, _height + randPiy
          )

          const _patinaSrc = canvas.toDataURL('image/jpeg', _config.quality / 100 + Math.random() * 0.1)
          patinaSrc = _patinaSrc
          renderFlagResolver()
        }
        _imgEl.src = _src
      })
      await renderFlag
      return patinaSrc
    }

    // ======== MAIN ========
    // (1) load GIF if new, otherwise read the cash `lastGIFInfo`
    // 每次加载和拆分 GIF 会耗费较多的时间，所以要手动做好缓存。
    // 如果每次 GIF 源没有变化，就直接读缓存，可以提速很多。
    const gifInfo = deepCopy(lastGIFInfo)
    await new Promise((resolve) => {
      if (imageEl.src === lastGIFInfo.gifSrc) {
        resolve()
        return
      }
      app.isLoadingGIF = true
      // cash gif src
      gifInfo.gifSrc = imageEl.src
      // cash every slice of image & gap time of gif delay
      let gifEndFlagResolver
      const gifEndFlag = new Promise((resolve) => { gifEndFlagResolver = resolve })
      const gifDom = imageEl.cloneNode()
      gifDom.style = 'display: none'
      document.body.appendChild(gifDom)
      const rub = new SuperGif({
        gif: gifDom,
        auto_play: false,
        on_end () {
          gifEndFlagResolver(new Date().getTime())
        }
      })
      rub.load(async () => {
        const picCnt = rub.get_length()
        // hide the gif loader DOM
        console.log(document.querySelectorAll('.jsgif'))
        document.querySelectorAll('.jsgif').forEach(el => el.style.visibility = 'hidden')
        // calc the time
        rub.pause()
        rub.move_to(0)
        gifStartTime = new Date().getTime()
        rub.play()
        const gifEndTime = await gifEndFlag
        const gifTime = gifEndTime - gifStartTime
        gifInfo.gapTime = gifTime / picCnt
  
        // get each picture of gif
        gifInfo.srcList = Array.from({ length: picCnt }).map((_, i) => {
          rub.move_to(i)
          const src = rub.get_canvas().toDataURL('image/jpeg')
          return src
        })
  
        gifDom.remove()

        app.isLoadingGIF = false
        resolve()
      })
    })
    lastGIFInfo = deepCopy(gifInfo)
    const { gapTime, srcList } = gifInfo
    const picCnt = srcList.length

    // (2) patina round by round
    // 一轮一轮地（current++）渲染GIF, 每一轮的水印应当在同一位置
    const srcListPatina = await Array.from({ length: _config.round }).reduce((prom, _) => {
      return prom.then(srcListLast => patinaOneRound(srcListLast))
    }, Promise.resolve(srcList))
    // 把上面的包浆 src 加载成为已经 onload 的 Image 实例
    const imgElListPatina = await Promise.all(
      srcListPatina.map(src => new Promise((resolve) => {
        const img = new Image()
        img.onload = resolve(img)
        img.src = src
      }))
    )

    // (3) generate and pack the GIF
    app.isPackingGIF = true
    // (3.1) 添加一点动画，增强用户体验
    let timer
    ;(async () => {
      let o = 0
      timer = setInterval(() => {
        app.output = imgElListPatina[o % picCnt].src
        o++
      }, gapTime * (Math.random() * 3 + 1.5))
    })()
    // (3.2) 开始生成 GIF
    const gif = new GIF({
      workers: 2,
      quality: 1,
      workerScript: 'patina-gif/lib/gif.worker.js'
    })
    for (const img of imgElListPatina) {
      gif.addFrame(img, { delay: gapTime })
    }
    gif.on('finished', (blob) => {
      clearInterval(timer)
      // output
      app.output = URL.createObjectURL(blob)
      app.isPackingGIF = false
      app.runing = false
      app.current = 0
      console.timeEnd('p')
    })
    gif.render()
  }
  window.patinaGIF = patinaGIF
})(window)
