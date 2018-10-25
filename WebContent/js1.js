var websocket = null;
var id ="nullxxx";
var peer ="ALL";//name name1 name2
var to ="0/ALL";
var state =0;
var seq=-1;

    //判断当前浏览器是否支持WebSocket
    if ('WebSocket' in window) {
        websocket = new WebSocket("ws://localhost:8888/w/server");	
    }
    else {
        alert('当前浏览器 Not support websocket')
    }

    //连接发生错误的回调方法
    websocket.onerror = function (e) {
        console.log("ERROE "+e);
    	console.log("the state is "+websocket.readyState);
        setMessageInnerHTML("WebSocket连接发生错误");
    };

    //连接成功建立的回调方法
    websocket.onopen = function () {
        setMessageInnerHTML("WebSocket连接成功");
       
    }
    

    //接收到消息的回调方法
    websocket.onmessage = function (event) {
        var mes = event.data;
        console.log(mes);
        if(mes.startsWith("1")){ // 1 user content
            usr(event);
        }else if(mes.startsWith("0")){// 0 content
            server(event);
        }
        
    }

    
    //连接关闭的回调方法
    websocket.onclose = function (e) {
        console.log("connectd closed "+e);
    	//websocket=new WebSocket("ws://localhost:8888/web/server");
        setMessageInnerHTML("WebSocket连接关闭");
    }

    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function () {
        closeWebSocket();
    }

  
    //将消息显示在网页上
    function setMessageInnerHTML(innerHTML) {
       // document.getElementById('message').innerHTML += innerHTML + '<br/>';
    }

    //关闭WebSocket连接
    function closeWebSocket() {
        websocket.close();
    }
                                                                                                 
    //发送消息
    function send(i,n,s) {//i state ,s content
       switch(i){
           case 0://server   s 0上线 1下线 2隐身
             websocket.send("0 1 "+seq+"/"+id+" "+s);
             console.log("0 1 "+seq+"/"+id+" "+s);
           break;
           case 1://user
           tt=peer;
           tt=tt.replace(" ","");
            to = document.getElementById("user_"+tt).innerHTML;
            console.log(to);
             websocket.send("1 "+seq+"/"+id+" "+1+" "+to+" "+s);
             console.log("1 "+seq+"/"+id+" "+1+" "+to+" "+s);
           break;
       }
        
    }
 
   
function sendTo(){//chat send message 
    var con = document.getElementById("text").value;
    if(con!=""){
        document.getElementById("wanning_3").innerHTML="";
        document.getElementById("text").value="";
        //console.log("send "+con);
        send(1,1,con);
        var text ="<div class='l'>"+"<p class='km'>"+id+"</p><p class='mm' >"+con+"</p>"+"</div>";
        var tt = "p_"+peer;
       tt= tt.replace(" ","");
        console.log("tt is "+tt);
        document.getElementById(tt).innerHTML+=text;  
    }else{
        document.getElementById("wanning_3").innerHTML="内容不能为空";
    }
}

function increase(o){//o :seq/name
    nn = o.split("/")[1];
    if(document.getElementById("user_"+nn)==undefined){
        console.log(o+" is online");
        o=""+o;
        div=document.createElement("li");
        div.setAttribute("id", "user_"+nn);
        div.setAttribute("onclick", "talkTo('"+nn+"')");
        div.setAttribute("class", 'friend');
        div.innerHTML = o;
        document.getElementById("list").appendChild(div);
        div=document.createElement("div");
        div.setAttribute("id","p_"+nn);
        div.setAttribute("class","message");
        div.setAttribute("style","display:none");
        document.getElementById("chat").appendChild(div);
    }
}

