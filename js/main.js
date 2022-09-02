;(function(){
    'use strict';
    
    var Event = new Vue(); //事件调度器
    var remind_sound = document.getElementById('remind-sound');//获取提醒的mp3文件

    Vue.component('task',{
        template:'#task-tpl',
        props:['todo',],   //设置需要属性
        methods:{
            action:function(name,params){
                Event.$emit(name,params); //将 操作名称，参数 推送到事件调度器
            }
        }
    })


    //封装需要常用的 内容拷贝函数
    function copy(obj){
        return Object.assign({},obj)
    };

    new Vue({
        el:"#main",
        data:{
            list:[],
            current:{},
            is_show:false,
        },

        mounted:function(){
            //渲染完成时 进行数据的初始化
            this.list = ms.get('list') || this.list;

            var that = this;
            //对 事件调度器的子组件允许调用的一些请求方法 进行注册
            Event.$on('remove',function(id){
                if(id)  
                    that.remove(id);
            });
            Event.$on('set_current',function(item){
                if(item)  
                    that.set_current(item);
            });
            Event.$on('toggle_completed',function(id){
                if(id)  
                    that.toggle_completed(id);
            });
            Event.$on('toggle_detail',function(id){
                if(id)  
                    that.toggle_detail(id);
            });

            // this.check_reminds();//检查 任务提醒功能
            setInterval(function(){
                that.check_reminds();   //每秒都检查一次 任务提醒功能
            },1000)
        },

        methods:{
            //自增id 保证添加数据字段的唯一性
            next_id:function(){
                // return this.list.length + 1;  //会出现删除后又添加 出现id重复的问题
                if(this.list.length == 0) return 1;
                else{
                    var id_lst = [];
                    for(var item of this.list){
                        id_lst.push(item.id); 
                    }
                    return Math.max.apply(null,id_lst)+1;
                }

            },
            //更新内容推到 输入框 (且暂不影响改变当前条目内容)
            set_current:function(todo){
                this.is_show = true;
                
                this.current = copy(todo);
                this.$refs.task_input.focus();//定位到输入框并聚焦
            },
            //清空输入框
            reset_current:function(){
                this.current = {};
                // this.set_current({});
            },
            //遍历查找 数组中匹配的元素
            find_index:function(id){
                return this.list.findIndex(function(item){
                    return item.id == id
                })
            },

            //添加与更新共用方法
            merge:function(){
                var is_update,id;
                is_update = id = this.current.id;
                if(is_update){
                    //遍历查找 回调函数中的内容 返回查找匹配的第一项(find方法找元素，findIndex找索引)
                    var index = this.find_index(id);

                    // this.list[index] = copy(this.current);//更新数组，但此方法Vue监测不到
                    Vue.set(this.list,index,copy(this.current)); //更改内容且vue能检测到
                }else{
                    var title = this.current.title;
                    //如果输入为空值
                    if(!title) return;
                    //对数据进行拷贝，避免引用变量，前面的值均受影响
                    var todo = copy(this.current);
                    todo.id = this.next_id();
                    todo.completed = false; //任务完成状态
                    this.list.push(todo);
                };
                this.reset_current();
            },

            //更新内容回到输入框，因此与添加共有同意方法分类判断即可
            // add:function(){
            //     var current = this.current;
            //     //如果输入为空值
                
            //     if(!current.title) return;
            //     //对数据进行拷贝，避免引用变量，前面的值均受影响
            //     var todo = Object.assign({},this.current);
            //     this.list.push(todo);
            //     console.log(this.list)
            // },
            // update:function(){},
            remove:function(id){
                //不应当使用索引来删除，假设有排序功能，索引会改变，故使用唯一ID
                var index = this.find_index(id);
                this.list.splice(index,1);
            },

            toggle_completed:function(id){
                //点击完成该任务
                var index = this.find_index(id);
                // this.list[index].completed = !this.list[index].completed;
                Vue.set(this.list[index],'completed',!this.list[index].completed);
            },

            //到点提醒
            check_reminds:function(){
                var that = this;
                this.list.forEach(function(item,index){
                    var remind_time = item.remind_time;
                    if(!remind_time || item.remind_confirmed) return;   //无提醒时间 或者 已确定提醒(不再检查提醒)
                    remind_time = new Date(remind_time).getTime();//获取提醒时间戳
                    var now_time = (new Date()).getTime();//获取当前时间戳
                    if(remind_time<=now_time){
                        remind_sound.play();//播放提醒音频
                        var confirmed = confirm(item.title);
                        Vue.set(that.list[index],'remind_confirmed',confirmed);
                    }
                });
            },

            //显示详情
            toggle_detail:function(id){
                var index = this.find_index(id);
                Vue.set(this.list[index],'show_detail',!this.list[index].show_detail)
            },

            //显示详情的编辑
            show_more:function(){
                // var more = document.getElementsByClassName('detail')[0];
                // if(more.style.display=='none')
                // more.style.display = 'unset';
                // else more.style.display='none';
                this.is_show = !this.is_show;
            }
        },

        watch:{
            //检测 list变化时 自动保存如本地缓存(避免了每次变化都要保存一次)
            list:{
                deep:true,  //无论变化深度多大
                //检测行为条件
                handler:function(new_val,old_val){
                    if(new_val){
                        ms.set('list',new_val);
                    }else{
                        ms.set('list',[]);
                    }
                }
            }
        },
    })

})();