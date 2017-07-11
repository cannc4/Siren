import qualified Network.Socket as N
import Sound.OSC.FD
import Sound.Tidal.Tempo

set_udp_opt k v (UDP s) = N.setSocketOption s k v
get_udp_opt k (UDP s) = N.getSocketOption s k

main = do fd <- openUDP "127.0.0.1" 3002
          set_udp_opt N.Broadcast 1 fd
          clocked $ onTick fd 

tempo_n = 1

onTick fd tempo tick_n = sendOSC fd $ Message "/tick" [int32 tick_n,
                                                       int32 tempo_n,
                                                       float (cps tempo)
                                                      ]
