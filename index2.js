let langlay = ''
// Hàm để dịch 
function dichTextFromTo(textDemDich, fromLang, toLang, noiGhiTextDaDich){
  //console.log('cac ts:',textDemDich, micNoi);
  let inputText = textDemDich;
  let sourceLanguage = fromLang;
  let targetLanguage = toLang;

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURI(inputText)}`;

  const xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200){
          const responseReturned = JSON.parse(this.responseText);
          const translations = responseReturned[0].map((text) => text[0]);
          const textDichRa  = translations.join(" ");
          //console.log(textDichRa);
          noiGhiTextDaDich.value = textDichRa; 
      }
  }
  xhttp.open("GET", url);
  xhttp.send();
};

// Hàm xu li box 
function xuli_box(){
    const box_input_1 = document.getElementById('box_input_1');
    const box_input_2 = document.getElementById('box_input_2');

    let textBox_1 = box_input_1.value;
    let textBox_2 = box_input_2.value;

    if (textBox_1.trim() !== "" && textBox_2.trim() === "" ) {
      dichTextFromTo(textBox_1, 'en', langlay, box_input_2);
    }
    if (textBox_2.trim() !== "" && textBox_1.trim() === "" ) {
      dichTextFromTo(textBox_2, langlay, 'en', box_input_1);
    }

} 

function micro_thu(){
  alert('OK!');
}

//Ham nay mo trang  Swal.fire de ghi text hoac noi text cho viec dich tu en qua lang trong menu voiceSelect
function chatBox(){
    let langen = 'en';
    langlay = '';
    for (let opt of voiceSelect.options) {
      if (opt.textContent.includes(voiceSelect.value)) {
        langlay = opt.textContent.split(" ")[0].substring(0,2);   // chọn option đó
        break;                      // dừng lại ngay
      }
    }

    
    Swal.fire({
        title: `<div style='color:darkgreen;'>Input by ⌨ or <span id="mic_ro" onclick="micro_thu()">🎙️</span></div>`,
        html: `
            <a style="color: darkblue;">${langen}</a>
            <textarea id="box_input_1" spellcheck="false" style="width:100%; height:150px; color:darkblue; font-size:1.3rem; border: 1px solid darkgreen; padding: 10px;"></textarea>
            <a style="color: darkgreen;">${langlay}</a>
            <textarea id="box_input_2" spellcheck="false" style="width:100%; height:150px; color:darkgreen; font-size:1.3rem; border: 1px solid darkblue; padding: 10px;"></textarea>
            <br>
            <button id="loseFocus_xulibox" onclick="xuli_box()" style="color:red;">Click here for Translation</button>
            <br>
            <hr>
            
            <script>

                window.addEventListener('DOMContentLoaded', () => {
                    document.getElementById('box_input_1').focus();
                });

            </script>
            `,
   
        showCancelButton: true,
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
    }).then((result) => {
        //box_input_1.addEventListener("blur", xuli_box);
        //box_input_2.addEventListener("blur", xuli_box);

        if (result.isConfirmed) {
          alert('xong');
        }
    });
}

//Ham vao chatBox()
gledich.addEventListener("click", function() {
  chatBox();
});
