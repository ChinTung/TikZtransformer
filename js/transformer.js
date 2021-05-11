var strokeWidth = 1
var smoothingFactor = 6
var angleSnapThreshold = 2
var angleThreshold = 5.0
var grid = 0.1
var strokeColor = '#000'
var svg = null
var rect = null
var svgpath = null
var strPath = null
var buffer = []
var latex = null
var d3svg = null
var select = null
var now = null
var lastpoint = null
var colorList = []
var colorIndex = 0

function setup () {
    
  
    d3svg = d3.select('#svg')
    svg = document.getElementById('svg')
    rect = svg.getBoundingClientRect()
  
    svg.addEventListener('mousedown', pointerDown)
    svg.addEventListener('mousemove', pointerMove)
    svg.addEventListener('mouseup', pointerUp)
  }

var pointerDown = function (e) {
  latex = document.getElementById('latex')
  if (pencil) {
    
    svgpath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    svgpath.setAttribute('fill', 'none')
    svgpath.setAttribute('stroke', strokeColor)
    svgpath.setAttribute('stroke-width', strokeWidth)
    buffer = []
    var pt = getMousePosition(e)
    lastpoint = pt
    appendToBuffer(pt)
    strPath = 'M' + pt.x + ' ' + pt.y
    svgpath.setAttribute('d', strPath)
    svg.appendChild(svgpath)
  } else if (eraser) {
    erase(getMousePosition(e))
  } else if (drag) {
    select = [getMousePosition(e).x,getMousePosition(e).y]
    console.log(select)
    
  }
}

var pointerMove = function (e) {
  
  if (pencil) {
    if (svgpath) {
      var pt=getMousePosition(e)
      //var thept = [pt.x,pt.y]
      //console.log(thept+"distance"+distance(lastpoint,thept))
      //if(distance(lastpoint,thept)  > 5){
        appendToBuffer(pt)
        updateSvgPath()
        
        //strPath += ' L' + pt.x.toFixed(0)*1 + ' ' + pt.y.toFixed(0)*1
        //lastpoint = thept
        //svgpath.setAttribute('d', strPath)
        //console.log(strPath)
      //}
    }
  } else if (eraser) {
    erase(getMousePosition(e))
  } else if (drag) {
    if(select){
      now = getMousePosition(e)
      console.log(now)
    }
  }
}

var pointerUp = function () {
  if (svgpath) {
    colorList.push(strokeColor)
    console.log(strPath)
    svgpath = null
  }
  if (drag) {
    latex.value=null
    d3svg.selectAll('circle').remove
    d3svg.selectAll('path').each(function (d, i) {
      var p = svgPathToList(this.getAttribute('d'))
      var selected = false
      if (p.length > 1) {
        for(var i=0; i<p.length;i++){
          //if(p[1].length==2){
          if (distance(p[i],select)<20){
            selected = true
            console.log("selected")
            break
          }
        //}else if(p[1].length==3){
        //  if (distance(p[i][2],select)<20){
        //    selected = true
        //    console.log("selected")
        //    break
        //  }
//
        //}
        }
      }
      if(selected){
        //if(p[1].length==2){
        var deltaX = now.x - select[0] 
        var deltaY = now.y - select[1]
        console.log("X"+deltaX+"Y"+deltaY)
        strPath = 'M' + (p[0][0]+deltaX) + ' ' + (p[0][1]+deltaY)
        for(var i=1;i<p.length;i++){
          strPath += ' L' + (p[i][0]+deltaX) + ' ' + (p[i][1]+deltaY)
        }
        console.log("new"+strPath)
        this.setAttribute('d',strPath)
      //}else if(p[1].length==3){
      //  var deltaX = now.x - select[0] 
      //  var deltaY = now.y - select[1]
      //  console.log("X"+deltaX+"Y"+deltaY)
      //  strPath = 'M' + (p[0][0]+deltaX) + ' ' + (p[0][1]+deltaY)
      //  for(var i=1;i<p.length;i++){
      //    strPath += ' C' + (p[i][0][0]+deltaX) + ' ' + (p[i][0][1]+deltaY) +' ' (p[i][1][0]+deltaX) + ' ' + (p[i][1][1]+deltaY) + ' ' + (p[i][2][0]+deltaX) + ' ' + (p[i][2][1]+deltaY)
      //  }
      //  console.log("new"+strPath)
      //  this.setAttribute('d',strPath)
      //}
      }
    })
    //svg.style.cursor = "default"
  }

  updateLatex()
}

