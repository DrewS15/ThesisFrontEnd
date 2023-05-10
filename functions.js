var manifestData = chrome.runtime.getManifest();
document.getElementById("version").innerHTML = " Version Alpha " + manifestData.version;
document.getElementById("title").innerHTML = manifestData.name;