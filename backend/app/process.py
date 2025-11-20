import cv2
import numpy as np
import base64

def order_points(pts):
    """Order points: top-left, top-right, bottom-right, bottom-left"""
    rect = np.zeros((4,2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect

def detect_card_and_crop(img):
    """Detect card contour and crop it with perspective correction"""
    orig = img.copy()
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5,5), 0)
    edged = cv2.Canny(blurred, 50, 150)
    contours, _ = cv2.findContours(edged.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
    screenCnt = None

    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4:
            screenCnt = approx
            break

    if screenCnt is None:
        return None

    pts = screenCnt.reshape(4,2)
    rect = order_points(pts)
    (tl, tr, br, bl) = rect
    widthA = np.linalg.norm(br - bl)
    widthB = np.linalg.norm(tr - tl)
    maxWidth = max(int(widthA), int(widthB))
    heightA = np.linalg.norm(tr - br)
    heightB = np.linalg.norm(tl - bl)
    maxHeight = max(int(heightA), int(heightB))

    dst = np.array([
        [0,0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]
    ], dtype="float32")

    M = cv2.getPerspectiveTransform(rect, dst)
    warp = cv2.warpPerspective(orig, M, (maxWidth, maxHeight))
    return warp

def process_image(image_bytes: bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {"error": "image cannot be decoded"}
    cropped_img = detect_card_and_crop(img)
    if cropped_img is not None:
        analysis_img = cropped_img
        card_detected = True
    else:
        analysis_img = img
        card_detected = False
    gray = cv2.cvtColor(analysis_img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5,5), 0)
    edged = cv2.Canny(blurred, 50, 150)
    edge_count= int(np.sum(edged>0))
    total_pixels=edged.size
    edge_ratio= edge_count/total_pixels
    lap=cv2.Laplacian(gray, cv2.CV_64F)
    sharpness= float(lap.var())
    preview_img = cropped_img if cropped_img is not None else img
    small = cv2.resize(preview_img, (preview_img.shape[1]//4, preview_img.shape[0]//4))
    buf = cv2.imencode('.jpg', small, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    thumbnail = buf[1].tobytes()
    b64 = base64.b64encode(thumbnail).decode("utf-8")

    return {
      "edge_ratio": edge_ratio,
      "sharpness": sharpness,
      "preview": f"data:image/jpeg;base64,{b64}"
      "card_detected": card_detected,
        "analysis_on_cropped": card_detected

    }


