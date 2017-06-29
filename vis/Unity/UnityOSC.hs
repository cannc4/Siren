-- custom osc send to processing
module UnityOSC where
import Sound.Tidal.Stream
import Sound.Tidal.Pattern
import Sound.Tidal.Parse
import Sound.Tidal.OscStream

port = 5678

unity = Shape {
  params = [ S "text" Nothing,
             I "wait" (Just 1),
             F "size" (Just 0.5),
             F "rotate" (Just 1.0),
             I "vertical" (Just 0),
             I "horizontal" (Just 0),
             F "z" (Just 5.0),
             S "figure" Nothing
           ],
  cpsStamp = False,
  latency = 38
}

unitySlang = OscSlang {
  path = "/",
  timestamp = NoStamp,
  namedParams = False,
  preamble = []
}

unityStream = do
  s <- makeConnection "127.0.0.1" port unitySlang
  stream (Backend s $ (\_ _ _ -> return ())) unity

text       = makeS unity "text"
wait       = makeI unity "wait"
size       = makeI unity "size"
rotate     = makeF unity "rotate"
vertical   = makeI unity "vertical"
horizontal = makeI unity "horizontal"
z          = makeF unity "z"
figure     = makeS unity "figure"
