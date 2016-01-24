// System
#include <ets_sys.h>
#include <osapi.h>
#include <os_type.h>
#include <user_interface.h>
#include <espconn.h>
#include <gpio.h>
#include <mem.h>

// Project
#include "psu.h"

void ICACHE_FLASH_ATTR psu_disable() {
	gpio_output_set(0, BIT12, BIT12, 0);
}

void ICACHE_FLASH_ATTR psu_enable () {
	gpio_output_set(BIT12, 0, BIT12, 0);
}

void ICACHE_FLASH_ATTR psu_init() {
	PIN_FUNC_SELECT(PERIPHS_IO_MUX_MTDI_U, FUNC_GPIO12);
	gpio_output_set(BIT12, 0, BIT12, 0);
}

void onPSURecv(void *arg, char *dat, uint16_t len) {
	if (dat[0]) psu_enable();
	else psu_disable();
}

void ICACHE_FLASH_ATTR psu_server_init() {
	static struct espconn psuserv;

	psuserv.type = ESPCONN_UDP;
	psuserv.proto.udp = (esp_udp *)os_zalloc(sizeof(esp_udp));
	psuserv.proto.udp->local_port = PSU_UDP_PORT;
	espconn_regist_recvcb(&psuserv, onPSURecv);
	espconn_create(&psuserv);
}
