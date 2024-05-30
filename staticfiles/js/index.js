'use strict';

// Function to retrieve CSRF token from the hidden input field
function getCSRFToken() {
  const csrfTokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
  if (csrfTokenInput) {
    return csrfTokenInput.value;
  }
  return null;
}

// On document load
document.addEventListener("DOMContentLoaded", function () {
  // Add event listener to image input
  const imageForm = document.getElementById("image-form");
  if (imageForm) {
    imageForm.addEventListener("submit", function (event) {
      event.preventDefault();
      // Get form data
      var formData = new FormData(this);
      // Show image conversion loader
      const imageLoader = document.getElementById("image-conversion-loader");
      if (imageLoader) {
        imageLoader.style.display = "block";
      }

      // Send POST request to server with CSRF token
      fetch("/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCSRFToken(), // Include CSRF token in the headers
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.type === "audio") {
            document.getElementById("image-output").innerHTML =
              '<audio controls><source src="data:audio/wav;base64,' +
              data.audio +
              '" type="audio/wav"></audio>';
          } else {
            console.error("Unknown response type:", data.type);
          }
          // Hide image conversion loader
          if (imageLoader) {
            imageLoader.style.display = "none";
          }
        })
        .catch(function (error) {
          console.error(error);
          // Display error message
          alert("An error occurred during the image conversion process. Please try again.");
          // Hide image conversion loader
          if (imageLoader) {
            imageLoader.style.display = "none";
          }
        });
    });
  }

  // Add event listener to audio input
  const audioForm = document.getElementById("audio-form");
  if (audioForm) {
    audioForm.addEventListener("submit", function (event) {
      event.preventDefault();
      // Get form data
      var formData = new FormData(this);
      // Show audio conversion loader
      const audioLoader = document.getElementById("audio-conversion-loader");
      if (audioLoader) {
        audioLoader.style.display = "block";
      }

      // Send POST request to server with CSRF token
      fetch("/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCSRFToken(), // Include CSRF token in the headers
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.type === "image") {
            document.getElementById("audio-output").innerHTML =
              '<img src="data:image/png;base64,' + data.image + '" style="width: 500px; height: auto;" />';
          } else {
            console.error("Unknown response type:", data.type);
          }
          // Hide audio conversion loader
          if (audioLoader) {
            audioLoader.style.display = "none";
          }
        })
        .catch(function (error) {
          console.error(error);
          // Display error message
          alert("An error occurred during the audio conversion process. Please try again.");
          // Hide audio conversion loader
          if (audioLoader) {
            audioLoader.style.display = "none";
          }
        });
    });
  }
});


// Preview Image function
function previewImage(event) {
  const input = event.target;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = input.parentElement.querySelector('#image-preview');
      if (preview) {
        preview.style.backgroundImage = `url('${e.target.result}')`;
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Preview Audio function
function previewAudio(event) {
  const input = event.target;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const audioPreview = input.parentElement.querySelector('#audio-preview');
      if (audioPreview) {
        audioPreview.innerHTML = '';
        const audio = document.createElement('audio');
        audio.setAttribute('controls', 'controls');
        const source = document.createElement('source');
        source.setAttribute('src', e.target.result);
        source.setAttribute('type', 'audio/wav');
        audio.appendChild(source);
        audioPreview.appendChild(audio);
        audioPreview.style.backgroundImage = 'none'; // Remove background image
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

  // The JavaScript code is responsible for handling the file upload and conversion process. It listens for the  submit  event on the image and audio forms, and then sends a POST request to the server with the form data. The server will then process the uploaded file and return the converted data in the response.
  // The  getCookie  function is used to get the CSRF token from the cookie, which is required to make POST requests to the Django server. The  previewImage  and  previewAudio  functions are used to display a preview of the uploaded image and audio files, respectively.
  // Next, we need to create the Django views that will handle the file upload and conversion process.
  // Path: static/views.py