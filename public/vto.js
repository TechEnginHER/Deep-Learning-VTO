// Client-side JavaScript

document.addEventListener('DOMContentLoaded', function () {
  // Get modal elements
  var humanModal = document.getElementById('humanModal');
  var clothModal = document.getElementById('clothModal');
  var recommendModal = document.getElementById('recommendModal');

  // Get button elements
  var refHumImg = document.getElementById('ref-hum-img');
  var refCloImg = document.getElementById('ref-clo-img');
  var recommendBtn = document.getElementById('recommend');

  // Get close buttons
  var closeButtons = document.querySelectorAll('.close');

  // Event listeners for opening modals
  refHumImg.addEventListener('click', function(event) {
      event.preventDefault();
      humanModal.style.display = 'block';
  });

  refCloImg.addEventListener('click', function(event) {
      event.preventDefault();
      clothModal.style.display = 'block';
  });

  recommendBtn.addEventListener('click', function(event) {
      event.preventDefault();
      recommendModal.style.display = 'block';
      populateRecommendations(); // Function to populate images in modal
  });

  // Event listener for closing modals
  closeButtons.forEach(function(button) {
      button.addEventListener('click', function() {
          this.closest('.modal').style.display = 'none';
      });
  });

  // Function to animate modal appearance
  function animateModal(modal) {
      modal.style.animation = 'slideDown 0.5s';
  }

  // Function to populate images in recommendation modal
  function populateRecommendations() {
      var recommendContent = document.querySelector('.recommend-content');
      recommendContent.innerHTML = '';
      for (var i = 1; i <= 36; i++) { // Assuming you want 36 images (6 rows x 6 columns)
          var img = document.createElement('img');
          img.src = '/wardrobe' + i + '.jpg'; // Update with your image path
          img.alt = 'Wardrobe item ' + i;
          img.addEventListener('click', function() {
              selectImage(this);
          });
          recommendContent.appendChild(img);
      }
  }

  // Function to handle image selection in recommendation modal
  function selectImage(imgElement) {
      // Remove 'selected' class from all images
      var recommendImages = document.querySelectorAll('.recommend-content img');
      recommendImages.forEach(function(img) {
          img.classList.remove('selected');
      });

      // Add 'selected' class to the clicked image
      imgElement.classList.add('selected');

      // Display the selected image info in the span below the garment image input
      var selectedImageUrl = imgElement.src;
      var garmImgInput = document.querySelector('input[name="garm_img"]');
      var garmImgInfo = document.getElementById('garmImgInfo');

      if (garmImgInfo) {
          garmImgInfo.textContent = `Wardrobe Image Selected`;
      } else {
          var paragraph = document.createElement('p');
          paragraph.id = 'garmImgInfo';
          paragraph.textContent = `Wardrobe Image Selected`;
          var wardsel = document.getElementById('ward-sel');
          wardsel .appendChild(paragraph);
      }

      // Remove 'required' attribute from garm_img input
      garmImgInput.removeAttribute('required');
  }

  // Close modals when clicking outside the modal content
  window.onclick = function(event) {
      if (event.target === humanModal) {
          humanModal.style.display = 'none';
      }
      if (event.target === clothModal) {
          clothModal.style.display = 'none';
      }
      if (event.target === recommendModal) {
          recommendModal.style.display = 'none';
      }
  };

  // Smooth scroll to main-section when Try Now! button is clicked
  var tryOnButton = document.getElementById('tryOnButton');
  tryOnButton.addEventListener('click', function() {
      var mainSection = document.getElementById('main-section');
      mainSection.scrollIntoView({ behavior: 'smooth' });
  });

  // Handle form submission with latest garment input
  var submitButton = document.getElementById('SubmitButton');
  submitButton.addEventListener('click', function(event) {
      event.preventDefault();

      var garmImgInput = document.querySelector('input[name="garm_img"]');
      var garmImgInfo = document.getElementById('garmImgInfo');
      var formData = new FormData();

      if (garmImgInfo) {
          // Use selected image from recommendation modal
          var selectedImageUrl = garmImgInfo.textContent.split(': ')[1];
          formData.append('garm_img', selectedImageUrl);
      } else {
          // Use uploaded image from input field
          var garmFile = document.querySelector('input[name="garm_img"]').files[0];
          formData.append('garm_img', garmFile);
      }

         // Continue with form submission
         const loadingMessage = document.getElementById('loadingMessage');
         document.getElementById('full-page').style.zIndex = '1000';
         loadingMessage.style.display = 'block';
         document.getElementById('loadingMessageP').scrollIntoView({behavior: "auto"})
         
 
         // Get human image file
         var humanFile = document.querySelector('input[name="human_img"]').files[0];
         formData.append('human_img', humanFile);

         // Start countdown
          let countdownElement = document.getElementById('countdown');
          let countdown = 60;

          const countdownInterval = setInterval(() => {
          countdown -= 1;
          countdownElement.textContent = countdown;
          if (countdown === 0) {
          clearInterval(countdownInterval);
          }
          }, 1000);
 
         // Send the form data to the server using fetch API
         fetch('/upload', {
             method: 'POST',
             body: formData
         })
         .then(response => {
             if (!response.ok) {
                 throw new Error('Network response was not ok');
             }
             return response.text();
         })
         .then(result => {
             // Replace the current page content with the result HTML
             document.open();
             document.write(result);
             document.close();
         })
         .catch(error => {
             console.error('Error uploading images:', error);
             loadingMessage.style.display = 'none';
             document.getElementById('full-page').style.zIndex = 'auto';
             alert('Error uploading images. Please try again.');
         });
     });
 });
 
