var I = {};

var menu='home';

var x = -100;
  var y = -100;
  var time = 0;
  var radius = 0;
  var alpha = 1;

  function draw_circle(){
        var c=document.getElementById("special"); 
        var ctx= c.getContext("2d");
      ctx.clearRect(0,0,800,600);
        ctx.beginPath();
        ctx.arc(x, y, radius,0, 2*Math.PI);
        ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(200,0,0,'+alpha+')';
        ctx.stroke();
    
    if(radius <= 15) {
      radius+=1;
      alpha-=.07;
    } 
  }

window.onload = function() {

  // set up
  Q.setup();


  I.interval = null;
  I.clicks = [];
  I.stored = [];


  $("#special").on('click', function(e){ 
    
    // get time
    var delta = Date.now() - Q.time_start;

    if (!I.interval) {
      I.interval = setInterval(draw_circle,30);
    }



    x = e.pageX - this.offsetLeft;
    y = e.pageY - this.offsetTop; 
    time = e.timeStamp;
    radius=0;
    alpha=1;
    draw_circle();

    var old_menu = menu;

    if(Q.current_sequence=='Ribbon')  {
      menu = Q.validate_menu(x,y,menu);
      $('canvas').css({'background':"url(gfx/ribbon_"+menu+".png)"});
    } else {
      menu = 'commandmap';
    }

    //$('#status2').html('position = ' + x +', '+ y + " @ " + time); 
    if (Q.validate(x,y,menu)) {

      // correct
      $('#overlay').show();

      // store the click
      var click = new Click();
      click.user_id = Q.user.id;
      click.x = x;
      click.y = y;
      click.icon = Q.current;
      click.correct = 1;
      click.click_time = delta;
      click.click_currmenu = menu;

      I.clicks.push(click);


      // send ajax to store all clicks in database
      for(var c=0; c<I.clicks.length; c++) {
        DB.store(I.clicks[c], function() {

          //console.log('stored click');

          I.stored.push(true);

          if (I.stored.length == I.clicks.length) {

            //console.log('all stored');
            

            $('#next').show();

          }

        });
      }

    } else {


      // wrong, play sound
      if (menu == old_menu) {
        var foo=new Sound("beep.mp3",100,false);
        foo.start();
        console.log('play sound');
      }



      // store click
      var click = new Click();
      click.user_id = Q.user.id;
      click.x = x;
      click.y = y;
      click.correct = 0;
      click.icon = Q.current;
      click.click_time = delta;
      click.click_currmenu = menu;

      I.clicks.push(click);
    }

  }); 
}