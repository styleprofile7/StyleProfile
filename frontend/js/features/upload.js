/**
 * IMAGE UPLOAD & OUTFIT SUBMISSION FEATURE
 * 
 * Manages the complete image upload workflow including drag-drop interface,
 * image compression, form submission, and Firestore/Cloud Storage integration.
 * 
 * Core Functions:
 * - setupDragDrop(): Initialize drag-drop event listeners on upload area
 *   Handles dragenter, dragover, dragleave, drop events
 *   Visual feedback during drag operations
 * 
 * - handleImageSelect(event): Process selected/dropped image file
 *   Validates file type (JPG, PNG, WebP), displays preview
 *   Stores in window.selectedFile for submission
 * 
 * - compressImage(file, quality, maxWidth): Compress image before upload
 *   Reduces file size to max 800KB for bandwidth efficiency
 *   Uses canvas API for client-side compression
 *   Returns Blob for upload to Cloud Storage
 * 
 * - attachUploadFormHandler(): Attach submit listener to upload form
 *   Called by router when upload.html page is injected
 *   Ensures form submission works after dynamic page loading
 * 
 * - handleSubmit(e): Process form submission
 *   Collects outfit metadata (tags, brands, occasion, caption)
 *   Uploads image to Firebase Cloud Storage
 *   Creates outfit document in Firestore with metadata
 *   Handles "Add to Closet" option
 *   Updates user points/posts count
 *   Shows success toast, redirects to home
 * 
 * Outfit Data Structure (Firestore):
 * {
 *   userId, userName, userImage, imageUrl, imageFile,
 *   tags, brands, occasion, caption, rating, likes,
 *   likedBy, ratingDistribution, timestamp, addedToCloset
 * }
 * 
 * Exported Functions: window.setupDragDrop, window.handleImageSelect, window.compressImage
 * 
 * Dependencies: firebase.js, state.js, toast.js, navigation.js
 * Initialized by: router.js afterPageLoad('upload') calls setupDragDrop() + attachUploadFormHandler()
 */

function setupDragDrop() {
  const uploadArea = document.getElementById('uploadArea');
  if (!uploadArea) {
    console.error('setupDragDrop: uploadArea element not found!');
    return;
  }

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragging'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragging'), false);
  });

  uploadArea.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageSelect({ target: { files } });
    }
  }, false);
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) {
    showToast('No file selected', 'error');
    return;
  }

  if (!file.type.match('image.*')) {
    showToast('Please select an image file (JPG, PNG, WebP)', 'error');
    document.getElementById('imageInput').value = '';
    return;
  }

  const maxSize = 15 * 1024 * 1024;
  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    showToast(`Image is ${sizeMB}MB. Maximum size is 15MB. Please choose a smaller image.`, 'error');
    document.getElementById('imageInput').value = '';
    return;
  }

  selectedFile = file;
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  showToast(`Processing image (${sizeMB}MB)...`, 'info');

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const img = new Image();
      img.onload = () => {
        compressImage(img, file.type).then(compressedDataUrl => {
          selectedImage = compressedDataUrl;
          document.getElementById('imagePreview').src = selectedImage;
          document.getElementById('imagePreview').style.display = 'block';
          document.getElementById('uploadForm').style.display = 'block';
          const compressedSize = ((compressedDataUrl.length * 0.75) / (1024 * 1024)).toFixed(2);
          showToast(`Image ready! (Compressed to ${compressedSize}MB)`, 'success');
        }).catch(err => {
          console.error('Compression error:', err);
          showToast('Failed to process image', 'error');
        });
      };
      img.onerror = () => {
        showToast('Failed to load image', 'error');
        selectedImage = null;
        selectedFile = null;
      };
      img.src = e.target.result;
    } catch (error) {
      console.error('Image load error:', error);
      showToast('Failed to load image', 'error');
      selectedImage = null;
      selectedFile = null;
    }
  };
  reader.onerror = () => {
    showToast('Failed to read file', 'error');
    selectedImage = null;
    selectedFile = null;
    document.getElementById('imageInput').value = '';
  };
  reader.readAsDataURL(file);
}

function compressImage(img, mimeType) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;

    const maxSizeBytes = 800 * 1024;
    const maxDimension = 1920;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = (height / width) * maxDimension;
        width = maxDimension;
      } else {
        width = (width / height) * maxDimension;
        height = maxDimension;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.8;
    let iterations = 0;
    const maxIterations = 10;

    function tryCompress() {
      const dataUrl = canvas.toDataURL(mimeType || 'image/jpeg', quality);
      const sizeBytes = (dataUrl.length * 0.75);

      if (sizeBytes <= maxSizeBytes || iterations >= maxIterations || quality <= 0.1) {
        resolve(dataUrl);
      } else {
        quality -= 0.1;
        iterations++;
        setTimeout(tryCompress, 10);
      }
    }

    tryCompress();
  });
}

