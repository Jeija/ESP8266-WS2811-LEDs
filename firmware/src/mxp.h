/*
 * Implementation of MXP (Matrix Protocol), a very simplistic
 * protocol for LED Matrix / LED Strip data communication.
 * Compatible with: https://github.com/Jeija/WS2811LEDMatrix
 *
 * UDP Port 2711
 *
 * ############################
 * LED Matrix UDP Data Protocol
 * ############################
 * [ 1 byte ] [ 0 -  0] Packet type
 *	- 0x00 = [MXP_FRM] Frame data from PC
 *
 * In case of frame data:
 * [ 2 bytes] [ 1 -     2] Offset (nth LED in string)
 * [ 2 bytes] [ 3 -     4] Length of data in LEDs (number n of bytes / 3); Offset + Length must be <= Number of LEDs
 * [ n bytes] [ 5 - n + 5] Frame data, which consists of:
 * ----------- Frame data -----------
 * [ 1 byte] Red from 0-255
 * [ 1 byte] Green from 0-255
 * [ 1 byte] Blue from 0-255
 * This 3-byte Order is repeated for each LED pixel (so Length / 3 times)
 * --> There are Length * 3 bytes of color data in total
 */

#ifndef _MXP_H
#define _MXP_H

// Configuration: UDP port and maximum number of LEDs in payload
#define MXP_UDP_PORT 2711
#define MXP_MAXLEN 300

/*** Setup Server, start listening ***/
void mxp_init();

#endif
