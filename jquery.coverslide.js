//
// jQuery Coverslide Plugin
// https://github.com/droidlabs/jquery.coverslide
// Copyright (c) 2011-2012 Droid Labs
// Licenced under [MIT](http://www.opensource.org/licenses/mit-license.php).
//
(function ($) {
  calculateProportionalSize = function (width, height) {
    if (width > height) width = height;
    if (height > width) height = width;
    return { width: width, height: height }
  }
  
  $.fn.coverslide = function (options) {
    $(this).each(function () {
      options = $.extend({}, {
        'height': 600,
        'width': 600
      }, options);
      
      var $gallery = $(this),
          $container = $('<div class="slider-container">'),
          $items = $gallery.children('li'),
          imgUrls = [];
      $container = $gallery.wrap($container).parent();
      
      // calculate img size
      var imgWidth = parseInt(options.width / 2, 10);
      options.imgSize = calculateProportionalSize(imgWidth, options.height);
      
      // setup container
      $container.css({
        'overflow':   'hidden',
        'position':   'relative',
        'width':      options.width,
        'height':     options.height,
        'padding':    '0 30px'
      });
      
      // setup gallery
      $gallery.css({
        'overflow':   'hidden',
        'position':   'relative',
        'width':      options.width,
        'height':     options.height,
        'padding':    0,
        'margin':     0
      });
      $gallery.css('margin-top', (options.height - options.imgSize.height) / 2);
      
      // setup gallery images
      $items.css({
        'list-style': 'none',
        'position':   'absolute',
        'text-align': 'center',
        'width':      options.imgSize.width,
        'height':     options.imgSize.height
      }).children('img').css({
        'padding':    0,
        'margin':     0,
        'max-width':  options.imgSize.width,
        'max-height': options.imgSize.height,
        'box-shadow': '0 0 8px #333'
      }).each(function () {
        imgUrls.push($(this).attr('src'));
      });
      
      var imgCount = $items.length,
          centeredImgPosition = (imgCount % 2 === 0) ? imgCount / 2 : (imgCount + 1) / 2;
      if (imgCount < 1) return false;
      
      $items.each(function (i) {
        var position = i + 1;

        if (position == centeredImgPosition) {
          $(this).addClass('center');
        } else if (position < centeredImgPosition) {
          $(this).addClass('left');
        } else if (position > centeredImgPosition) {
          $(this).addClass('right');
        }
      });
      
      var imgCountLeft = $items.filter('.left').length,
          imgCountRight = $items.filter('.right').length;
      
      // setup first positions
      $.imgpreload(imgUrls, function () {
        $items.find('img').each(function () {
          $(this).parent().css('width', $(this).width());
        });

        // set postion of left and right images
        $items.filter('.left, .right').each(function (i) {

          var align = $(this).is('.left') ? 'left' : 'right',
              position = align == 'left' ? i : (imgCount - i) - 2,
              offsetMax = parseInt(options.width / 3, 10),
              offsetImgCount = align == 'left' ? imgCountLeft : imgCountRight;

          options[align + 'OffsetPerItem'] = parseInt(offsetMax / (offsetImgCount + 1), 10);
          var offset = position * options[align + 'OffsetPerItem'];
          $(this).css(align, offset).css('z-index', 10 + position);
        });

        // set postion of centered image
        $items.filter('.center').each(function (i) {
          var offset = (options.width / 2) - ($(this).width() / 2);
          $(this).css('left', offset).css('z-index', 10 + imgCount);
        });
      });
      
      // create arrows
      var $arrowLeft = $('<img src="images/arrow-left.png" class="arrow-left" />'),
          $arrowRight = $('<img src="images/arrow-right.png" class="arrow-left" />');
      $arrowLeft.add($arrowRight).css({
        'z-index': 30,
        position: 'absolute',
        top: (options.height / 2) - 20,
        width: 25,
        height: 37
      }).appendTo($container);

      $arrowRight.css('right', 0);
      $arrowLeft.css('left', 0);
      
      // Click Right arrow
      $arrowRight.on('click', function () {
        $items = $gallery.children('li');
        var $left = $items.filter('.left'),
            $right = $items.filter('.right'),
            $center = $items.filter('.center').first(),
            $leftFirst = $left.first(),
            $rightFirst = $right.first();

        // move first item
        $leftFirst.animate({left: 300}, 400, function () {
          $(this).removeClass('left').addClass('right').css('z-index', 0)
          $(this).insertAfter($right.last()).css('right', 300).css('left', 'auto').animate({right: 0});
        });
        // move center image
        $center.each(function () {
          $(this).removeClass('center').addClass('left');
          var offset = (imgCountLeft - 1) * options.leftOffsetPerItem;
          $(this).animate({left: offset}, 300).css('z-index', 10 + imgCountLeft);
        });
        // move first right image to center
        $rightFirst.each(function () {
          var offset = (options.width / 2) - ($(this).width() / 2),
              animateRight = parseInt($(this).css('right'), 10) - ($(this).width() / 2),
              animateLeft = (options.width - animateRight) - $(this).width();
          $(this).animate({right: animateRight}, 150, function () {
            $(this).css('left', animateLeft).animate({left: offset}).css('z-index', 10 + imgCountLeft);
          });
          $(this).removeClass('right').addClass('center');
        })
        // move left and right items
        $left.add($right).not($rightFirst).not($leftFirst).each(function () {
          var align = $(this).is('.left') ? 'left' : 'right',
              index = $(this).index(),
              position = align == 'left' ? index - 1 : (imgCount - index),
              offset = position * options[align + 'OffsetPerItem'],
              animation = {}
          animation[align] = offset
          $(this).animate(animation, 300, function () {
            $(this).css('z-index', 10 + position);
          })
        });
      });
      
      // Click Left arrow
      $arrowLeft.on('click', function () {
        $items = $gallery.children('li');
        var $left = $items.filter('.left'),
            $right = $items.filter('.right'),
            $center = $items.filter('.center').first(),
            $leftLast = $left.last(),
            $rightLast = $right.last();

        // move last item
        $rightLast.animate({right: 300}, 400, function () {
          $(this).removeClass('right').addClass('left').css('z-index', 0)
          $(this).insertBefore($left.first()).css('left', 300).css('right', 'auto').animate({left: 0});
        });
        // move center image
        $center.each(function () {
          $(this).removeClass('center').addClass('right');
          var offset = (imgCountRight - 1) * options.rightOffsetPerItem;
          $(this).css('right', $(this).css('left')).css('left', 'auto')
          $(this).animate({right: offset}, 300).css('z-index', 10 + imgCountRight);
        });
        // move last left image to center
        $leftLast.each(function () {
          var offset = (options.width / 2) - ($(this).width() / 2),
              animateLeft = parseInt($(this).css('left'), 10) - ($(this).width() / 2),
              animateRight = (options.width - animateLeft) - $(this).width();
          $(this).animate({left: animateLeft}, 150, function () {
            $(this).css('right', animateRight).css('left', 'auto');
            $(this).animate({right: offset}).css('z-index', 10 + imgCountRight + 1);
          });
          $(this).removeClass('left').addClass('center');
        })
        // move left and right items
        $left.add($right).not($rightLast).not($leftLast).each(function () {
          var align = $(this).is('.left') ? 'left' : 'right',
              index = $(this).index(),
              position = align == 'left' ? index + 1 : (imgCount - index - 2),
              offset = position * options[align + 'OffsetPerItem'],
              animation = {}
          animation[align] = offset
          $(this).animate(animation, 300, function () {
            $(this).css('z-index', 10 + position);
          })
        });
      });
    });
  }
  $.imgpreload = function (imgs, callback) {
    if ('string' == typeof imgs) { imgs = [imgs]; }
    var loaded = [];
    var t = imgs.length;
    for (var i=0; i<t; i++) {
      var img = new Image();
      $(img).on('load error', function(e) {
        loaded.push(this);
        $.data(this, 'loaded', ('error'==e.type)?false:true);
        if (loaded.length >= t) callback.call(loaded);
  		});
      img.src = imgs[i];
  	}
  }
})(jQuery);