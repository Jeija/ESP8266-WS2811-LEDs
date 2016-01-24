// System
#include <ets_sys.h>
#include <osapi.h>
#include <gpio.h>
#include <os_type.h>
#include <user_interface.h>

// Project
#include "ws2811dma.h"
#include "slc_register.h"
#include "i2s_reg.h"

/*
 * Raw WS2811 output data storage:
 * "tape" stores the i2s / ws2811 binary data that is played on loop,
 * including the 50us pause at the end. Each entry in tape stores the
 * data for one one color of an LED (so 32-bit per color which makes
 * 96bit = 12byte per LED)
 */
uint32_t tape[MAXPIXELS * 3 + WS_BREAK_BYTES / 4];

void ICACHE_FLASH_ATTR ws2811dma_init() {
	// I²S module seems to take some time to power up
	os_delay_us(100);

	/*** Prefill tape with zeros ***/
	os_memset(tape, WS_BIT0 | (WS_BIT0<<4), sizeof(tape) - WS_BREAK_BYTES);
	os_memset((void *)(((uint32_t)tape) - WS_BREAK_BYTES), 0, WS_BREAK_BYTES);

	/*
	 * DMA (Direct Memory Access) using SLC controller to fill I²S FIFO:
	 * Setup and start SLC transmission
	 * datalen / blocksize are in bytes
	 */
	static struct slcRXDescriptor slc;
	slc.owner = 1;
	slc.buf_ptr = (uint32_t)tape;
	slc.eof = 1;
	slc.sub_sof = 0;
	slc.size = slc.length = sizeof(tape);
	slc.next_link_ptr = (uint32_t)&slc;

	*((uint32_t *)SLC_CONF0) = (1<<SLC_MODE_S);
	*((uint32_t *)SLC_RX_DSCR_CONF) = SLC_INFOR_NO_REPLACE | SLC_TOKEN_NO_REPLACE;
	*((uint32_t *)SLC_RX_LINK) = SLC_RXLINK_START | (((uint32_t) &slc) & SLC_RXLINK_DESCADDR_MASK);

	/*
	 * Setup I²S output:
	 * - Choose Function 2 (count from 0) of U0RXD which is I2SO_DATA (I²S Data Output)
	 * - Give I²S module clock signal
	 * - Setup clock prescaler and frequency divider + MSB + start tape playback
	 */
	PIN_FUNC_SELECT(PERIPHS_IO_MUX_U0RXD_U, 1);
	rom_i2c_writeReg_Mask(0x67, 4, 4, 7, 7, 1);
	*((uint32_t *)I2SCONF) = I2S_RIGHT_FIRST | I2S_MSB_RIGHT | I2S_I2S_TX_START
							| (((I2S_CLKM_DIV - 1) & I2S_CLKM_DIV_NUM) << I2S_CLKM_DIV_NUM_S)
							| (((I2S_BCK_DIV - 1) & I2S_BCK_DIV_NUM) << I2S_BCK_DIV_NUM_S);
}

/*
 * ws2811dma_put: add data to playback tape
 * buffer: raw color data, 3 bytes per pixel
 * pixels: number of pixels in dataset
 * offset: nth LED in String
 */
void ws2811dma_put(uint8_t buffer[][3], uint16_t pixels, uint16_t offset) {
	if(pixels > MAXPIXELS) return;

	// Fill tape with color data, 32bit of color data per color
	uint16_t px, c;
	uint8_t bit;
	for(px = offset; px < offset + pixels; ++px) {
		for (c = 0; c < 3; ++c) {
			uint32_t pxval = 0x00000000;
			uint8_t colorbyte = buffer[px - offset][c];
			for (bit = 0; bit < 8; ++bit)
				pxval |= (((1<<bit) & colorbyte) ? WS_BIT1 : WS_BIT0) << (bit * 4);
			tape[px * 3 + c] = pxval;
		}
	}
}
