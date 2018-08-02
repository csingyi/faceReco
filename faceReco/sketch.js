var video;
var button;
var button2;
var mycanvas;
var myImg;
var myImg2;
var inputName;
var persons = [];
var forwardParams;
var allClass;
var iKnowYou;
var clearbutton;

var flag = false;
async function setup() {
  mycanvas = createCanvas(320, 240);
  background(51);
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide()
  createP("")
  button = createButton('setup');
  button.mousePressed(init);
  button2 = createButton('capImage');
  inputName = createInput('');
  clearbutton=createButton("clear")
  clearbutton.mousePressed(clearPic);
  button2.mousePressed(capImage);
  iKnowYou=createP("")

//   myImg=createImg("/public/img/raj1.png")
//   myImg2 = createImg('/public/img/raj5.png');

  await faceapi.loadTinyYolov2Model('models');
  await faceapi.loadFaceRecognitionModel('models');
  forwardParams = { scoreThreshold: 0.5, // 'xs' (224 x 224) | 'sm' (320 x 320) | 'md' (416 x 416) | 'lg' (608 x 608) // any number or one of the predifened sizes:
    inputSize: 'sm' };
}

function clearPic() {

	persons=[]
	allClass=[]
}

function capImage() {
  var myImg = video.get();
  var myname = inputName.value();

  var myObj = {};
  myObj[myname] = myImg;

  persons.push(myObj);
}

async function init() {
	allClass=await initTrainDescriptorsByClass()
	flag = true;
	// console.log(allClass);
	// const descriptor1 = await faceapi.computeFaceDescriptor(myImg2.elt);

}

async function initTrainDescriptorsByClass() {
  return Promise.all(

	 
    persons.map(async person => {
      personName = Object.keys(person)[0];
      var descript=await faceapi.computeFaceDescriptor(person[personName].canvas);

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

async function faceDectect() {
  image(video.get(), 0, 0,320,240);
  // im=createImg(video.get())
  // console.log(mycanvas.canvas);
  imgEle = mycanvas.canvas;
  const detections = await faceapi.tinyYolov2(imgEle, forwardParams);
  const detectionsForSize = detections.map(det =>
    det.forSize(imgEle.width, imgEle.height),
  );


    if (typeof detectionsForSize == 'undefined' || detectionsForSize.length == 0) {
	  // the array is defined and has at least one element
	  iKnowYou.html('');
    }
//    console.log(detectionsForSize);

   if ((flag && typeof detectionsForSize != 'undefined') && detectionsForSize.length > 0) {
        const descriptor1 = await faceapi.computeFaceDescriptor(imgEle);
    //  console.log(descriptor1);
     
     var best = getBestMatch(allClass, descriptor1);
     iKnowYou.html(best.personName);
   } 

     faceapi.drawDetection(imgEle, detectionsForSize, { withScore: true });

//   // console.log(descriptor1)
//   const descriptor2 = await faceapi.computeFaceDescriptor(person[0]['jack']);
//   const distance = faceapi.euclideanDistance(descriptor1, descriptor2);

//   if (distance < 0.5) console.log('match');
//   else console.log('no match');


  //   faceapi.drawLandmarks(imgEle, faceLandmarks);
  // console.log(detectionsForSize[0].relativeBox);
}

function draw() {
  //   faceDectect()
  // faceDectect()
  // background(255,255,0)
  // image(video, 0, 0)
  var w = 80;
  var h = 60;
  var x = 0;
  y = 0;

  for (let index = 0; index < persons.length; index++) {
    const element = persons[index];
    var key = Object.keys(element)[0];
    var img = element[key];
	image(img, x, y, w, h);

	text(key, x+w/2, y+w/2)
    x = x + w;
    if (x > width) {
      y = y + h;
      x = 0;
    }
  }

  faceDectect();

}
