#ifndef _PSU_H
#define _PSU_H

#define PSU_UDP_PORT 2777

/*
 * GPIO12 is connected to a pin that can enable / disable the LED's power supply
 * If your setup is different, you can either just remove all PSU (= Power supply) - related
 * code or simply ignore the fact that GPIO12 will be high by default.
 */
void psu_init();

void psu_disable();
void psu_enable();
void psu_server_init();

#endif
