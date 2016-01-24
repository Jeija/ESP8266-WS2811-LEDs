#include <ets_sys.h>

#ifndef _WS2811_DMA
#define _WS2811_DMA

// Functions:
void ws2811dma_init();
void ws2811dma_put(uint8_t buffer[][3], uint16_t pixels, uint16_t offset);

/**
 * Configuration:
 * MAXPIXELS: Maximum number of WS2811 pixels that can be stored.
 * Since this has to be stored in the 12-bit slc.size / slc.length field with
 * max. value 2^12 = 4096 and WS_BREAK_BYTES is added, no more than 339 LEDs
 * can be addressed in this mode (use two slcRXDescriptors in row to fix this)
 */
#define MAXPIXELS 300

/*
 * I²S data output clock (bit clock) calculation:
 * According to http://bbs.espressif.com/viewtopic.php?t=958 and some own tests
 * From my assumptions the I²S bit frequency is calculated as follows:
 * 160MHz is the internal clock speed (independent of CPU frequency and crystal)
 * bitfreq = 2 * 160MHz / I2S_BCK_DIV / I2S_CLKM_DIV 
 * For I2S_BCK_DIV = 21 and WS_I2S_CLKM = 21:
 * bitfreq = 3.8 MHz which means each output bit takes 0.2625us
 * I should propably test this formula with an oscilloscope...
 * This timing works fine for WS2811 in fast mode, adapt for WS2812B / WS2811 in slow mode
 *
 * Use 24 bytes (must be divisible by 4, makes 24 / 4 = 6 uint32_t's in tape) at the end
 * of the "tape" to generate the ~50us break, adds up to: 24 * 8 * 0.2625us = 50.4us
 */
#define I2S_BCK_DIV 21
#define I2S_CLKM_DIV 4

// Should technically also work for WS2812B, but I haven't tested the timings
#define WS_BIT1 0b1100
#define WS_BIT0 0b1000
#define WS_BREAK_BYTES 24

/*
 * Structures for internal usage. Refer to Espressif's document
 * "8P ESP8266 I2S Module Description" for proper description.
 * slcRXDescriptor is bitfield of configuration data for DMA
 */
struct slcRXDescriptor {
	uint32_t size			: 12;
	uint32_t length			: 12;
	uint32_t				:  5;
	uint32_t sub_sof		:  1;
	uint32_t eof			:  1;
	uint32_t owner			:  1;
	uint32_t buf_ptr		: 32;
	uint32_t next_link_ptr	: 32;
};

#endif