var getMousePosition = function (e) {
    return {
      x: e.pageX - rect.left,
      y: e.pageY - rect.top
    }
}

var appendToBuffer = function (pt) {
    buffer.push(pt)
    while (buffer.length > smoothingFactor) {
      buffer.shift()
    }
}

var getAveragePoint = function (offset) {
    var len = buffer.length
    if (len % 2 === 1 || len >= smoothingFactor) {
      var totalX = 0
      var totalY = 0
      var pt, i
      var count = 0
      for (i = offset; i < len; i++) {
        count++
        pt = buffer[i]
        totalX += pt.x
        totalY += pt.y
      }
      return {
        x: totalX / count,
        y: totalY / count
      }
    }
    return null
}

    function pointdist(pt){
      var thept = [pt.x,pt.y]
      var thelastpoint = [lastpoint.x,lastpoint.y]
      return(distance(thelastpoint,thept)  > 4)
    }

  var updateSvgPath = function () {
    var pt = getAveragePoint(0)
    if (pt) {

      if(pointdist(pt)){
      strPath += ' L' + pt.x.toFixed(0)*1 + ' ' + pt.y.toFixed(0)*1
      var tmpPath = ''
      for (var offset = 2; offset < buffer.length; offset += 2) {
        pt = getAveragePoint(offset)
        lastpoint = pt
        if(pointdist(pt)){
        tmpPath += ' L' + pt.x.toFixed(0)*1 + ' ' + pt.y.toFixed(0)*1
        lastpoint = pt
        }
      }
      svgpath.setAttribute('d', strPath + tmpPath)
    }
  }
    }
  

  function svgPathToList (svgPath) {
    var src = svgPath.split(/(?=[LM])/)
    var path = []
    for (var i = 0; i < src.length; i++) {
      var seg = src[i].replace(/L /g, '').replace(/M /g, '').replace(/L/g, '').replace(/M/g, '')  //.replace(/C /g, '').replace(/C/g, '')
      var point = seg.split(' ')
      //if(point.length==2){
        path.push([parseFloat(point[0]), parseFloat(point[1])])
      //}else{
      //  path.push([[parseFloat(point[0]), parseFloat(point[1])],[parseFloat(point[2]),parseFloat(point[3])],[parseFloat(point[4]),parseFloat(point[5])]])
      //}
    }
    return path
  }

  function distance (a, b) {
    var x = b[0] - a[0]   
    var y = b[1] - a[1]
    return Math.sqrt(x * x + y * y)
  }

  function BoundingBox (path) {
    var minX, maxX, minY, maxY
    for (var i = 0; i < path.length; i++) {
      minX = (path[i][0] < minX || minX == null) ? path[i][0] : minX
      maxX = (path[i][0] > maxX || maxX == null) ? path[i][0] : maxX
      minY = (path[i][1] < minY || minY == null) ? path[i][1] : minY
      maxY = (path[i][1] > maxY || maxY == null) ? path[i][1] : maxY
    }
    return [[minX, minY], [maxX, maxY]]
  }

function updateLatex() {
    var pathlist = []
    d3svg.selectAll('path').each(function (d, i) {
        var p = svgPathToList(this.getAttribute('d'))
        if (p.length > 1) pathlist.push(p)
      })
    latex.value = generateLatex(pathlist)
}

