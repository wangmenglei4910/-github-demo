/*
zepto和jquery的区别?
zepto专门为移动端卡法准备的，所以没有考虑pc端和ie的兼容问题，所以zepto要比
jquery小的多，而且一方面，也导致了zepto比jquery小：zaepto只实现了jquery中
最常用的方法（例如：slideDown/slideUp/slideToggle等快捷动画，在zepto中都没有）；
1.jq中设置样式和实现动画的时候，不支持css3中某些样式属性的设置，例如tranform
但是zp中支持了这样的处理
2.zp中单独提供了一些移动端常用的事件方法：tap/singleTap/doubleTap/longTap
swipe/swipeLeft/swipeRight/swipeDown/pinchIn/pinchOut...而这些jq中都没有

移动端能用click事件行为吗？
1.pc端click是点击事件，移动端的click是单击事件（所以在移动端使用click会存在300ms延迟的问题，
在第一次触发后，会等待300ms，看是否第二次触发，存在则为双击，不存在才是单击）=>移动端
的所有操作基本上就是基于touch/gesture事件模型模拟出来的

*/

//在移动端处理滑屏事件的时候，我们要把文档滑动的默认行为禁止掉
$(document).on('touchstart touchmove touchend', function (ev) {
    ev.preventDefault();
});


//魔方模块
let cubeModule = (function () {
    let $cubeBox = $('.cubeBox'),
        $cube = $cubeBox.children('.cube');

    //=>记录手指的起始坐标和盒子的起始旋转角度
    function down(ev) {
        let point = ev.changedTouches[0];
        this.startX = point.clientX;
        this.startY = point.clientY;
        if (!this.rotateY) {
            this.rotateX = -30;
            this.rotateY = 45;
        }
        this.isMove = false;


    }
    //=>记录手指在x/y轴偏移的值，计算出是否发生移动
    function move(ev) {
        let point = ev.changedTouches[0];
        this.changeX = point.clientX - this.startX;
        this.changeY = point.clientY - this.startY;
        if (Math.abs(this.changeX) > 10 || Math.abs(this.changeY) > 10) {
            this.isMove = true;
        }

    }
    //=>如果发生过移动，我们让盒子在原始的旋转角度上继续旋转
    //=>changex控制的是Y轴旋转的角度，changey控制的是x轴的旋转角度，并且changey的值和沿着x轴旋转的角度的值正好相反（向上移动，changey为负）
    //按照x轴向上旋转确实正的角度
    function up(ev) {
        let point = ev.changedTouches[0],
            $this = $(this);
        if (!this.isMove) return;
        this.rotateY = this.rotateY + this.changeX / 3;
        this.rotateX = this.rotateX + this.changeY / 3;
        $this.css('transform', `scale(.8) rotateX(${this.rotateX}deg) rotateY(${this.rotateY}deg)`)

    }

    // function up(ev) {
    // 	let point = ev.changedTouches[0],
    // 		$this = $(this);
    // 	if (!this.isMove) return;
    // 	this.rotateY = this.rotateY + this.changeX / 3;
    //     this.rotateX = this.rotateX - this.changeY / 3;
    //     console.log(1111111111)
    // 	$this.css(`transform`, `scale(.8) rotateX(${this.rotateX}deg) rotateY(${this.rotateY}deg)`);
    // }

    return {
        init(isInit) {
            $cubeBox.css('display', 'block');
            if (isInit) return;
            $cube.css('transform', `scale(.8) rotateX(-30deg) rotateY(45deg)`).on('touchstart', down).on('touchmove', move).on('touchend', up);
            //=>魔方每一面点击事件
            $cube.children('li').tap(function () {
                $cubeBox.css('display', 'none');
                swiperModule.init($(this).index() + 1);
            })
        }
    }
})();

/*滑屏模块*/
let swiperModule = (function () {
    let swiperExample = null,
        $swiperBox = $('.swiperBox'),
        $returnBox = $('.returnBox'),
        $baseInfo = null;
    //=>makisu的基础配置
    // $baseInfo.makisu({
    //     selector:'dd',
    //     overlap:0.6,
    //     speed:0.8

    // })
    function pageMove() {
        let activeIndex = this.activeIndex,
            $baseInfo = $('.baseInfo'),
            slides = this.slides;
        if (activeIndex === 1 || activeIndex === 7) {
            $baseInfo.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0.8

            })
            $baseInfo.makisu('open')
        } else {
            $baseInfo.makisu({
                selector: 'dd',
                overlap: 0,
                speed: 0
            })
            $baseInfo.makisu('close');
        }

        //=>给当前页面设置id，让其内容有动画效果
        [].forEach.call(slides, (item, index) => {
            if (index === activeIndex) {
                activeIndex === 0 ? activeIndex = 6 : null;
                activeIndex === 7 ? activeIndex = 1 : null;
                item.id = 'page' + activeIndex;
                return;
            }
            item.id = null;
        })
    }
    return {
        init(index = 1) {
            $swiperBox.css('display', 'block');
            if (swiperExample) {
                swiperExample.sildeTo(index, 0);
                return;
            }
            swiperExample = new Swiper('.swiper-container', {
                // initialSlide:index,
                direction: 'horizontal',
                loop: true,
                effect: 'coverflow',
                on: {
                    init: pageMove,
                    transitionEnd: pageMove
                }
            });
            swiperExample.slideTo(index, 0);
            $returnBox.tap(function () {
                $swiperBox.css('display', 'none');
                cubeModule.init(true);
            })


        }
    }
})();


cubeModule.init();
// swiperModule.init();


//=>音乐区域
function handleMusic() {
    let $musicAudio = $('.musicAudio'),
        musicAudio = $musicAudio[0],
        $musicIcon = $('.musicIcon');
    $musicAudio.on('canplay', function () {
        $musicIcon.css('display', 'block')
        .addClass('move')
    });
    $musicIcon.tap(function () {
        if (musicAudio.paused) {
            play();
            $musicIcon.addClass('move');
            return;
        }
        musicAudio.pause();
        $musicIcon.removeClass('move');
        
    })
    

    function play() {
        musicAudio.play();
        document.removeEventListener('touchstart',play)
    }
    play();
    //=>兼容处理
    document.addEventListener('weixinJSBridgeReady',play);
    document.addEventListener('weixinJSBridgeReady',play);
    document.addEventListener('touchstart',play);


}
setTimeout(handleMusic, 1000)