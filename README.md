# sashajs
sasha it's general purpose javascript library which consist of many features that are reusable by the user.
one of the great feature is simple but yet powerfull realtime data driven from the server.
sasha can manipulate the dom.

# How to use this library
Simply call the # sasha

sasha.response({
            meth:'' // http methods POST/GET,
            url:"" // path to the server url,
            query:"" // query strings,
            success:function(){
                if(sasha.state(this)){
                    var result = JSON.parse(this.response);
                    // how to use your result
                    }
            }
});
