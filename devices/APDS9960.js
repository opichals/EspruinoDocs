/**
 * @file    SparkFun_APDS-9960.cpp
 * @brief   Library for the SparkFun APDS-9960 breakout board
 * @author  Shawn Hymel (SparkFun Electronics)
 *
 * @copyright	This code is public domain but you buy me a beer if you use
 * this and we meet someday (Beerware license).
 *
 * This library interfaces the Avago APDS-9960 to Arduino over I2C. The library
 * relies on the Arduino Wire (I2C) library. to use the library, instantiate an
 * APDS9960 object, call init(), and call the appropriate functions.
 *
 * APDS-9960 current draw tests (default parameters):
 *   Off:                   1mA
 *   Waiting for gesture:   14mA
 *   Gesture in progress:   35mA
```
I2C1.setup({scl:B6, sda:B7});
var apds = require("APDS9960").connect(I2C1, {int:B5});
apds.onGesture(function(e) {
    console.log("Gesture: ", e);
});
apds.onProximity(function(e) {
    console.log("Proximity: ", e);
});
apds.onLight(function(e) {
    console.log("Light: ", e);
});
```
 */

exports.connect = function(i2c, options) {
    let addr = options.address || 0x39; // APDS-9960 I2C address */
    let apds = new APDS9960(i2c, addr);
    init.call(apds, apds);
    return apds;
};


const
/* Gesture parameters */
    GESTURE_THRESHOLD_OUT  =  10,
    GESTURE_SENSITIVITY_1  =  50,
    GESTURE_SENSITIVITY_2  =  20,

/* Error code for returned values */
    ERROR  =                  0xFF,

/* Acceptable device IDs */
    APDS9960_ID_1  =          0xAB,
    APDS9960_ID_2  =          0x9C,

/* Misc parameters */
    FIFO_PAUSE_TIME  =        30,      // Wait period (ms) between FIFO reads

/* APDS-9960 register addresses */
    APDS9960_ENABLE  =        0x80,
    APDS9960_ATIME  =         0x81,
    APDS9960_WTIME  =         0x83,
    APDS9960_AILTL  =         0x84,
    APDS9960_AILTH  =         0x85,
    APDS9960_AIHTL  =         0x86,
    APDS9960_AIHTH  =         0x87,
    APDS9960_PILT  =          0x89,
    APDS9960_PIHT  =          0x8B,
    APDS9960_PERS  =          0x8C,
    APDS9960_CONFIG1  =       0x8D,
    APDS9960_PPULSE  =        0x8E,
    APDS9960_CONTROL  =       0x8F,
    APDS9960_CONFIG2  =       0x90,
    APDS9960_ID  =            0x92,
    APDS9960_STATUS  =        0x93,
    APDS9960_CDATAL  =        0x94,
    APDS9960_CDATAH  =        0x95,
    APDS9960_RDATAL  =        0x96,
    APDS9960_RDATAH  =        0x97,
    APDS9960_GDATAL  =        0x98,
    APDS9960_GDATAH  =        0x99,
    APDS9960_BDATAL  =        0x9A,
    APDS9960_BDATAH  =        0x9B,
    APDS9960_PDATA  =         0x9C,
    APDS9960_POFFSET_UR  =    0x9D,
    APDS9960_POFFSET_DL  =    0x9E,
    APDS9960_CONFIG3  =       0x9F,
    APDS9960_GPENTH  =        0xA0,
    APDS9960_GEXTH  =         0xA1,
    APDS9960_GCONF1  =        0xA2,
    APDS9960_GCONF2  =        0xA3,
    APDS9960_GOFFSET_U  =     0xA4,
    APDS9960_GOFFSET_D  =     0xA5,
    APDS9960_GOFFSET_L  =     0xA7,
    APDS9960_GOFFSET_R  =     0xA9,
    APDS9960_GPULSE  =        0xA6,
    APDS9960_GCONF3  =        0xAA,
    APDS9960_GCONF4  =        0xAB,
    APDS9960_GFLVL  =         0xAE,
    APDS9960_GSTATUS  =       0xAF,
    APDS9960_IFORCE  =        0xE4,
    APDS9960_PICLEAR  =       0xE5,
    APDS9960_CICLEAR  =       0xE6,
    APDS9960_AICLEAR  =       0xE7,
    APDS9960_GFIFO_U  =       0xFC,
    APDS9960_GFIFO_D  =       0xFD,
    APDS9960_GFIFO_L  =       0xFE,
    APDS9960_GFIFO_R  =       0xFF,

/* Bit fields */
    APDS9960_PON  =           0b00000001,
    APDS9960_AEN  =           0b00000010,
    APDS9960_PEN  =           0b00000100,
    APDS9960_WEN  =           0b00001000,
    APSD9960_AIEN  =          0b00010000,
    APDS9960_PIEN  =          0b00100000,
    APDS9960_GEN  =           0b01000000,
    APDS9960_GVALID  =        0b00000001,

/* On/Off definitions */
    OFF  =                    0,
    ON  =                     1,

/* Acceptable parameters for setMode */
    POWER  =                  0,
    AMBIENT_LIGHT  =          1,
    PROXIMITY  =              2,
    WAIT  =                   3,
    AMBIENT_LIGHT_INT  =      4,
    PROXIMITY_INT  =          5,
    GESTURE  =                6,
    ALL  =                    7,

/* LED Drive values */
    LED_DRIVE_100MA  =        0,
    LED_DRIVE_50MA  =         1,
    LED_DRIVE_25MA  =         2,
    LED_DRIVE_12_5MA  =       3,

/* Proximity Gain (PGAIN) values */
    PGAIN_1X  =               0,
    PGAIN_2X  =               1,
    PGAIN_4X  =               2,
    PGAIN_8X  =               3,

/* ALS Gain (AGAIN) values */
    AGAIN_1X  =               0,
    AGAIN_4X  =               1,
    AGAIN_16X  =              2,
    AGAIN_64X  =              3,

/* Gesture Gain (GGAIN) values */
    GGAIN_1X  =               0,
    GGAIN_2X  =               1,
    GGAIN_4X  =               2,
    GGAIN_8X  =               3,

/* LED Boost values */
    LED_BOOST_100  =          0,
    LED_BOOST_150  =          1,
    LED_BOOST_200  =          2,
    LED_BOOST_300  =          3,

/* Gesture wait time values */
    GWTIME_0MS  =             0,
    GWTIME_2_8MS  =           1,
    GWTIME_5_6MS  =           2,
    GWTIME_8_4MS  =           3,
    GWTIME_14_0MS  =          4,
    GWTIME_22_4MS  =          5,
    GWTIME_30_8MS  =          6,
    GWTIME_39_2MS  =          7,

