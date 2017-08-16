/*
 Global functionality
 
 Authors: Grzegorz Swiderski
 Written: November 2015
 Version: 1.01
 
 Includes the following distinct applications:
 - Media width handler, in case the browser doesn't support CSS3 queries
 - Animated splash screen, shown during page loads
 - Animated menu dropdowns
*/

//Polyfill for all animations
requestAnimationFrame = window.requestAnimationFrame
 || window.webkitRequestAnimationFrame
 || window.mozRequestAnimationFrame
 || window.msRequestAnimationFrame
 || function(callback){ setTimeout(callback, 1000 / 60) };

+function(){ //Closed scope

/*------------------------------------------------------------|
| Media width handler ---------------------------------------*/

var dochead = document.head || document.getElementsByTagName('head')[0];
var sheets  = dochead.getElementsByTagName('link'),
    queries = []; //Contains stylesheets and query data for dynamic insertion

//Simple handler which responds only to min-width and max-width queries
function mediaWidthHandler(){
  var width = window.innerWidth || document.body.clientWidth;
  for(var i = 0; i < queries.length; i++)
    switch(queries[i].media){
      case 'min-width':
        if(width >= queries[i].value)
          dochead.appendChild(queries[i].sheet);
        else
          try{ //in case this stylesheet is not part of dochead
            dochead.removeChild(queries[i].sheet);
          } catch(e){}
        break;
      case 'max-width':
        if(width <= queries[i].value)
          dochead.appendChild(queries[i].sheet);
        else
          try{ //in case this stylesheet is not part of dochead
            dochead.removeChild(queries[i].sheet);
          } catch(e){}
    };
};

//Iterate through stylesheets and append data
for(var i = 0; i < sheets.length; i++){
  var media = sheets[i].getAttribute('media');
  if(media){
    queries.push({
      sheet: sheets[i],
      //Values hardwired to min-width and max-width only
      media: media.slice(1, 10),
      value: parseInt(media.slice(11))
    });
    sheets[i].removeAttribute('media'); //Turn into a normal stylesheet
    dochead.removeChild(sheets[i--]);
  };
};

//Fires once and on every resize
(onresize = mediaWidthHandler)();

/*------------------------------------------------------------|
| Splash screen & menu dropdowns ----------------------------*/

var splash = document.createElement('canvas');
var context, splashImg, loadTween, loadState, unloadFlag;

//Run only if canvas is supported
if(splash.getContext && (context = splash.getContext('2d')) ){
  splashImg = new Image;
  splashImg.src = 'images/global/logo-splash.png';

  loadTween = 200;
  loadState = false;
}
else{ //Define alternative static splash screen
  splash = document.createElement('div');
  splash.style.background = "#f6f6f6 url('images/global/logo-splash.png') no-repeat center";
};
document.body.appendChild(splash).id = 'splash';

onbeforeunload = function(){
  loadTween = 5;
  unloadFlag = true;
  splash.style.display = ''; //Show splash screen again
};

//Contains data about each dropdown menu node
var navbarData = [];
function navbarDropdown(e){
  //Backwards compatibility
  e = e || window.event;

  for(var i = 0; i < navbarData.length; i++){
    //Respond to both mouseover and click events, in case of no mouse
    if(navbarData[i].navElement == this || navbarData[i].navElement.parentNode == this)
      navbarData[i].hoverFlag = e.type == 'mouseover' || e.type == 'click';
    
    //If clicked, hide other opened menus
    else if(e.type == 'click')
      navbarData[i].hoverFlag = false;
  };
};

function globalAnimation(){
  //Menu dropdowns
  for(var i = 0; i < navbarData.length; i++){
    var limit = navbarData[i].hoverFlag ? 100 : 0;
    var value = navbarData[i].menuTween;
    var delta = (limit - value) / 4;
    //Round to integer to keep the loop finite
    value = delta < 0 ? Math.floor(value + delta) : Math.ceil(value + delta);

    //Dynamic DOM changes
    navbarData[i].navElement.style.display = value ? 'block' : 'none'; //Menu hides when tween value is 0
    navbarData[i].navElement.style.height = ''; //Reactivate default height briefly to fetch clientHeight
    navbarData[i].navElement.style.height = navbarData[i].navElement.clientHeight * value / 100 + 'px';

    navbarData[i].menuTween = value;
  };

  //Splash screen; run only if canvas is supported and animation is not finished
  if(context && loadTween){
    splash.width = window.innerWidth;   //Assumes that these properties are supported
    splash.height = window.innerHeight; //if canvas is supported as well

    /* Splash screen's opacity depends on loading time
    |  Page slowly becomes halfway visible after 1 second of loading */
    context.globalAlpha = Math.min(1, loadTween / 100);
    context.fillStyle = '#f6f6f6'; //Background color, same as body
    context.fillRect(0, 0, splash.width, splash.height);

    context.drawImage( //Draw NJJ logo, assumes its size is 160x160 px
      splashImg,
      splash.width  / 2 - 80 | 0,
      splash.height / 2 - 80 | 0
    );

    //Draw spinning circles which indicate loading
    context.fillStyle = '#000';
    for(var i = 0; i < 8; i++){
      var time = Date.now();
      context.beginPath();
      context.arc( //Circles positioned in the middle below the logo
        splash.width / 2 + 20 * Math.cos( i*Math.PI/4 + time/1000 ),
        splash.height / 2 + 20 * Math.sin( i*Math.PI/4 + time/1000 ) + 128,
        Math.cos( i*Math.PI/4 + time/200 ) + 2, //Variable radius
        0, 2*Math.PI //Full circle
      );
      context.fill();
    };
    if(loadState) //Snap to a lower tween value if page is loaded quickly
      loadTween = Math.min(120, loadTween);

    if(unloadFlag)    loadTween += 10; //Splash screen quickly reappears when navigating away
    else if(loadState) loadTween -= 5; //Splash screen fades out faster when page is loaded
    else if(loadTween > 50) //Until page is loaded, opacity changes slowly to 50%
      loadTween--;

    if(loadTween <= 0){
      loadTween = 0; //Hide splash when fading out is finished
      splash.style.display = 'none';
    };
  };
  requestAnimationFrame(globalAnimation);
};

globalAnimation();

onload = function(){
  //Append navbar data and activate menu dropdown animations
  var navElements = document.getElementById('navbar').getElementsByTagName('span');
  for(var i = 0; i < navElements.length; i++)
    if(navElements[i].className == 'drop'){ //Use dropdown containers only
      navbarData.push({
        navElement: navElements[i],
        hoverFlag: false,
        menuTween: 0
      });

      //Append events to dropdown containers as well as their parent nodes
      navElements[i].onmouseover = navElements[i].parentNode.onmouseover = navElements[i].parentNode.onclick =
      navElements[i].onmouseout = navElements[i].parentNode.onmouseout = navbarDropdown;
    };

  //If canvas is not supported, static splash disappears
  if(!context) splash.style.display = 'none';

  loadState = true;
};

}(); //End of closed scope