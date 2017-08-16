/*
 Animated tooltips in the homepage navigation section

 Authors: Grzegorz Swiderski, Andreas Nordby, Mathias Maagerø Svendsen
 Written: November 2015
 Version: 1.0
*/
+function(){ //Closed scope

var navData = { //Data about #navsect elements
  anchrRef: [],
  imageRef: [],
  titleRef: [],
  paragRef: [],
  hoverVal: [], //Boolean mouseover flags
  tweenVal: []  //Animation values
};

function mainAnimation(){
  for(var i = 0; i < navData.anchrRef.length; i++){
    var limit = navData.hoverVal[i] ? 100 : 0;
    var value = navData.tweenVal[i];
    var delta = (limit - value) / 4;
    //Round to integer to keep the loop finite
    value = delta < 0 ? Math.floor(value + delta) : Math.ceil(value + delta);

    //Arbitrary DOM appearance changes
    navData.imageRef[i].style.opacity = 1 - value * 0.005;
    navData.imageRef[i].style.filter = 'alpha(opacity=' + (100 - value / 2) + ')'; //opacity for IE<9
    navData.paragRef[i].style.bottom = navData.paragRef[i].clientHeight * (value / 100 - 1) + 'px';
    navData.titleRef[i].style.bottom = navData.paragRef[i].clientHeight * value / 100 + 'px';
    try{ //Script halts on some browsers if RGBA values aren't supported
      navData.titleRef[i].style.background = 'rgba(0, 0, 0, ' + ((100 - value) * 0.005) + ')';
    } catch(e) {};

    navData.tweenVal[i] = value;
  };
  requestAnimationFrame(mainAnimation);
};

function eventHandler(e){
  //Backwards compatibility
  e = e || window.event;

  //Simple loop rather than [].indexOf
  for(var i = 0; i < navData.anchrRef.length; i++)
    if(navData.anchrRef[i] == this){
      navData.hoverVal[i] = e.type == 'mouseover'; //true if cursor enters element, false if leaves
      return;
    };
};

var navAnchors = document.getElementById('navsect').getElementsByTagName('a');
for(var i = 0; i < navAnchors.length; i++){
  //Fetch elements
  var a = navAnchors[i],
      p = navAnchors[i].getElementsByTagName('p')[0],
     h1 = navAnchors[i].getElementsByTagName('h1')[0],
    img = navAnchors[i].getElementsByTagName('img')[0];

  //Append usable data
  navData.anchrRef[i] = a;
  navData.titleRef[i] = h1;
  navData.paragRef[i] = p;
  navData.imageRef[i] = img;
  navData.tweenVal[i] = 0;
  navData.hoverVal[i] = false;

  a.onmouseover = a.onmouseout = eventHandler;
};

mainAnimation();

}(); //End of closed scope