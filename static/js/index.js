"use strict";

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
  console.log("toggleRecording called");
  const recordButton = document.getElementById("recordButton");
  const recordingStatus = document.getElementById("recordingStatus");
  const recordingPreview = document.getElementById("recordingPreview");

  console.log("Elements found:", {
    recordButton: !!recordButton,
    recordingStatus: !!recordingStatus,
    recordingPreview: !!recordingPreview,
  });

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
          "github-button px-4 py-2 rounded-lg text-white font-medium mt-3";
        submitButton.textContent = "Submit Recording";
        submitButton.onclick = () => submitRecordedAudio(audioUrl);

        // Clear previous content and add new content
        recordingPreview.innerHTML = "";
        recordingPreview.appendChild(audio);
        recordingPreview.appendChild(submitButton);
        recordingPreview.classList.remove("hidden");

        recordingStatus.textContent = "Recording completed successfully!";
        recordingStatus.className = "text-sm text-green-400";
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        recordingStatus.textContent = "Error: Recording failed";
        recordingStatus.className = "text-sm text-red-400";
      };

      mediaRecorder.start(1000); // Collect data every second
      isRecording = true;
      recordButton.textContent = "⏹️ Stop Recording";
      recordButton.className =
        "bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium";
      recordingStatus.textContent = "Recording... Speak now!";
      recordingStatus.className = "text-sm text-red-400";
    } catch (error) {
      console.error("Error accessing microphone:", error);
      recordingStatus.textContent = `Error: ${error.message}`;
      recordingStatus.className = "text-sm text-red-400";

      // Show helpful message
      if (error.name === "NotAllowedError") {
        recordingStatus.textContent =
          "Error: Microphone access denied. Please allow microphone access and try again.";
      } else if (error.name === "NotFoundError") {
        recordingStatus.textContent =
          "Error: No microphone found. Please connect a microphone and try again.";
      }
    }
  } else {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    isRecording = false;
    recordButton.textContent = "🎤 Start Recording";
    recordButton.className =
      "github-button px-4 py-2 rounded-lg text-white font-medium";
    recordingStatus.textContent = "Recording stopped";
    recordingStatus.className = "text-sm text-github-muted";
  }
}

async function submitRecordedAudio(audioUrl) {
  console.log("submitRecordedAudio called");
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
      } else {
        console.error("Unknown response type:", data.type);
      }

      // Hide loader
      if (audioLoader) {
        audioLoader.classList.add("hidden");
      }
    };
  } catch (error) {
    console.error("Error submitting recorded audio:", error);
    alert(
      "An error occurred while submitting the recorded audio. Please try again."
    );
  }
}

// Display generated image
function displayGeneratedImage(data) {
  console.log("displayGeneratedImage called with:", data);
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
}

// Display generated audio
function displayGeneratedAudio(data) {
  console.log("displayGeneratedAudio called with:", data);
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
}

// On document load
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, setting up event listeners");

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

  console.log("Checking required elements:");
  requiredElements.forEach((id) => {
    const element = document.getElementById(id);
    console.log(`${id}: ${!!element}`);
  });

  // Add event listener to image form
  const imageForm = document.getElementById("image-form");
  console.log("Image form found:", !!imageForm);

  if (imageForm) {
    imageForm.addEventListener("submit", function (event) {
      console.log("Image form submitted");
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
          console.log("Response status:", response.status);
          return response.json();
        })
        .then((data) => {
          console.log("Image form response:", data);
          if (data.type === "audio") {
            displayGeneratedAudio(data);
          } else if (data.type === "error") {
            console.error("Server error:", data.error);
            alert(`Error: ${data.error}`);
          } else if (data.type === "quota_error") {
            console.error("Quota error:", data.error);
            alert(`OpenAI API Quota Error: ${data.error}\n\nPlease check your OpenAI billing and try again later.`);
          } else {
            console.error("Unknown response type:", data.type);
            console.error("Full response data:", data);
            alert("An unexpected error occurred. Please try again.");
          }
          // Hide image conversion loader
          if (imageLoader) {
            imageLoader.classList.add("hidden");
          }
        })
        .catch(function (error) {
          console.error("Image form error:", error);
          alert(
            "An error occurred during the AI image-to-audio conversion process. Please try again."
          );
          // Hide image conversion loader
          if (imageLoader) {
            imageLoader.classList.add("hidden");
          }
        });
    });
  }

  // Add event listener to audio form
  const audioForm = document.getElementById("audio-form");
  console.log("Audio form found:", !!audioForm);

  if (audioForm) {
    audioForm.addEventListener("submit", function (event) {
      console.log("Audio form submitted");
      event.preventDefault();

      // Check if we have either a file or recorded audio
      const audioFile = document.getElementById("audio-file").files[0];
      const hasRecording =
        document.querySelector("#recordingPreview audio") !== null;

      console.log("Audio form check:", {
        audioFile: !!audioFile,
        hasRecording: hasRecording,
      });

      if (!audioFile && !hasRecording) {
        alert(
          "Please either upload an audio file or record audio before generating an image."
        );
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
          console.log("Response status:", response.status);
          return response.json();
        })
        .then((data) => {
          console.log("Audio form response:", data);
          if (data.type === "image") {
            displayGeneratedImage(data);
          } else if (data.type === "error") {
            console.error("Server error:", data.error);
            alert(`Error: ${data.error}`);
          } else if (data.type === "quota_error") {
            console.error("Quota error:", data.error);
            alert(`OpenAI API Quota Error: ${data.error}\n\nPlease check your OpenAI billing and try again later.`);
          } else {
            console.error("Unknown response type:", data.type);
            console.error("Full response data:", data);
            alert("An unexpected error occurred. Please try again.");
          }
          // Hide audio conversion loader
          if (audioLoader) {
            audioLoader.classList.add("hidden");
          }
        })
        .catch(function (error) {
          console.error("Audio form error:", error);
          alert(
            "An error occurred during the AI audio-to-image conversion process. Please try again."
          );
          // Hide audio conversion loader
          if (audioLoader) {
            audioLoader.classList.add("hidden");
          }
        });
    });
  }

  // Add drag and drop functionality
  setupDragAndDrop();
});

// Preview Image function
function previewImage(event) {
  console.log("previewImage called");
  const input = event.target;
  if (input.files && input.files[0]) {
    console.log("Image file selected:", input.files[0].name);
    const reader = new FileReader();
    reader.onload = function (e) {
      // Find the image preview container
      const imageDisplay = document.getElementById("image-display");
      const imagePreview = document.getElementById("image-preview");

      console.log("Image preview elements:", {
        imageDisplay: !!imageDisplay,
        imagePreview: !!imagePreview,
      });

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
        console.error("Image preview element not found!");
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Preview Audio function
function previewAudio(event) {
  console.log("previewAudio called");
  const input = event.target;
  if (input.files && input.files[0]) {
    console.log("Audio file selected:", input.files[0].name);
    const reader = new FileReader();
    reader.onload = function (e) {
      // Find the audio preview container
      const audioDisplay = document.getElementById("audio-display");
      const audioPreview = document.getElementById("audio-preview");

      console.log("Audio preview elements:", {
        audioDisplay: !!audioDisplay,
        audioPreview: !!audioPreview,
      });

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
        console.error("Audio preview element not found!");
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Setup drag and drop functionality
function setupDragAndDrop() {
  console.log("Setting up drag and drop");
  const uploadAreas = document.querySelectorAll(".upload-area");
  console.log("Upload areas found:", uploadAreas.length);

  uploadAreas.forEach((area, index) => {
    console.log(`Setting up upload area ${index + 1}`);
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
