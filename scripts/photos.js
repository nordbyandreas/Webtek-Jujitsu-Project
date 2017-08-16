/*
 Interactive photo gallery with rollovers and a display interface

 Authors: Thea Skylstad, Grzegorz Swiderski
 Written: November 2015
 Version: 1.01
*/
+function(){ //Closed scope

var gallery  = document.getElementById('gallery');
var photos   = gallery.getElementsByTagName('a'), //or links to photos, rather
    photoCvs = gallery.appendChild(document.createElement('canvas')),
    photoCxt;

if(photoCvs.getContext) //If canvas is unsupported, photoCxt remains undefined or null
  photoCxt = photoCvs.getContext('2d');

var hovered = null; //Indicates which image is hovered
var display = { //Data about active images
  initRect: null,
  sideImgs: {prev: null, next: null},
  thumbImg: null,
  largeImg: new Image,
  loadFlag: false,
  transDir: 'out',
  tweenVal: 0
};
display.largeImg.onload = function(){
  display.loadFlag = true;
};

//Handles click, mouseover and mouseout events for displaying or hovering on photos
function photoHandler(e){
  //Backwards compatibility
  e = e || window.event

  var type = e.type;
  if(type == 'click' && photoCxt){ //Run only if canvas is supported

    //Look for clicked index
    for(var i = 0; i < photos.length; i++)
      if(photos[i] == this) break;

    //Update data for further display animation
    display.sideImgs = {
      prev: photos[(i - 1 + photos.length) % photos.length].getElementsByTagName('img')[0],
      next: photos[(i + 1 + photos.length) % photos.length].getElementsByTagName('img')[0]
    };
    display.thumbImg = this.getElementsByTagName('img')[0];
    display.initRect = this.getBoundingClientRect();

    //Load full size image of current selection
    display.loadFlag = false;
    display.largeImg.src = display.thumbImg.src.split('/thumbs').join('');

    //Commence animation
    display.transDir = 'in';
    display.tweenVal = 100;

    hovered = null; //Cancel current hover indicator
    photoCvs.style.display = 'block'; //Show canvas topmost
    photoCvs.style.zIndex = 1;

    return false; //Cancels default click behavior - old school
  };

  //Handle rollovers in the same function
  var thisHover = type == 'mouseover';
  if(thisHover)
    hovered = this;
  else if(hovered == this) //Cursor leaves element
    hovered = null;
};
//Attach handler to all photo elements
for(var i = 0; i < photos.length; i++)
  photos[i].onclick = photos[i].onmouseover = photos[i].onmouseout = photoHandler;

//Switches between three active photos on display
function switchPhoto(dir){
  switch(dir){
    case 'left':
      for(var i = 0; i < photos.length; i++) //Find index of left image
        if(photos[i] == display.sideImgs.prev.parentNode) break;

      display.sideImgs.next = display.thumbImg;
      display.thumbImg = display.sideImgs.prev;
      display.sideImgs.prev = photos[(i - 1 + photos.length) % photos.length].getElementsByTagName('img')[0];
      break;

    case 'right':
      for(var i = 0; i < photos.length; i++) //Find index of right image
        if(photos[i] == display.sideImgs.next.parentNode) break;

      display.sideImgs.prev = display.thumbImg;
      display.thumbImg = display.sideImgs.next;
      display.sideImgs.next = photos[(i + 1 + photos.length) % photos.length].getElementsByTagName('img')[0];
      break;

    default: return;
  };
  //If thumbnails changed, load a new full sized image
  display.loadFlag = false;
  display.largeImg.src = display.thumbImg.src.split('/thumbs').join('');

  //Initialize transition in prompted direction
  display.tweenVal = 100;
  display.transDir = dir;
};

var ratio = {
 photo: 3/2, //Photographic aspect ratio assumed here
 screen: 0  //Screen ratio changes during animation
};

//Handle switching images through clicks or touches
photoCvs.onclick = function(e){
  //Backwards compatibility
  e = e || window.event;

  if(ratio.screen < ratio.photo){
    if(e.clientY < photoCvs.height * 0.25) //Top 25% of screen
      switchPhoto('left');
    else if(e.clientY > photoCvs.height * 0.75)  //Bottom 25% of screen
      switchPhoto('right');
    else{ //Switch off
      display.tweenVal = 100;
      display.transDir = 'out';
    };
  }
  else{
    if(e.clientX < photoCvs.width * 0.25) //Left 25% of screen
      switchPhoto('left');
    else if(e.clientX > photoCvs.width * 0.75) //Right 25% of screen
      switchPhoto('right');
    else{ //Switch off
      display.tweenVal = 100;
      display.transDir = 'out';
    };
  };
};

//Handle switching images through arrow keys
onkeydown = function(e){
  e = e || window.event; //Backwards compatibility
  var key = e.key || e.keyCode;

  if(photoCvs.style.display){ //Run only when a photo is actually displayed
    if(key == 'ArrowLeft'  || key == 'Left'  || key == 37)
      switchPhoto('left');
    if(key == 'ArrowRight' || key == 'Right' || key == 39)
      switchPhoto('right');
  };
};

//Handle switching images through touch swipes
var touchCoord = null;
function swipeStart(e){
  //Distinguish TouchEvent from MouseEvent and PointerEvent
  if(e.touches) e = e.touches[0];

  //Store new coordinates if they don't exist
  touchCoord = touchCoord || {
    down: ratio.screen < ratio.photo ? e.clientY : e.clientX,
    move: ratio.screen < ratio.photo ? e.clientY : e.clientX
  };
};
function swipeMove(e){
  //Prevent default scrolling
  e.preventDefault();

  //Distinguish TouchEvent from MouseEvent and PointerEvent
  if(e.touches) e = e.touches[0];

  if(touchCoord) //Ensure that only a single touch is possible
    touchCoord.move = ratio.screen < ratio.photo ? e.clientY : e.clientX;
};
function swipeEnd(){
  if(touchCoord){ //Perform result if difference is above 10 pixels
    var diff = touchCoord.down - touchCoord.move;
    if(diff < -10)
      switchPhoto('left')
    else if(diff > 10)
      switchPhoto('right')

    //End swipe
    touchCoord = null;
  };
};
function swipeCancel(){
  touchCoord = null;
};
//Assign touch events to all possible listeners
photoCvs.ontouchstart  = photoCvs.onmspointerdown = photoCvs.onpointerdown = swipeStart;
photoCvs.ontouchmove   = photoCvs.onmspointermove = photoCvs.onpointermove = swipeMove;
photoCvs.ontouchend    = photoCvs.onmspointerup   = photoCvs.onpointerup   = swipeEnd;
photoCvs.ontouchcancel = photoCvs.onmspointercancel = photoCvs.onpointercancel = swipeCancel;


function mainAnimation(){
  //Rollover DOM animations on photos
  for(var i = 0; i < photos.length; i++){
    var limit = photos[i] == hovered ? 75 : 100;
    var value = 100 * parseFloat(photos[i].style.opacity) || 100;
    var delta = (limit - value) / 4;
    //Round integer to keep the loop finite
    value = delta < 0 ? Math.floor(value + delta) : Math.ceil(value + delta);

    photos[i].style.opacity = value / 100;
    photos[i].style.filter = 'alpha(opacity=' + value + ')'; //opacity for IE<9
  };
  
  //Display animations; run only if canvas is supported and displayed at the moment
  if(photoCxt && photoCvs.style.display){
    photoCvs.width = window.innerWidth;
    photoCvs.height = window.innerHeight;
    ratio.screen = photoCvs.width / photoCvs.height;

    //Tween value always goes from 100 to 0 here
    value = display.tweenVal * 3/4 | 0;
    var cent = value / 100;

    //Adapt images to screen
    var fullRect = { //Assumes full images to be sized 1280x853
      width: Math.min(1280, 0.8 * (ratio.screen < ratio.photo ? photoCvs.width : photoCvs.height * ratio.photo)),
      height: Math.min(853, 0.8 * (ratio.screen < ratio.photo ? photoCvs.width / ratio.photo : photoCvs.height))
    };
    var sideRect = { //Assumes thumbnails to be size 240x160
      width: Math.min(240, 1/6 * (ratio.screen < ratio.photo ? photoCvs.width : photoCvs.height * ratio.photo)),
      height: Math.min(160, 1/6 * (ratio.screen < ratio.photo ? photoCvs.width / ratio.photo : photoCvs.height))
    };
    //Define some initial positioning for elements
    fullRect.left = (photoCvs.width - fullRect.width) / 2;
    fullRect.top  = (photoCvs.height - fullRect.height) / 2;
    sideRect.left = ratio.screen < ratio.photo ? (photoCvs.width - sideRect.width) / 2 : -sideRect.width / 2;
    sideRect.top  =  ratio.screen < ratio.photo ? -sideRect.height / 2 : (photoCvs.height - sideRect.height) / 2;
    
    //The bloated code below indicates the animations as explicitly as possible
    switch(display.transDir){
      case 'in':
        photoCxt.fillStyle = 'rgba(255, 255, 255, ' + (0.5 - cent / 2) + ')';
        photoCxt.fillRect(0, 0, photoCvs.width, photoCvs.height);

        photoCxt.drawImage(
          display.loadFlag ? display.largeImg : display.thumbImg,
          cent * display.initRect.left   + (1 - cent) * fullRect.left,
          cent * display.initRect.top    + (1 - cent) * fullRect.top,
          cent * display.initRect.width  + (1 - cent) * fullRect.width,
          cent * display.initRect.height + (1 - cent) * fullRect.height
        );
        photoCxt.drawImage(
          display.sideImgs.prev,
          ratio.screen < ratio.photo ? sideRect.left : (-0.5 - cent / 2) * sideRect.width,
          ratio.screen < ratio.photo ? (-0.5 - cent / 2) * sideRect.height : sideRect.top,
          sideRect.width,
          sideRect.height
        );
        photoCxt.drawImage(
          display.sideImgs.next,
          ratio.screen < ratio.photo ? sideRect.left : (cent / 2 - 0.5) * sideRect.width + photoCvs.width,
          ratio.screen < ratio.photo ? (cent / 2 - 0.5) * sideRect.height + photoCvs.height : sideRect.top,
          sideRect.width,
          sideRect.height
        );
        break;
      case 'left':
        photoCxt.fillStyle = 'rgba(255, 255, 255, 0.5)';
        photoCxt.fillRect(0, 0, photoCvs.width, photoCvs.height);

        photoCxt.drawImage(
          display.loadFlag ? display.largeImg : display.thumbImg,
          cent * sideRect.left   + (1 - cent) * fullRect.left,
          cent * sideRect.top    + (1 - cent) * fullRect.top,
          cent * sideRect.width  + (1 - cent) * fullRect.width,
          cent * sideRect.height + (1 - cent) * fullRect.height
        );
        photoCxt.drawImage(
          display.sideImgs.prev,
          ratio.screen < ratio.photo ? 0.5 * (photoCvs.width - sideRect.width) : (-0.5 - cent / 2) * sideRect.width,
          ratio.screen < ratio.photo ? (-0.5 - cent / 2) * sideRect.height : 0.5 * (photoCvs.height - sideRect.height),
          sideRect.width,
          sideRect.height
        );
        photoCxt.drawImage(
          display.sideImgs.next,
          (1 - cent) * (sideRect.left + (ratio.screen < ratio.photo ? 0 : photoCvs.width))  + cent * fullRect.left,
          (1 - cent) * (sideRect.top  + (ratio.screen < ratio.photo ? photoCvs.height : 0)) + cent * fullRect.top,
          (1 - cent) * sideRect.width  + cent * fullRect.width,
          (1 - cent) * sideRect.height + cent * fullRect.height
        );
        break;
      case 'right':
        photoCxt.fillStyle = 'rgba(255, 255, 255, 0.5)';
        photoCxt.fillRect(0, 0, photoCvs.width, photoCvs.height);

        photoCxt.drawImage(
          display.loadFlag ? display.largeImg : display.thumbImg,
          cent * (sideRect.left + (ratio.screen < ratio.photo ? 0 : photoCvs.width))  + (1 - cent) * fullRect.left,
          cent * (sideRect.top  + (ratio.screen < ratio.photo ? photoCvs.height : 0)) + (1 - cent) * fullRect.top,
          cent * sideRect.width  + (1 - cent) * fullRect.width,
          cent * sideRect.height + (1 - cent) * fullRect.height
        );
        photoCxt.drawImage(
          display.sideImgs.prev,
          (1 - cent) * sideRect.left   + cent * fullRect.left,
          (1 - cent) * sideRect.top    + cent * fullRect.top,
          (1 - cent) * sideRect.width  + cent * fullRect.width,
          (1 - cent) * sideRect.height + cent * fullRect.height
        );
        photoCxt.drawImage(
          display.sideImgs.next,
          ratio.screen < ratio.photo ? sideRect.left : (cent / 2 - 0.5) * sideRect.width + photoCvs.width,
          ratio.screen < ratio.photo ? (cent / 2 - 0.5) * sideRect.height + photoCvs.height : sideRect.top,
          sideRect.width,
          sideRect.height
        );
        break;
      case 'out':
        photoCxt.fillStyle = 'rgba(255, 255, 255, ' + (cent / 2) + ')';
        photoCxt.fillRect(0, 0, photoCvs.width, photoCvs.height);
        display.initRect = display.thumbImg.getBoundingClientRect();

        photoCxt.drawImage(
          display.loadFlag ? display.largeImg : display.thumbImg,
          (1 - cent) * display.initRect.left   + cent * fullRect.left,
          (1 - cent) * display.initRect.top    + cent * fullRect.top,
          (1 - cent) * display.initRect.width  + cent * fullRect.width,
          (1 - cent) * display.initRect.height + cent * fullRect.height
        );
        photoCxt.drawImage(
          display.sideImgs.prev,
          ratio.screen < ratio.photo ? sideRect.left : (-1 + cent / 2) * sideRect.width,
          ratio.screen < ratio.photo ? (-1 + cent / 2) * sideRect.height : sideRect.top,
          sideRect.width,
          sideRect.height
        );
        photoCxt.drawImage(
          display.sideImgs.next,
          ratio.screen < ratio.photo ? sideRect.left : (-cent / 2) * sideRect.width + photoCvs.width,
          ratio.screen < ratio.photo ? (-cent / 2) * sideRect.height + photoCvs.height : sideRect.top,
          sideRect.width,
          sideRect.height
        );
        //Hide display canvas at the end of transition
        if(!value) photoCvs.style.display = '';
    };
    //Finally, update tween
    display.tweenVal = value;
  };
  requestAnimationFrame(mainAnimation);
};

mainAnimation();

}(); //End of closed scope