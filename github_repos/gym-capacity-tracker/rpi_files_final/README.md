This folder within our repository encompasses code and steps implemented on the
Raspberry Pi's. This is a significant development from prototyping on Arduino,
as Pi's are a complete microcomputer whereas Arduino is just a microcontroller.
Additionally, Raspberry Pi does not have the same GPIO properties as Arduino.
One of the largest challenges converting to RPi is that RPi does not have analog
input GPIO's while Arduino does. The sensor outputs analog PWM data, which is 
easily readable by Arduino. Pi can only read digital input, so we had to manipulate
a circuit such that the Pi could read data. 

We accomplished this by manually initiating the sending of pulses using the RX
sensor pin and an output GPIO, and using a second input GPIO to track how long
the PWM pin is pulled high for and manually calculate how far away an object is.

This node.js script requires npm regression, pigpio, and request libraries. 
Script is to be run on a Raspberry Pi properly configured and connected to
a MaxBotix MaxSonar-EZ1 sensor. Algorithm utilizes node.js callback to avoid
using an analog-to-digital converter to read data via gpio pins. Raspberry
Pi's are configured to automatically connect to wifi and run node.js script
after wifi connection has been made, using npm forever library.

The following image explains the sonar sensor protocol for timing regarding sending
a pulse, receiving a pulse and sending data.

![Sonar Protocol](sonar_proto.png "Analysis of timing protocols per sensor pin")
