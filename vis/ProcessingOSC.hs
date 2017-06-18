-- custom osc send to processing
module ProcessingOSC where
import Sound.Tidal.Stream
import Sound.Tidal.Pattern
import Sound.Tidal.Parse
import Sound.Tidal.OscStream

port = 5000

testShape = Shape {
	params = [
		S "image" Nothing,
		I "npy" (Just 0),
		F "pspeed" (Just 1),
		F "threshold" (Just (-1)),
		F "blur" (Just (-1)),
		F "median" (Just (-1)),
		F "edge" (Just (-1)),
		F "edgel" (Just (-1)),
		F "edgeh" (Just (-1)),
		F "hough" (Just (-1)),
		F "means" (Just (-1))
	],
	cpsStamp = True,
	latency = 0.38
}

testSlang = OscSlang {
	path = "/processing_osc",
	timestamp = NoStamp,
	namedParams = False,
	preamble = []
}

testStream = do
	s <- makeConnection "127.0.0.1" port testSlang
	stream (Backend s $ (\_ _ _ -> return ())) testShape

image = makeS testShape "image"
npy = makeI testShape "npy"
pspeed = makeF testShape "pspeed"
threshold = makeF testShape "threshold"
blur = makeF testShape "blur"
median = makeF testShape "median"
edge = makeF testShape "edge"
edgel = makeF testShape "edgel"
edgeh = makeF testShape "edgeh"
hough = makeF testShape "hough"
means = makeF testShape "means"
