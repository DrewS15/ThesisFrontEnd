chrome.storage.local.get('highlighted_text', function(result){
  selected = result.highlighted_text;
  console.log(selected);
  document.getElementById('text_display').innerHTML = selected;
});
