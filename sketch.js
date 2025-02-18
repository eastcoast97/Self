const px ='█▒▒▒▒▒▒░░░░░░░:*&^.                             ';
let video;
let asciiDiv;
let asciiContainer;
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let canvas;
let ctx;

function calculateDimensions() {
  const container = select('.screen');
  const w = container.width;
  const h = container.height;
  
  let charWidth = floor(w / 60);
  return {
    videoWidth: floor(w / charWidth),
    videoHeight: floor((h / charWidth) * 0.7),
    fontSize: charWidth
  };
}

if (/Mobi|Android|iPad|iPhone/i.test(navigator.userAgent)) {
  // Mobile-friendly download function for recorded videos
  window.downloadVideo = function(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  console.log("Mobile device detected. Mobile recording and download enabled.");
}
function setup() {
  noCanvas();
  video = createCapture(VIDEO);
  
  // Create canvas for recording
  canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');
  
  // Get reference to the ASCII container
  asciiContainer = select('.ascii-container');
  asciiDiv = createDiv();
  asciiDiv.parent(asciiContainer);
  
  // Initial sizing
  const dims = calculateDimensions();
  video.size(dims.videoWidth, dims.videoHeight);
  canvas.width = dims.videoWidth * dims.fontSize;
  canvas.height = dims.videoHeight * dims.fontSize;
  
  // Style for the ASCII content
  updateAsciiStyle(dims.fontSize);
  
  // Set up recording controls
  setupRecordingControls();
  
  // Handle window resizing
  window.addEventListener('resize', () => {
    const newDims = calculateDimensions();
    video.size(newDims.videoWidth, newDims.videoHeight);
    canvas.width = newDims.videoWidth * newDims.fontSize;
    canvas.height = newDims.videoHeight * newDims.fontSize;
    updateAsciiStyle(newDims.fontSize);
  });
}

function updateAsciiStyle(fontSize) {
  asciiDiv.style('font-size', `${fontSize}px`);
  asciiDiv.style('line-height', `${fontSize}px`);
  asciiDiv.style('letter-spacing', `${fontSize * 0.1}px`);
  asciiDiv.style('text-align', 'center');
  asciiDiv.style('color', 'var(--text-color)');
  asciiDiv.style('text-shadow', '0 0 5px var(--text-color)');
}

function setupRecordingControls() {
  const recordBtn = document.querySelector('.record-btn');
  const stopBtn = document.querySelector('.stop-btn');
  const downloadBtn = document.querySelector('.download-btn');
  const monitor = document.querySelector('.monitor');
  
  recordBtn.addEventListener('click', startRecording);
  stopBtn.addEventListener('click', stopRecording);
  downloadBtn.addEventListener('click', downloadRecording);
  
  function startRecording() {
    recordedChunks = [];
    const stream = canvas.captureStream(30);
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      monitor.classList.remove('recording');
      monitor.classList.add('has-recording');
    };
    
    mediaRecorder.start(100);
    isRecording = true;
    monitor.classList.add('recording');
  }
  
  function stopRecording() {
    mediaRecorder.stop();
    isRecording = false;
  }
  
  function downloadRecording() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    if (/Mobi|Android|iPad|iPhone/i.test(navigator.userAgent)) {
      window.downloadVideo(blob, 'ascii-recording.webm');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = 'ascii-recording.webm';
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}

function draw() {
  video.loadPixels();
  let asciiImage = '';
  
  ctx.fillStyle = 'var(--screen-color)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${canvas.width/60}px "Courier New"`;
  ctx.fillStyle = 'var(--text-color)';
  
  for(let j = 0; j < video.height; j++) {
    for(let i = 0; i < video.width; i++) {
      const pixelIndex = (i + j * video.width) * 4;
      const r = video.pixels[pixelIndex + 0];
      const g = video.pixels[pixelIndex + 1];
      const b = video.pixels[pixelIndex + 2];
      
      const brightness = (r * 0.2 + g * 0.6 + b * 0.2);
      const len = px.length;
      const charIndex = floor(map(brightness, 0, 255, len - 1, 0));
      const c = px.charAt(charIndex);
      
      const char = c === ' ' ? '\u00A0' : c;
      asciiImage += char;
      
      if(isRecording) {
        ctx.fillText(char, i * canvas.width/60, (j + 1) * canvas.width/60);
      }
    }
    asciiImage += '<br/>';
  }
  
  // Add retro effect with random glitch
  if (random() < 0.03) {
    let glitchLine = floor(random(video.height));
    let glitchText = '';
    for (let i = 0; i < video.width; i++) {
      glitchText += random() < 0.5 ? '█' : '▒';
    }
    let lines = asciiImage.split('<br/>');
    lines[glitchLine] = glitchText;
    asciiImage = lines.join('<br/>');
    
    if(isRecording) {
      ctx.fillStyle = 'var(--text-color)';
      ctx.fillText(glitchText, 0, (glitchLine + 1) * canvas.width/60);
    }
  }
  
  asciiDiv.html(asciiImage);
}

// Handle visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if(isRecording) {
      document.querySelector('.stop-btn').click();
    }
    noLoop();
  } else {
    loop();
  }
});
