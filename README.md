Nimg
====


NImg 是基于[ZImg](https://github.com/buaazp/zimg)的nodejs实现。

去掉了ZImg中 memcached的缓存功能，图片上传处理接口使用json数据格式。不兼容ZImg的文件存储。

环境要求：

- 操作系统：任何能安装 nodejs 的操作系统

- node版本：>=v0.10

- ImageMagick版本：>=6.8.7

- python版本:>=2.6



**********************



##使用##


-- 使用前确保node环境及ImageMagick已安装好

  \#下载NImg

     wget  https://github.com/ofpay/nimg/archive/master.zip -O nimg.zip

   \#解压
    
    uzip nimg.zip

   \#安装依赖模组
   
    cd nimg-master
    npm install

   \#修改配置,确保图片存储及上传目录有足够的权限

    vi config.js

```json
exports.tmproot='/node/temp'; //上传临时目录，
exports.imgroot='/node/img'; //图片存储目录，
exports.errorlog='/node/log/error.log'; //程序错误日志，记录
exports.port=9000;  //http端口号
exports.appname='NImg';
exports.maxFileSize=1024*1024;//上传最大限制单位字节 1024kb 1mb
exports.maxSide=800; //最大截图边长
exports.minSide=30; //最小截图边长

//支持图像文件类型
exports.imgtypes={
        "gif": "image/gif",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "png": "image/png"
};

```

  \#启动
 
    sh nimg.sh start

  \#查看控制台输出

    tailf nohup.out

  \#关闭

    sh nimg.sh stop



api
========================

###名词解释###
**userpath**  用户目录，NImg支持多用户系统，使用userpath来区分用户目录

**md5**   根据图片信息得到md5值

**t**    图像类型，Nimg支持的目前有4种： jpg|jpeg|png|gif

**w**   图像宽度

**h**    图像高度

**url**  图像访问路径，上传时由接口返回

  - 原图url：{userpath}/{md5}.{t}  or  {userpath}/{md5}-0-0.{t}
 
  - 等比例裁图url:  {userpath}/{md5}-{w}-{h}.{t} 

  - 强制裁图url:  {userpath}/{md5}-{w}-{h}-f.{t} 


**act**  图像处理命令   

  -  del 删除图像,不需要参数  
  
  -  tleft 左旋90度
  
  -  tright 右旋90度
  
  -  resize 缩放，注意：此操作是对当前资源做出修改，不生成新文件

  -  info 返回图片信息，高度，宽度，图片大小


**param**  命令参数  

  -  调用resize时，需要. 等比例缩放示例: 500X500  强制缩放:500X500!


**act**  目录处理命令
    -  tsize 获取目录下所有文件大小字节数



###说明###


1.图片访问地址   限制：无

	调用地址： http://nimg/{url}   


	返回： 图像文件


2.上传api  限制：内网调用

	 调用地址： http://nimg/{userpath}/upload

	 成功返回
	 
```json
    {
        "code": 200,
        "msg": "upload success!",
        "data": {
            "t": "gif",
            "userpath": "01",
            "md5": "d6da9ccfcf52211eba99722207ee3d9a",
            "url": "01/d6da9ccfcf52211eba99722207ee3d9a.gif"
        }
    }
```
   失败返回
     
     
```json
    {
      "code": 300,
      "msg": "filetype error,not supported txt"
    }
      
```

3.图像处理api  限制：内网调用

   调用地址：http://nimg/{url}/manage-{act}?a={param} 

   成功返回
     
```json
    {
      "code": 200,
      "msg": "exec ok!"
    }
```
 
    失败返回
    
```json
    {
      "code": 301,
      "msg": "exec fail"
    }
```
4.目录管理api  限制：内网调用

 调用地址：http://nimg/{userpath}/{act}


 调用示例：http://192.168.111.189:9000/854899/tsize


成功返回

```json
    {

        "code": 200,
        "msg": "success!",
        "data": {
            "userpath": "854899",
            "total": 32515395
        }

    }
```

###api错误代码对照表###

编码| 说明
--------------|------------------
200|操作成功 
300|上传错误
301|处理错误
404|资源不存在
