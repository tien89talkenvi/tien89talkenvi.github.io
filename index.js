var text='';
var chongiongenUS=0;
const voiceInEl = document.getElementById('voicegiong');//khai bao voiceInEl la bien toan cuc 

function populateVoiceList() {
  if (typeof speechSynthesis === "undefined") {
    return;
  }

  const voices = speechSynthesis.getVoices();

  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement("option");
    option.textContent = `${voices[i].name} (${voices[i].lang})`;

    if (voices[i].default) {
      option.textContent += " — DEFAULT";
    }

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    document.getElementById("voicegiong").appendChild(option);
  }
}
//-------------------------------------
populateVoiceList();
if (typeof speechSynthesis !== "undefined" && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}


//------------cac thong bao nho---------------------------
var messages = {
    "start": {
      msg: 'Click on the microphone icon and begin speaking.',
      class: 'alert-success'},
    "speak_now": {
      msg: 'Speak now.',
      class: 'alert-success'},
    "no_speech": {
      msg: 'No speech was detected. You may need to adjust your <a href="//support.google.com/chrome/answer/2693767" target="_blank">microphone settings</a>.',
      class: 'alert-danger'},
    "no_microphone": {
      msg: 'No microphone was found. Ensure that a microphone is installed and that <a href="//support.google.com/chrome/answer/2693767" target="_blank">microphone settings</a> are configured correctly.',
      class: 'alert-danger'},
    "allow": {
      msg: 'Click the "Allow" button above to enable your microphone.',
      class: 'alert-warning'},
    "denied": {
      msg: 'Permission to use microphone was denied.',
      class: 'alert-danger'},
    "blocked": {
      msg: 'Permission to use microphone is blocked. To change, go to chrome://settings/content/microphone',
      class: 'alert-danger'},
    "upgrade": {
      msg: 'Web Speech API is not supported by this browser. It is only supported by <a href="//www.google.com/chrome">Chrome</a> version 25 or later on desktop and Android mobile.',
      class: 'alert-danger'},
    "stop": {
        msg: 'Stop listening, click on the microphone icon to restart',
        class: 'alert-success'},
    "copy": {
      msg: 'Content copy to clipboard successfully.',
      class: 'alert-success'},
}
//cac bien global
var final_transcript = '';

var recognizing = false;
var ignore_onend;
var start_timestamp;
var recognition;
  
//cac ham ung voi cac su kien
$( document ).ready(function() {
    for (var i = 0; i < langs.length; i++) {
      select_source_language.options[i] = new Option(langs[i][0], i);
      select_target_language.options[i] = new Option(langs[i][0], i);
    }
    select_source_language.selectedIndex = 12; //viet
    select_target_language.selectedIndex = 1;  //english
    updateCountry();
    select_source_dialect.selectedIndex = 0;
    select_target_dialect.selectedIndex = 0;
    
    if (!('webkitSpeechRecognition' in window)) {
      upgrade();
    } else {
      showInfo('start'); 
      resultsdich.innerHTML=''; //khi dang chuan bi thi cai nay phai empty
      start_button.style.display = 'inline-block';
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
  
      recognition.onstart = function() {

        recognizing = true;
        showInfo('speak_now');
        resultsdich.innerHTML=''; //khi dang chuan bi thi cai nay phai empty
        start_img.src = 'icons/mic-animation.gif';
      };
  
      recognition.onerror = function(event) {
        if (event.error == 'no-speech') {
          start_img.src = 'icons/mic.gif';
          showInfo('no_speech');
          resultsdich.innerHTML=''; //khi dang chuan bi thi cai nay phai empty
          ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
          start_img.src = 'icons/mic.gif';
          showInfo('no_microphone');
          resultsdich.innerHTML=''; //khi dang chuan bi thi cai nay phai empty
          ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
          resultsdich.innerHTML=''; //khi dang chuan bi thi cai nay phai empty
          if (event.timeStamp - start_timestamp < 100) {
            showInfo('blocked');
          } else {
            showInfo('denied');
          }
          ignore_onend = true;
        }
      };
  
      recognition.onend = function() {
        recognizing = false;
        if (ignore_onend) {
          return;
        }
        start_img.src = 'icons/mic.gif';
        if (!final_transcript) {
          showInfo('start');
          return;
        }
        showInfo('stop');
        translate();
      };
  
      recognition.onresult = function(event) {
          var interim_transcript = '';
          resultsdich.innerHTML=''; //khi dang chuan bi thi cai nay phai empty
          //chu y rang van de kq trung gian va cuoi cung hien ra cho ta thay ct dang chay
          //nhung cuoi cung thi dich moi hien ra 
          for (var i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                  final_transcript += event.results[i][0].transcript;
              } else {
                  interim_transcript += event.results[i][0].transcript; 
              }
          }
          final_transcript = capitalize(final_transcript);
          final_span.innerHTML = linebreak(final_transcript);
          interim_span.innerHTML = linebreak(interim_transcript);
      
        //final_transcript la global nen no van ton tai ca cac thay doi, den khi ta click nghe thi moi dich
        //resultsdich.innerHTML=translate(final_transcript);     
        //translate(final_transcript);     
      };

    }
});
  
  
function updateCountry() {
      for (var i = select_source_dialect.options.length - 1; i >= 0; i--) {
          select_source_dialect.remove(i);
      }
      var list = langs[select_source_language.selectedIndex];
      for (var i = 1; i < list.length; i++) {
          select_source_dialect.options.add(new Option(list[i][1], list[i][0]));
      }
      select_source_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
      //----
      for (var i = select_target_dialect.options.length - 1; i >= 0; i--) {
          select_target_dialect.remove(i);
      }
      var list = langs[select_target_language.selectedIndex];
      for (var i = 1; i < list.length; i++) {
          select_target_dialect.options.add(new Option(list[i][1], list[i][0]));
      }
      select_target_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
  
}
  
  
function upgrade() {
    start_button.style.visibility = 'hidden';
    showInfo('upgrade');
}
  
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
  
