# USAGE
# python click_and_crop.py --image jurassic_park_kitchen.jpg

# import the necessary packages
import argparse
import cv2

# initialize the list of reference points and boolean indicating
# whether cropping is being performed or not
refPt = []
cropping = False
ref=[]

def click_and_crop(event, x, y, flags, param):
	# grab references to the global variables
	global refPt, cropping,ref
	
	# if the left mouse button was clicked, record the starting
	# (x, y) coordinates and indicate that cropping is being
	# performed
	if event == cv2.EVENT_LBUTTONDOWN:
		ref=[]
		ref.append((x, y))
		print(ref)
		cropping = True

	# check to see if the left mouse button was released
	elif event == cv2.EVENT_LBUTTONUP:
		# record the ending (x, y) coordinates and indicate that
		# the cropping operation is finished
		ref.append((x, y))
		print(ref)
		cropping = False

		# draw a rectangle around the region of interest

		cv2.rectangle(image, ref[0], ref[1], (0, 255, 0), 2)
		refPt.append(ref)
		print(refPt)
		cv2.imshow("image", image)

def parse_name(count,name):
	if ".png" in name:
		name=name.replace(".png","crop-"+str(count)+".png")
	elif ".jpeg" in name:
		name=name.replace(".jpeg","crop-"+str(count)+".jpeg")
	elif ".jpg" in name:
		name=name.replace(".jpg","crop-"+str(count)+".jpg")
	return name


# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-i", "--image", required=True, help="Path to the image")
args = vars(ap.parse_args())

# load the image, clone it, and setup the mouse callback function
image = cv2.imread(args["image"])
clone = image.copy()
cv2.namedWindow("image")
cv2.moveWindow("image", 40,30)  # Move it to (40,30)
cv2.setMouseCallback("image", click_and_crop)

# keep looping until the 'q' key is pressed
while True:
	# display the image and wait for a keypress
	
	cv2.imshow("image", image)
	key = cv2.waitKey(1) & 0xFF

	# if the 'r' key is pressed, reset the cropping region
	if key == ord("r"):
		image = clone.copy()

	# if the 'c' key is pressed, break from the loop
	elif key == ord("c"):
		break

# if there are two reference points, then crop the region of interest
# from teh image and display it
if len(refPt) > 0:
	count=0
	for j in refPt:
		print(j[0])
		roi = clone[j[0][1]:j[1][1], j[0][0]:j[1][0]]
		cv2.imshow("ROI", roi)
		image_name=parse_name(count,args["image"])
		print(image_name)
		cv2.imwrite(image_name, roi)
		count+=1
		#cv2.waitKey(0)

# close all open windows
cv2.destroyAllWindows()
