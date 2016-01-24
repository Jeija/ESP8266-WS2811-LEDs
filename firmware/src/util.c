#include <ets_sys.h>

// Parse string of IP address to uint32_t IP for ip_info
uint32_t ICACHE_FLASH_ATTR string_to_ip(char *ipstring) {
	uint32_t addr = 0;
	uint8_t octet = 0;
	uint8_t i = 0;
	uint8_t ioctet = 0;
	char octet_str[4] = {0x00};

	while (octet < 4) {
		if (ipstring[i] == '.' || ipstring[i] == 0x00) {
			octet_str[ioctet] = 0x00;
			addr += ((atoi(octet_str) & 0xff) << (8 * octet++));

			i++;
			ioctet = 0;
		} else {
			octet_str[ioctet++] = ipstring[i++];
		}
	}

	return addr;
}
