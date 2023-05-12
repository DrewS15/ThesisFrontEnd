const analyzeBtn = document.getElementById("analyze");
const inputText = document.getElementById("input_text");
const decisionDisplay = document.getElementById("decision_display");
const decisionLabel = document.getElementById("decision_label");
var isClick = true;

chrome.storage.local.get('highlighted_text', function(result){
  selected = result.highlighted_text;
  inputText.innerHTML = selected;
});

if(analyzeBtn){
analyzeBtn.addEventListener("click", function() {
  var sentiment =  inputText.value;
  if(sentiment==""){
    console.log("isNull");
    inputText.placeholder='PLEASE SELECT OR TYPE IN A VALID SENTENCE';
  }
  else{
    if(isClick){
      console.log("Value: " + sentiment);
      console.log("Input string: " + sentiment);
      analyzeBtn.innerHTML = "Clear";
      inputText.readOnly = true;
      // !!!need to change BASE_URL everytime there is a new session
      // !!!get url from val
      const BASE_URL = 'https://dda0-124-106-181-212.ngrok-free.app';
      const queryParam = `/?input='${sentiment}'`;
  
      fetch(`${BASE_URL}${queryParam}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': '1234'
        }
      })
            .then(response => response.json())
            .then(data => decisionDisplay.value = data.Result)
      isClick = false;
      decisionDisplay.style.display = "block";
      decisionLabel.style.display = "block";
    }
    else{
      console.log("Clear! : " + decisionDisplay.value);
      chrome.storage.local.set({ highlighted_text : null});
      inputText.readOnly = false;
      analyzeBtn.innerHTML = "Analyze";
      inputText.value = null;
      decisionDisplay.value = null;
      decisionDisplay.style.display = "none";
      decisionLabel.style.display = "none";
      sentiment = null;
      isClick = true;
    }
  }
});
}







