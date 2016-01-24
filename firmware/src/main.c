// System
#include <ets_sys.h>
#include <osapi.h>
#include <gpio.h>
#include <os_type.h>
#include <user_interface.h>

// Project
#include "user_config.h"
#include "ws2811dma.h"
#include "psu.h"

void ICACHE_FLASH_ATTR wifi_init() {
	/*** Connect to WiFi ***/
	wifi_set_opmode(STATION_MODE);
	wifi_station_disconnect();

	char ssid[32] = WIFI_SSID;
	char pass[64] = WIFI_PASS;
	struct station_config sta_conf;
	sta_conf.bssid_set = 0;
	os_memcpy(&sta_conf.ssid, ssid, 32);
	os_memcpy(&sta_conf.password, pass, 64);

	wifi_station_set_config(&sta_conf);
	wifi_station_connect();

	/*** Network configuration ***/
	wifi_station_dhcpc_stop();

	struct ip_info ip_conf;
	ip_conf.ip.addr = string_to_ip(IP_ADDR);
	ip_conf.netmask.addr = string_to_ip(IP_SUBNET);
	wifi_set_ip_info(STATION_IF, &ip_conf);
}

enum conn_status {
	STAT_NO_CONNECT = 0,
	STAT_CONNECTED = 1
};

/*
 * Output status indicator color to 10 LEDs
 * Red = Not connected
 * Green = Connected, no data yet
 */
void ICACHE_FLASH_ATTR status_indicate(enum conn_status status) {
	uint8_t buf[10][3];
	uint8_t i;
	for (i = 0; i < 10; ++i) {
		buf[i][0] = 0x00; buf[i][1] = 0x00; buf[i][2] = 0x00;
		if (status == STAT_NO_CONNECT) buf[i][0] = 0xff;
		if (status == STAT_CONNECTED) buf[i][1] = 0xff;
	}

	ws2811dma_put(buf, 10, 0);
}

void onWifiEvent(System_Event_t *evt) {
	if (evt->event == EVENT_STAMODE_CONNECTED)
		status_indicate(STAT_CONNECTED);
}

void ICACHE_FLASH_ATTR user_init(void) {
	uart_div_modify(0, UART_CLK_FREQ / BAUD);
	os_printf("Startup\r\n");

	/*** Initialize subsystems ***/
	psu_init();
	ws2811dma_init();
	wifi_init();
	mxp_init(ws2811dma_put);
	psu_server_init();

	/*** Use LED strip as status indicator ***/
	wifi_set_event_handler_cb(onWifiEvent);
	status_indicate(STAT_NO_CONNECT);
}
