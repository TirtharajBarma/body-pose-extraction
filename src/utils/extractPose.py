import sys
import json
import cv2
import mediapipe as mp
import ssl
import certifi

# Fix SSL certificate issues on macOS
ssl._create_default_https_context = ssl._create_unverified_context

def extract_pose_keypoints(image_path):
    """
    Extract 33 pose keypoints from an image using MediaPipe Pose.
    Returns JSON array of keypoints with id, name, x, y, z, and visibility.
    """
    mp_pose = mp.solutions.pose
    
    # Landmark names for 33 keypoints
    landmark_names = [
        'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 
        'right_eye_inner', 'right_eye', 'right_eye_outer',
        'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
        'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
        'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
        'left_index', 'right_index', 'left_thumb', 'right_thumb',
        'left_hip', 'right_hip', 'left_knee', 'right_knee',
        'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
        'left_foot_index', 'right_foot_index'
    ]
    
    try:
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image: {image_path}")
        
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Initialize pose model
        with mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            min_detection_confidence=0.5
        ) as pose:
            
            # Process image
            results = pose.process(image_rgb)
            
            if not results.pose_landmarks:
                raise ValueError("No pose detected in the image")
            
            # Extract keypoints
            keypoints = []
            for idx, landmark in enumerate(results.pose_landmarks.landmark):
                keypoint = {
                    "id": idx,
                    "name": landmark_names[idx],
                    "x": round(landmark.x, 4),
                    "y": round(landmark.y, 4),
                    "z": round(landmark.z, 4),
                    "visibility": round(landmark.visibility, 4)
                }
                keypoints.append(keypoint)
            
            return keypoints
            
    except Exception as e:
        raise Exception(f"Error extracting pose: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}), file=sys.stderr)
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    try:
        keypoints = extract_pose_keypoints(image_path)
        print(json.dumps(keypoints))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
