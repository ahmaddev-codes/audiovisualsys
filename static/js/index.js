"use strict";

// Toast notification system
class ToastNotification {
  constructor() {
    this.createToastContainer();
  }

  createToastContainer() {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(container);
    }
  }

  show(message, type = 'info', duration = 5000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Set background and text colors based on type
    let bgColor, textColor, icon;
    switch (type) {
      case 'success':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        icon = '<i data-lucide="check-circle" class="icon-sm"></i>';
        break;
      case 'error':
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        icon = '<i data-lucide="x-circle" class="icon-sm"></i>';
        break;
      case 'warning':
        bgColor = 'bg-yellow-600';
        textColor = 'text-white';
        icon = '<i data-lucide="alert-triangle" class="icon-sm"></i>';
        break;
      default:
        bgColor = 'bg-blue-600';
        textColor = 'text-white';
        icon = '<i data-lucide="info" class="icon-sm"></i>';
    }

    toast.className = `${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300 translate-x-full`;
    toast.innerHTML = `
      ${icon}
      <span class="flex-1">${message}</span>
      <button onclick="this.parentElement.remove()" class="text-white hover:text-gray-200">
        <i data-lucide="x" class="icon-sm"></i>
      </button>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after duration
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, duration);

    // Reinitialize icons
    lucide.createIcons();
  }
}

// Initialize toast system
const toast = new ToastNotification();

// Get CSRF token from cookies
function getCSRFToken() {
  const name = "csrftoken";
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Audio recording functionality
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

async function toggleRecording() {
  const recordButton = document.getElementById("recordButton");
  const recordingStatus = document.getElementById("recordingStatus");
  const recordingPreview = document.getElementById("recordingPreview");

  if (!isRecording) {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Audio recording is not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunks.length === 0) {
          recordingStatus.textContent = "Error: No audio data recorded";
          recordingStatus.className = "text-sm text-red-400";
          toast.show("No audio data was recorded. Please try again.", "error");
          return;
        }

        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Create audio element
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = audioUrl;

        // Create submit button
        const submitButton = document.createElement("button");
        submitButton.type = "button";
        submitButton.className =
          "github-button px-4 py-2 rounded-lg text-white font-medium mt-3 flex items-center space-x-2";
        submitButton.innerHTML = '<i data-lucide="send" class="icon-sm"></i><span>Submit Recording</span>';
        submitButton.onclick = () => submitRecordedAudio(audioUrl);

        // Clear previous content and add new content
        recordingPreview.innerHTML = "";
        recordingPreview.appendChild(audio);
        recordingPreview.appendChild(submitButton);
        recordingPreview.classList.remove("hidden");

        // Reinitialize icons for the new button
        lucide.createIcons();

        recordingStatus.textContent = "Recording completed successfully!";
        recordingStatus.className = "text-sm text-green-400";
        toast.show("Audio recording completed successfully!", "success");
      };

      mediaRecorder.onerror = (event) => {
        // Error handling for MediaRecorder
        recordingStatus.textContent = "Error: Recording failed";
        recordingStatus.className = "text-sm text-red-400";
        toast.show("Recording failed. Please try again.", "error");
      };

      mediaRecorder.start(1000); // Collect data every second
      isRecording = true;
      recordButton.innerHTML = '<i data-lucide="square" class="icon-sm"></i><span>Stop Recording</span>';
      recordButton.className =
        "bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium flex items-center space-x-2";
      recordingStatus.textContent = "Recording... Speak now!";
      recordingStatus.className = "text-sm text-red-400";
      // Reinitialize icons for the new button content
      lucide.createIcons();
    } catch (error) {
      recordingStatus.textContent = `Error: ${error.message}`;
      recordingStatus.className = "text-sm text-red-400";

      // Show helpful message
      if (error.name === "NotAllowedError") {
        recordingStatus.textContent =
          "Error: Microphone access denied. Please allow microphone access and try again.";
        toast.show("Microphone access denied. Please allow microphone access and try again.", "error");
      } else if (error.name === "NotFoundError") {
        recordingStatus.textContent =
          "Error: No microphone found. Please connect a microphone and try again.";
        toast.show("No microphone found. Please connect a microphone and try again.", "error");
      } else {
        toast.show(`Recording error: ${error.message}`, "error");
      }
    }
      } else {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      isRecording = false;
      recordButton.innerHTML = '<i data-lucide="mic" class="icon-sm"></i><span>Start Recording</span>';
      recordButton.className =
        "github-button px-4 py-2 rounded-lg text-white font-medium flex items-center space-x-2";
      recordingStatus.textContent = "Recording stopped";
      recordingStatus.className = "text-sm text-github-muted";
      // Reinitialize icons for the new button content
      lucide.createIcons();
    }
}

async function submitRecordedAudio(audioUrl) {
  try {
    // Convert audio URL to blob
    const response = await fetch(audioUrl);
    const audioBlob = await response.blob();

    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async function () {
      const base64Audio = reader.result;

      // Get description prompt
      const descriptionPrompt =
        document.getElementById("description-prompt").value;

      // Create form data
      const formData = new FormData();
      formData.append("recorded_audio", base64Audio);
      formData.append("description_prompt", descriptionPrompt);

      // Show loader
      const audioLoader = document.getElementById("audio-conversion-loader");
      if (audioLoader) {
        audioLoader.classList.remove("hidden");
      }

      // Send to server
      const response = await fetch("/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
      });

      const data = await response.json();

      if (data.type === "image") {
        displayGeneratedImage(data);
        toast.show("Image generated successfully!", "success");
      } else if (data.type === "error") {
        toast.show(`Error: ${data.error}`, "error");
      } else if (data.type === "quota_error") {
        toast.show(`OpenAI API Quota Error: ${data.error}. Please check your OpenAI billing and try again later.`, "error");
      } else {
        toast.show("An unexpected error occurred. Please try again.", "error");
      }

      // Hide loader
      if (audioLoader) {
        audioLoader.classList.add("hidden");
      }
    };
  } catch (error) {
    toast.show("An error occurred while submitting the recorded audio. Please try again.", "error");
  }
}

// Display generated image
function displayGeneratedImage(data) {
  const outputDiv = document.getElementById("audio-output");
  const generatedImage = document.getElementById("generated-image");
  const metadata = document.getElementById("ai-metadata");

  // Create image element
  const img = document.createElement("img");
  img.src = `data:image/png;base64,${data.image}`;
  img.className = "w-full h-auto rounded-lg";
  img.alt = "Generated Image";

  // Clear previous content and add new image
  generatedImage.innerHTML = "";
  generatedImage.appendChild(img);

  // Add metadata
  metadata.innerHTML = `
    <div class="space-y-2">
      <p><strong class="text-github-text">Transcription:</strong> <span class="text-github-muted">${
        data.transcription || "N/A"
      }</span></p>
      <p><strong class="text-github-text">Image Description:</strong> <span class="text-github-muted">${
        data.image_description || "N/A"
      }</span></p>
      <p><strong class="text-github-text">AI Models Used:</strong> <span class="text-github-muted">${
        data.ai_model_used || "N/A"
      }</span></p>
      <p><strong class="text-github-text">Session ID:</strong> <span class="text-github-muted">${
        data.session_id || "N/A"
      }</span></p>
    </div>
  `;

  // Show output section
  outputDiv.classList.remove("hidden");

  // Scroll to output
  outputDiv.scrollIntoView({ behavior: "smooth" });
  
  // Show success message
  toast.show("Image generated and displayed successfully!", "success");
}

// Display generated audio
function displayGeneratedAudio(data) {
  const outputDiv = document.getElementById("image-output");
  const generatedAudio = document.getElementById("generated-audio");
  const metadata = document.getElementById("image-metadata");

  // Create audio element
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.className = "w-full";

  const source = document.createElement("source");
  source.src = `data:audio/mp3;base64,${data.audio}`;
  source.type = "audio/mp3";

  audio.appendChild(source);

  // Clear previous content and add new audio
  generatedAudio.innerHTML = "";
  generatedAudio.appendChild(audio);

  // Add metadata
  metadata.innerHTML = `
    <div class="space-y-2">
      <p><strong class="text-github-text">Image Description:</strong> <span class="text-github-muted">${
        data.image_description || "N/A"
      }</span></p>
      <p><strong class="text-github-text">Voice Used:</strong> <span class="text-github-muted">${
        data.voice_used || "N/A"
      }</span></p>
      <p><strong class="text-github-text">AI Models Used:</strong> <span class="text-github-muted">${
        data.ai_model_used || "N/A"
      }</span></p>
      <p><strong class="text-github-text">Session ID:</strong> <span class="text-github-muted">${
        data.session_id || "N/A"
      }</span></p>
    </div>
  `;

  // Show output section
  outputDiv.classList.remove("hidden");

  // Scroll to output
  outputDiv.scrollIntoView({ behavior: "smooth" });
  
  // Show success message
  toast.show("Audio generated and displayed successfully!", "success");
}

// On document load
document.addEventListener("DOMContentLoaded", function () {

  // Test if all required elements exist
  const requiredElements = [
    "audio-form",
    "image-form",
    "recordButton",
    "audio-file",
    "image_file",
    "audio-display",
    "image-display",
    "audio-preview",
    "image-preview",
  ];

  // requiredElements.forEach((id) => {
  //   const element = document.getElementById(id);
  // });

  // Add event listener to image form
  const imageForm = document.getElementById("image-form");

  if (imageForm) {
    imageForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Get form data
      var formData = new FormData(this);

      // Show image conversion loader
      const imageLoader = document.getElementById("image-conversion-loader");
      if (imageLoader) {
        imageLoader.classList.remove("hidden");
      }

      // Send POST request to server with CSRF token
      fetch("/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.type === "audio") {
            displayGeneratedAudio(data);
            toast.show("Audio generated successfully!", "success");
          } else if (data.type === "error") {
            toast.show(`Error: ${data.error}`, "error");
          } else if (data.type === "quota_error") {
            toast.show(`OpenAI API Quota Error: ${data.error}. Please check your OpenAI billing and try again later.`, "error");
          } else {
            toast.show("An unexpected error occurred. Please try again.", "error");
          }
          // Hide image conversion loader
          if (imageLoader) {
            imageLoader.classList.add("hidden");
          }
        })
        .catch(function (error) {
          toast.show("An error occurred during the AI image-to-audio conversion process. Please try again.", "error");
          // Hide image conversion loader
          if (imageLoader) {
            imageLoader.classList.add("hidden");
          }
        });
    });
  }

  // Add event listener to audio form
  const audioForm = document.getElementById("audio-form");

  if (audioForm) {
    audioForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Check if we have either a file or recorded audio
      const audioFile = document.getElementById("audio-file").files[0];
      const hasRecording =
        document.querySelector("#recordingPreview audio") !== null;

      if (!audioFile && !hasRecording) {
        toast.show("Please either upload an audio file or record audio before generating an image.", "warning");
        return;
      }

      // Get form data
      var formData = new FormData(this);

      // Show audio conversion loader
      const audioLoader = document.getElementById("audio-conversion-loader");
      if (audioLoader) {
        audioLoader.classList.remove("hidden");
      }

      // Send POST request to server with CSRF token
      fetch("/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.type === "image") {
            displayGeneratedImage(data);
            toast.show("Image generated successfully!", "success");
          } else if (data.type === "error") {
            toast.show(`Error: ${data.error}`, "error");
          } else if (data.type === "quota_error") {
            toast.show(`OpenAI API Quota Error: ${data.error}. Please check your OpenAI billing and try again later.`, "error");
          } else {
            toast.show("An unexpected error occurred. Please try again.", "error");
          }
          // Hide audio conversion loader
          if (audioLoader) {
            audioLoader.classList.add("hidden");
          }
        })
        .catch(function (error) {
          toast.show("An error occurred during the AI audio-to-image conversion process. Please try again.", "error");
          // Hide audio conversion loader
          if (audioLoader) {
            audioLoader.classList.add("hidden");
          }
        });
    });
  }

  // Add event listener to record button
  const recordButton = document.getElementById("recordButton");
  if (recordButton) {
    recordButton.addEventListener("click", toggleRecording);
  }

  // Add drag and drop functionality
  setupDragAndDrop();
});

// Preview Image function
function previewImage(event) {
  const input = event.target;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      // Find the image preview container
      const imageDisplay = document.getElementById("image-display");
      const imagePreview = document.getElementById("image-preview");

      if (imagePreview) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "w-full h-auto rounded-lg";
        img.alt = "Image Preview";

        imagePreview.innerHTML = "";
        imagePreview.appendChild(img);

        // Show the display container
        if (imageDisplay) {
          imageDisplay.classList.remove("hidden");
        }
      } else {
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
      // Find the audio preview container
      const audioDisplay = document.getElementById("audio-display");
      const audioPreview = document.getElementById("audio-preview");

      if (audioPreview) {
        const audio = document.createElement("audio");
        audio.setAttribute("controls", "controls");
        audio.className = "w-full";
        const source = document.createElement("source");
        source.setAttribute("src", e.target.result);
        source.setAttribute("type", "audio/wav");
        audio.appendChild(source);

        audioPreview.innerHTML = "";
        audioPreview.appendChild(audio);

        // Show the display container
        if (audioDisplay) {
          audioDisplay.classList.remove("hidden");
        }
      } else {
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Setup drag and drop functionality
function setupDragAndDrop() {
  const uploadAreas = document.querySelectorAll(".upload-area");

  uploadAreas.forEach((area, index) => {
    area.addEventListener("dragover", (e) => {
      e.preventDefault();
      area.classList.add("dragover");
    });

    area.addEventListener("dragleave", (e) => {
      e.preventDefault();
      area.classList.remove("dragover");
    });

    area.addEventListener("drop", (e) => {
      e.preventDefault();
      area.classList.remove("dragover");

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const input = area.querySelector('input[type="file"]');
        if (input) {
          input.files = files;
          input.dispatchEvent(new Event("change"));
        }
      }
    });
  });
}
