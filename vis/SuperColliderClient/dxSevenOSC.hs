-- custom osc send to processing
module DxSevenOSC where
import Sound.Tidal.Stream
import Sound.Tidal.Pattern
import Sound.Tidal.Parse
import Sound.Tidal.OscStream

port = 57120

dxShape = Shape {
	params = [
		S "notedx" Nothing,
		I "velocitydx" (Just 67),
		F "durationdx" (Just 1),
		F "presetdx" (Just 1)
	],
	cpsStamp = True,
	latency = 0.38
}

dxlang = OscSlang {
	path = "/dx7path",
	timestamp = NoStamp,
	namedParams = False,
	preamble = []
}

dxStream = do
	s <- makeConnection "127.0.0.1" port dxlang
	stream (Backend s $ (\_ _ _ -> return ())) dxShape

notedx = makeF dxShape "notedx"
velocitydx = makeI dxShape "velocitydx"
durationdx = makeF dxShape "durationdx"
presetdx = makeI dxShape "presetdx"
