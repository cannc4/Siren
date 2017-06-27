from __future__ import print_function
import argparse
import math
import re

from threading import Thread
import sys
import cv2
import time

# import the Queue class from Python 3
if sys.version_info >= (3, 0):
	from queue import Queue

# otherwise, import the Queue class for Python 2.7
else:
	from Queue import Queue

class FileVideoStream:
	def __init__(self, path, queueSize=128):
		# initialize the file video stream along with the boolean
		# used to indicate if the thread should be stopped or not
		self.stream = cv2.VideoCapture(path)
		self.stopped = False

		# initialize the queue used to store frames read from
		# the video file
		self.Q = Queue(maxsize=queueSize)

	def start(self):
		# start a thread to read frames from the file video stream
		t = Thread(target=self.update, args=())
		t.daemon = True
		t.start()
		return self

	def update(self):
		# keep looping infinitely
		while True:
			# if the thread indicator variable is set, stop the
			# thread
			if self.stopped:
				break

			# otherwise, ensure the queue has room in it
			if not self.Q.full():
				# read the next frame from the file
				(grabbed, frame) = self.stream.read()

				# if the `grabbed` boolean is `False`, then we have
				# reached the end of the video file
				if not grabbed:
					self.stop()
					break

				# add the frame to the queue
				self.Q.put((grabbed, frame))
		self.Q.task_done()
		self.stream.release()

	def read(self):
		# return next frame in the queue
		return self.Q.get()

	def more(self):
		# return True if there are still frames in the queue
		return self.Q.qsize() > 0

	def stop(self):
		# indicate that the thread should be stopped
		self.stopped = True


class WebcamVideoStream:
	def __init__(self, src=0):
		# initialize the video camera stream and read the first frame
		# from the stream
		self.stream = cv2.VideoCapture(src)
		(self.grabbed, self.frame) = self.stream.read()

		# initialize the variable used to indicate if the thread should
		# be stopped
		self.stopped = False

	def start(self):
		# start the thread to read frames from the video stream
		Thread(target=self.update, args=()).start()
		return self

	def isOpened(self):
		return self.stream.isOpened()

	def update(self):
		# keep looping infinitely until the thread is stopped
		while self.isOpened():
			# if the thread indicator variable is set, stop the thread
			if self.stopped:
				return

			# otherwise, read the next frame from the stream
			(self.grabbed, self.frame) = self.stream.read()
		self.stream.release()

	def read(self):
		# return the frame most recently read
		return (self.grabbed, self.frame)

	def stop(self):
		# indicate that the thread should be stopped
		self.stopped = True

from os import listdir
from os.path import isfile, join

from pythonosc import dispatcher
from pythonosc import osc_server
from numpy import *

import imutils
import scipy.ndimage as ndimage

# signal to main window thread
stopWindow = False

# canny thresholds
canny_low  = 100
canny_high = 200

params = cv2.SimpleBlobDetector_Params()
params.minDistBetweenBlobs = 5.0
params.filterByInertia = True
params.filterByConvexity = False
params.filterByColor = False
params.filterByCircularity = False
params.filterByArea = True
params.minArea = 10.0
params.maxArea = 500.0
params.minThreshold = 40
blobdetect = cv2.SimpleBlobDetector_create(params)

def scale01(input, scale_low = 0 , scale_high = 255):
	scale_low = min(scale_low, scale_high)
	scale_high = max(scale_low, scale_high)

	if input > 0 and input <= 1:
		input = input*(scale_high - scale_low)+scale_low
	return input

