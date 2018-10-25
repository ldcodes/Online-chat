package web;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.servlet.annotation.WebServlet;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint("/server")
public class Server {
 
    private static int onlineCount = 0;
    private static CopyOnWriteArraySet<Server> webSocketSet = new CopyOnWriteArraySet<Server>();
    private static CopyOnWriteArraySet<Server> online = new CopyOnWriteArraySet<Server>();
    private static CopyOnWriteArraySet<Server> offline = new CopyOnWriteArraySet<Server>();
    private static CopyOnWriteArraySet<Server> stealth = new CopyOnWriteArraySet<Server>();
    private Session session;
    private static Map seqMap = new HashMap();  //seq server 
    private static Map nameMap = new HashMap();   // name key
    private static Map map = new HashMap();     //server seq/name
    private static int seq =1000;
    
    @OnOpen
    public void onOpen(Session session){
        this.session = session;
        webSocketSet.add(this);  
        seqMap.put(""+seq,this);
        try {
			this.sendMessage("0 0 "+seq);
			//System.out.println("seq is "+seq);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        seq++;
    }

    @OnClose
    public void onClose(){
        webSocketSet.remove(this);  
        if(online.contains(this))
        	online.remove(this);
        if(offline.contains(this))
        	offline.remove(this);
        if(stealth.contains(this))
        	stealth.remove(this);
        //subOnlineCount();          
        System.out.println("one closed  number online " + map.get(this));
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        System.out.println("message:" + message);
        if(message.startsWith("0")) {
        	server(message);
        }else if(message.startsWith("1")) {
        	user(message);
        }     
    }

    private void user(String message) {
		// TODO Auto-generated method stub
		String[] comd =message.split(" ");
		String  seqa = comd[1].split("/")[0];
		Server s =(Server) seqMap.get(seqa);
		//System.out.println("seq is"+seqa);
		//System.out.println(" user inforamtion dest is "+comd[3]);
		if(comd[3].equals("0/ALL")) {
			broadcast(message);
		}else {
			  String[] t1 ;
			  t1 = comd[3].split("/");
				Server d = (Server) seqMap.get(t1[0]);
				try {
					d.sendMessage(message);
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			
		}
	}

	private void broadcast(String message) {
		// TODO Auto-generated method stub
		String[] comd = message.split(" ");
		Server sou =null;
		System.out.println("cast :"+message);
		if(message.startsWith("0")) {
			 sou = (Server) seqMap.get(comd[2].split("/")[0]);
		}else if(message.startsWith("1")) {
			 sou = (Server) seqMap.get(comd[1].split("/")[0]);
		}
		
		for(Server item: online){
        try {
        	if(!sou.equals(item))
            item.sendMessage(message);
        } catch (IOException e) {
            e.printStackTrace();
            continue;
        }
       }
		for(Server item: stealth){
	        try {
	        	if(!sou.equals(item))
	            item.sendMessage(message);
	        } catch (IOException e) {
	            e.printStackTrace();
	            continue;
	        }
	       }
	}


	private void server(String message) {
		// TODO Auto-generated method stub
		String[] comd =message.split(" ");
		String[] seqa=comd[2].split("/");
		Server aim;
		String response;
	   switch(comd[1]) {
	   case "1":
		  switch(comd[3]) {
		  case "0":
		     aim =(Server) seqMap.get(seqa[0]);
		     if(!online.contains(aim))
		        online.add(aim);
		      if(offline.contains(aim))
		    	  offline.remove(aim);
		      if(stealth.contains(aim))
		    	  stealth.remove(aim);
			  broadcast(message);
		break;
		  case "1":
			  aim =(Server) seqMap.get(seqa[0]);
			  if(!offline.contains(aim))
		          offline.add(aim);
		      if(online.contains(aim))
		    	  online.remove(aim);
		      if(stealth.contains(aim))
		    	  stealth.remove(aim);
			  broadcast(message);
			  break;
		  case "2":
			  aim =(Server) seqMap.get(seqa[0]);
			  if(!stealth.contains(aim))
		         stealth.add(aim);
		      if(online.contains(aim))
		    	  online.remove(aim);
		      if(offline.contains(aim))
		    	  offline.remove(aim);
		      String n = "0 1 "+comd[2]+" 1";
			  broadcast(n);
			  break; 
		  }
		   break;
	   case "2":
		   aim = (Server) seqMap.get(seqa[0]);
		   String key = (String) nameMap.get(comd[4]);
		   System.out.println("key is "+key);
		   
		   if(key!=null&&key.equals(seqa[1])) {//successful
			   response = "0 2 "+comd[2]+" 0 "+comd[4];
			   try {
				aim.sendMessage(response);
		     } catch (IOException e) {
				
				e.printStackTrace();
			}
			   switch(comd[4]) {
			   case "0":
				   if(!online.contains(aim)) {
					   online.add(aim);
					   response ="0 1 "+comd[2]+" 0";  
				   }
				  
				   break;
			   case "1":
				   if(!offline.contains(aim)) {
					   offline.add(aim);
					   response ="0 1 "+comd[2]+" 1";
				   }
				  break;
			   case "2":
				   if(!stealth.contains(aim)) {
					   stealth.add(aim);
					   response ="0 1 "+comd[2]+" 1"; 
				   }	   
				   break; 
			   }
			   map.put(aim, comd[2]);
			   broadcast(response);
			   String seqb = null;
			   for( Server i : online) {
				   if(!aim.equals(i)) {
					   seqb = (String) map.get(i);
						  response = "0 1 "+seqb+" 0";
						  try {
							aim.sendMessage(response);
						} catch (IOException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
				   }
				 
			   }
			   
		   }else {
			   response = "0 2 "+comd[2]+" 1 "+comd[4];
			   try {
				aim.sendMessage(response);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		   }
		   break;
		   
	   case "3":
		   aim = (Server)seqMap.get(seqa[0]);
		   if(!nameMap.containsValue(seqa[1])) {
			   response = "0 2 "+comd[2]+" 0 "+comd[4];
			   try {
					aim.sendMessage(response);
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			   nameMap.put(comd[3],seqa[1]);
			   map.put(aim, comd[2]);
			   switch(comd[4]) {
			   case "0":
				   online.add(aim);
				   response ="0 1 "+comd[2]+" 0";
				   break;
			   case "1":
				   offline.add(aim);
				   response ="0 1 "+comd[2]+" 1";
				   break;
			   case "2":
				   stealth.add(aim);
				   response ="0 1 "+comd[2]+" 1";
				   break; 
			   }
			   broadcast(response);
			   String seqb = null;
			   for( Server i : online) {
				   if(!i.equals(aim)) {
					   seqb = (String) map.get(i);
						  response = "0 1 "+seqb+" 0";
						  try {
							 
							aim.sendMessage(response);
						} catch (IOException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						} 
				   }
			   }
		   }else {
			   response = "0 2 "+comd[2]+" 2 "+comd[4];
			   try {
					aim.sendMessage(response);
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
		   }
		   
		   break;
	   }
	}

	@OnError
    public void onError(Session session, Throwable error){
        System.out.println("error");
        error.printStackTrace();
    }

  
    public void sendMessage(String message) throws IOException{
        this.session.getBasicRemote().sendText(message);
        //this.session.getAsyncRemote().sendText(message);
    }

    public static synchronized int getOnlineCount() {
        return onlineCount;
    }

    public static synchronized void addOnlineCount() {
        Server.onlineCount++;
    }

    public static synchronized void subOnlineCount() {
        Server.onlineCount--;
    }
}