var first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, function(m) { return m.toUpperCase(); });
}
  
$("#start_button").click(function () {
    if (recognizing) {
      recognition.stop();
      return;
    }
    final_transcript = '';
    
    recognition.lang = select_source_dialect.value;
    //alert(recognition.lang); //thu cho nay thay dung roi khi nhap nut button start
    recognition.start();
    ignore_onend = false;
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    start_img.src = 'icons/mic-slash.gif';
    showInfo('allow');
    start_timestamp = event.timeStamp;
});
  
$("#select_source_language").change(function () {
    updateCountry();
});
  
function showInfo(s) {
    if (s) {
      var message = messages[s];
      $("#info").html(message.msg);
      $("#info").removeClass();
      $("#info").addClass('alert');
      $("#info").addClass(message.class);
    } else {
      $("#info").removeClass();
      $("#info").addClass('d-none');
    }
}
//----------------------------------------------
$("#hoanviLangs").click(function () {
    //1.lay chi so lang ben phai dat no la jp
    let jp = select_target_language.selectedIndex;
    //2. lay chi so lang ben trai dat no la jt
    let jt = select_source_language.selectedIndex;
    //3. di tim ben trai cai phan tu co chi so index la jp va default tai do (tuc la chon phan tu do)
    select_source_language.selectedIndex = jp;
    select_target_language.selectedIndex = jt;
    //4. hvi 2 lang bc rut ra 2 lang tuong ung 2 jp jt
    const sourceLanguaget =langs[jp][1][0];
    const targetLanguaget =langs[jt][1][0];
    //5. hvi 2 text. vi final_transcript do noi tao ra nen type khac voi van dich nen ko hoan vi
    //ma phai xoa trong de noi lai
    final_transcript = '';
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    document.getElementById("resultsdich").textContent ='';
    text = '';

    updateCountry();
}); 
//xu li pit/rate/vol ----------------------------------------------------------------------------------
//khai bao cac bien toan cuc va gan gitri dau
const pitchInEl = document.getElementById('pitch');
const rateInEl = document.getElementById('rate');
const volumeInEl = document.getElementById('volume');

const pitchOutEl = document.querySelector('output[for="pitch"]');
const rateOutEl = document.querySelector('output[for="rate"]');
const volumeOutEl = document.querySelector('output[for="volume"]');

