chrome.storage.local.get('highlighted_text', function(result){
  selected = result.highlighted_text;
  // console.log(selected);
  document.getElementById('text_display').innerHTML = selected;
});

// const BASE_URL = 'https://cf98-124-106-181-212.ngrok-free.app';
// const sentiment = 'tangina pareh dami mga shawty sa bgc pareh';
// const sentiment = 'gusto ko na mamatay';
// const sentiment = text_display.value;
// const queryParam = `/?input='${sentiment}'`;
// console.log(selected)


// const path = `${BASE_URL}${queryParam}`
// const path = JSON.parse(`${BASE_URL}${queryParam}`)
// fetch(`${BASE_URL}${queryParam}`)
//   .then(response => response.text())
//   .then(data => console.log(data));
// console.log(`${BASE_URL}${queryParam}`)

// fetch(`${BASE_URL}${queryParam}`, {
//   method: 'GET',
//   headers: {
//     'ngrok-skip-browser-warning': '1234'
//   }
// })
//       .then(response => response.json())
//       .then(data => console.log(data.Result));

const analyzeBtn = document.getElementById("analyze");
const decisionDisplay = document.getElementById("decision_display");


analyzeBtn.addEventListener("click", function() {
  // !!!need to change BASE_URL everytime there is a new session
  // !!!get url from val
  const BASE_URL = 'https://cf98-124-106-181-212.ngrok-free.app';
  const sentiment = selected;
  const queryParam = `/?input='${sentiment}'`;

  fetch(`${BASE_URL}${queryParam}`, {
    method: 'GET',
    headers: {
      'ngrok-skip-browser-warning': '1234'
    }
  })
        .then(response => response.json())
        .then(data => decisionDisplay.value = data.Result);
  
});
