;(function(){
    //将方法暴露出去
    window.ms = {
        set:set,
        get:get,
    };

    function set(key,val){
        //当传入的是对象时，无法转为字符串，故利用json转换
        val = JSON.stringify(val);
        localStorage.setItem(key,val);
    }
    function get(key){
        //转成JSON可读格式
        var result = localStorage.getItem(key);
        if(result){
            return JSON.parse(result);
        }
    }
})();

// ms.set('zhangsan','18');
// var z = ms.get('zhangsan');
// ms.set('lisi',{1:'a',2:'b'});
// var l = ms.get('lisi');
// console.log(z,l)