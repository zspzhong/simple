## simple
**simple**是一个用node.js实现的web server，主要用于个人业余学习和实践

### 目录结构
* bin：启动脚本
* conf：配置文件
* dev：开发时gulp打包出来的网站前端文件
* doc：说明文档
* lib：应用程序启动代码及公用库
* logs：日志文件
* output：应用程序输出，如爬虫下载的文件
* release：发布时gulp打包出来的网站前端文件
* src：应用程序代码

### 使用
1. 安装node.js，mongodb，mysql
2. 下载代码到本地
3. 在simple目录下执行npm install
4. 修改simple/conf/目录下的配置文件中的相关路径
5. 修改simple/bin/目录下的启动脚本中的相关路径
6. 在simple/bin/目录下启动应用，爬虫脚本：`./script_dev.sh spider/script/spider.js(脚本相对src的路径)`，webApp：`./webApp_dev.sh`