def do_siren(unused_addr, unused_nmb,
			name, no, speed, threshold, blur, median,
			edge, edgel, edgeh, hough, mean_shift):
	# try:
	# parameters
	print(name, no, speed, threshold, blur, median, edge, edgel, edgeh)

	# relative or global path of media folder
	# PATH = "../media/"
	PATH = "C:/Users/Mert/Dropbox/Whalehouse/99s/"

	# determines if any selector on eg `sample_name:2`
	try:
		no = int(re.search('(?<=:)\w+', name).group(0))
		name = re.search('\w+(?=:)', name).group(0)
	except AttributeError:  pass

	# gets the corresponging sample number from the folder
	filenames = []
	try:
		filenames = [f for f in listdir(PATH+name+"/mov") if isfile(join(PATH+name+"/mov", f))]
	except FileNotFoundError:
		print("FileNotFoundError caught")
		pass

	# If there are files in the directory
	if len(filenames) > 0:
		filename = PATH + name + "/mov/" + filenames[ no%len(filenames) ]

		vs = FileVideoStream(filename).start()
		time.sleep(.1)

		# keep first frame for reference
		(_, firstFrame) = vs.read()
		firstFrame = cv2.resize(firstFrame,(180,144))

		# for blob tracking
		accum = float32(cv2.cvtColor(firstFrame, cv2.COLOR_BGR2GRAY))

		while vs.more():
			(ret, frame) = vs.read()

			# default speed is 30 fps
			# if `speed` becomes 2 it becomes 60 fps
			if speed < 0:
				speed = 1
			time.sleep(1./(30.*speed))

			if ret:
				try:
					frame = cv2.resize(frame,(180,144))
					if not threshold == -1:
						threshold = scale01(threshold)
						threshold = threshold % 255
						frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
						ret, frame = cv2.threshold(frame, threshold, 255, cv2.THRESH_BINARY)

					if not blur == -1:
						blur = scale01(blur, 0, 15)
						frame = cv2.GaussianBlur(frame, (0,0), blur)

					if not median == -1:
						median = scale01(median, 3, 9)
						frame = ndimage.median_filter(frame, size=int(median))

					# canny edge parameters
					if not edgel == -1:
						global canny_low
						canny_low = edgel
					if not edgeh == -1:
						global canny_high
						canny_high = edgeh

					if not edge == -1 and (edge == 3 or edge == 5 or edge == 7):
						frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
						frame = cv2.Canny(frame,
							min(canny_low, canny_high),
							max(canny_low, canny_high),
							apertureSize = int(edge))

					if not hough == -1:
						gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
						edges = cv2.Canny(gray, 50, 150, apertureSize = 3)
						minLineLength = hough
						maxLineGap = 10
						lines = cv2.HoughLinesP(edges, 1, pi / 180, 12, minLineLength, maxLineGap)
						if lines is not None:
							for x1,y1,x2,y2 in lines[0]:
								cv2.line(frame, (x1,y1), (x2,y2),
								(140,140,20),
								2)

					if not mean_shift == -1:
						if mean_shift > 1:
							mean_shift = 1.

						gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
						cv2.accumulateWeighted(gray, accum, mean_shift)
						difference = cv2.absdiff(gray, accum.astype(uint8))

						keypoints = blobdetect.detect(difference)

						# frame = difference

						for kp in keypoints:
							average_color_per_row = average(frame, axis=0)
							ac = average(average_color_per_row, axis=0)
							cv2.circle(frame, (int(kp.pt[0]),int(kp.pt[1])),
											  int(kp.size),
											  (ac[2]*2, ac[1], ac[0]),
											  2, 8)

					# frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
					# edges = cv2.Canny(frame, 50, 150, apertureSize = 5)
					# lines = cv2.HoughLines(edges, 1, np.pi / 180, 200)
					# if lines.any() == None:
					#     raise
					#
					# for rho, theta in lines[0]:
					#     a = np.cos(theta)
					#     b = np.sin(theta)
					#     x0 = a*rho
					#     y0 = b*rho
					#     x1 = int(x0 + 1000*(-b))
					#     y1 = int(y0 + 1000*(a))
					#     x2 = int(x0 - 1000*(-b))
					#     y2 = int(y0 - 1000*(a))
					#
					#     cv2.line(frame, (x1,y1), (x2,y2), color=(255,255,255))

					# frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
					# frame = dstack([frame, frame, frame])

					cv2.imshow('Siren Message Result',frame)
				except cv2.error:
					print("cv2 error")
					pass
	# except ValueError:
	# 	print("ValueError exception caught")
	# 	pass

def window():
	while True:
		cv2.namedWindow('Siren Message Result', cv2.WINDOW_NORMAL)

		if stopWindow:
			break

		if cv2.waitKey(1) & 0xFF == ord('q'):
			break

if __name__ == "__main__":
	parser = argparse.ArgumentParser()
	parser.add_argument("--ip", default="127.0.0.1", help="The ip to listen on")
	parser.add_argument("--port", type=int, default=5000, help="The port to listen on")
	args = parser.parse_args()

	Thread(target=window, args=()).start()

	dispatcher = dispatcher.Dispatcher()
	dispatcher.map("/processing_osc", do_siren)

	try:
		server = osc_server.ThreadingOSCUDPServer( (args.ip, args.port), dispatcher)
		print("Serving on {}".format(server.server_address))
		server.serve_forever()
	except KeyboardInterrupt:
		stopWindow = True
		server.server_close()
		cv2.destroyAllWindows()
		pass
