KISSY.use('cec/cec', function (S, CEC) {
	var Ticker = CEC.Ticker,
		RectSprite = CEC.Sprite.Rect;

	var stage = new RectSprite('canvas');

        var rect = new RectSprite({
            x: 10,
            y: 10,
            width: 300,
            height: 200,
            backgroundImage: './images/package/pkg_03.png',
            backgroundSize: '10% 10%',
            backgroundPosition: '-100 0'
        })
        .setFillColor('#333')
        .appendTo(stage)
        .on('img:ready', function (img) {
            // this.ready = true;
            // this.setDim(img.width, img.height);
        }).on('render:before', function () {
                this.rotate('+1');
                this.ss = this.ss || '-0.01';
                if (/\+/.test(this.ss) && this.scaleX >= 1) this.ss = '-0.01';
                if (/\-/.test(this.ss) && this.scaleX <= 0.5) {this.ss = '+0.01';}
                
                this.setScale(this.ss, this.ss);  
                this.setBackgroundPositionX('-1')        
            
        })


        Ticker.singleton.on('tick', function (dt) {
            stage.clear();
            stage.render(dt);
        }); 

	// var screenCanvas = document.getElementById('canvas'),
	// 	tmpCanvas = document.createElement('canvas'),
	// 	scrCtx = screenCanvas.getContext('2d'),
	// 	tmpCtx = tmpCanvas.getContext('2d');

	// tmpCanvas.width = 100;
	// tmpCanvas.height = 100;

	// tmpCtx.fillStyle = 'red';
	// tmpCtx.fillRect(0, 0, 100, 100);

	// scrCtx.drawImage(tmpCanvas, 0, 0);

})