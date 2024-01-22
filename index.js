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
    select_source_language.selectedIndex = 10; //viet
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

$("#hoanviLangs").click(function () {
    //1.lay chi so lang ben phai dat no la jp
    let jp = select_target_language.selectedIndex;
    //2. lay chi so lang ben trai dat no la jt
    let jt = select_source_language.selectedIndex;
    //3. di tim ben trai cai phan tu co chi so index la jp va default tai do (tuc la chon phan tu do)
    select_source_language.selectedIndex = jp;
    select_target_language.selectedIndex = jt;
    updateCountry();
}); 

//--end cac bien va ham lquan recognition speech --------------------------------------------
function translate() { //(5)
  const inputText = final_transcript;
  const outputTextEle = document.getElementById("resultsdich");
  const sourceLanguaget = langs[document.querySelector("#select_source_language").value][0];
  const targetLanguaget = langs[document.querySelector("#select_target_language").value][0];
  let vtdL1 = sourceLanguaget.indexOf('(');
  let vtcL1 = sourceLanguaget.indexOf(')');
  let sourceLanguage = sourceLanguaget.substring(vtdL1+1,vtcL1);
  
  let vtdL2 = targetLanguaget.indexOf('(');
  let vtcL2 = targetLanguaget.indexOf(')');
  let targetLanguage = targetLanguaget.substring(vtdL2+1,vtcL2);
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURI(inputText)}`;

  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200)
    {
        const responseReturned = JSON.parse(this.responseText);
        const translations = responseReturned[0].map((text) => text[0]);
        const outputText = translations.join(" ");
        outputTextEle.textContent = outputText;
        text = outputTextEle.textContent;
        //play();
        //listen_button.click();
        //readTextQuick(text,langread);
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.getVoices().forEach(voice => {
          if (voice.lang==='vi-VN' && voice.name.toLowerCase() === 'linh'){
            let giong = voice.lang;
            utterance.voice = giong;
          }
        });
        window.speechSynthesis.speak(utterance);

      //-----------------------------------------------------------------------------
    }
  };
  xhttp.open("GET", url);
  xhttp.send();
}
//-------------------
function readTextQuick(){
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);

}