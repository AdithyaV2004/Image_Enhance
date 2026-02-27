let opencvReady = false;

// Called when OpenCV.js is loaded
function onOpenCvReady() {
    opencvReady = true;
    console.log('OpenCV.js is ready');
}

// Get DOM elements
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const loading = document.getElementById('loading');
const results = document.getElementById('results');

// File input change handler
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        fileName.textContent = file.name;
        processImage(file);
    }
});

function processImage(file) {
    if (!opencvReady) {
        alert('OpenCV.js is still loading. Please wait a moment and try again.');
        return;
    }

    // Show loading, hide results
    loading.classList.add('show');
    results.classList.remove('show');

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Small delay to ensure UI updates
            setTimeout(() => {
                enhanceImage(img);
            }, 100);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function enhanceImage(img) {
    try {
        // Create a temporary canvas to load the image
        let src = cv.imread(img);
        
        // 1. Display original
        displayOnCanvas('original', src);
        
        // 2. Contrast Enhancement on V channel (HSV color space)
        let hsv = new cv.Mat();
        cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
        cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
        
        // Split HSV channels
        let hsvChannels = new cv.MatVector();
        cv.split(hsv, hsvChannels);
        
        // Get V channel and equalize
        let vChannel = hsvChannels.get(2);
        cv.equalizeHist(vChannel, vChannel);
        
        // Merge back
        hsvChannels.set(2, vChannel);
        let hsvEqualized = new cv.Mat();
        cv.merge(hsvChannels, hsvEqualized);
        
        // Convert back to RGB
        let colorEqualized = new cv.Mat();
        cv.cvtColor(hsvEqualized, colorEqualized, cv.COLOR_HSV2RGB);
        displayOnCanvas('contrastEnhanced', colorEqualized);
        
        // 3. Noise Reduction (Gaussian Blur)
        let blurred = new cv.Mat();
        let ksize = new cv.Size(5, 5);
        cv.GaussianBlur(colorEqualized, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);
        displayOnCanvas('blurred', blurred);
        
        // 4. Sharpening
        let sharpened = new cv.Mat();
        let kernel = cv.matFromArray(3, 3, cv.CV_32F, [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ]);
        cv.filter2D(blurred, sharpened, cv.CV_8U, kernel);
        displayOnCanvas('finalEnhanced', sharpened);
        
        // Cleanup
        src.delete();
        hsv.delete();
        hsvChannels.delete();
        vChannel.delete();
        hsvEqualized.delete();
        colorEqualized.delete();
        blurred.delete();
        sharpened.delete();
        kernel.delete();
        
        // Hide loading, show results
        loading.classList.remove('show');
        results.classList.add('show');
        
    } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try another image.');
        loading.classList.remove('show');
    }
}

function displayOnCanvas(canvasId, mat) {
    const canvas = document.getElementById(canvasId);
    
    // Set canvas dimensions to match image
    canvas.width = mat.cols;
    canvas.height = mat.rows;
    
    // Convert to RGBA if needed for display
    let displayMat = new cv.Mat();
    if (mat.channels() === 3) {
        cv.cvtColor(mat, displayMat, cv.COLOR_RGB2RGBA);
    } else {
        displayMat = mat.clone();
    }
    
    // Display on canvas
    cv.imshow(canvas, displayMat);
    
    // Cleanup
    displayMat.delete();
}
