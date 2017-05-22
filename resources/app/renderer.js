const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const fs = require("fs");
const path = require("path");


//End______________________________________________________________________

//全局变量_________________________________________________________________
var newBtn  = document.getElementById("new-btn");
var projects = document.getElementById("projects");
var Files = document.getElementById("files");

var fileList = Files.childNodes;  //文件显示框的所有子元素
var selectedFilePath;  //文件显示框中被选中的文件或文件夹的路径
var selectedProjectPath;  //项目显示框被选中的项目
var selectedObject;  //文件显示框被选中的子元素
var projectChoosed; //项目显示框中当前选中的项目名称
var fileChoosed;   //文件显示框中当前选中文件或文件夹的名称；

//End______________________________________________________________________

//常用函数_____________________________________________________________________

//生成项目节点函数
function createProject(dirName){
    var li = document.createElement("li");
    li.innerHTML = '<span>'+dirName+'</span>';
    return li;
}
//生成文件节点函数
function createFile(fileName){
    var div = document.createElement("div");
    div.className = "file";
    var imgName;
    var type = fileName.substring(fileName.indexOf('.')+1);
    switch (type){
        case "css":
                imgName="css";
                break;
        case "html":
                imgName="html";
                break;
        case "pdf":
                imgName="pdf";
                break;
        case "ppt":
        case "pptx":
                imgName="powerpoint";
                break;
        case "docx":
        case "doc":
                imgName="word";
                break;
        case "jpg":
        case "png":
        case "gif":
        case "jpeg":
        case "bmp":
                imgName="image";
                break;
        case "xls":
                imgName="excel";
                break;
        case "txt":
                imgName="text";
                break;
        case ".fla":
                imgName="flash";
                break;
        case "mp3":
                imgName="music";
                break;
        case "avi":
                imgName="movie";
                break;
        case "zip":
        case "rar":
                imgName="compressed";
                break;
        case "psd":
                imgName="photoshop";
                break;
        case "fw":
                imgName="fireworks";
                break;
        case "ai":
                imgName="illustrator";
                break;
        case "pages":
                imgName="pages";
                break;
        case "key":
                imgName="keynote";
                break;
        case "dll":
                imgName="developer";
                break;
        default :
                imgName="blank";
    }
    if(fileName.indexOf('.')==-1){
        imgName = "folder";
    }
    div.innerHTML = '<img src="images/icons/'+imgName+'.png" /><p class="file-name">'+fileName+'</p>';

    return div;
}
//End___________________________________________________________________


//创建新项目__________________________________________________________

newBtn.onclick = function(){
    //向主进程发送信息，创建添加项目名字的窗口；
    ipcRenderer.send("new-project","create");
};
//与主进程通信，获取新项目的名字,并且创建目录
ipcRenderer.on("project-dom",function(event,arg){
    //var newPro = new Project(arg,path.join(__dirname,"/projects/"+arg),null);
    projects.insertBefore(createProject(arg),projects.firstChild);
    //在projects目录中创建文件夹
    fs.mkdir(path.join(__dirname,"/projects/"+arg),function(error){
        if(error)
            throw error;
    });
});

//End___________________________________________________________________


//初始化页面____________________________________________________________
function renderPage(){

    //读取本地仓库项目
    fs.readdir(path.join(__dirname,"/projects/"),function(error,files){
        if(error){
            throw error;
            console.log(error);
        }else{
            files.forEach(function(file){
                var dP = path.join(__dirname,"/projects/")+file;
                fs.stat(dP,function(error,stats){
                    if(stats.isDirectory()){
                        projects.appendChild(createProject(file));
                    }
                })
            })
        }
    });
}

//初始渲染应用
renderPage();
//End__________________________________________________________________________


//单击项目，打开文件夹_________________________________________________________

//初始点击样式
function rmClass(){
    var pros = document.querySelectorAll("#projects li");
    pros.forEach(function(pro){
        pro.id="";
    });
    Files.querySelectorAll("div.file").forEach(function(file){
        file.remove();
    });    
}

function readProject(projectName){
   fs.readdir(path.join(__dirname,"/projects/"+projectName),function(error,files){
       if(error){
           throw error;
           console.log(error);
       }else{
           files.forEach(function(file){
               var dP = path.join(__dirname,"/projects/"+projectName)+file;
               Files.appendChild(createFile(file));
                clickFile();
           })
       }
   }); 
}

