var latex = null
var codeList = []
var charIndex = 0
var strPath = null
var strokeWidth = 2
var strokeColor = '#000'
var curvingThreshold = 100

function svgCoords (point) {
    var x = point[0]
    var y = point[1]
    return [x * svg.getBoundingClientRect().height/10 , (10 - y) * svg.getBoundingClientRect().height/10]
}

function command() {
    console.log("transfer")
    textfield = document.getElementById('latex')
  
    d3svg = d3.select('#svg')
    svg = document.getElementById('svg')
    rect = svg.getBoundingClientRect()
    latex = textfield.value
    

    initialSvg()
    codeList = latex.split("\n")
    console.log(codeList)
    
    for (var i = 0; i < codeList.length; i++) {
        if(codeList[i].length){
           // console.log("detect")
            detect(codeList[i].trim())
        }
    }
}


function detect(code) {
    //console.log("draw")
    var command = code.split(" ",1)
    switch(command[0]){
        
        case "\\draw" : draw(code)
        //case "\\node" : node(code)

    }
}

function draw(code) {
    charIndex = 7
    console.log("startdraw")
    //var points = []
    //var angles = []
    console.log(code)



    svgpath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    svgpath.setAttribute('fill', 'none')

    console.log("Getcolor" + getOption(code))
    svgpath.setAttribute('stroke', strokeColor)
    svgpath.setAttribute('stroke-width', strokeWidth)


    var firstPoint = true
    var straight, rectangle, circle = false
    var angle = []
    var point = []
    var pointList = []
    var lastPoint = []
    var i = 0

    while(i<code.length){   
        var char = code.charAt(i)
        if(char=="("){//point
            console.log(code.substring(i))
            lastPoint = point
                point = getPointCoord(code.substring(i))[0]
                console.log(point)
                i = i + getPointCoord(code.substring(i))[1] + 1
                point = svgCoords(point)
            if(firstPoint){
                strPath = 'M' + point[0] + ' ' + point[1]
                firstPoint = false
            } else if (angle.length){
                var dist = distance(point, lastPoint)
                curvingThreshold = dist/Math.sqrt(7)
                var outX = lastPoint[0] + Math.cos(Math.PI / 180 * angle[0]) * curvingThreshold
                var outY = lastPoint[1] - Math.sin(Math.PI / 180 * angle[0]) * curvingThreshold
                //delta Y is minus because the svg coordinates are upside down compared with tikz
                var inX = point[0] + Math.cos(Math.PI / 180 * angle[1]) * curvingThreshold
                var inY = point[1] - Math.sin(Math.PI / 180 * angle[1]) * curvingThreshold
                strPath += ' C' + outX + ' ' + outY + ' ' + inX + ' ' + inY + ' ' + point[0] + ' ' + point[1]
                angle = []
            } else if (straight){
                strPath += 'L' + point[0] + ' ' + point[1]
                straight = false
            } else if (rectangle){
                strPath += 'L' + point[0] + ' ' + lastPoint[1]
                strPath += 'L' + point[0] + ' ' + point[1]
                strPath += 'L' + lastPoint[0] + ' ' + point[1]
                strPath += 'L' + lastPoint[0] + ' ' + lastPoint[1]
            } else if (circle){
                strPath = null
                svgpath = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
                svgpath.setAttribute('fill', 'none')
                svgpath.setAttribute('stroke', strokeColor)
                svgpath.setAttribute('stroke-width', strokeWidth)
                svgpath.setAttribute('cx',lastPoint[0])
                svgpath.setAttribute('cy',lastPoint[1])
                svgpath.setAttribute('r',point[0])
            }
            
        }else if(code.substring(i,i+2)=="--"){
            console.log("straight")
            straight = true
            i = i+2
        }else if(char=="t" && code.substring(i,i+3)=="to["){
            angle = getAngle(code.substring(i+2))[0]
            i = i + getAngle(code.substring(i+2))[1] + 1
        }else if(char=="r" && code.substring(i,i+9)=="rectangle"){
            rectangle = true
            i = i + 9
        }else if(char=="c" && code.substring(i,i+6)=="circle"){
            circle = true
            i = i + 6
        }else{
            i++
        }
    }
    
    if (strPath){
        svgpath.setAttribute('stroke', strokeColor)
        svgpath.setAttribute('d', strPath)
        
    }
    svg.appendChild(svgpath)
    svgpath = null

}

function getOption(code){
    var i = 7 
    console.log("char at")
    while(code.charAt(i)==" "){
        i++
    }
    if(code.charAt(i)=="["){
        i++
        var start = i
        while(code.charAt!="]" && i<code.length){
            i++
        }

        return code.substring(start,i+1).trim()
    }
    return null
}

function node(){

}

function getPointCoord(code){
    var numList = []
    var i = 0
    
    while(code.charAt(i)!==")"){
        i++
        var start = i
        while(code.charAt(i)!=="," && code.charAt(i)!==")"){
            i++
        }
        var end = i
        var num1 = parseFloat(code.substring(start,end).trim())
        numList.push(num1)


    }
    return [numList,i]

}


function getAngle(code){
    var i = 1
    while(code.charAt(i)!=="="){
        i++
    }
    var start = i+1
    while(code.charAt(i)!==","){
        i++
    }
    var end = i
    var num1 = parseFloat(code.substring(start,end).trim())

    while(code.charAt(i)!=="="){
        i++
    }
    start = i+1
    while(code.charAt(i)!=="]"){
        i++
    }
    end = i

    var num2 = parseFloat(code.substring(start,end).trim())
    return [[num1,num2],i]

}

function distance (a, b) {
    var x = b[0] - a[0]
    var y = b[1] - a[1]
    return Math.sqrt(x * x + y * y)
  }



function initialSvg(){
    d3svg.selectAll('path').remove()
    d3svg.selectAll('circle').remove()
  }