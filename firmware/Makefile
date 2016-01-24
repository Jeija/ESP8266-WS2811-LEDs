# Esptool firmware download options
PORT			:= /dev/ttyUSB0
BAUD			:= 1000000

# Network Settings
# Do NOT modify these placeholders, but include your configuration in your make commandline, e.g.:
# make WIFI_SSID="myssid" WIFI_PASS="secretpassword" STATIC_IP="192.168.0.80" STATIC_SUBNET="255.255.255.0"
# Always uses static IPs, dynamic IPs don't really make sense for this kind of application
WIFI_SSID		:= placeholder
WIFI_PASS		:= placeholder
IP_ADDR			:= placeholder
IP_SUBNET		:= placeholder
NET_DEFINES		:= -D WIFI_SSID=\"$(WIFI_SSID)\" -D WIFI_PASS=\"$(WIFI_PASS)\" -D IP_ADDR=\"$(IP_ADDR)\" -D IP_SUBNET=\"$(IP_SUBNET)\"

# Directory structure
BUILDDIR		:= build
SRCDIR			:= src
OBJDIR			:= obj

SRCS			:= $(wildcard  $(SRCDIR)/*.c)
OBJS			:= $(addprefix $(OBJDIR)/,$(notdir $(SRCS:.c=.o)))
DEPS			:= $(addprefix $(OBJDIR),$(notdir $(SRCS:.c=.d)))

# SDK / Compiler settings
SDK_DIR			:= /opt/esp-open-sdk/esp_iot_sdk_v1.5.0
CC				:= xtensa-lx106-elf-gcc
LD				:= xtensa-lx106-elf-gcc
ESPTOOL			:= esptool.py
CFLAGS			:= -O2 -fdata-sections -ffunction-sections -Wpointer-arith -Wall -Wno-parentheses -Wno-implicit-function-declaration -fno-inline-functions -nostdlib -mlongcalls -mtext-section-literals -DICACHE_FLASH
LDLIBS			:= -nostdlib -Wl,--gc-sections -Wl,--no-check-sections -u call_user_start -Wl,-static -Wl,--start-group -lc -lgcc -lhal -lphy -lpp -lnet80211 -lwpa -lmain -llwip -lcrypto $(OBJS) -Wl,--end-group
LDFLAGS			:= -O2 -T$(SDK_DIR)/ld/eagle.app.v6.ld
INCLUDES		:= -I $(SDK_DIR)/include -I $(SDK_DIR)/include/json -I $(SRCDIR)/

# Project settings
TARGET			:= ws2811
FLASH_FREQ		:= 80m
FLASH_MODE		:= qio
FLASH_SIZE		:= 32m
FLASH_OPT		:= --flash_freq $(FLASH_FREQ) --flash_mode $(FLASH_MODE) --flash_size $(FLASH_SIZE)

TARGET_ELF		:= $(BUILDDIR)/$(TARGET).elf
TARGET_FLASH	:= $(BUILDDIR)/$(TARGET)-0x00000.bin
TARGET_IROM		:= $(BUILDDIR)/$(TARGET)-0x40000.bin

all: $(OBJDIR) $(BUILDDIR) $(TARGET_FLASH) $(TARGET_IROM)
	@echo Compilation successful
	@echo Use \'make flash\' to flash firmware

$(TARGET_FLASH) $(TARGET_IROM): $(TARGET_ELF)
	$(ESPTOOL) elf2image $(FLASH_OPT) $^ --output $(BUILDDIR)/$(TARGET)-

$(TARGET_ELF): $(OBJS)
	$(LD) -L$(SDK_DIR)/lib $(LDFLAGS) $(LDLIBS) -o $@
		
$(OBJDIR)/%.o: $(SRCDIR)/%.c
	$(CC) $(CFLAGS) $(INCLUDES) $(NET_DEFINES) -MMD -MP -c $< -o $@

$(OBJDIR):
	mkdir -p $(OBJDIR)

$(BUILDDIR):
	mkdir -p $(BUILDDIR)

flash: all
	$(ESPTOOL) --port $(PORT) --baud $(BAUD) write_flash $(FLASH_OPT) 0x00000 $(TARGET_FLASH) 0x40000 $(TARGET_IROM)

.PHONY: clean

clean:
	$(RM) -r $(OBJDIR)
	$(RM) -r $(BUILDDIR)

-include $(DEPS)