projects.onclick = function(event){

    var _target = event.target;
    var proName;

    if(_target.nodeName.toUpperCase()=="SPAN"){
        rmClass();
        proName = _target.innerText;
        _target.parentNode.id="li-clicked";
        projectChoosed = document.getElementById("li-clicked").querySelector("span").innerText;
        selectedProjectPath = __dirname+"/projects/"+projectChoosed;
        fileChoosed = null;  //初始化文件筐的选中对象
        selectedFilePath = null;

        var pwd = window.localStorage.getItem(selectedProjectPath);
        if(pwd==null){
            //读取项目内容的操作
            readProject(proName);
        }else{
            ipcRenderer.send("encrypt-project-open","open");
            isOpen = true;
            ipcRenderer.once("encrypt-project",function(event,arg){
                if(arg==pwd){
                    //读取项目内容的操作
                    readProject(proName);
                }else{
                    alert("Error!密码错误");
                }
            });
        }

    }else if(_target.nodeName.toUpperCase()=="LI"){
        rmClass();
        proName = _target.querySelector("span").innerText;
        _target.id="li-clicked";
        projectChoosed = document.getElementById("li-clicked").querySelector("span").innerText;
        selectedProjectPath = __dirname+"/projects/"+projectChoosed;
        fileChoosed = null;  //初始化文件筐的选中对象
        selectedFilePath = null;

       var pwd = window.localStorage.getItem(selectedProjectPath);
               if(pwd==null){
                   //读取项目内容的操作
                   readProject(proName);
               }else{
                   ipcRenderer.send("encrypt-project-open","open");
                   isOpen = true;
                   ipcRenderer.once("encrypt-project",function(event,arg){
                       if(arg==pwd){
                           //读取项目内容的操作
                           readProject(proName);
                           isOpen = false;
                       }else{
                           alert("Error!密码错误");
                           isOpen = false;
                       }
                   });
               }

    }else{
        return false;
    }
}
//End__________________________________________________________________________

//单击或双击时的操作_____________________________________________________________

function clickFile(){
    fileList.forEach(function(File){

        //单击选中文件
        File.onclick=function(){
            fileList.forEach(function(f){
                f.className = "file"; 
            });
            File.className = "file file-clicked"; 
            fileChoosed = File.querySelector("p.file-name").innerText;
            selectedFilePath = path.join(__dirname,'/projects/'+projectChoosed+'/'+fileChoosed);
            selectedObject =Files.querySelector("div.file.file-clicked");
        };

        //双击打开文件或者文件夹
        File.ondblclick = function(){
            ipcRenderer.send("open-file",selectedFilePath);
        }
    });
}
//End__________________________________________________________________________


