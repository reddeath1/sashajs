/**********************************************************************************************
 * @Author: Frank Galos.
 * @Email-address: frankslayer1@gmail.com.
 * @date-created: 26/3/2017.
 * @copyrights: sasha.
 * @website: nevaa.com //when it's created this domain could not be created so it might be different.
 *
 **********************************************************************************************/


/**********************************************************************************************
 * ********************************************************************************************
 * **********************************           ***********************************************
 * **********************************   SASHA   ***********************************************
 * **********************************           ***********************************************
 * ********************************************************************************************
 **********************************************************************************************/

/******************************************************************************************
 * ***************************************            *************************************
 ***************************************** COPYRIGHTS *************************************
 * ***************************************            *************************************
 * ****************************************************************************************
 *
 * This library and it's methods are here by the use of this software. Therefore no one is,
 * Allowed to owen or have a piece of this software. whomever found with piece of this,
 * Software or it's core class. Strong action will be taken.
 *
 ********************************************************************************************/

/**********************************************************************************************
 * ************************                                              **********************
************************** SEVER SENT EVENT AND LONG POLLING TECHNIQUES  **********************
***************************                                              **********************
 * ********************************************************************************************
* This class is for real time data accessing that involve the sse as sever sent event and ajax.
* both techniques they are doing the same thing the only different is sse that is server persistent,
* and ajax -> Long poll is not server persistent
*
 **********************************************************************************************/


// initializing the library
var isConnected = 0,
    interval = 1000,
    connetion = null,
    sasha,url = null;

// proccessor
function sasha() {};

// DOM<element> id getter
sasha.prototype.getID = function (id)
{
    return document.getElementById(id);
}

// browser support checking
// this is to insure all browser are getting the same information at the exactly moment.
sasha.prototype.supported = function ()
{
    var type = "";

    if(typeof(EventSource) !== "undefined"){
        type = "sse";
    }else if (window.XMLHttpRequest){
        type = "xhr";
    }else if(window.ActiveXObject){
        type = "xhr";
    }
    return type;
}

// make a connection to the server
sasha.prototype.onConnect = function (url)
{

    // we're only supporting either sse or xhr
    if (this.supported() === "sse" || this.supported() === "xhr"){

        if(this.supported() === "sse"){
            var sse =  new EventSource(url);
            var error = this.onError(sse);

            // making connection to sse and return request
            if(!error){
                type = "sse";

                return {con:sse,type:type};
            }

        }else{
            // making connection to xhr and return request

            var xhr;
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else {
                // code for IE6, IE5
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }

            return {con:xhr,type:"xhr"};
        }

    }else{
        return this.onResponse("Unsupported browser","Sorry your browser is not supported by this library","OK");
    }
}

// get error information
sasha.prototype.onError = function (e)
{

    if (e.readyState === 1){
        e.onerror = function () {
            sasha.onResponse("Error","Connection failed. Please try again","OK");
        }
    }

    return false;
}

/** open the connection when it's made
 * @meth is xhr method either get/pos
 * @url is actual url
 * @data is query string data that are appended in url for sse.
 * @data for xhr are either get or post form data can be represented by forward slash(/) or & and = sign e.g action=value&data=value. the same in htaccess /value/value
 */
sasha.prototype.onOpen = function (objs)
{
    var o  = objs,
        meth = o.meth,
        urls = o.url,
        data = o.query,
        state,obj,con,type,
        dataString = data;

    if(this.supported() === "sse"){
        obj = this.onConnect(urls+"?"+dataString);
        con = obj.con;
        type = obj.type,
        connetion = con,
        url = urls;
    }else{
        if (meth === "GET" || meth === "get"){
            obj = this.onConnect(urls+"?"+dataString);
            con = obj.con;
            type = obj.type,
            connetion = con,
            url = urls;
        }else{
            obj = this.onConnect(urls+"");
            con = obj.con;
            type = obj.type,
            connetion = con,
            url = urls;
        }
    }


    state = {con:false,status:isConnected,type:null};

    if (type === "sse"){
        con.onopen = function () {return true;}

        if (con){
            isConnected = 1;
            state = {con:con,status:isConnected,type:type};
        }

    }else if(type === "xhr"){
            con.open(meth,url);
            con.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            if(con.readyState === 1){
                isConnected = 1;
                state = {con:con,status:isConnected,type:type};
            }
    }

    return state;
}

// close the connection if there is any connection exist
sasha.prototype.onClose = function ()
{
    if(connetion !== null && this.supported() === "sse"){

        if(typeof connetion.close === 'function'){
            connetion.close();
        }

        //console.log("connection to the server [ "+url+" ] closed");
        return true;
    }else if(connetion !== null && this.supported() === "xhr"){

        if(typeof  connetion.abort === 'function'){
            connetion.abort();
        }
            //console.log("connection to the server [ "+url+" ] closed");
        return true;
    }else{
        //console.log("connection to the server [ "+url+" ] failed to be closed");
        return false;
    }
}