/* Default values */
    DEFAULT_ATIME  =          219,     // 103ms
    DEFAULT_WTIME  =          246,     // 27ms
    DEFAULT_PROX_PPULSE  =    0x87,    // 16us, 8 pulses
    DEFAULT_GESTURE_PPULSE  = 0x89,    // 16us, 10 pulses
    DEFAULT_POFFSET_UR  =     0,       // 0 offset
    DEFAULT_POFFSET_DL  =     0,       // 0 offset
    DEFAULT_CONFIG1  =        0x60,    // No 12x wait (WTIME) factor
    DEFAULT_LDRIVE  =         LED_DRIVE_100MA,
    DEFAULT_PGAIN  =          PGAIN_4X,
    DEFAULT_AGAIN  =          AGAIN_4X,
    DEFAULT_PILT  =           0,       // Low proximity threshold
    DEFAULT_PIHT  =           50,      // High proximity threshold
    DEFAULT_AILT  =           0xFFFF,  // Force interrupt for calibration
    DEFAULT_AIHT  =           0,
    DEFAULT_PERS  =           0x11,    // 2 consecutive prox or ALS for int.
    DEFAULT_CONFIG2  =        0x01,    // No saturation interrupts or LED boost
    DEFAULT_CONFIG3  =        0,       // Enable all photodiodes, no SAI
    DEFAULT_GPENTH  =         40,      // Threshold for entering gesture mode
    DEFAULT_GEXTH  =          30,      // Threshold for exiting gesture mode
    DEFAULT_GCONF1  =         0x40,    // 4 gesture events for int., 1 for exit
    DEFAULT_GGAIN  =          GGAIN_4X,
    DEFAULT_GLDRIVE  =        LED_DRIVE_100MA,
    DEFAULT_GWTIME  =         GWTIME_2_8MS,
    DEFAULT_GOFFSET  =        0,       // No offset scaling for gesture mode
    DEFAULT_GPULSE  =         0xC9,    // 32us, 10 pulses
    DEFAULT_GCONF3  =         0,       // All photodiodes active during gesture
    DEFAULT_GIEN  =           0,       // Disable gesture interrupts

/* Direction definitions */
     DIR_NONE = 1,
     DIR_LEFT = 2,
     DIR_RIGHT = 3,
     DIR_UP = 4,
     DIR_DOWN = 5,
     DIR_NEAR = 6,
     DIR_FAR = 7,
     DIR_AL = 8;

/* State definitions */
    NA_STATE = 1,
    NEAR_STATE = 2,
    FAR_STATE = 3,
    ALL_STATE = 4
;


function APDS9960(i2c, addr)
{
    this.write = function(reg, value) {
        console.log('write', reg, value);
        i2c.writeTo(addr, reg, value)
    };
    this.read = function(reg, count) {
        console.log('read', reg, count);
        i2c.writeTo(addr, reg);
        if (!count) {
            return i2c.readFrom(addr, 1)[0];
        } else {
            return i2c.readFrom(addr, count);
        }
    };
    this.gesture = {
        data_: {
            u_data: new Uint8Array(32),
            u_data: new Uint8Array(32),
            l_data: new Uint8Array(32),
            r_data: new Uint8Array(32)
        },

        ud_delta: 0,
        lr_delta: 0,

        ud_count: 0,
        lr_count: 0,

        near_count: 0,
        far_count: 0,

        state: 0,
        motion: DIR_NONE
    }
}