function updateOutputs() {//---------
    // display current values of all range inputs, phoi bay gtri hien huu
    pitchOutEl.textContent = pitchInEl.value;
    rateOutEl.textContent = rateInEl.value;
    volumeOutEl.textContent = volumeInEl.value;
}

// add UI event handlers, khi pit/rate/vol thay doi thi chay ham updateOutputs() o tren de lay gt moi
pitchInEl.addEventListener('change', updateOutputs);
rateInEl.addEventListener('change', updateOutputs);
volumeInEl.addEventListener('change', updateOutputs);

//----------------------------------------
//Xu li 3 nut play/pause/stop2 phia duoi 

// grab the UI elements to work with
const textEl = document.getElementById('resultsdich');

const playEl = document.getElementById('play');
const pauseEl = document.getElementById('pause');
const stopEl = document.getElementById('stop');

// add UI event handlers
playEl.addEventListener('click', play);
pauseEl.addEventListener('click', pause);
stopEl.addEventListener('click', stop);

// set text
textEl.innerHTML = text;
//-----------------------
function play() {
  if (window.speechSynthesis.speaking) {
    // there's an unfinished utterance
    window.speechSynthesis.resume();
  } else {
    // start new utterance
    if (text==''){return;}  // de tranh giat giat khi text trong
    
    //text nay la text dich o phan translate qua
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.addEventListener('start', handleStart);
    utterance.addEventListener('pause', handlePause);
    utterance.addEventListener('resume', handleResume);
    utterance.addEventListener('end', handleEnd);
    utterance.addEventListener('boundary', handleBoundary);
    
    //let giong = langs[select_target_language.value][1][0];
    //voiceInEl.selectedIndex = 12;
    //let idexdachon = voiceInEl.selectedIndex;
    utterance.voice = window.speechSynthesis.getVoices().find(voice => voiceInEl.value.includes(voice.voiceURI));
    
    //alert(utterance.voice);
    
    //let selectedVoice = voiceInEl.selectedOptions[0].getAttribute('data-lang');
    //alert(selectedVoice);
    //utterance.lang = selectedVoice;
    //utterance.voice = window.speechSynthesis.getVoices().find(voice => voice.voiceURI === voiceInEl.value);
  
    utterance.pitch = pitchInEl.value;
    utterance.rate = rateInEl.value;
    utterance.volume = volumeInEl.value;
    
    window.speechSynthesis.speak(utterance);

    //giong co dang 'vi-VN',khi hoan vi phai xac dinh lai cai nay
    //let count = 0;
    //let i = 0;
    //const arrayi = new Array(); 
    //window.speechSynthesis.getVoices().forEach(voice => {
    //    i=i+1;
        //alert(chongiongenUS);
    //    if (voice.lang.includes(giong.substr(0,2))){
    //      arrayi.push(i-1);
    //      voiceInEl.selectedIndex = i-1;
          //neu la giong en-US thi buoc noi giong en-US Zira ung voi voiceInEl.selectedIndex = 2, th khac binh tthuong
     //      let selectedVoice = voiceInEl.selectedOptions[0].getAttribute('data-lang');
          //alert(selectedVoice);
     //     utterance.lang = selectedVoice;
          //utterance.voice = window.speechSynthesis.getVoices().find(voice => voice.voiceURI === voiceInEl.value);
        
     //     utterance.pitch = pitchInEl.value;
     //     utterance.rate = rateInEl.value;
     //     utterance.volume = volumeInEl.value;
          
    //      window.speechSynthesis.speak(utterance);
      
     //   }
    //});
    //let number = arrayi.length;
    //console.log(number.toString() +' voice(s) '+giong.substr(0,2)+' in local.')
    //lay ngau nhien 1 pt trong arrayi
    //let indexrandom = arrayi[(Math.floor(Math.random() * arrayi.length))];
   
    //console.log(indexrandom);
    //vd cho say
    //const utterance = new SpeechSynthesisUtterance(text);
    //voiceInEl.selectedIndex = indexrandom;
    //neu la giong en-US thi buoc noi giong en-US Zira ung voi voiceInEl.selectedIndex = 2, th khac binh tthuong
     //let selectedVoice = voiceInEl.selectedOptions[0].getAttribute('data-lang');
    //alert(selectedVoice);
    //utterance.lang = selectedVoice;
    //utterance.voice = window.speechSynthesis.getVoices().find(voice => voice.voiceURI === voiceInEl.value);
  
    //utterance.pitch = pitchInEl.value;
    //utterance.rate = rateInEl.value;
    //utterance.volume = volumeInEl.value;
    
    //window.speechSynthesis.speak(utterance);
    //------

  }
}

