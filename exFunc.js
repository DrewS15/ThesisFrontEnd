var manifestData = chrome.runtime.getManifest();
document.getElementById("version").innerHTML = " Version Alpha " + manifestData.version;
document.getElementById("title").innerHTML = manifestData.name;

var sentence = document.getElementById("analyze");
sentence.addEventListener('click',getInput);

function getInput(){
document.getElementById("out").innerHTML = document.getElementById("user_input").value;
}