function init(apds)
{

/*******************************************************************************
 * Public methods for controlling the APDS-9960
 ******************************************************************************/

/**
 * @brief Reads and returns the contents of the ENABLE register
 *
 * @return Contents of the ENABLE register. 0xFF if error.
 */
function getMode()
{
    /* Read current ENABLE register */
    return read(APDS9960_ENABLE);
}

/**
 * @brief Enables or disables a feature in the APDS-9960
 *
 * @param[in] mode which feature to enable
 * @param[in] enable ON (1) or OFF (0)
 */
function setMode(mode, enable)
{
    /* Read current ENABLE register */
    let reg_val = getMode();
    if( reg_val == ERROR ) {
        return false;
    }

    /* Change bit(s) in ENABLE register */
    enable = enable & 0x01;
    if( mode >= 0 && mode <= 6 ) {
        if (enable) {
            reg_val |= (1 << mode);
        } else {
            reg_val &= ~(1 << mode);
        }
    } else if( mode == ALL ) {
        if (enable) {
            reg_val = 0x7F;
        } else {
            reg_val = 0x00;
        }
    }

    /* Write value back to ENABLE register */
    write(APDS9960_ENABLE, reg_val);
}

/**
 * @brief Starts the light (R/G/B/Ambient) sensor on the APDS-9960
 *
 * @param[in] interrupts true to enable hardware interrupt on high or low light
 */
function enableLightSensor(interrupts)
{
    /* Set default gain, interrupts, enable power, and enable sensor */
    setAmbientLightGain(DEFAULT_AGAIN);
    setAmbientLightIntEnable(interrupts ? 1 : 0);
    enablePower();
    setMode(AMBIENT_LIGHT, 1);
}

/**
 * @brief Ends the light sensor on the APDS-9960
 *
 * @return True if sensor disabled correctly. False on error.
 */
function disableLightSensor()
{
    setAmbientLightIntEnable(0);
    setMode(AMBIENT_LIGHT, 0);
}

/**
 * @brief Starts the proximity sensor on the APDS-9960
 *
 * @param[in] interrupts true to enable hardware external interrupt on proximity
 * @return True if sensor enabled correctly. False on error.
 */
function enableProximitySensor(interrupts)
{
    /* Set default gain, LED, interrupts, enable power, and enable sensor */
    setProximityGain(DEFAULT_PGAIN);
    setLEDDrive(DEFAULT_LDRIVE);
    setProximityIntEnable(interrupts ? 1 : 0);
    enablePower();
    setMode(PROXIMITY, 1);
}

/**
 * @brief Ends the proximity sensor on the APDS-9960
 *
 * @return True if sensor disabled correctly. False on error.
 */
function disableProximitySensor()
{
	setProximityIntEnable(0);
	setMode(PROXIMITY, 0);
}

/**
 * @brief Starts the gesture recognition engine on the APDS-9960
 *
 * @param[in] interrupts true to enable hardware external interrupt on gesture
 * @return True if engine enabled correctly. False on error.
 */
function enableGestureSensor(interrupts)
{

    /* Enable gesture mode
       Set ENABLE to 0 (power off)
       Set WTIME to 0xFF
       Set AUX to LED_BOOST_300
       Enable PON, WEN, PEN, GEN in ENABLE
    */
    resetGestureParameters();
    write(APDS9960_WTIME, 0xFF);
    write(APDS9960_PPULSE, DEFAULT_GESTURE_PPULSE);
    setLEDBoost(LED_BOOST_300);
    setGestureIntEnable(interrupts ? 1 : 0);
    setGestureMode(1);
    enablePower();
    setMode(WAIT, 1);
    setMode(PROXIMITY, 1);
    setMode(GESTURE, 1);
}

/**
 * @brief Ends the gesture recognition engine on the APDS-9960
 *
 * @return True if engine disabled correctly. False on error.
 */
function disableGestureSensor()
{
    resetGestureParameters();
    setGestureIntEnable(0);
    setGestureMode(0);
    setMode(GESTURE, 0);
}

/**
 * @brief Determines if there is a gesture available for reading
 *
 * @return True if gesture available. False otherwise.
 */
function isGestureAvailable()
{
    /* Read value from GSTATUS register */
    let val = read(APDS9960_GSTATUS);

    /* Shift and mask out GVALID bit */
    val &= APDS9960_GVALID;

    /* Return true/false based on GVALID bit */
    if( val == 1) {
        return true;
    } else {
        return false;
    }
}

/**
 * @brief Processes a gesture event and returns best guessed gesture
 *
 * @return Number corresponding to gesture. -1 on error.
 */
function readGesture()
{
    let
        fifo_level = 0,
        bytes_read = 0,
        gstatus,
        motion,
        i;

    /* Make sure that power and gesture is on and data is valid */
    if( !isGestureAvailable() || !(getMode() & 0b01000001) ) {
        return DIR_NONE;
    }

    /* Keep looping as long as gesture data is valid */
    let gesture = this.gesture;
    while(1) {

        /* Wait some time to collect next batch of FIFO data */
        delay(FIFO_PAUSE_TIME);

        /* Get the contents of the STATUS register. Is data still valid? */
        gstatus = read(APDS9960_GSTATUS);

        /* If we have valid data, read in FIFO */
        if( (gstatus & APDS9960_GVALID) == APDS9960_GVALID ) {

            /* Read the current FIFO level */
            fifo_level = read(APDS9960_GFLVL);

/*
#if DEBUG
            Serial.print("FIFO Level: ");
            Serial.println(fifo_level);
#endif
*/

            /* If there's stuff in the FIFO, read it into our data block */
            if( fifo_level > 0) {
                let fifo_data = read(APDS9960_GFIFO_U, fifo_level * 4);
                let bytes_read = fifo_data.length;
                if( bytes_read == -1 ) {
                    return ERROR;
                }
/*
#if DEBUG
                Serial.print("FIFO Dump: ");
                for ( i = 0; i < bytes_read; i++ ) {
                    Serial.print(fifo_data[i]);
                    Serial.print(" ");
                }
                Serial.println();
#endif
*/
                let gesture_data_ = gesture.data_;

                /* If at least 1 set of data, sort the data into U/D/L/R */
                if( bytes_read >= 4 ) {
                    for( i = 0; i < bytes_read; i += 4 ) {
                        gesture_data_.u_data[gesture_data_.index] = fifo_data[i + 0];
                        gesture_data_.d_data[gesture_data_.index] = fifo_data[i + 1];
                        gesture_data_.l_data[gesture_data_.index] = fifo_data[i + 2];
                        gesture_data_.r_data[gesture_data_.index] = fifo_data[i + 3];
                        gesture_data_.index++;
                        gesture_data_.count++;
                    }

/*
#if DEBUG
                Serial.print("Up Data: ");
                for ( i = 0; i < gesture_data_.count; i++ ) {
                    Serial.print(gesture_data_.u_data[i]);
                    Serial.print(" ");
                }
                Serial.println();
#endif
*/

                    /* Filter and process gesture data. Decode near/far state */
                    if( processGestureData() ) {
                        if( decodeGesture() ) {
                            //***TODO: U-Turn Gestures
/*
#if DEBUG
                            //Serial.println(gesture.motion_);
#endif
*/
                        }
                    }

                    /* Reset data */
                    gesture_data_.index = 0;
                    gesture_data_.count = 0;
                }
            }
        } else {

            /* Determine best guessed gesture and clean up */
            delay(FIFO_PAUSE_TIME);
            decodeGesture();
            motion = gesture.motion_;
/*
#if DEBUG
            Serial.print("END: ");
            Serial.println(gesture.motion_);
#endif
*/
            resetGestureParameters();
            return motion;
        }
    }
}

/**
 * Turn the APDS-9960 on
 */
function enablePower()
{
    setMode(POWER, 1);
}

/**
 * Turn the APDS-9960 off
 */
function disablePower()
{
    setMode(POWER, 0);
}

/*******************************************************************************
 * Ambient light and color sensor controls
 ******************************************************************************/

/**
 * @brief Reads the ambient (clear) light level as a 16-bit value
 *
 * @return value of the light sensor.
 */
function readAmbientLight()
{
    /* Read value from clear channel, low byte register */
    let val_lo = read(APDS9960_CDATAL);
    /* Read value from clear channel, high byte register */
    let val_hi = read(APDS9960_CDATAH);

    return val_lo + (val_hi << 8);
}

/**
 * @brief Reads the red light level as a 16-bit value
 *
 * @param[out] val value of the light sensor.
 * @return True if operation successful. False otherwise.
 */
function readRedLight()
{
    /* Read value from clear channel, low byte register */
    let val_lo = read(APDS9960_RDATAL);
    /* Read value from clear channel, high byte register */
    let val_hi = read(APDS9960_RDATAH);

    return val_lo + (val_hi << 8);
}

/**
 * @brief Reads the green light level as a 16-bit value
 *
 * @param[out] val value of the light sensor.
 * @return True if operation successful. False otherwise.
 */
function readGreenLight()
{
    /* Read value from clear channel, low byte register */
    let val_lo = read(APDS9960_GDATAL);
    /* Read value from clear channel, high byte register */
    let val_hi = read(APDS9960_GDATAH);

    return val_lo + (val_hi << 8);
}

/**
 * @brief Reads the blue light level as a 16-bit value
 *
 * @param[out] val value of the light sensor.
 * @return True if operation successful. False otherwise.
 */
function readBlueLight()
{
    /* Read value from clear channel, low byte register */
    let val_lo = read(APDS9960_BDATAL);
    /* Read value from clear channel, high byte register */
    let val_hi = read(APDS9960_BDATAH);

    return val_lo + (val_hi << 8);
}

/*******************************************************************************
 * Proximity sensor controls
 ******************************************************************************/

/**
 * @brief Reads the proximity level as an 8-bit value
 *
 * @param[out] val value of the proximity sensor.
 * @return True if operation successful. False otherwise.
 */
function readProximity()
{
    return read(APDS9960_PDATA);
}

/*******************************************************************************
 * High-level gesture controls
 ******************************************************************************/

/**
 * @brief Resets all the parameters in the gesture data member
 */
function resetGestureParameters()
{
    let gesture = this.gesture;
    gesture.data_.index = 0;
    gesture.data_.count = 0;

    gesture.ud_delta_ = 0;
    gesture.lr_delta_ = 0;

    gesture.ud_count_ = 0;
    gesture.lr_count_ = 0;

    gesture.near_count_ = 0;
    gesture.far_count_ = 0;

    gesture.state_ = 0;
    gesture.motion_ = DIR_NONE;
}

/**
 * @brief Processes the raw gesture data to determine swipe direction
 *
 * @return True if near or far state seen. False otherwise.
 */
function processGestureData()
{
    let u_first = 0,
        d_first = 0,
        l_first = 0,
        r_first = 0,
        u_last = 0,
        d_last = 0,
        l_last = 0,
        r_last = 0,
        ud_ratio_first,
        lr_ratio_first,
        ud_ratio_last,
        lr_ratio_last,
        ud_delta,
        lr_delta,
        i;

        abs = Math.abs;
        gesture = this.gesture;
        gesture_data_ = gesture.data_;

    /* If we have less than 4 total gestures, that's not enough */
    if( gesture_data_.count <= 4 ) {
        return false;
    }

    /* Check to make sure our data isn't out of bounds */
    if( (gesture_data_.count <= 32) &&
        (gesture_data_.count > 0) ) {

        /* Find the first value in U/D/L/R above the threshold */
        for( i = 0; i < gesture_data_.count; i++ ) {
            if( (gesture_data_.u_data[i] > GESTURE_THRESHOLD_OUT) &&
                (gesture_data_.d_data[i] > GESTURE_THRESHOLD_OUT) &&
                (gesture_data_.l_data[i] > GESTURE_THRESHOLD_OUT) &&
                (gesture_data_.r_data[i] > GESTURE_THRESHOLD_OUT) ) {

                u_first = gesture_data_.u_data[i];
                d_first = gesture_data_.d_data[i];
                l_first = gesture_data_.l_data[i];
                r_first = gesture_data_.r_data[i];
                break;
            }
        }

        /* If one of the _first values is 0, then there is no good data */
        if( (u_first == 0) || (d_first == 0) ||
            (l_first == 0) || (r_first == 0) ) {

            return false;
        }
        /* Find the last value in U/D/L/R above the threshold */
        for( i = gesture_data_.count - 1; i >= 0; i-- ) {
/*
#if DEBUG
            Serial.print(F("Finding last: "));
            Serial.print(F("U:"));
            Serial.print(gesture_data_.u_data[i]);
            Serial.print(F(" D:"));
            Serial.print(gesture_data_.d_data[i]);
            Serial.print(F(" L:"));
            Serial.print(gesture_data_.l_data[i]);
            Serial.print(F(" R:"));
            Serial.println(gesture_data_.r_data[i]);
#endif
*/
            if( (gesture_data_.u_data[i] > GESTURE_THRESHOLD_OUT) &&
                (gesture_data_.d_data[i] > GESTURE_THRESHOLD_OUT) &&
                (gesture_data_.l_data[i] > GESTURE_THRESHOLD_OUT) &&
                (gesture_data_.r_data[i] > GESTURE_THRESHOLD_OUT) ) {

                u_last = gesture_data_.u_data[i];
                d_last = gesture_data_.d_data[i];
                l_last = gesture_data_.l_data[i];
                r_last = gesture_data_.r_data[i];
                break;
            }
        }
    }

    /* Calculate the first vs. last ratio of up/down and left/right */
    ud_ratio_first = ((u_first - d_first) * 100) / (u_first + d_first);
    lr_ratio_first = ((l_first - r_first) * 100) / (l_first + r_first);
    ud_ratio_last = ((u_last - d_last) * 100) / (u_last + d_last);
    lr_ratio_last = ((l_last - r_last) * 100) / (l_last + r_last);

/*
#if DEBUG
    Serial.print(F("Last Values: "));
    Serial.print(F("U:"));
    Serial.print(u_last);
    Serial.print(F(" D:"));
    Serial.print(d_last);
    Serial.print(F(" L:"));
    Serial.print(l_last);
    Serial.print(F(" R:"));
    Serial.println(r_last);

    Serial.print(F("Ratios: "));
    Serial.print(F("UD Fi: "));
    Serial.print(ud_ratio_first);
    Serial.print(F(" UD La: "));
    Serial.print(ud_ratio_last);
    Serial.print(F(" LR Fi: "));
    Serial.print(lr_ratio_first);
    Serial.print(F(" LR La: "));
    Serial.println(lr_ratio_last);
#endif
*/

    /* Determine the difference between the first and last ratios */
    ud_delta = ud_ratio_last - ud_ratio_first;
    lr_delta = lr_ratio_last - lr_ratio_first;

/*
#if DEBUG
    Serial.print("Deltas: ");
    Serial.print("UD: ");
    Serial.print(ud_delta);
    Serial.print(" LR: ");
    Serial.println(lr_delta);
#endif
*/

    /* Accumulate the UD and LR delta values */
    gesture.ud_delta_ += ud_delta;
    gesture.lr_delta_ += lr_delta;

/*
#if DEBUG
    Serial.print("Accumulations: ");
    Serial.print("UD: ");
    Serial.print(gesture.ud_delta_);
    Serial.print(" LR: ");
    Serial.println(gesture.lr_delta_);
#endif
*/

    /* Determine U/D gesture */
    if( gesture.ud_delta_ >= GESTURE_SENSITIVITY_1 ) {
        gesture.ud_count_ = 1;
    } else if( gesture.ud_delta_ <= -GESTURE_SENSITIVITY_1 ) {
        gesture.ud_count_ = -1;
    } else {
        gesture.ud_count_ = 0;
    }

    /* Determine L/R gesture */
    if( gesture.lr_delta_ >= GESTURE_SENSITIVITY_1 ) {
        gesture.lr_count_ = 1;
    } else if( gesture.lr_delta_ <= -GESTURE_SENSITIVITY_1 ) {
        gesture.lr_count_ = -1;
    } else {
        gesture.lr_count_ = 0;
    }

    /* Determine Near/Far gesture */
    if( (gesture.ud_count_ == 0) && (gesture.lr_count_ == 0) ) {
        if( (abs(ud_delta) < GESTURE_SENSITIVITY_2) &&
            (abs(lr_delta) < GESTURE_SENSITIVITY_2) ) {

            if( (ud_delta == 0) && (lr_delta == 0) ) {
                gesture.near_count_++;
            } else if( (ud_delta != 0) || (lr_delta != 0) ) {
                gesture.far_count_++;
            }

            if( (gesture.near_count_ >= 10) && (gesture.far_count_ >= 2) ) {
                if( (ud_delta == 0) && (lr_delta == 0) ) {
                    gesture.state_ = NEAR_STATE;
                } else if( (ud_delta != 0) && (lr_delta != 0) ) {
                    gesture.state_ = FAR_STATE;
                }
                return true;
            }
        }
    } else {
        if( (abs(ud_delta) < GESTURE_SENSITIVITY_2) &&
            (abs(lr_delta) < GESTURE_SENSITIVITY_2) ) {

            if( (ud_delta == 0) && (lr_delta == 0) ) {
                gesture.near_count_++;
            }

            if( gesture.near_count_ >= 10 ) {
                gesture.ud_count_ = 0;
                gesture.lr_count_ = 0;
                gesture.ud_delta_ = 0;
                gesture.lr_delta_ = 0;
            }
        }
    }

/*
#if DEBUG
    Serial.print("UD_CT: ");
    Serial.print(gesture.ud_count_);
    Serial.print(" LR_CT: ");
    Serial.print(gesture.lr_count_);
    Serial.print(" NEAR_CT: ");
    Serial.print(gesture.near_count_);
    Serial.print(" FAR_CT: ");
    Serial.println(gesture.far_count_);
    Serial.println("----------");
#endif
*/

    return false;
}

/**
 * @brief Determines swipe direction or near/far state
 *
 * @return True if near/far event. False otherwise.
 */
function decodeGesture()
{
    let gesture = this.gesture;
    let abs = Math.abs;

    /* Return if near or far event is detected */
    if( gesture.state_ == NEAR_STATE ) {
        gesture.motion_ = DIR_NEAR;
        return true;
    } else if ( gesture.state_ == FAR_STATE ) {
        gesture.motion_ = DIR_FAR;
        return true;
    }

    /* Determine swipe direction */
    if( (gesture.ud_count_ == -1) && (gesture.lr_count_ == 0) ) {
        gesture.motion_ = DIR_UP;
    } else if( (gesture.ud_count_ == 1) && (gesture.lr_count_ == 0) ) {
        gesture.motion_ = DIR_DOWN;
    } else if( (gesture.ud_count_ == 0) && (gesture.lr_count_ == 1) ) {
        gesture.motion_ = DIR_RIGHT;
    } else if( (gesture.ud_count_ == 0) && (gesture.lr_count_ == -1) ) {
        gesture.motion_ = DIR_LEFT;
    } else if( (gesture.ud_count_ == -1) && (gesture.lr_count_ == 1) ) {
        if( abs(gesture.ud_delta_) > abs(gesture.lr_delta_) ) {
            gesture.motion_ = DIR_UP;
        } else {
            gesture.motion_ = DIR_RIGHT;
        }
    } else if( (gesture.ud_count_ == 1) && (gesture.lr_count_ == -1) ) {
        if( abs(gesture.ud_delta_) > abs(gesture.lr_delta_) ) {
            gesture.motion_ = DIR_DOWN;
        } else {
            gesture.motion_ = DIR_LEFT;
        }
    } else if( (gesture.ud_count_ == -1) && (gesture.lr_count_ == -1) ) {
        if( abs(gesture.ud_delta_) > abs(gesture.lr_delta_) ) {
            gesture.motion_ = DIR_UP;
        } else {
            gesture.motion_ = DIR_LEFT;
        }
    } else if( (gesture.ud_count_ == 1) && (gesture.lr_count_ == 1) ) {
        if( abs(gesture.ud_delta_) > abs(gesture.lr_delta_) ) {
            gesture.motion_ = DIR_DOWN;
        } else {
            gesture.motion_ = DIR_RIGHT;
        }
    } else {
        return false;
    }

    return true;
}

/*******************************************************************************
 * Getters and setters for register values
 ******************************************************************************/

/**
 * @brief Returns the lower threshold for proximity detection
 *
 * @return lower threshold
 */
function getProxIntLowThresh()
{
    /* Read value from PILT register */
    return read(APDS9960_PILT);
}

/**
 * @brief Sets the lower threshold for proximity detection
 *
 * @param[in] threshold the lower proximity threshold
 */
function setProxIntLowThresh(threshold)
{
    write(APDS9960_PILT, threshold);
}

/**
 * @brief Returns the high threshold for proximity detection
 *
 * @return high threshold
 */
function getProxIntHighThresh()
{
    return read(APDS9960_PIHT);
}

/**
 * @brief Sets the high threshold for proximity detection
 *
 * @param[in] threshold the high proximity threshold
 * @return True if operation successful. False otherwise.
 */
function setProxIntHighThresh(threshold)
{
    write(APDS9960_PIHT, threshold);
}

/**
 * @brief Returns LED drive strength for proximity and ALS
 *
 * Value    LED Current
 *   0        100 mA
 *   1         50 mA
 *   2         25 mA
 *   3         12.5 mA
 *
 * @return the value of the LED drive strength. 0xFF on failure.
 */
function getLEDDrive()
{
    let val = read(APDS9960_CONTROL);

    /* Shift and mask out LED drive bits */
    val = (val >> 6) & 0b00000011;

    return val;
}

/**
 * @brief Sets the LED drive strength for proximity and ALS
 *
 * Value    LED Current
 *   0        100 mA
 *   1         50 mA
 *   2         25 mA
 *   3         12.5 mA
 *
 * @param[in] drive the value (0-3) for the LED drive strength
 */
function setLEDDrive(drive)
{
    /* Read value from CONTROL register */
    let val = read(APDS9960_CONTROL);

    /* Set bits in register to given value */
    drive &= 0b00000011;
    drive = drive << 6;
    val &= 0b00111111;
    val |= drive;

    /* Write register value back into CONTROL register */
    write(APDS9960_CONTROL, val);
}

/**
 * @brief Returns receiver gain for proximity detection
 *
 * Value    Gain
 *   0       1x
 *   1       2x
 *   2       4x
 *   3       8x
 *
 * @return the value of the proximity gain. 0xFF on failure.
 */
function getProximityGain()
{
    /* Read value from CONTROL register */
    let val = read(APDS9960_CONTROL);

    /* Shift and mask out PDRIVE bits */
    val = (val >> 2) & 0b00000011;

    return val;
}

/**
 * @brief Sets the receiver gain for proximity detection
 *
 * Value    Gain
 *   0       1x
 *   1       2x
 *   2       4x
 *   3       8x
 *
 * @param[in] drive the value (0-3) for the gain
 * @return True if operation successful. False otherwise.
 */
function setProximityGain(drive)
{
    /* Read value from CONTROL register */
    let val = read(APDS9960_CONTROL);

    /* Set bits in register to given value */
    drive &= 0b00000011;
    drive = drive << 2;
    val &= 0b11110011;
    val |= drive;

    /* Write register value back into CONTROL register */
    write(APDS9960_CONTROL, val);
}

/**
 * @brief Returns receiver gain for the ambient light sensor (ALS)
 *
 * Value    Gain
 *   0        1x
 *   1        4x
 *   2       16x
 *   3       64x
 *
 * @return the value of the ALS gain. 0xFF on failure.
 */
function getAmbientLightGain()
{
    /* Read value from CONTROL register */
    let val = read(APDS9960_CONTROL);

    /* Shift and mask out ADRIVE bits */
    val &= 0b00000011;

    return val;
}

/**
 * @brief Sets the receiver gain for the ambient light sensor (ALS)
 *
 * Value    Gain
 *   0        1x
 *   1        4x
 *   2       16x
 *   3       64x
 *
 * @param[in] drive the value (0-3) for the gain
 * @return True if operation successful. False otherwise.
 */
function setAmbientLightGain(drive)
{
    /* Read value from CONTROL register */
    let val = read(APDS9960_CONTROL);

    /* Set bits in register to given value */
    drive &= 0b00000011;
    val &= 0b11111100;
    val |= drive;

    /* Write register value back into CONTROL register */
    write(APDS9960_CONTROL, val);
}

/**
 * @brief Get the current LED boost value
 *
 * Value  Boost Current
 *   0        100%
 *   1        150%
 *   2        200%
 *   3        300%
 *
 * @return The LED boost value. 0xFF on failure.
 */
function getLEDBoost()
{
    /* Read value from CONFIG2 register */
    let val = read(APDS9960_CONFIG2);

    /* Shift and mask out LED_BOOST bits */
    val = (val >> 4) & 0b00000011;

    return val;
}

/**
 * @brief Sets the LED current boost value
 *
 * Value  Boost Current
 *   0        100%
 *   1        150%
 *   2        200%
 *   3        300%
 *
 * @param[in] drive the value (0-3) for current boost (100-300%)
 */
function setLEDBoost(boost)
{
    /* Read value from CONFIG2 register */
    let val = read(APDS9960_CONFIG2);

    /* Set bits in register to given value */
    boost &= 0b00000011;
    boost = boost << 4;
    val &= 0b11001111;
    val |= boost;

    /* Write register value back into CONFIG2 register */
    write(APDS9960_CONFIG2, val);
}

/**
 * @brief Gets proximity gain compensation enable
 *
 * @return 1 if compensation is enabled. 0 if not. 0xFF on error.
 */
function getProxGainCompEnable()
{
    /* Read value from CONFIG3 register */
    let val = read(APDS9960_CONFIG3);

    /* Shift and mask out PCMP bits */
    val = (val >> 5) & 0b00000001;

    return val;
}

/**
 * @brief Sets the proximity gain compensation enable
 *
 * @param[in] enable 1 to enable compensation. 0 to disable compensation.
 */
function setProxGainCompEnable(enable)
{
    /* Read value from CONFIG3 register */
    let val = read(APDS9960_CONFIG3);

    /* Set bits in register to given value */
    enable &= 0b00000001;
    enable = enable << 5;
    val &= 0b11011111;
    val |= enable;

    /* Write register value back into CONFIG3 register */
    write(APDS9960_CONFIG3, val);
}

/**
 * @brief Gets the current mask for enabled/disabled proximity photodiodes
 *
 * 1 = disabled, 0 = enabled
 * Bit    Photodiode
 *  3       UP
 *  2       DOWN
 *  1       LEFT
 *  0       RIGHT
 *
 * @return Current proximity mask for photodiodes. 0xFF on error.
 */
function getProxPhotoMask()
{
    let val = read(APDS9960_CONFIG3);

    /* Mask out photodiode enable mask bits */
    val &= 0b00001111;

    return val;
}

/**
 * @brief Sets the mask for enabling/disabling proximity photodiodes
 *
 * 1 = disabled, 0 = enabled
 * Bit    Photodiode
 *  3       UP
 *  2       DOWN
 *  1       LEFT
 *  0       RIGHT
 *
 * @param[in] mask 4-bit mask value
 */
function setProxPhotoMask(mask)
{
    /* Read value from CONFIG3 register */
    let val = read(APDS9960_CONFIG3);

    /* Set bits in register to given value */
    mask &= 0b00001111;
    val &= 0b11110000;
    val |= mask;

    /* Write register value back into CONFIG3 register */
    write(APDS9960_CONFIG3, val);
}

/**
 * @brief Gets the entry proximity threshold for gesture sensing
 *
 * @return Current entry proximity threshold.
 */
function getGestureEnterThresh()
{

    /* Read value from GPENTH register */
    let val = read(APDS9960_GPENTH);

    return val;
}

/**
 * @brief Sets the entry proximity threshold for gesture sensing
 *
 * @param[in] threshold proximity value needed to start gesture mode
 */
function setGestureEnterThresh(threshold)
{
    write(APDS9960_GPENTH, threshold);
}

/**
 * @brief Gets the exit proximity threshold for gesture sensing
 *
 * @return Current exit proximity threshold.
 */
function getGestureExitThresh()
{
    let val = read(APDS9960_GEXTH);

    return val;
}

/**
 * @brief Sets the exit proximity threshold for gesture sensing
 *
 * @param[in] threshold proximity value needed to end gesture mode
 */
function setGestureExitThresh(threshold)
{
    write(APDS9960_GEXTH, threshold);
}

/**
 * @brief Gets the gain of the photodiode during gesture mode
 *
 * Value    Gain
 *   0       1x
 *   1       2x
 *   2       4x
 *   3       8x
 *
 * @return the current photodiode gain. 0xFF on error.
 */
function getGestureGain()
{
    /* Read value from GCONF2 register */
    let val = read(APDS9960_GCONF2);

    /* Shift and mask out GGAIN bits */
    val = (val >> 5) & 0b00000011;

    return val;
}

/**
 * @brief Sets the gain of the photodiode during gesture mode
 *
 * Value    Gain
 *   0       1x
 *   1       2x
 *   2       4x
 *   3       8x
 *
 * @param[in] gain the value for the photodiode gain
 */
function setGestureGain(gain)
{
    /* Read value from GCONF2 register */
    let val = read(APDS9960_GCONF2);

    /* Set bits in register to given value */
    gain &= 0b00000011;
    gain = gain << 5;
    val &= 0b10011111;
    val |= gain;

    /* Write register value back into GCONF2 register */
    write(APDS9960_GCONF2, val);
}

/**
 * @brief Gets the drive current of the LED during gesture mode
 *
 * Value    LED Current
 *   0        100 mA
 *   1         50 mA
 *   2         25 mA
 *   3         12.5 mA
 *
 * @return the LED drive current value. 0xFF on error.
 */
function getGestureLEDDrive()
{
    let val = read(APDS9960_GCONF2);

    /* Shift and mask out GLDRIVE bits */
    val = (val >> 3) & 0b00000011;

    return val;
}

/**
 * @brief Sets the LED drive current during gesture mode
 *
 * Value    LED Current
 *   0        100 mA
 *   1         50 mA
 *   2         25 mA
 *   3         12.5 mA
 *
 * @param[in] drive the value for the LED drive current
 */
function setGestureLEDDrive(drive)
{
    /* Read value from GCONF2 register */
    let val = read(APDS9960_GCONF2);

    /* Set bits in register to given value */
    drive &= 0b00000011;
    drive = drive << 3;
    val &= 0b11100111;
    val |= drive;

    /* Write register value back into GCONF2 register */
    write(APDS9960_GCONF2, val);
}

/**
 * @brief Gets the time in low power mode between gesture detections
 *
 * Value    Wait time
 *   0          0 ms
 *   1          2.8 ms
 *   2          5.6 ms
 *   3          8.4 ms
 *   4         14.0 ms
 *   5         22.4 ms
 *   6         30.8 ms
 *   7         39.2 ms
 *
 * @return the current wait time between gestures. 0xFF on error.
 */
function getGestureWaitTime()
{
    /* Read value from GCONF2 register */
    let val = read(APDS9960_GCONF2);

    /* Mask out GWTIME bits */
    val &= 0b00000111;

    return val;
}

/**
 * @brief Sets the time in low power mode between gesture detections
 *
 * Value    Wait time
 *   0          0 ms
 *   1          2.8 ms
 *   2          5.6 ms
 *   3          8.4 ms
 *   4         14.0 ms
 *   5         22.4 ms
 *   6         30.8 ms
 *   7         39.2 ms
 *
 * @param[in] the value for the wait time
 */
function setGestureWaitTime(time)
{
    /* Read value from GCONF2 register */
    let val = read(APDS9960_GCONF2);

    /* Set bits in register to given value */
    time &= 0b00000111;
    val &= 0b11111000;
    val |= time;

    /* Write register value back into GCONF2 register */
    write(APDS9960_GCONF2, val);
}

/**
 * @brief Gets the low threshold for ambient light interrupts
 *
 * @return current low threshold stored on the APDS-9960
 */
function getLightIntLowThreshold()
{
    /* Read value from ambient light low threshold, low byte register */
    let val_lo = read(APDS9960_AILTL);
    /* Read value from ambient light low threshold, high byte register */
    let val_hi = read(APDS9960_AILTH);
    return val_lo + (val_hi << 8);
}

/**
 * @brief Sets the low threshold for ambient light interrupts
 *
 * @param[in] threshold low threshold value for interrupt to trigger
 */
function setLightIntLowThreshold(threshold)
{
    /* Break 16-bit threshold into 2 8-bit values */
    write(APDS9960_AILTL, threshold & 0x00FF);
    write(APDS9960_AILTH, (threshold & 0xFF00) >> 8);
}

/**
 * @brief Gets the high threshold for ambient light interrupts
 *
 * @return threshold current low threshold stored on the APDS-9960
 */
function getLightIntHighThreshold()
{
    /* Read value from ambient light high threshold, low byte register */
    let val_lo = read(APDS9960_AIHTL);
    /* Read value from ambient light high threshold, high byte register */
    let val_hi = read(APDS9960_AIHTH);
    return val_lo + (val_hi << 8);
}

/**
 * @brief Sets the high threshold for ambient light interrupts
 *
 * @param[in] threshold high threshold value for interrupt to trigger
 */
function setLightIntHighThreshold(threshold)
{
    write(APDS9960_AIHTL, threshold & 0x00FF);
    write(APDS9960_AIHTH, (threshold & 0xFF00) >> 8);
}

/**
 * @brief Gets the low threshold for proximity interrupts
 *
 * @return threshold current low threshold stored on the APDS-9960
 */
function getProximityIntLowThreshold()
{
    /* Read value from proximity low threshold register */
    return read(APDS9960_PILT);
}

/**
 * @brief Sets the low threshold for proximity interrupts
 *
 * @param[in] threshold low threshold value for interrupt to trigger
 */
function setProximityIntLowThreshold(threshold)
{
    /* Write threshold value to register */
    write(APDS9960_PILT, threshold);
}

/**
 * @brief Gets the high threshold for proximity interrupts
 *
 * @return current low threshold stored on the APDS-9960
 */
function getProximityIntHighThreshold()
{
    /* Read value from proximity low threshold register */
    return read(APDS9960_PIHT);
}

/**
 * @brief Sets the high threshold for proximity interrupts
 *
 * @param[in] threshold high threshold value for interrupt to trigger
 */
function setProximityIntHighThreshold(threshold)
{
    /* Write threshold value to register */
    write(APDS9960_PIHT, threshold);
}

/**
 * @brief Gets if ambient light interrupts are enabled or not
 *
 * @return 1 if interrupts are enabled, 0 if not. 0xFF on error.
 */
function getAmbientLightIntEnable()
{
    /* Read value from ENABLE register */
    let val = read(APDS9960_ENABLE);

    /* Shift and mask out AIEN bit */
    val = (val >> 4) & 0b00000001;

    return val;
}

/**
 * @brief Turns ambient light interrupts on or off
 *
 * @param[in] enable 1 to enable interrupts, 0 to turn them off
 */
function setAmbientLightIntEnable(enable)
{
    /* Read value from ENABLE register */
    let val = read(APDS9960_ENABLE);

    /* Set bits in register to given value */
    enable &= 0b00000001;
    enable = enable << 4;
    val &= 0b11101111;
    val |= enable;

    /* Write register value back into ENABLE register */
    write(APDS9960_ENABLE, val);
}

/**
 * @brief Gets if proximity interrupts are enabled or not
 *
 * @return 1 if interrupts are enabled, 0 if not. 0xFF on error.
 */
function getProximityIntEnable()
{
    /* Read value from ENABLE register */
    let val = read(APDS9960_ENABLE);

    /* Shift and mask out PIEN bit */
    val = (val >> 5) & 0b00000001;

    return val;
}

/**
 * @brief Turns proximity interrupts on or off
 *
 * @param[in] enable 1 to enable interrupts, 0 to turn them off
 */
function setProximityIntEnable(enable)
{
    /* Read value from ENABLE register */
    let val = read(APDS9960_ENABLE);

    /* Set bits in register to given value */
    enable &= 0b00000001;
    enable = enable << 5;
    val &= 0b11011111;
    val |= enable;

    /* Write register value back into ENABLE register */
    write(APDS9960_ENABLE, val);
}

/**
 * @brief Gets if gesture interrupts are enabled or not
 *
 * @return 1 if interrupts are enabled, 0 if not. 0xFF on error.
 */
function getGestureIntEnable()
{
    /* Read value from GCONF4 register */
    let val = read(APDS9960_GCONF4);

    /* Shift and mask out GIEN bit */
    val = (val >> 1) & 0b00000001;

    return val;
}

/**
 * @brief Turns gesture-related interrupts on or off
 *
 * @param[in] enable 1 to enable interrupts, 0 to turn them off
 */
function setGestureIntEnable(enable)
{
    /* Read value from GCONF4 register */
    let val = read(APDS9960_GCONF4);

    /* Set bits in register to given value */
    enable &= 0b00000001;
    enable = enable << 1;
    val &= 0b11111101;
    val |= enable;

    /* Write register value back into GCONF4 register */
    write(APDS9960_GCONF4, val);
}

/**
 * @brief Clears the ambient light interrupt
 *
 * @return void
 */
function clearAmbientLightInt()
{
    read(APDS9960_AICLEAR);
}

/**
 * @brief Clears the proximity interrupt
 *
 * @return void
 */
function clearProximityInt()
{
    read(APDS9960_PICLEAR);
}

/**
 * @brief Tells if the gesture state machine is currently running
 *
 * @return 1 if gesture state machine is running, 0 if not. 0xFF on error.
 */
function getGestureMode()
{
    /* Read value from GCONF4 register */
    let val = read(APDS9960_GCONF4);

    /* Mask out GMODE bit */
    val &= 0b00000001;

    return val;
}

/**
 * @brief Tells the state machine to either enter or exit gesture state machine
 *
 * @param[in] mode 1 to enter gesture state machine, 0 to exit.
 */
function setGestureMode(mode)
{
    /* Read value from GCONF4 register */
    let val = read(APDS9960_GCONF4);

    /* Set bits in register to given value */
    mode &= 0b00000001;
    val &= 0b11111110;
    val |= mode;

    /* Write register value back into GCONF4 register */
    write(APDS9960_GCONF4, val);
}

/**
 * @brief Configures I2C communications and initializes registers to defaults
 *
 * @return True if initialized successfully. False otherwise.
 */
    var read = apds.read;
    var write = apds.write;

    apds.readProximity = readProximity;
    apds.readGesture = readGesture;
    apds.readAmbientLight = readAmbientLight;
    apds.enableLightSensor = enableLightSensor;
    apds.readRedLight = readRedLight;
    apds.readGreenLight = readGreenLight;
    apds.readBlueLight = readBlueLight;
    console.log('init', Object.keys(apds));

    /* Read ID register and check against known values for APDS-9960 */
    let id = read(APDS9960_ID);
    console.log('ID: ', id);
    if( !(id == APDS9960_ID_1 || id == APDS9960_ID_2) ) {
        console.log('Wrong ID: ', id);
        return false;
    }

    /* Set ENABLE register to 0 (disable all features) */
    setMode(ALL, OFF);

    /* Set default values for ambient light and proximity registers */
    write(APDS9960_ATIME, DEFAULT_ATIME);
    write(APDS9960_WTIME, DEFAULT_WTIME);
    write(APDS9960_PPULSE, DEFAULT_PROX_PPULSE);
    write(APDS9960_POFFSET_UR, DEFAULT_POFFSET_UR);
    write(APDS9960_POFFSET_DL, DEFAULT_POFFSET_DL);
    write(APDS9960_CONFIG1, DEFAULT_CONFIG1);
    setLEDDrive(DEFAULT_LDRIVE);
    setProximityGain(DEFAULT_PGAIN);
    setAmbientLightGain(DEFAULT_AGAIN);
    setProxIntLowThresh(DEFAULT_PILT);
    setProxIntHighThresh(DEFAULT_PIHT);
    setLightIntLowThreshold(DEFAULT_AILT);
    setLightIntHighThreshold(DEFAULT_AIHT);
    write(APDS9960_PERS, DEFAULT_PERS);
    write(APDS9960_CONFIG2, DEFAULT_CONFIG2);
    write(APDS9960_CONFIG3, DEFAULT_CONFIG3);

    /* Set default values for gesture sense registers */
    setGestureEnterThresh(DEFAULT_GPENTH);
    setGestureExitThresh(DEFAULT_GEXTH);
    write(APDS9960_GCONF1, DEFAULT_GCONF1);
    setGestureGain(DEFAULT_GGAIN);
    setGestureLEDDrive(DEFAULT_GLDRIVE);
    setGestureWaitTime(DEFAULT_GWTIME);
    write(APDS9960_GOFFSET_U, DEFAULT_GOFFSET);
    write(APDS9960_GOFFSET_D, DEFAULT_GOFFSET);
    write(APDS9960_GOFFSET_L, DEFAULT_GOFFSET);
    write(APDS9960_GOFFSET_R, DEFAULT_GOFFSET);
    write(APDS9960_GPULSE, DEFAULT_GPULSE);
    write(APDS9960_GCONF3, DEFAULT_GCONF3);
    setGestureIntEnable(DEFAULT_GIEN)

    /* Gesture config register dump */
/*
#if 0
    let reg;
    let val;

    for(reg = 0x80; reg <= 0xAF; reg++) {
        if( (reg != 0x82) &&
            (reg != 0x8A) &&
            (reg != 0x91) &&
            (reg != 0xA8) &&
            (reg != 0xAC) &&
            (reg != 0xAD) )
        {
            val = read(reg);
            Serial.print(reg, HEX);
            Serial.print(": 0x");
            Serial.println(val, HEX);
        }
    }

    for(reg = 0xE4; reg <= 0xE7; reg++) {
        val = read(reg);
        Serial.print(reg, HEX);
        Serial.print(": 0x");
        Serial.println(val, HEX);
    }
#endif
*/
    return true;
}