function server(event){// 0 1/0/6 name(一次一个)
    var s = event.data;
    var comd = s.split(" ");
    console.log(" message "+s);
    
    if(comd[1]=="0"){// 0 0 seq (get seq)
        seq=comd[2];
    }else if(comd[1]=="1"){//0 1 seq/name 0/1  (other on/offline)
        if(comd[3]=="0"){
            console.log(comd[2].split("/")[1]);
            increase(comd[2]);
        } else if(comd[3]=="1"){
            var p="user_"+comd[2].split("/")[1];
           document.getElementById(p).parentElement.removeChild(document.getElementById(p));
            // document.getElementById("list").removeChild(document.getElementById("user_"+comd[2].split("/")[1]));
        }   
    }else if(comd[1]=="2"){//登录或注册  0 2 seq/name/state 0/1  
        if(comd[3]=="0"){
            var t =comd[2].split("/");
            document.getElementById("wanning_1").innerHTML="";
            document.getElementById("f").style.display="none";
           document.getElementById("second").style.display="inline-block";
            id = t[1];
            state = comd[4];
            type.options[type.selectedIndex].selected='false'; 
            switch(comd[4]){
                case "0":
                document.getElementById("s1").selected="selected";
                break;
                case "1":
                document.getElementById("s2").selected="selected";
                break;
                case "2":
                document.getElementById("s3").selected="selected";
                break;
            }
            seq=t[0];
            document.getElementById("information_1").innerHTML+=id;
        } else if(comd[3]=="1"){
            document.getElementById("wanning_1").innerHTML="用户名或密码错误";
            }else if(comd[3]=="2"){
                document.getElementById("wanning_2").innerHTML="用户名已被占用";
            }   
    }
}
// 接受到其他用户的消息
function usr(event){
    console.log(event);
    var mes = event.data.split(" ");
    var comd = mes[1].split("/");
    var len = parseInt(mes[2]);
    var content =mes[3+parseInt(mes[2])];
    console.log("comd length "+comd.length+" "+parseInt(mes[2]));
    
    /*for(j=0;j<parseInt(mes[2]);j++){
        if(mes[3+j].split("/")[1]!=id){
            peer+=""+mes[3+j].split("/")[1]+" ";
            to+=mes[3+j];
        }
    }*/
    
    sou = comd[1];
    if(mes[3]=="0/ALL"&&sou!=id){
      talkTo("ALL");
            document.getElementById("head").innerHTML=peer;
            var text ="<div class='l'>"+"<p class='ko'>"+sou+"</p><p class='mo' >"+content+"</p>"+"</div>"
            console.log("p_"+peer); 
            document.getElementById("p_ALL").innerHTML+=text; 
    }else if(len==1){
        if(sou!=id){
            talkTo(comd[1]);
            document.getElementById("head").innerHTML=peer;
            var text ="<div class='l'>"+"<p class='mo' >"+content+"</p>"+"</div>"
            console.log("p_"+peer);
            var tt = "p_"+peer;
           tt= tt.replace(" ","");
            console.log("tt is "+tt);
            document.getElementById(tt).innerHTML+=text;  
        } 
    }
}
// 更换聊天框
function talkTo(p){//p:name
    var n ="p_"+p; //new 
    var tt=peer;//yuanlai
    tt=tt.replace(" ","");
    to=document.getElementById("user_"+p).innerHTML.replace(" ","");
    document.getElementById("p_"+tt).style.display="none";
    document.getElementById(n).style.display="block";
    document.getElementById("head").innerHTML=p;
    peer=p;  
}

//exchang state 
function exchang_state(){
    var s =document.getElementById("type");
    var index=s.selectedIndex ;
    console.log(" xuan zhogn "+index);
    if(index==0){
       if(state!=0){
    	   state=0;
        send(0,1,0);//上线
       }
       
    } else if(index==1){
        if(state!=1){
        	state=1;
            send(0,1,1);//下线
           }
           
    } else if(index==2){
        if(state!=2){
        	state=2;
            send(0,1,2);//隐身
           }
    }
}


function ex(i){
    console.log(i);
    console.log(i==0);
    if(i=="0"){//zhuce
        console.log("come in 0");
        document.getElementById("log_in").style.display="none";
        document.getElementById("register").style.display="block";
    }else if(i=="1"){
        document.getElementById("log_in").style.display="block";
        document.getElementById("register").style.display="none";
   
    }
}

function submit(i){
    console.log(i);
    if(i==0){//login
        var name = document.getElementById("firstname1").value;
        var key = document.getElementById("lastname1").value;
        var sex = document.getElementById("log_state").selectedIndex;
        console.log("name "+name+" key "+key+" state "+sex);
        if(name==""){
            document.getElementById("wanning_1").innerHTML="用户名不能为空"
        }else if(key==""){
            document.getElementById("wanning_1").innerHTML="密码不能为空"
        }else{
            document.getElementById("wanning_1").innerHTML="";
            websocket.send("0 2 "+seq+"/"+name+"  "+key+"  "+sex);
        }
    }else if(i==1){ //register
        var name = document.getElementById("firstname").value;
        var key = document.getElementById("lastname").value;
        var sex = document.getElementById("log_state1").selectedIndex;
        console.log("name "+name+" key "+key+" state "+sex);
        if(name==""){
            document.getElementById("wanning_2").innerHTML="用户名不能为空"
        }else if(key==""){
            document.getElementById("wanning_2").innerHTML="密码不能为空"
        }else{
            document.getElementById("wanning_2").innerHTML="";
            websocket.send("0 3 "+seq+"/"+name+" "+key+" "+sex);
        }
    }
}