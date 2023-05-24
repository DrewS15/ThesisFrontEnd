const analyzeBtn = document.getElementById("analyze");
const inputText = document.getElementById("input_text");
const decisionDisplay = document.getElementById("decision_display");
const decisionLabel = document.getElementById("decision_label");
var isClick = true;

const observer = new MutationObserver(postProcess);
const delay = setTimeout(postProcess,1*1000);
const output = document.querySelector('#decision_display');

chrome.storage.local.get('highlighted_text', function(result){
  selected = result.highlighted_text;
  inputText.innerHTML = selected;
});

if(analyzeBtn){
analyzeBtn.addEventListener("click", function() {
  var sentiment =  inputText.value;
  if(sentiment==""){
    inputText.placeholder='PLEASE SELECT OR TYPE IN A VALID SENTENCE';
  }
  else{
    if(isClick){
      analyzeBtn.innerHTML = "CLEAR";
      inputText.readOnly = true;
      const BASE_URL = 'https://d1aa-124-106-181-212.ngrok-free.app';
      const queryParam = `/?input='${sentiment}'`;
      fetch(`${BASE_URL}${queryParam}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': '1234'
        }
      })
            .then(response => response.json())
            .then(data => decisionDisplay.innerHTML = data.Result)
      decisionDisplay.style.display = "block";
      decisionLabel.style.display = "block";
      isClick = false;
    }
    else{
      chrome.storage.local.set({ highlighted_text : null});
      inputText.readOnly = false;
      analyzeBtn.innerHTML = "ANALYZE";
      inputText.value = null;
      decisionDisplay.innerHTML = null;
      decisionDisplay.style.display = "none";
      decisionLabel.style.display = "none";
      sentiment = null;
      isClick = true;
    }
  }

  observer.observe(output,{
    subtree: true,
    characterData: true,
    childList: true,
  });
  
});
}

function postProcess(){
  if(!isClick){
    if(decisionDisplay.innerHTML=="POSITIVE SENTIMENT"){
      decisionDisplay.style.color = "rgb(125, 255, 0)";
    }
    else if(decisionDisplay.innerHTML=="NEGATIVE SENTIMENT"){
      decisionDisplay.style.color = "red";
    }
  }
  else{
    decisionDisplay.style.color = "transparent";
  }
}

