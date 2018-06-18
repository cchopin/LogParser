const fs = require('fs');
const source="log.log";
const targetInfo="info-20180618.log";
const targetError="error-20180618.log";
const filePtr = {};
const fileBuffer = {};
const buffer = new Buffer(4096);

fopen = function(path, mode) {
    var handle = fs.openSync(path, mode)
    filePtr[handle] = 0
    fileBuffer[handle]= []
    return handle
  }
  
  

fclose = function(handle) {
    fs.closeSync(handle)
    if (handle in filePtr) {
      delete filePtr[handle]
      delete fileBuffer[handle]
    } 
    return
  }

fgets = function(handle) { 
    if(fileBuffer[handle].length == 0)
    {
      var pos = filePtr[handle]
      var br = fs.readSync(handle, buffer, 0, 4096, pos)
      if(br < 4096) {
        delete filePtr[handle]
        if(br == 0)  return false
      }
      var lst = buffer.slice(0, br).toString().split("\n")
      var minus = 0
      if(lst.length > 1) {
        var x = lst.pop()
        minus = x.length
      } 
      fileBuffer[handle] = lst 
      filePtr[handle] = pos + br - minus
    }
    return fileBuffer[handle].shift()
  }
  
eof = function(handle) {
    return (handle in filePtr) == false && (fileBuffer[handle].length == 0) 
  }


var r = fopen(source,"r")
if(r===false)
{
   console.log("Error, can't open ", source)
   process.exit(1)
} 

let wInfo = fs.openSync(targetInfo,"w");
let wError = fs.openSync(targetError,"w");
let count=0;
let lineInfo;
let lineError;

do
{
    let line = fgets(r);
    
    if(line.toString().indexOf("INFO")>=0)
    {
        let taille1 = line.toString().indexOf("contrat");
        lineInfo = line.toString().substring(taille1+8);
        let taille = lineInfo.toString().indexOf("/")
        lineInfo = lineInfo.toString().substring(taille,0);
        
        if(lineInfo != '')
        {
            console.log(lineInfo);
            fs.writeSync(wInfo, lineInfo + "\r\n", null, 'utf8')
        }
    }
    else if (line.toString().indexOf("ERROR")>=0)
    {
       
        let taille1 = line.toString().indexOf("contrat");
        lineError = line.toString().substring(taille1+8);
        let taille = lineError.toString().indexOf("/")
        lineError = lineError.toString().substring(taille,0);
        console.log(lineError);
        fs.writeSync(wError, lineError + " : ", null, 'utf8')
    }
    else if (line.toString().indexOf("Cause :")>=0)
    {
        lineError = line;
        console.log(line);
        fs.writeSync(wError, line + "\r\n", null, 'utf8')
    }
   
    

    count+=1
}
while (!eof(r));
fclose(r);
fs.closeSync(wInfo);
fs.closeSync(wError);


console.log(count, " lines read.");
