const fs = require('fs');
const path = require('path');
const dirs  = './routes';
var requires = [];
var urlName = [];
var dirName = [];
var name = '';

var otherFile = function(dir,parentdir){
  for(var x= 0; x<dir.length;x++){//
    if(!dir) return 'No file found';
      
      file = parentdir+'/'+dir[x];
            
      if(file && file.indexOf('routes')==-1){
        var mbek = fs.statSync(file);
        if(mbek && mbek.isDirectory()){
            //console.log(path.dirname(file));
            otherDir(file);
        }else{
//            console.log(file);
        //    otherFile(file);
        }
      }else{
        var mbul = fs.statSync(file);
        if(!mbul){
            name ='';
        }
        if(mbul && mbul.isDirectory()){
            name = file.substr(dirs.length,file.length);
            dirName.push(name);
            otherDir(file);
        }else{
            var require = file.substr(0,file.indexOf('.js'));
            name = dirName+'/'+ path.basename(file,'.js');
            if(name.indexOf('/index')!='-1'){
	            	name = name.substr(0,name.indexOf('index'));
            }
            requires.push(require);
            urlName.push(name);
            name='';
           // otherFile(file);
        }
      }
  }
  dirName.pop();
  //name='';
}

var otherDir = function(directory){
  //console.log(!fs.statSync(directory).isDirectory());
  list = fs.readdirSync(directory);//console.log(list.length);
  if(!list){
    throw {"Error":404,"messages":"File not found..."};
  }else
    otherFile(list,directory);
}

module.exports = function(app){
	otherDir(dirs);
	for(var i = 0; i<requires.length;i++){//console.log(urlName[i]);
		var r = require(path.resolve(requires[i]));
    app.use(urlName[i],r);
	}
}