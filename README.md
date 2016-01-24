# ESP8266 driver for WS2811 LED Strips
### This project is incomplete, more animations and hopefully some photos will be posted soon.

## Project description
This project uses the ESP8266's DMA (Direct Memory Access) functionality that is designed for I²S output in order to drive WS2811 LEDs. It is remotely based on cnlohr's [WS2812 driver implementation](https://github.com/cnlohr/esp8266ws2812i2s), but much more minimal. If you want to use this implementation in your own project, just get these source files:
* `firmware/src/ws2811dma.c`: Complete implementation of DMA WS2811 output
* `firmware/src/ws2811dma.h`: Header file contains important timing configuration
* `firmware/src/i2s_reg.h` and `firmware/src/slc_register.h`: Original source files from Espressif that contain register addresses for I²S and DMA functionality

If you want to know more about how DMA and I²S output actually works, I suggest you to watch cnlohr's [very informative video](https://www.youtube.com/watch?v=6zqGwxqJQnw) and read the source code.

The firmware will receive UDP packages on port 2711 with my custom, very simple MXP protocol (matrix protocol) that I originally made for [my LED Matrix project](https://github.com/Jeija/WS2811LEDMatrix). The node.js client provides a very simple user interface for live LJ'ing and is forked from the [LED Matrix client](https://github.com/Jeija/WS2811LEDMatrix).

Additionally, the ESP it will accept commands to turn the Voltek power supply on and off. You can easily send them with the following bash commands:
```bash
# Assuming 192.168.0.81 is the ESP8266's IP, port 2777 is default
# Disable the LED power supply
echo -e "\0"  >/dev/udp/192.168.0.81/2777

# Enable the LED power supply
echo -e "\1"  >/dev/udp/192.168.0.81/2777
```

## Build the Controller Hardware
I use an ESP-03 module on a custom board embedded into a "Voltek SPEC7188B" power supply for minimal usage of space and maximum portability. You can have a look at the KiCad PCB designs for the small, custom single-layered PCB that the ESP-03 mounts on top of in the `hardware` directory. Apart from adding a pin that can be used to enable / disable the power supply altogether it is just a very minimal way of interfacing the ESP-03 module.

The ESP8266 is basically powered by the trickle charge output of the Voltek power supply, so that it can manually toggle power for the LEDs connected to the strip. By default, it will enable the power supply.

Please mind that since this project is using DMA / I²S output, this will use up the RX pin of the ESP. I didn't experience any issues programming the module even when the LED strip was connected, but you might need to unplug the LEDs if this happens to you. The upside of this of course is that the RX pin is also available on popular modules like the ESP-01.

## Flash the Firmware
Before flashing the firmware, you will need to compile it with your own static network configuration. I use pfalcon's [esp-open-sdk](https://github.com/pfalcon/esp-open-sdk) as my ESP8266 build system. Depending the Espressif SDK version you are using, you might need to adjust the `SDK_DIR` setting in `firmware/Makefile`. Also, make sure the Xtensa build tools such as `xtensa-lx106-elf-gcc` and `xtensa-lx106-elf-gcc` as well as the themadinventor's [esptool](https://github.com/themadinventor/esptool) are in your `PATH`.

In order to compile the firmware with your network configuration, follow these steps:
* Go into the `firmware` directory
* `make clean` to get rid of any previous build of the firmware
* `make WIFI_SSID="myWifiSSID" WIFI_PASS="mySecretPassword" IP_ADDR="192.168.0.123" IP_SUBNET="255.255.0.0" flash`. Of course, you have to replace the SSID, password and IP placeholders with your network configuration.
* Connect the ESP8266 and choose your preffered baudrate and port in `firmware/Makefile`. If you don't use DTR/RTS to get the ESP into programming mode, you need to manually enter flash download mode now.
* `make flash` to download the firmware

The ESP should now try to connect to your WiFi network. If the WS2811 LED strip is connected, it will light up the first 10 LEDs red while connecting and green as soon as the connection has been established.

## Install and use the client
The node.js client allows for live input of animation data (e.g. corresponding to music). It has an animation queue that can be put together by multiple people at once and a site for the LED strip operator / LJ with a live preview of the current colors on the LED strips.

* Install dependencies: You need to have `node.js`, `npm` and `bower` installed on your system. Go to `client` and execute `npm install` to install all dependencies. Then, install the bower dependencies by executing `bower install` in `client/site`.
* You should edit the file `client/config.json` to reflect the actual LED strip configuration you are using.
* You can run the node.js server by executing `client/server.js`: In the `client` directory, type `node server.js`.
* The server is now available at [localhost:8080](http://localhost:8080) or at any IP of your computer. You can manage the animation queue at [localhost:8080/queue](http://localhost:8080/queue) and execute queue elements and control the animation at [localhost:8080](http://localhost:8080). On that page, press the `n` key to start the next animation, and any of the keys `a`, `s`, `d` or `f` for rhythm input. You can toggle the recording feature that records keypresses with the `r` key and play back your recordings by pressing `p`.

For animations that use the spectrum analyzer, the animation server must get good quality music input from the default microphone or line in device. Music input also requires ALSA and its tools to be installed on the server machine!
