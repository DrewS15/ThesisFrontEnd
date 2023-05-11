chrome.storage.local.get('highlighted_text', function(result){
  selected = result.highlighted_text;
  document.getElementById('input_text').innerHTML = selected;
});

const analyzeBtn = document.getElementById("analyze");
const decisionDisplay = document.getElementById("decision_display");
var isClick = true;

analyzeBtn.addEventListener("click", function() {
  preprocess();
});

function preprocess(){
  console.log("Preprocessing");
  var sentiment =  document.getElementById('input_text').value;
  console.log("Value: " + sentiment);
  if(sentiment==""){
    console.log("isNull");
    document.getElementById("input_text").placeholder='PLEASE SELECT OR TYPE IN A VALID SENTENCE';
  }
  else{
    if(isClick){
      console.log("Input string: " + sentiment);
      document.getElementById('analyze').innerHTML = "Clear Input";
      document.getElementById("input_text").readOnly = true;
      // !!!need to change BASE_URL everytime there is a new session
      // !!!get url from val
      const BASE_URL = 'https://9ba3-204-145-5-43.ngrok-free.app';
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
    }
    else{
      console.log("Clear!");
      chrome.storage.local.set({ highlighted_text : null});
      document.getElementById("input_text").readOnly = false;
      document.getElementById("analyze").innerHTML = "Analyze Text";
      document.getElementById("input_text").value = null;
      document.getElementById("decision_display").value = null;
      sentiment = null;
      isClick = true;
    }
  }
}