function attachUploadFormHandler() {
  const form = document.getElementById('uploadForm');
  if (!form) return;
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!selectedImage || !currentUser) {
      showToast('Please select an image first', 'error');
      return;
    }

    const btn = document.getElementById('uploadSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Uploading...';

    const tags = document.getElementById('outfitTags').value.split(',').map(t => t.trim()).filter(t => t);
    const addToCloset = document.getElementById('addToCloset').checked;

    try {
      const imageSizeInMB = (selectedImage.length * 0.75) / (1024 * 1024);

      if (imageSizeInMB > 1) {
        showToast('Compressing image for upload...', 'info');
        if (selectedFile && storage && firebaseInitialized) {
          try {
            const timestamp = Date.now();
            const fileName = selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const storageRef = storage.ref(`outfits/${currentUser.uid}/${timestamp}_${fileName}`);

            showToast('Uploading to cloud storage...', 'info');
            const uploadTask = await storageRef.put(selectedFile);
            const imageURL = await uploadTask.ref.getDownloadURL();

            const outfitData = {
              userId: currentUser.uid,
              userName: currentUser.name,
              userInitial: currentUser.initial,
              userProfileImage: currentUser.profileImage || null,
              personality: currentUser.personality,
              image: imageURL,
              tags,
              brands: document.getElementById('outfitBrands').value.trim(),
              occasion: document.getElementById('outfitOccasion').value.trim(),
              caption: document.getElementById('outfitCaption').value.trim(),
              inCloset: addToCloset,
              ratings: [],
              avgRating: 0,
              totalRatings: 0,
              comments: [],
              likes: [],
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('outfits').add(outfitData);
          } catch (storageError) {
            console.error('Storage upload failed:', storageError);
            throw new Error('Image too large. Please compress it or enable Firebase Storage.');
          }
        } else {
          throw new Error('Image too large for direct upload. Please compress it or use a smaller image.');
        }
      } else {
        const outfitData = {
          userId: currentUser.uid,
          userName: currentUser.name,
          userInitial: currentUser.initial,
          userProfileImage: currentUser.profileImage || null,
          personality: currentUser.personality,
          image: selectedImage,
          tags,
          brands: document.getElementById('outfitBrands').value.trim(),
          occasion: document.getElementById('outfitOccasion').value.trim(),
          caption: document.getElementById('outfitCaption').value.trim(),
          inCloset: addToCloset,
          ratings: [],
          avgRating: 0,
          totalRatings: 0,
          comments: [],
          likes: [],
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('outfits').add(outfitData);
      }

      await db.collection('users').doc(currentUser.uid).update({
        postsCount: firebase.firestore.FieldValue.increment(1),
        points: firebase.firestore.FieldValue.increment(50)
      });

      currentUser.points = (currentUser.points || 0) + 50;
      currentUser.postsCount = (currentUser.postsCount || 0) + 1;
      document.getElementById('userPoints').textContent = currentUser.points;

      document.getElementById('uploadForm').reset();
      document.getElementById('imagePreview').style.display = 'none';
      document.getElementById('imagePreview').src = '';
      document.getElementById('uploadForm').style.display = 'none';
      document.getElementById('imageInput').value = '';
      selectedImage = null;
      selectedFile = null;

      showToast('Outfit posted successfully! +50 points', 'success');
      await loadOutfits();
      setTimeout(() => showPage('home'), 500);
    } catch (error) {
      console.error('Full upload error:', error);
      let errorMsg = 'Upload failed. ';
      if (error.code === 'permission-denied') {
        errorMsg += 'Database permission denied. Please check Firestore rules.';
      } else if (error.code === 'unavailable') {
        errorMsg += 'Network error. Check your internet connection.';
      } else if (error.message && error.message.includes('too large')) {
        errorMsg = error.message;
      } else if (error.message) {
        errorMsg += error.message;
      } else {
        errorMsg += 'Please try again.';
      }
      showToast(errorMsg, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Post Outfit';
    }
  });
}

window.handleImageSelect = handleImageSelect;
window.setupDragDrop = setupDragDrop;
window.attachUploadFormHandler = attachUploadFormHandler;
