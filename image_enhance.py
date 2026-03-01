import cv2
import numpy as np

def enhance_image(image):
    """
    Enhances an image using contrast enhancement, noise reduction, and sharpening.
    
    Args:
        image: Input image in BGR format (as loaded by cv2.imread)
    
    Returns:
        Enhanced image in BGR format
    """
    # Convert to HSV color space
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Split channels
    h, s, v = cv2.split(hsv)
    
    # 1️⃣ Contrast Enhancement on V channel only
    v_equalized = cv2.equalizeHist(v)
    
    # Merge channels back
    hsv_equalized = cv2.merge([h, s, v_equalized])
    
    # Convert back to BGR
    color_equalized = cv2.cvtColor(hsv_equalized, cv2.COLOR_HSV2BGR)
    
    # 2️⃣ Noise Reduction
    blur = cv2.GaussianBlur(color_equalized, (5,5), 0)
    
    # 3️⃣ Sharpening
    kernel = np.array([[0, -1, 0],
                       [-1, 5,-1],
                       [0, -1, 0]])
    
    sharpened = cv2.filter2D(blur, -1, kernel)
    
    return sharpened