/** get server response
 *  check if there is a conection to the server
 * @meth is xhr method either get/pos
 * @url is actual url
 * @query is query string data that are appended in url for sse,
 * And for xhr are either get or post form data can be represented by forward slash(/) or & and = sign e.g action=value&data=value. the same in htaccess /value/value.
 * @param is string parameter that represent id of an html element
 */
sasha.prototype.onMessage = function (objs)
{
    var o = objs,
        meth = o.meth,
        url = o.url,
        query = o.query,
        interval = o.interval,
        callback = o.success;

    // if there is any connection just close it so that the new connection can be established
    if(typeof this.onClose == "function"){
        (this.onClose());
    }

    // get connection components
    if(typeof this.onOpen === "function")
        var obj = this.onOpen({meth:meth,url:url,query:query}),
            con = obj.con,
            isConnected = obj.status,
            type = obj.type;


    // checking if there is connection to this channel
    if(isConnected === 1){

       if (type === "sse"){

            connetion.onmessage = callback;

       }else if(type === "xhr"){
           con.onreadystatechange = callback;

           setTimeout(function(){
               sasha.onMessage(objs);
           },interval);

            sasha.send(con,query,meth);
       }
    }else{
        console.log("Connection Failed");
    }

}

sasha.prototype.data = function(obj){
    if(typeof obj != 'undefined'){
        if(typeof obj.type != 'undefined' && typeof obj.data != 'undefined' && obj.type === 'json'){
            return JSON.parse(obj.data.data);
        }else{
            if(typeof obj.data != 'undefined'){
                return obj.data;
            }else{
                throw console.warn("Error::: data is require");
            }
        }
    }else{
        throw console.warn("Error::: object is not defined");
    }
}

// show the response to the client
sasha.prototype.onResponse = function (h,b,f)
{
    cAlert.renderAlertData(h,b,f);
}

/**
 * @param url this caries the informations about the server.
 * @param meth is either get/post
 */
sasha.prototype.connect = function (meth,url)
{
    var xhr;

    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    }else if(window.ActiveXObject){
        xhr = new ActiveXObject();
    }else {

        throw new Error ("Ajax is not supported in your browser");

    }
    xhr.open(meth,url);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

    return xhr;
}


sasha.prototype.cancel = function(arg){
    var c = arg.cancelable = true;

    if(c){
        console.log("Conection cancel");
    }else{
        console.log("Failed to cancel the connection");
    }

    return c;
}

/**
 * @param con this caries the connection informations.
 * Here i checked for connection state and status.
 */
sasha.prototype.state = function (con)
{
    if (con.readyState === 4){
        if(con.status === 200 && con.status < 300){
            return true;
        }
    }

    return false;
}

/**
 * @param url this caries the informations about the server.
 * @param query this caries information that is about to sent to the server.
 * @param meth this caries information that is about to checked. this method are either POST/GET
 */
sasha.prototype.response = function (obj)
{
    var con,
        o = obj,
        meth = o.meth,
        url = o.url,
        query = o.query,
        callback = o.success;

    if(meth === "get" || meth === "GET"){
        con = this.connect(meth,url+"/"+query);
    }else if(meth === "POST" || meth === "post"){
        con = this.connect(meth,url);
    }

    con.onreadystatechange = callback;

    sasha.send(con,query,meth);
}

sasha.prototype.ready = function (target) {
  if(target.readyState === 4){
     if(target.status === 200 && target.status < 300){
         return {boolen:true,type:'xhr'};
     }
  }else if(target.readyState === 1){
      return {boolen:true,type:'sse'};
  }

  return {boolen:false,type:null};
};

sasha.prototype.onData = function(target){
    var r = this.ready(target.target),x = '';
    if(r.boolen && r.type === 'xhr'){
        x = target.target.responseText;
    }else if(r.boolen && r.type === 'sse'){
        x = target.event.data;
    }

    if(r.boolen){
        return {response:x};
    }
};

/**
 * @param con this caries the connection informations that returned by connect method.
 * @param query this caries information that is about to sent to the server.
 * @param method this caries information that is about to checked. this method are either POST/GET
 */
sasha.prototype.send = function (con,query,method)
{
    if (method === "GET" || method === "get"){
        con.send(null);
    }else{
        con.send(query);
    }
};


/** library call
 * @type {sasha}
 * Test url: 'http://localhost/route/chat.live/'
 * Test query: 'action=getMessages&sender=frank&receiver=galos'
 * Test param: 'ms-body' this is message body,for displaying all messages
 */
sasha = new sasha();
