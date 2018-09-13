var canvas1;
var canvas2;
var video;
var myImg;
var capImageBtn;
var inputName;
var persons = [];
var forwardParams;
var allClass;
var iKnowYou;
var clearbutton;
var flag;
var sketch = function(p) {
  p.setup = function() {
    p.createCanvas(480, 320);

    p.background(51);
  };

  p.draw = function() {
    var w = 200;
    var h = 100;
    var x = 0;
    var y = 0;
    for (let index = 0; index < persons.length; index++) {
      const person = persons[index];
      let personName = Object.keys(person)[0];
      let personImg = person[personName];
      p.image(personImg, x, y, w, h);
      p.fill(255);
      p.textSize(40);
      p.text(personName, x + w / 2, y + h / 3);
      x = x + w;
      if (x > 300) {
        x = 0;
        y = y + h;
      }
    }
  };
};

var sketch2 = function(p) {
  var video;
  var mycanvas;
  var imgEle;
  var rectBox;
  p.setup = function() {
    mycanvas = p.createCanvas(480, 320);
    p.background(51);
    video = p.createCapture(VIDEO);
    video.size(480, 320);
    video.hide();
  };

  p.faceDectect = async function() {
    p.image(video.get(), 0, 0, 480, 320);
    // im=createImg(video.get())
    // console.log(mycanvas.canvas);
    imgEle = mycanvas.canvas;
    // console.log(imgEle)
    if (flag) {
      const forwardParams = {
        scoreThreshold: 0.5,
        inputSize: 'sm',
      };
      const descriptor1 = await faceapi.computeFaceDescriptor(imgEle);
      //  console.log(descriptor1);
      const detections = await faceapi.tinyYolov2(imgEle, forwardParams);

      if (detections === undefined || detections.length == 0) {
        iKnowYou.html("");
         return
      }

      const detectionsForSize = detections.map(det =>
        det.forSize(imgEle.width, imgEle.height),
      );
      rectBox = detectionsForSize[0].box;

      p.fill(204, 101, 192, 127);
      p.stroke(127, 63, 120);

      // A rectangle
      p.rect(rectBox.x, rectBox.y, rectBox.width, rectBox.height);

      console.log(detectionsForSize);

      var best = getBestMatch(allClass, descriptor1);
      if (best) {
        var sayHello = 'hello ' + best.personName;

        console.log(sayHello);
        iKnowYou.html(sayHello);
      }
      // await faceapi.drawDetection(imgEle, detectionsForSize, { withScore: true });
    }
  };

  p.draw = function() {
    // p.image(video, 0, 0, 480, 320);
    p.faceDectect();
  };
};

async function preload() {
  await faceapi.loadTinyYolov2Model('models');
  await faceapi.loadFaceRecognitionModel('models');
}

function setup() {
  persons = [];
  video = createCapture(VIDEO);
  video.size(480, 320);
  video.hide();
  canvas1 = new p5(sketch, 'can1');
  canvas2 = new p5(sketch2, 'can2');
  canvas.remove();
  button = createButton('setup');
  button.mousePressed(() => {
    canvas2.faceDectect();
  });
  inputName = createInput('');
  capImageBtn = createButton('capImage');
  clearbutton = createButton('clear');
  clearbutton.mousePressed(clearPic);
  capImageBtn.mousePressed(capImage);
  iKnowYou = createP('');
}

function clearPic() {
  persons = [];
  allClass = [];
  // noCanvas()
}

function capImage() {
  var myImg = video.get();
  var myname = inputName.value();
  //  console.log(myname)
  inputName.value('');
  if (!myname) {
    return;
  }
  var myObj = {};
  myObj[myname] = myImg;

  persons.push(myObj);

  init();
}

function draw() {}

async function init() {
  allClass = await initTrainDescriptorsByClass();
  flag = true;
  // console.log(allClass);
  // const descriptor1 = await faceapi.computeFaceDescriptor(myImg2.elt);
}

async function initTrainDescriptorsByClass() {
  return Promise.all(
    persons.map(async person => {
      personName = Object.keys(person)[0];
      var descript = await faceapi.computeFaceDescriptor(
        person[personName].canvas,
      );

      return { descript, personName };
    }),
  );
}

function getBestMatch(descriptorsByClass, queryDescriptor) {
  return descriptorsByClass
    .map(({ descript, personName }) => ({
      distance: faceapi.euclideanDistance(descript, queryDescriptor),
      personName,
    }))
    .reduce((best, curr) => (best.distance < curr.distance ? best : curr));
}
