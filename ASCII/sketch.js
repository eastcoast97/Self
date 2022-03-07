// const px ='#$0%*+=![]|i-_:;",..                      ';
const px ='█▒▒▒▒▒▒░░░░░░░:*&^.                             ';
let video;
let div1;
function setup() {
  noCanvas();
  video = createCapture(VIDEO);
  video.size(68,48);
  div1= createDiv();
}

function draw() {
video.loadPixels();
let row =' ';
for(let j=0; j<video.height;j++)
{
  for(let i=0; i<video.width; i++)
  {
    const pixelIndex= (i+j*video.width)*4;
    const r = video.pixels[pixelIndex+0];
    const g = video.pixels[pixelIndex+1];
    const b = video.pixels[pixelIndex+2];
    const avg =(r+b+g)/3;
    const len = px.length;
    const charIndex = floor(map(avg,0,255,0,len));
    const c =  px.charAt(charIndex);
    if(c==' ')row+= '&nbsp';
    else row+=c;
  }
  row+='<br/>&nbsp'
}
div1.html(row);
}