function latexWire (wire, begin, end, color){
    var simplewire = simplifyWire(wire)
    var latex = ' \\draw '
    var strokeColor = colorList[color]
    if(strokeColor=='#FF0000') latex += '[red] '
    if(strokeColor=='#0000FF') latex += '[blue] '
    latex +=  '(' + latexCoords(begin) + ')'
    for (var i = 1; i < simplewire.length - 1; i++) {
      latex += ' to[out=' + simplewire[i - 1][2] + ', in=' + simplewire[i][1] + '] ('
      latex += latexCoords(simplewire[i][0])
      latex += ')'
    }
    latex += ' to[out=' + simplewire[simplewire.length - 2][2] + ', in=' + simplewire[simplewire.length - 1][1] + '] ('
    latex += latexCoords(end)
    latex += ');\n'
    return latex
}

function generateLatex(wires){
  
    if(latex.value){
      var text = latex.value
      var ind = text.indexOf("\end{tikzpicture}")
      var text = text.substring(0,ind-1)
        var wire = wires[wires.length-1]
        var begin = wire[0]
        var end= wire[wire.length - 1]
        text += latexWire(wire, begin, end, wires.length-1)
    }else{
      var text = '\\documentclass{standalone}\n\\usepackage{freetikz}\n\\begin{document}\n\\begin{tikzpicture}\n'
      for (var i = 0; i < wires.length; i++){
        var wire = wires[i]
        var begin = wire[0]
        var end= wire[wire.length - 1]
        text += latexWire(wire, begin, end, i)
      }
    }
    text += '\\end{tikzpicture}\n\\end{document}'
    return text
}

var pencil = true
var eraser = false
var drag = false



/**
 * Setup for the toolbar element
 */
function toolbar () {
  console.log(" switched")
  pencil = document.getElementById('switch_pencil').checked
  eraser = document.getElementById('switch_eraser').checked
  drag = document.getElementById('switch_drag').checked
}

function colorSwitcher() {
  console.log("color")
  if(document.getElementById('color_black').checked) strokeColor = '#000'
  if(red = document.getElementById('color_red').checked) strokeColor = '#FF0000'
  if(blue = document.getElementById('color_blue').checked) strokeColor = '#0000FF'


}

/**
 * Event handler for the erase
 */
function erase (pt) {
  var path = document.elementFromPoint(pt.x, pt.y)
  if (path.tagName === 'path') {
    path.remove()
    updateLatex()
  }
}

// Register undo event with d3
d3.select('body').on('keydown', function () { if (d3.event.keyCode == 90) undo() })

/**
 * Handler for the undo action
 */
function undo () {
  d3.select('#svg>path:last-child').remove()
  updateLatex()
}

function latexCoords (point) {
    var x = point[0]
    var y = point[1]
    return parseFloat(x * 10 / svg.getBoundingClientRect().height).mround(grid).toFixed(2) * 1 +
      ', ' + parseFloat(10 - y * 10 / svg.getBoundingClientRect().height).mround(grid).toFixed(1) * 1
  } 
  
