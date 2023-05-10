chrome.storage.local.set({ highlighted_text : null});
chrome.runtime.onInstalled.addListener(() => {
    // context menu information for chrome extension
    // when user right clicks on a text, the extension be available in the options
    var contextMenuItem = {
        "id": "ExtensionDemo", 
        "title": "Filipino Hatespeech Detection3",
        "contexts": ["selection"]
    }

    // create context menu with the information above
    chrome.contextMenus.create(contextMenuItem);

    // when user clicks on the extension, the selected text will be stored in the local storage
    chrome.contextMenus.onClicked.addListener(function(info, tab){
      //store the selected text in variable selectedText
      var selectedText = info.selectionText
          //store the selected text in local storage
          chrome.storage.local.set({ highlighted_text : selectedText})

    });
});



