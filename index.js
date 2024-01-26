var text='';
const voiceInEl = document.getElementById('voice');//khai bao voiceInEl la bien toan cuc 
function updateVoices() {
  //lap array lang tu langs trong index.js
  //const voicelangsarr=[];
  //for (let i = 1; i < langs.length ; i++) {
  //    console.log(langs[i][1][0]);
  //    voicelangsarr.push(langs[i][1][0]);
  //};
  //neu khong co array tren thi chi tieng Thai la khong phat am dc
  //con ney lap array thi den nhieu tieng ko the phat am
  //Do do nen bo di 
    // lay cac voice dat vao cac option
    window.speechSynthesis.getVoices().forEach(voice => {
      //check xem voice.lang co trong  voicelangsarr thi moi lay
      const isAlreadyAdded = [...voiceInEl.options].some(option => option.value === voice.voiceURI);
      //const isInlangs = voicelangsarr.includes(voice.lang);
      if (!isAlreadyAdded ) {
          const option = new Option(voice.name, voice.voiceURI, voice.default, voice.default);
          voiceInEl.add(option);
        }      
    });
}
//chay ham tren day updateVoices() de lay cac voice vao cac opption cua select
updateVoices(); 
//goi chay ham nay voi bien voiceInEl va dinh nghia ham o phia tren

//moi khi thay doi voice thi no cap nhat lai de co gtri moi 
window.speechSynthesis.onvoiceschanged = updateVoices;
//vi du de gan gtri voice hien hanh la voiceInEl.value cho dt utterance
//utterance.voice=window.speechSynthesis.getVoices().find(voice => voice.voiceURI === voiceInEl.value);

//cac thong bao nho
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
        listen_button.click(); // readTextQuick()
        //play();
        //listen_button.click();
        //readTextQuick();
        //const utterance = new SpeechSynthesisUtterance(text);
        //window.speechSynthesis.getVoices().forEach(voice => {
        //  if (voice.lang==='vi-VN' && voice.name.toLowerCase() === 'linh'){
        //    let giong = voice.lang;
        //    utterance.voice = giong;
        //  }
        //});
        //window.speechSynthesis.speak(utterance);

      //-----------------------------------------------------------------------------
    }
  };
  xhttp.open("GET", url);
  xhttp.send();
}
//-------------------
//khi nhap nut loa listen_button.click() thi thi thanh ham nay
function readTextQuick(){
  
  let giong = langs[select_target_language.value][1][0];
  //giong co dang 'vi-VN',khi hoan vi phai xac dinh lai cai nay
  //alert(giong);
  let giong2 = giong;
  let count = 0;
  let i = 0;
  const arrayi = new Array(); 
  window.speechSynthesis.getVoices().forEach(voice => {
      i=i+1;
      if (voice.lang.includes(giong2)){
          arrayi.push(i-1);
      }
  });
  console.log(arrayi);
  //lay ngau nhien 1 pt trong arrayi
  let indexrandom = arrayi[(Math.floor(Math.random() * arrayi.length))];
  console.log(indexrandom);
  //vd cho say
  const utterance = new SpeechSynthesisUtterance(text);
  voiceInEl.selectedIndex = indexrandom;
  
  utterance.voice = window.speechSynthesis.getVoices().find(voice => voice.voiceURI === voiceInEl.value);
  window.speechSynthesis.speak(utterance);

}          
//-------------------
function actchangevoice(){
  //string tren giao dien: voice.value
  //chi so index da chon: voice.selectedIndex
  let giongnoi: langs[voice.selectedIndex][1][0];
  //ngu : langs[voice.selectedIndex][1][0] (vi-VN).substr(0,2)
  //ten nguoi doc:ko xd 
  
  //alert(voice.selectedIndex);
  //alert(langs[voice.selectedIndex][1][0]);
  let n = voice.selectedIndex;
  let tb = String(n)+'. '+ giongnoi;
  alert(tb);

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
function chongiongfix(){
  //xac dinh giong de set la giong hien chon trong menu phai
  let giongset = langs[select_target_language.selectedIndex][1][0];
  //co bao nhieu giong nay trong may?
  let count = 0;
  let i = 0;
  const arrayi = new Array(); 
  window.speechSynthesis.getVoices().forEach(voice => {
      i=i+1;
      if (voice.lang.includes(giongset)){
          arrayi.push(i-1);
      }
  });
  console.log(arrayi);
  alert(arrayi);
  //xet tung giong loop chi so giong trong arrayi
  for (i=0; i < arrayi.length; i++){
    const utterance = new SpeechSynthesisUtterance(text);
    voiceInEl.selectedIndex = i;
    utterance.voice = window.speechSynthesis.getVoices().find(voice => voice.voiceURI === voiceInEl.value);
    window.speechSynthesis.speak(utterance);
  
  }
  
}


  //laygiongstbco(giong.substr(0,2));
  //alert(giong);
  
  //tim giong trong thiet bi khop voi giong treen
  //let voicetimintb = window.speechSynthesis.getVoices().find(voice => voice.lang==giong );
  //set default in voiceInEl
  //voiceInEl.selectedIndex = window.speechSynthesis.getVoices().indexOf(voicetimintb);
 // const utterance = new SpeechSynthesisUtterance(text);
  //lay cai defaul tu menu  
  //utterance.voice = window.speechSynthesis.getVoices().find(voice => voice.voiceURI === voiceInEl.value);
  //o day ta lay theo voiceInEl.selectedIndex
  //utterance.voice = voicetimintb;
  

  //dong 2 dat defaul la index cua voice chon tre
  //voiceInEl.selectedIndex = window.speechSynthesis.getVoices().indexOf(voicechon);
  //dong 3 lay voice trinh duyet la cua ele
 // let voicechon = window.speechSynthesis.getVoices().find(voice => voice.lang === giong );
 // utterance.voice = voicechon;
  //alert(voicechon.voiceURI);
 // voiceInEl.value = voicechon.voiceURI;
 // window.speechSynthesis.speak(utterance);
//}
//--------------------------------------