function svgCoords (point) {
    var x = point[0]
    var y = point[1]
    return x * svg.getBoundingClientRect().width/10 + ', ' + y * svg.getBoundingClientRect().width/10
}


  function snapAngle (angle) {
    var snapangle = parseFloat(angle).mround(angleSnapThreshold)
    if (snapangle === -180) snapangle = 180
    if (snapangle === 0) snapangle = 0 // Force to +0, not -0
    return snapangle
  }

  function simplifyWire (wire) {
    console.log(wire)
    
  
    var angledwire = [[wire[0], 999, snapAngle(Angle(wire[0], wire[1]))]]
    for (var i = 1; i < wire.length - 1; i++) {
      angledwire.push([wire[i], snapAngle(Angle(wire[i], wire[i - 1])), snapAngle(Angle(wire[i], wire[i + 1]))])
      showDot(wire[i],'blue');
    }
    angledwire.push([wire[wire.length - 1], snapAngle(Angle(wire[wire.length - 1], wire[wire.length - 2])), 999])

    var simplewire = [0]
    for (var i = 1; i < wire.length - 1; i++) {
      var inAngle = angledwire[i][1]
      var outAngle = angledwire[i][2]
      if(outAngle>inAngle){
        outAngle += 360
      }
      var result = Math.abs(angledwire[i][1] - angledwire[i][2]) - 180
      if (Math.abs(result - 0) < 4) result = 0
      simplewire.push(result)
    }
    simplewire.push(0)

    console.log("angledwire"+angledwire)
    console.log("simplewire"+simplewire)

    var sparsewire = [angledwire[0]]
     showDot(sparsewire[0][0],'red');


    var ind = 1
    while(ind < simplewire.length - 2){

      var midpoint = 0
      var position = ind
      var len = 0
      while(!isPoint(ind) && ind < simplewire.length - 2){  
        len++
        if(simplewire[ind]>0){
          if (simplewire[ind]>midpoint){
            position = ind
            midpoint = simplewire[ind]
          }
        }else if(simplewire[ind]<0){
          if (simplewire[ind]<midpoint){
            position = ind
            midpoint = simplewire[ind]
          }
        }
        ind++
      }
      if(midpoint !== 0 && (len > 1 || midpoint > 8)){
        sparsewire.push(angledwire[position])
        console.log("position"+ position)
      }
      //sparsewire.push(angledwire[ind])
      ind++
    }

    sparsewire.push(angledwire[angledwire.length - 1])
    console.log(sparsewire)

    function isPoint(i){
      
      var flag  = false
      if(simplewire[i] == 0){
        
        if(simplewire[i-1]!== 0 || simplewire[i+1]!==0){
          flag = true
        }
      }else if(simplewire[i-1]*simplewire[i]<0){
        flag = true
      }
      return flag
      
    }

    for (var i = 1; i < sparsewire.length; i++) {
     
      showDot(sparsewire[i][0],'red');
    }
    
    return sparsewire

    

  }

  
  function Angle (begin, end) {
    var dx = end[0] - begin[0]
    var dy = end[1] - begin[1]
    var angle = Math.atan2(-dy, dx)
    return angle * 180.0 / Math.PI
  }


  //get a mod round
  Number.prototype.mround = function (_mult) {
    var base = Math.abs(this)
    var mult = Math.abs(_mult)
    var mod = (base % mult)
    if (mod <= (mult / 2)) {
      base -= mod
    } else {
      base += (mult - mod)
    }
    return (this < 0) ? -base : base
  }

  /**
 * Render the dot to svg
 * @param {[Number, Number]} point
 * @param {String} color
 */
function showDot (point, color) {
  var svgns = 'http://www.w3.org/2000/svg'
  var dot = document.createElementNS(svgns, 'circle')
  dot.setAttributeNS(null, 'cx', point[0])
  dot.setAttributeNS(null, 'cy', point[1])
  dot.setAttributeNS(null, 'r', 2)
  dot.setAttributeNS(null, 'style', 'fill:' + color + ';')
  svg.appendChild(dot)
}


function copy(e) {
  let transfer = document.createElement('input');
  document.body.appendChild(transfer);
  transfer.value = latex.value;  
  transfer.focus();
  transfer.select();
  if (document.execCommand('copy')) {
      document.execCommand('copy');
  }
  transfer.blur();
  console.log('复制成功');
  document.body.removeChild(transfer);
  
}

function cleartext() {
  if(confirm("ARE YOU CONFIRMED TO CLEAR?")){
    latex.value=""
    initialSvg()
  }
}

function initialSvg(){
  d3svg.selectAll('path').remove()
  d3svg.selectAll('circle').remove()
}