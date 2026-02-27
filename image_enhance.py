import cv2
import numpy as np
from matplotlib import pyplot as plt

# Load image
image = cv2.imread("dawngga.jpeg")

if image is None:
    print("Image not found")
    exit()

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

# Display
plt.figure(figsize=(10,8))

plt.subplot(2,2,1)
plt.title("Original")
plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
plt.axis("off")

plt.subplot(2,2,2)
plt.title("Contrast Enhanced (Color)")
plt.imshow(cv2.cvtColor(color_equalized, cv2.COLOR_BGR2RGB))
plt.axis("off")

plt.subplot(2,2,3)
plt.title("Blurred")
plt.imshow(cv2.cvtColor(blur, cv2.COLOR_BGR2RGB))
plt.axis("off")

plt.subplot(2,2,4)
plt.title("Final Enhanced (Color)")
plt.imshow(cv2.cvtColor(sharpened, cv2.COLOR_BGR2RGB))
plt.axis("off")

plt.tight_layout()
plt.show()