var manifestData = chrome.runtime.getManifest();
document.getElementById("version").innerHTML = " Version Alpha " + manifestData.version;
document.getElementById("title").innerHTML = manifestData.name;

const outputField = document.getElementById("decision_display");

outputField.addEventListener("change",()=>{
    console.log("hasChanged")
    if(outputField.innerHTML=="POSITIVE SENTIMENT"){
        decisionDisplay.style.color = "green";
      }
      else if(outputField.innerHTML=="NEGATIVE SENTIMENT"){
        decisionDisplay.style.color = "red";
      }
});