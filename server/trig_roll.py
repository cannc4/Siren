## This script triggers pattern rolls on the sequencer of Siren.
## incoming data format:
##  -- roll_name, roll_note, start, stop, speed, orbit, loopCount

import sys, os, time, json, numpy as np

from pythonosc import osc_message_builder
from pythonosc import udp_client
from pythonosc import osc_server
from pythonosc import dispatcher
from pythonosc.udp_client import SimpleUDPClient

osc_udp_client = None
current_milli_time = lambda: int(round(time.time() * 1000))
osc_udp_client = SimpleUDPClient("127.0.0.1", 57120)

def icmap(value, istart, istop, ostart, ostop):
    temp = int(ostart + (ostop - ostart) * ((value - istart) / (istop - istart)))
    if temp >= ostop:
        return ostop
    elif temp <= ostart:
        return ostart
    else:
        return temp
    
def sendSCMessage(m):
    cycle = "cycle"
    delta = "delta"
    cps = "cps"
    n = "n"
    s = "s"
    orbit = "orbit"

    # TODO: 
    # Add all fields

    osc_udp_client.send_message("/play2", [cycle, m['cycle'], delta, m['delta'], cps, 1, s , m['s'], n, m['n'], orbit, m['orbit']])

def constructTimeline(roll):
    timelength = roll['end']*roll['resolution']
    timeline = [None] * timelength

    for message in roll['messages']:
        if timeline[message['t_index']] is None:
            timeline[message['t_index']] = [message]
        else:
            timeline[message['t_index']].append(message)
    
    return timeline

def loadJSON(name, number = 0):
    saves = [filename for filename in os.listdir("./processing/export/") if name in filename and os.path.isdir(filename) == False]
    if saves:
        wrapped_index = divmod(int(number), len(saves))[1]
        jsondata = json.load( open( ("./processing/export/{0}").format(saves[wrapped_index]) ))
        return jsondata

def main(unused_addr, unused_arg, message):
    lines = message.split(",")

    #parameters
    roll_name  = lines[0]
    roll_note  = lines[1]
    roll_start = lines[2] ## CONDITIONS?
    roll_stop  = lines[3] ## CONDITIONS?
    roll_speed = float(lines[4])
    roll_loop  = int(lines[5])
    
    print(roll_name, roll_note, roll_start, roll_stop, roll_speed, roll_loop)

    if roll_speed == 0.0:
        roll_speed = 1.0
    if roll_loop < 0:
        roll_loop = 1

    jsondata = loadJSON(roll_name, roll_note)
    if jsondata is None:
        print(current_milli_time(), "could not find, exiting...")
        exit
    else:
        # 2dimensional timeline list
        timeline = constructTimeline(jsondata)
        
        print('-> ' + roll_name+":"+roll_note+" started")
        # time parameters
        roll_length_in_ms = 1000*jsondata['end']
        loop_count = 0 
        prev_time = current_milli_time()
        delta_time = 0
        time = 0 if roll_speed > 0 else roll_length_in_ms
        current_timestamp = -1 if roll_speed > 0 else jsondata['end']*jsondata['resolution']+1

        print("Loop {0}/{1}".format(loop_count, roll_loop))  
        while loop_count < roll_loop:
            prev_time = current_milli_time()
            time += roll_speed * delta_time

            timestamp_location = icmap(time, 
                                    0, roll_length_in_ms, 
                                    0, jsondata['end']*jsondata['resolution']-1)
            
            if ((roll_speed > 0 and timestamp_location > current_timestamp) or 
                (roll_speed < 0 and timestamp_location < current_timestamp)):

                current_timestamp = timestamp_location
                
                print(current_timestamp, len(timeline))
                if timeline[current_timestamp] is not None:
                    for message in timeline[current_timestamp]:
                        sendSCMessage(message)
            
            if time > roll_length_in_ms: 
                time -= roll_length_in_ms 
                current_timestamp = -1
                loop_count += 1
                print("Loop {0}/{1}".format(loop_count, roll_loop))
            if time < 0:
                time += roll_length_in_ms
                current_timestamp = jsondata['end']*jsondata['resolution'] + 1
                loop_count += 1
                print("Loop {0}/{1}".format(loop_count, roll_loop))
                
            delta_time = current_milli_time() - prev_time    
        print('-> '+roll_name+":"+roll_note+" finished")


        # TODO:
        # Incorporate 
        #   START 
        #   STOP 
        # + LOOP 
        # + SPEED
        
                        

if __name__ == '__main__':
    # main("sth", "sth", "nspy,2,0,1,-8.0,2,1")
    dispatcher = dispatcher.Dispatcher()
    dispatcher.map("/roll", main, "roll")

    server = osc_server.ThreadingOSCUDPServer(
        ("127.0.0.1", 3009), dispatcher)
    print("Serving on {}".format(server.server_address))
    server.serve_forever()