(function ($) {
  calculateProportionalSize = function (width, height) {
    var proportionalWidth = parseInt((height / 3) * 4, 10);
    if (width > proportionalWidth) width = proportionalWidth;
        
    var proportionalHeight = parseInt((width / 4) * 3, 10);
    if (height > proportionalHeight) height = proportionalHeight;
    return { width: width, height: height }
  }
  
  $.fn.slider = function (options) {
    $(this).each(function () {
      options = $.extend({}, {
        'height': 600,
        'width': 900
      }, options);
      
      var $gallery = $(this),
          $container = $('<div class="slider-container">'),
          $items = $gallery.children('li');
      $container = $gallery.wrap($container).parent();
      
      // calculate img size
      var imgWidth = parseInt(options.width / 2, 10);
      options.imgSize = calculateProportionalSize(imgWidth, options.height);
      
      // setup container
      $container.css({
        'overflow':   'hidden',
        'position':   'relative',
        'width':      options.width,
        'height':     options.height
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
      })
      
      // setup first positions
      var imgCount = $items.length;
      if (imgCount < 1) return false;
      
      if (imgCount % 2 === 0) {
        var centeredImgPosition = imgCount / 2;
      } else {
        var centeredImgPosition = (imgCount + 1) / 2;
      }
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
        
        var offset = (options.width / 2) - (options.imgSize.width / 2);
        $(this).css('left', offset).css('z-index', 10 + imgCount);
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
        // move left items
        $left.not($leftFirst).not($rightFirst).each(function () {
          var offset = parseInt($(this).css('left'), 10) - options.leftOffsetPerItem;
          $(this).animate({left: offset}, 300);
        });
        // move center image
        $center.each(function () {
          $(this).removeClass('center').addClass('left');
          var offset = (imgCountLeft - 1) * options.leftOffsetPerItem;
          $(this).animate({left: offset}, 300).css('z-index', 10 + imgCountLeft);
        });
        // move first right image to center
        $rightFirst.each(function () {
          var offset = (options.width / 2) - (options.imgSize.width / 2);
          $(this).animate({right: 0}, function () {
            $(this).css('left', 500).animate({left: offset}).css('z-index', 10 + imgCountLeft);
          });
          $(this).removeClass('right').addClass('center');
        })
        // move right items
        $right.not($rightFirst).not($leftFirst).each(function () {
          var position = imgCount - $(this).index();
          var offset = position * options.rightOffsetPerItem;
          $(this).animate({right: offset}, 300, function () {
            $(this).css('z-index', 10 + position);
          })
        });
      })
    });
  }
})(jQuery);