function pause() {
  window.speechSynthesis.pause();
}

function stop() {
  window.speechSynthesis.cancel();
  // Safari doesn't fire the 'end' event when cancelling, so call handler manually
  handleEnd();
}

function handleStart() {
  playEl.disabled = true;
  pauseEl.disabled = false;
  stopEl.disabled = false;
}

function handlePause() {
  playEl.disabled = false;
  pauseEl.disabled = true;
  stopEl.disabled = false;
}

function handleResume() {
  playEl.disabled = true;
  pauseEl.disabled = false;
  stopEl.disabled = false;
}

function handleEnd() {
  playEl.disabled = false;
  pauseEl.disabled = true;
  stopEl.disabled = true;
  
  // reset text to remove mark
  textEl.innerHTML = text;
}

function handleBoundary(event) {
  if (event.name === 'sentence') {
    // we only care about word boundaries
    return;
  }

  const wordStart = event.charIndex;
  let wordLength = event.charLength;
  if (wordLength === undefined) {
    // Safari doesn't provide charLength, so fall back to a regex to find the current word and its length (probably misses some edge cases, but good enough for this demo)
    const match = text.substring(wordStart).match(/^[a-z\d']*/i);
    wordLength = match[0].length;
  }
  // wrap word in <mark> tag
  const wordEnd = wordStart + wordLength;
  const word = text.substring(wordStart, wordEnd);
  const markedText = text.substring(0, wordStart) + '<mark>' + word + '</mark>' + text.substring(wordEnd);
  textEl.innerHTML = markedText;

}

//--end cac bien va ham lquan recognition speech --------------------------------------------
function translate() { //(5)
  const inputText = final_transcript;
  const outputTextEle = document.getElementById("resultsdich");

  const sourceLanguaget =langs[document.querySelector("#select_source_language").value][1][0];
  const targetLanguaget =langs[document.querySelector("#select_target_language").value][1][0];
  //document.querySelector("#select_source_language").value la chi so
  //langs[document.querySelector("#select_target_language").value][1] la phan tu 1 cua list, co dang ['vi-VN']
  //langs[document.querySelector("#select_target_language").value][1][0] la chuoi 'vi-VN'
  
  let sourceLanguage = sourceLanguaget.substring(0,2);
  let targetLanguage = targetLanguaget.substring(0,2);
  //alert(sourceLanguage);
  //alert(targetLanguage);

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURI(inputText)}`;

  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200)
    {
        const responseReturned = JSON.parse(this.responseText);
        const translations = responseReturned[0].map((text) => text[0]);
        const outputText = translations.join(" ");
        outputTextEle.textContent = outputText;
        //text cua kq dich chua fdung trong outputTextEle
        text = outputTextEle.textContent;
        listen_button.click(); //co play() trong nay; text nay la text dich se di theo
    }
  };
  //---------------------
  xhttp.open("GET", url);
  xhttp.send();
}

//-------------------------------xoa text phan duoi------------------------

//khi nhap nut loa listen_button.click() thi thi thanh ham nay
//bay gio la play()
function readTextQuick(){
  
  let giong = langs[select_target_language.value][1][0];
  //giong co dang 'vi-VN',khi hoan vi phai xac dinh lai cai nay
  let count = 0;
  let i = 0;
  const arrayi = new Array(); 
  window.speechSynthesis.getVoices().forEach(voice => {
      i=i+1;
      //alert(chongiongenUS);
      if (giong === 'en-US'){
          if (voice.lang.includes(giong) && voice.name.includes('Samantha') ){
            arrayi.push(i-1);
          }
      }else{
        if (voice.lang.includes(giong)){
          arrayi.push(i-1);
        }
      }

  });
  console.log(arrayi);
  //lay ngau nhien 1 pt trong arrayi
  let indexrandom = arrayi[(Math.floor(Math.random() * arrayi.length))];
 
  console.log(indexrandom);
  //vd cho say
  const utterance = new SpeechSynthesisUtterance(text);
  voiceInEl.selectedIndex = indexrandom;
  //neu la giong en-US thi buoc noi giong en-US Zira ung voi voiceInEl.selectedIndex = 2, th khac binh tthuong
   let selectedVoice = voiceInEl.selectedOptions[0].getAttribute('data-lang');
  //alert(selectedVoice);
  utterance.lang = selectedVoice;
  //utterance.voice = window.speechSynthesis.getVoices().find(voice => voice.voiceURI === voiceInEl.value);

  
  window.speechSynthesis.speak(utterance);

}          
//-------------------
//<select id="voicegiong" onchange="actchange_voice()"></select>
function actchange_voice(){
  //string tren giao dien: voice.value
  //alert(voiceInEl.value);
  let selectedName = voiceInEl.selectedOptions[0].getAttribute('data-name');
  let selectedVoice = voiceInEl.selectedOptions[0].getAttribute('data-lang');
  
  console.log(selectedName);
  console.log(selectedVoice);

  //alert(selectedName);
  //alert(selectedVoice);
  
}
//----------------------
function act_source_lang(){
  //lang vd vi-VN
  //alert(langs[select_source_language.selectedIndex][1][0]);
  final_transcript = '';
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  document.getElementById("resultsdich").textContent ='';
  text = '';
}
//-------------------------
function act_target_lang(){
  //lang vd vi-VN
  //alert(langs[select_target_language.selectedIndex][1][0]);
  translate();
}
//-------------------
//<div  id="info" translate="no" onclick="chongiongfix()"></div>
function chongiongfix(){
  chongiongenUS = chongiongenUS + 1;
  //alert(chongiongenUS%2);
}
//--------------------------------------
function xoaduoi(){
  act_source_lang();
}
//--------------------
function hdansd(){
  let texhd ='';
  texhd = texhd + 'App này dùng để dịch tiếng nói và văn bản giữa hai ngôn ngữ trong 14 ngôn ngữ được chọn. ';
  texhd = texhd + 'Nó phục vụ cho việc đàm thoại có thông dịch và việc học tiếng Anh, tiếng Việt là chính. \n';
  texhd = texhd + '\n';
  texhd = texhd + 'Việc dịch qua lại giữa các thứ tiếng được lấy từ các dịch vụ miễn phí của Google Translation. Nó chạy rất ổn định trên trình duyệt Chrome Laptop và Safari Iphone.\n';
  texhd = texhd + 'Cái hay nhất là tiếng nói phát ra ngay khi văn bản được dịch mà không cần tương tác của người dùng, ngoại trừ lần đầu tiên. \n';
  texhd = texhd + '\n';
  texhd = texhd + 'Vắn tắt cách sử dụng như sau: \n';
  texhd = texhd + '\n';
  
  texhd = texhd + '1. Chọn ngôn ngữ nói và ngôn ngữ nghe (mặc định là Việt-Anh).\n';
  texhd = texhd + '2. Nhấp vào biểu tương micro rồi nói. Micro sẽ nhấp nháy. Văn bản nói sẽ hiện ra. Nhấp vào thì nó ngưng và bắt đầu dịch. Văn bàn dịch sẽ hiện ra và tự động phát âm (trừ lân đầu phải nhấp vào micro.\n';
  texhd = texhd + 'Phía dải trên cúng sẽ hiện ra giọng phát âm và thông tin các giọng có trong máy.\n';
  texhd = texhd + 'Muốn nghe lại thì nhấp vào biểu tượng loa.\n';
  texhd = texhd + 'Nếu muốn đổi vai ngôn ngữ nói và nghe thì nhấp mũi tên ở giũa. Để tiếp tục nói lại nhấp micro...\n';
  texhd = texhd + '3. Phần bên dưới là để "Chơi thêm" giọng phát ra loa nhanh/chậm/cao/trầm... \n';
  texhd = texhd + 'Chọn giọng nào trên dải phía trên cùng thì văn bản dịch ra sẽ phát giong đó cho đến khi dùng lại phần giữa. \n';
  
  
  alert(texhd);
}