//删除文件或者项目_____________________________________________________________
//删除选中的文件函数
function delFile(fPath){
    if(fs.existsSync(fPath)){

        fs.unlink(fPath,function(error){
            if(error){
                throw error;
                console.log(error);
            }
            fileChoosed = null;  //初始化文件筐的选中对象
            selectedFilePath = null;
            console.log("文件"+fPath+"删除成功");
        })
    }
}
//删除文件夹的函数
function delDiretory(fPath){
    if(fs.existsSync(fPath)){
        fs.readdir(fPath,function(error,files){
            files.forEach(function(file){
                var curPath = fPath+"/"+file;
                if(fs.statSync(curPath).isDirectory()){
                    delDiretory(curPath);
                }else{
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdir(fPath);
            fileChoosed = null;  //初始化文件筐的选中对象
            selectedFilePath = null;
        });
    }else{ return false; };

}
//删除文件或项目
var delBtn = document.getElementById("delete");
delBtn.onclick = function(){
    //删除项目
    if(selectedFilePath==null&&selectedProjectPath!==null){
        var answer = confirm("是否要删除项目"+projectChoosed+"?");
        if(answer){
            delDiretory(selectedProjectPath);
            Files.querySelectorAll("div.file").forEach(function(filess){
                filess.remove();
            })
            var rmchild = projects.querySelector("li#li-clicked");
            projects.removeChild(rmchild);

            //删除本地密码
            window.localStorage.removeItem(selectedProjectPath);
        }
    }else{
        //删除文件显示区的文件夹或文件
 
        //检查是否为目录
        if(fs.statSync(selectedFilePath).isDirectory()){
            delDiretory(selectedFilePath);
        }else if(fs.statSync(selectedFilePath).isFile()){
            delFile(selectedFilePath);
            console.log(selectedFilePath);
            Files.removeChild(selectedObject);    
        }
    }    
}

//End__________________________________________________________________________



//导入文件_____________________________________________________________________

var addBtn = document.getElementById("add");
add.onclick = function(event){
    if(!projectChoosed){
        alert("请选择导入到目的项目");
        return false;
    }else{

        var oldPath = ipcRenderer.sendSync("add-file-open","open");
        if(oldPath=="equit"){
            return false;
        }
        var imDirName = path.parse(oldPath[0]).base;  //导入的文件名字;
        var newPath = path.join(__dirname,"/projects/"+projectChoosed+"/"+imDirName);

        //使用nodejs的stream类读写文件
        var is = fs.createReadStream(oldPath[0])
        var os = fs.createWriteStream(newPath);
        is.pipe(os);
        Files.insertBefore(createFile(imDirName),Files.firstChild);
        clickFile();
        fs.unlinkSync(oldPath[0]);
        
    }
}
//End____________________________________________________________________________


//移动文件_______________________________________________________________________
var moveBtn = document.getElementById("delete");
move.onclick = function(){
if(!fileChoosed){
        alert("请选择要移动的文件");
        return false;
    }else{
        ipcRenderer.send("move-project-open","move");
        ipcRenderer.on("move-project",function(event,arg){
            var from = path.join(__dirname,"/projects/"+projectChoosed+"/"+fileChoosed);
            var to = path.join(__dirname,"/projects/"+arg+"/"+fileChoosed);

            if(from==to){
                return false;
            }
            fs.rename(from,to,function(error){
                if(error){
                    console.log(error);
                    return ;
                }else if(from!==to){         
                    selectedObject.remove();
                    fileChoosed = null;  //初始化文件筐的选中对象
                    selectedFilePath = null;
                }
            });          
        });
    }
}
//End____________________________________________________________________________


//加密项目_______________________________________________________________________
var encryptBtn = document.getElementById("encrypt");
encrypt.onclick = function(event){
    if(!projectChoosed){
        alert("请选择要加密的项目");
        return false;
    }else{
        var localStorage = window.localStorage;
        if(localStorage.getItem(selectedProjectPath)){
            alert("Error!此项目已被加密");
            return false;
        }else{
            ipcRenderer.send("encrypt-project-open","open");
            ipcRenderer.once("encrypt-project",function(event,arg){
                //利用本地储存存储密码
                localStorage.setItem(selectedProjectPath,arg);
            });
        }
    }
}

//End______________________________________________________________________________

//文件搜索功能_____________________________________________________________________
var searchBtn = document.getElementById("search-btn");
var searchInput = document.getElementById("search-input");
var resultContianer = document.getElementById("result");

var whichProject;

//遍历本地仓库搜索文件的函数
function searchFile(Path){
    //var reg = new RegExp("^"+name);
    if(fs.existsSync(Path)){
        fs.readdir(Path,function(error,fis){
            fis.forEach(function(file){
                var curPath = Path+"\\"+file;
                if(fs.statSync(curPath).isDirectory()){
                    
                    if(file.match(searchInput.value)){
                        console.log(file);
                        var dom = createFile(file);
                        dom.ondblclick = function(){
                           ipcRenderer.send("open-file",curPath); 
                        }
                        resultContianer.appendChild(dom);
                    }
                    searchFile(curPath);
                }else if(fs.statSync(curPath).isFile()){
                    if(file.match(searchInput.value)){
                        console.log(file);
                        var dom = createFile(file);
                        dom.ondblclick = function(){
                           ipcRenderer.send("open-file",curPath); 
                        }
                        resultContianer.appendChild(dom);
                    }
                }
            });
        });
    }else{ 
        console.log("search error");
        return false; 
    };
}

searchBtn.onclick =function(){
    //输入值
    var val = searchInput.value;
    if (val.length==0) {
        alert("请输入文件名");
        return false;
    }else{
        resultContianer.querySelectorAll("div.file").forEach(function(node){
            node.remove();
        });
        //搜索路径
        var p = __dirname+"\\projects";
        searchFile(p);
    }
}


//利用blur focus change事件实现搜索框的动态效果
searchInput.onfocus = function(){

    resultContianer.querySelectorAll("div.file").forEach(function(node){
        node.remove();
    });

    if(this.value.length!==0){
        return false;
    }else{
        whichProject = document.getElementById("li-clicked");
        
        resultContianer.style.display="block";
        Files.style.display="none";  

        if(searchInput.value){
            this.select();
        };

        if(whichProject){
            whichProject.removeAttribute("id");   
        } 
    }
}
searchInput.onblur = function(){
    if(this.value.length==0){
        if(whichProject){
            whichProject.setAttribute("id", "li-clicked");
        }
        resultContianer.style.display="none";
        Files.style.display="block";
    }else{
        return false;
    }

}
searchInput.onchange = function(){
    if(this.value.length!==0){
        resultContianer.style.display="block";
        Files.style.display="none"; 
    }else{
        if(whichProject){
            whichProject.setAttribute("id", "li-clicked");
        }
        resultContianer.style.display="none";
        Files.style.display="block"; 
    }
}

//End______________________________________________________________________________
