/* pie chart code was adapted from an adaptation of http://blakek.us/css3-pie-graph-timer-with-jquery/ that can be found here http://www.awwwards.com/*/
var timer;
var timerFinish;
var timerSeconds;
var colors = ['#ff0000', '#ff4a4a', '#fb6a6a','#fb8b8b','#ff9f9f','#fcbfbf']
var dist = 10

function drawTimer(id, percent){

    $('#note_'+id).html('<div class="percent"></div><div id="slice"'+(percent > 5?' class="gt50"':'')+'><div class="pie"></div>'+(percent > 5?'<div class="pie fill"></div>':'')+'</div>');

    var deg = 360/10*percent;

    $('#note_'+id+' #slice .pie').css({
        '-moz-transform':'rotate('+deg+'deg)',
        '-webkit-transform':'rotate('+deg+'deg)',
        '-o-transform':'rotate('+deg+'deg)',
        'transform':'rotate('+deg+'deg)',
        'border-color': colors[id]
    });
    

}

function stopNote(id, note){

    var seconds = (timerFinish-(new Date().getTime()))/1000;
    var percent = 10-((seconds/timerSeconds)*10);
    dist+= .02 //for easing 
    percent = Math.floor(percent*100)/dist; //default 100
    if(percent <= note){
        drawTimer(id, percent);
    }

}


timerSeconds = 3;
timerFinish = new Date().getTime()+(timerSeconds*1000);

$('.pie-piece').each(function(id) {
    note = $('#note_'+id).attr('dir');
    timer = setInterval('stopNote('+id+', '+note+')',0);
});

