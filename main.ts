/*
 microbot package
*/
 //% weight=10 icon="\uf013" color=#2896ff
namespace microbot {

    export enum Servos {
		S1 = 0x01,
		S2 = 0x02,
		S3 = 0x03,
		S4 = 0x04,
		S5 = 0x05,
		S6 = 0x06,
		S7 = 0x07,
		S8 = 0x08
	}
	
    export enum Colors {
        //% blockId="Red" block="Red"
        Red = 0x01,
        //% blockId="Green" block="Green"
        Green = 0x02,
        //% blockId="Blue" block="Blue"
		Blue = 0x03,
    }

    export enum Lights {
        //% block="Light 1"
        Light1 = 0x00,
        //% block="Light 2"
        Light2 = 0x01
    }

    export enum SendType {
        //% block="Set immediately"
        NoDelaySend = 0x00,
        //% block="Set delay"
        DelaySend = 0x01
    }
    
    export enum LineFollower {
        //% blockId="S1_OUT_S2_OUT" block="Sensor1 and sensor2 are out black line"
        S1_OUT_S2_OUT = 0x00,
        //% blockId="S1_OUT_S2_IN" block="Sensor2 in black line but sensor1 not"
        S1_OUT_S2_IN = 0x01,
        //% blockId="S1_IN_S2_OUT" block="Sensor1 in black line but sensor2 not"
        S1_IN_S2_OUT = 0x02,
        //% blockId="S1_IN_S2_IN" block="Sensor1 and sensor2 are in black line "
        S1_IN_S2_IN = 0x03
    }

    export enum CmdType {
        //% block="Invalid command"
        NO_COMMAND = 0,
        //% block="car run"
        CAR_RUN = 1,
        //% block="Servo"
        SERVO = 2,
        //% block="Ultrasonic distance"
        ULTRASONIC = 3,
        //% block="Temperature"
        TEMPERATURE = 4,
        //% block="Sound"
        SOUND = 5,
        //% block="Light"
        LIGHT = 6,
        //% block="Rgb light"
        RGB_LIGHT = 8,
        //% block="Honk horn"
        DIDI = 9,
        //% block="Read firmware version"
        VERSION = 10
    }

    export enum CarRunCmdType {
        //% block="Stop"
        STOP = 0,
        //% block="Go ahead"
        GO_AHEAD,
        //% block="Back"
        GO_BACK,
        //% block="Turn left"
        TURN_LEFT,
        //% block="Turn right"
        TURN_RIGHT,
        //% block="Go ahead slowly"
        GO_AHEAD_SLOW,
        //% block="Turn left slowly"
        TURN_LEFT_SLOW,
        //% block="Turn right slowly"
        TURN_RIGHT_SLOW,
        //% block="Invalid command"
        COMMAND_ERRO
    }


    let lhRGBLight: RGBLight.LHRGBLight;
	let R_F: number;
	let r_f: number;
	
	let g_f: number;
	let G_F: number;

	let b_f: number;
	let B_F: number;

	/**
   * Microbot board initialization, please execute at boot time
  */
  //% weight=100 blockId=microbotInit block="Initialize Microbot"
  export function microbotInit() {
	serial.redirect(
   SerialPin.P12,
   SerialPin.P8,
   BaudRate.BaudRate9600);
      initRGBLight();   
      initColorSensor();
}

/**
* Set the angle of servo 1 to 8, range of 0~180 degree
*/
//% weight=98 blockId=setServo block="Set servo|index %index|angle %angle|duration %duration"
//% angle.min=0 angle.max=180
    export function setServo(index: number, angle: number, duration: number) {
        if (angle > 180 || angle < 0)
        {
            return; 
        }    
        let position = mapRGB(angle, 0, 180, 500, 2500);
       
	   let buf = pins.createBuffer(10);
	   buf[0] = 0x55;
	   buf[1] = 0x55;
	   buf[2] = 0x08;
	   buf[3] = 0x03;//cmd type
	   buf[4] = 0x01;
	   buf[5] = duration & 0xff;
	   buf[6] = (duration >> 8) & 0xff;
	   buf[7] = index;
	   buf[8] = position & 0xff;
	   buf[9] = (position >> 8) & 0xff;
	   serial.writeBuffer(buf);
}

/**
*	Set the speed of the number 1 motor and number 2 motor, range of -100~100, that can control the tank to go advance or turn of.
*/
//% weight=96 blockGap=50 blockId=setMotor block="Set motor1 speed|%speed1|and motor2|speed %speed2"
//% speed1.min=-100 speed1.max=100
//% speed2.min=-100 speed2.max=100
    export function setMotorSpeed(speed1: number, speed2: number) {
        if (speed1 > 100 || speed1 < -100 || speed2 > 100 || speed2 < -100) {
            return;
        }
        speed1 = speed1 * -1;
        speed2 = speed2 * -1;
   let buf = pins.createBuffer(6);
   buf[0] = 0x55;
   buf[1] = 0x55;
   buf[2] = 0x04;
   buf[3] = 0x32;//cmd type
   buf[4] = speed1;
   buf[5] = speed2;
   serial.writeBuffer(buf);
}
    

/**
*  Obtain the distance of ultrasonic detection to the obstacle
*/
//% weight=94 blockId=Ultrasonic block="Ultrasonic distance(cm)"
   export function Ultrasonic(): number {
	   //init pins
   let echoPin:DigitalPin = DigitalPin.P13;
   let trigPin:DigitalPin = DigitalPin.P14;
   pins.setPull(echoPin, PinPullMode.PullNone);
   pins.setPull(trigPin, PinPullMode.PullNone);
		   
   // send pulse
   pins.digitalWritePin(trigPin, 0);
   control.waitMicros(2);
   pins.digitalWritePin(trigPin, 1);
   control.waitMicros(10);
   pins.digitalWritePin(trigPin, 0);
   control.waitMicros(2);
   // read pulse
   let d = pins.pulseIn(echoPin, PulseValue.High, 11600);
   return d / 58;
   }

/**
* Get the volume level detected by the sound sensor, range 0 to 255
*/
//% weight=92 blockId=Sound block="Sound volume"
	export function getSoundVolume(): number {
        let volume = pins.analogReadPin(AnalogPin.P1);
        volume = mapRGB(volume, 0, 1023, 0, 255);
  	    return volume;
	}	
	
    /**
     * Obtain the condition of the tracking sensor
     */
    //% weight=90 blockGap=50 blockId=readLineStatus block="Line follower status |%status|"
    export function readLineFollowerStatus(status: LineFollower): boolean {
        let s1 = pins.digitalReadPin(DigitalPin.P2);
        let s2 = pins.digitalReadPin(DigitalPin.P16);
        let s = ((1 & s1) << 1) | s2;
        if (s == status)
        {
            return true;
        }    
        else
        {
            return false;
        }     
    }

    /**
	 * Initialize RGB
	 */
	function initRGBLight() {
		if (!lhRGBLight) {
			lhRGBLight = RGBLight.create(DigitalPin.P15, 2, RGBPixelMode.RGB);
		}
    }
    
    /**
     * Set the color of the colored lights, after finished the setting please perform  the display of colored lights.
     */
    //% weight=86 blockId=setLightColor block="Set|%lightoffset|color to %rgb"
    export function setPixelRGB(lightoffset: Lights, rgb: RGBColors)
    {
        lhRGBLight.setPixelColor(lightoffset, rgb);
    }
    /**
     * Set RGB Color argument
     */
    //% weight=85 blockId=setLightColorArgs block="Set|%lightoffset|color to %rgb"
    export function setPixelRGBArgs(lightoffset: Lights, rgb: number)
    {
        lhRGBLight.setPixelColor(lightoffset, rgb);
    }

    /**
     * Display the colored lights, and set the color of the colored lights to match the use. After setting the color of the colored lights, the color of the lights must be displayed.
     */
    //% weight=84 blockId=showLight block="Show light"
    export function showLight() {
        lhRGBLight.show();
    }

    /**
     * Clear the color of the colored lights and turn off the lights.
     */
    //% weight=82 blockGap=50 blockId=clearLight block="Clear light"
    export function clearLight() {
        lhRGBLight.clear();
    }


	const APDS9960_I2C_ADDR = 0x39;
    const APDS9960_ID_1 = 0xA8;
    const APDS9960_ID_2 = 0x9C;
    /* APDS-9960 register addresses */
    const APDS9960_ENABLE = 0x80;
    const APDS9960_ATIME  = 0x81;
    const APDS9960_WTIME  = 0x83;
    const APDS9960_AILTL  = 0x84;
    const APDS9960_AILTH  = 0x85;
    const APDS9960_AIHTL  = 0x86;
    const APDS9960_AIHTH  = 0x87;
    const APDS9960_PILT = 0x89;
    const APDS9960_PIHT = 0x8B;
    const APDS9960_PERS = 0x8C;
    const APDS9960_CONFIG1 = 0x8D;
    const APDS9960_PPULSE  = 0x8E;
    const APDS9960_CONTROL = 0x8F;
    const APDS9960_CONFIG2 = 0x90;
    const APDS9960_ID = 0x92;
    const APDS9960_STATUS  = 0x93;
    const APDS9960_CDATAL  = 0x94;
    const APDS9960_CDATAH  = 0x95;
    const APDS9960_RDATAL  = 0x96;
    const APDS9960_RDATAH  = 0x97;
    const APDS9960_GDATAL  = 0x98;
    const APDS9960_GDATAH  = 0x99;
    const APDS9960_BDATAL  = 0x9A;
    const APDS9960_BDATAH  = 0x9B;
    const APDS9960_PDATA   = 0x9C;
    const APDS9960_POFFSET_UR = 0x9D;
    const APDS9960_POFFSET_DL = 0x9E;
    const APDS9960_CONFIG3 = 0x9F;


    /* LED Drive values */
    const LED_DRIVE_100MA = 0;
    const LED_DRIVE_50MA = 1;
    const LED_DRIVE_25MA = 2;
    const LED_DRIVE_12_5MA = 3;

    /* ALS Gain (AGAIN) values */
    const AGAIN_1X = 0;
    const AGAIN_4X = 1;
    const AGAIN_16X = 2;
    const AGAIN_64X = 3;
    
    /* Default values */
    const DEFAULT_ATIME = 219;    // 103ms
    const DEFAULT_WTIME = 246;    // 27ms
    const DEFAULT_PROX_PPULSE = 0x87;    // 16us, 8 pulses
    const DEFAULT_GESTURE_PPULSE = 0x89;    // 16us, 10 pulses
    const DEFAULT_POFFSET_UR = 0;       // 0 offset
    const DEFAULT_POFFSET_DL = 0;       // 0 offset      
    const DEFAULT_CONFIG1 = 0x60;    // No 12x wait (WTIME) factor
    const DEFAULT_PILT = 0;       // Low proximity threshold
    const DEFAULT_PIHT = 50;      // High proximity threshold
    const DEFAULT_AILT = 0xFFFF;  // Force interrupt for calibration
    const DEFAULT_AIHT = 0;
    const DEFAULT_PERS = 0x11;    // 2 consecutive prox or ALS for int.
    const DEFAULT_CONFIG2 = 0x01;    // No saturation interrupts or LED boost  
    const DEFAULT_CONFIG3 = 0;       // Enable all photodiodes, no SAI
    const DEFAULT_GPENTH = 40;      // Threshold for entering gesture mode
    const DEFAULT_GEXTH = 30;      // Threshold for exiting gesture mode    
    const DEFAULT_GCONF1 = 0x40;    // 4 gesture events for int., 1 for exit
    const DEFAULT_GOFFSET = 0;       // No offset scaling for gesture mode
    const DEFAULT_GPULSE = 0xC9;    // 32us, 10 pulses
    const DEFAULT_GCONF3 = 0;       // All photodiodes active during gesture
    const DEFAULT_GIEN = 0;       // Disable gesture interrupts
    const DEFAULT_LDRIVE = LED_DRIVE_100MA;
    const DEFAULT_AGAIN = AGAIN_4X;
    
    const OFF = 0;
    const ON = 1;
    const POWER = 0;
    const AMBIENT_LIGHT = 1;
    const PROXIMITY = 2;
    const WAIT = 3;
    const AMBIENT_LIGHT_INT = 4;
    const PROXIMITY_INT = 5;
    const GESTURE = 6;
    const ALL = 7;


    function i2cwrite(reg: number, value: number) {
       let buf = pins.createBuffer(2);
       buf[0] = reg;
       buf[1] = value;
       pins.i2cWriteBuffer(APDS9960_I2C_ADDR, buf);
    }

     function i2cread(reg: number): number {
		pins.i2cWriteNumber(APDS9960_I2C_ADDR, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(APDS9960_I2C_ADDR, NumberFormat.UInt8BE);
        return val;
    }

     function InitColor(): boolean {
         let id = i2cread(APDS9960_ID);
        //  serial.writeLine("id:")
        //  serial.writeNumber(id); 
        if (!(id == APDS9960_ID_1 || id == APDS9960_ID_2)) {
            return false;
         }
        //  serial.writeLine("set mode:")
        setMode(ALL, OFF);
        i2cwrite(APDS9960_ATIME, DEFAULT_ATIME);
        i2cwrite(APDS9960_WTIME, DEFAULT_WTIME);
        i2cwrite(APDS9960_PPULSE, DEFAULT_PROX_PPULSE);
        i2cwrite(APDS9960_POFFSET_UR, DEFAULT_POFFSET_UR);
        i2cwrite(APDS9960_POFFSET_DL, DEFAULT_POFFSET_DL);
         i2cwrite(APDS9960_CONFIG1, DEFAULT_CONFIG1);
        setLEDDrive(DEFAULT_LDRIVE);
        setAmbientLightGain(DEFAULT_AGAIN);
        setLightIntLowThreshold(DEFAULT_AILT);
        setLightIntHighThreshold(DEFAULT_AIHT);
        i2cwrite(APDS9960_PERS, DEFAULT_PERS);
        i2cwrite(APDS9960_CONFIG2, DEFAULT_CONFIG2);
        i2cwrite(APDS9960_CONFIG3, DEFAULT_CONFIG3);
        return true;  
    }
        
     function setMode(mode: number, enable: number) {
         let reg_val = getMode();
         serial.writeLine("mode:");
         serial.writeNumber(reg_val);
            /* Change bit(s) in ENABLE register */
        enable = enable & 0x01;
         if (mode >= 0 && mode <= 6)
         {
             if (enable > 0)
             {
                reg_val |= (1 << mode);
             }
             else
             {
                //reg_val &= ~(1 << mode);
                 reg_val &= (0xff-(1 << mode)); 
             }
        }
         else if(mode == ALL)
         {
             if (enable > 0)
             {
                reg_val = 0x7F;
             }
             else
             {
                reg_val = 0x00;
             }
        }
        i2cwrite(APDS9960_ENABLE,reg_val);
    }
    
     function getMode(): number {
            let enable_value = i2cread(APDS9960_ENABLE);
            return enable_value;
        }

     function setLEDDrive(drive: number) {
        let val = i2cread(APDS9960_CONTROL);
            /* Set bits in register to given value */
         drive &= 0b00000011;
         drive = drive << 6;
         val &= 0b00111111;
         val |= drive;
         i2cwrite(APDS9960_CONTROL,val);
    }
    
     function setLightIntLowThreshold(threshold: number) {
        let val_low = threshold & 0x00FF;
        let val_high = (threshold & 0xFF00) >> 8;
        i2cwrite(APDS9960_AILTL, val_low);
        i2cwrite(APDS9960_AILTH,val_high);
    }

     function setLightIntHighThreshold(threshold: number) {
        let val_low = threshold & 0x00FF;
        let val_high = (threshold & 0xFF00) >> 8;
        i2cwrite(APDS9960_AIHTL, val_low);
        i2cwrite(APDS9960_AIHTH, val_high);
    }

     function enableLightSensor(interrupts: boolean) {
        setAmbientLightGain(DEFAULT_AGAIN);
        if (interrupts)
        {
            setAmbientLightIntEnable(1);
        }   
        else
        {
            setAmbientLightIntEnable(0);
        }
        enablePower();
        setMode(AMBIENT_LIGHT,1);
    }

     function setAmbientLightGain(drive: number) {
        let val = i2cread(APDS9960_CONTROL);
            /* Set bits in register to given value */
        drive &= 0b00000011;
        val &= 0b11111100;
        val |= drive;
        i2cwrite(APDS9960_CONTROL,val);
    }

     function getAmbientLightGain(): number {
        let val = i2cread(APDS9960_CONTROL);
        val &= 0b00000011;
        return val;
    }

     function enablePower() {
        setMode(POWER,1);
    }

     function setAmbientLightIntEnable(enable: number) {
        let val = i2cread(APDS9960_ENABLE);
            /* Set bits in register to given value */
        enable &= 0b00000001;
        enable = enable << 4;
        val &= 0b11101111;
        val |= enable;
        i2cwrite(APDS9960_ENABLE, val);
    }

     function readAmbientLight(): number {
        let val_byte = i2cread(APDS9960_CDATAL);
        let val = val_byte;
        val_byte = i2cread(APDS9960_CDATAH);
        val = val + val_byte << 8;
        return val;
    }
    
     function readRedLight(): number {
     
        let val_byte = i2cread(APDS9960_RDATAL);
        let val = val_byte;
        val_byte = i2cread(APDS9960_RDATAH);
        val = val + val_byte << 8;
        return val;
    }

     function readGreenLight(): number {
        
           let val_byte = i2cread(APDS9960_GDATAL);
           let val = val_byte;
           val_byte = i2cread(APDS9960_GDATAH);
           val = val + val_byte << 8;
           return val;
    }
    
     function readBlueLight(): number {
        
           let val_byte = i2cread(APDS9960_BDATAL);
           let val = val_byte;
           val_byte = i2cread(APDS9960_BDATAH);
           val = val + val_byte << 8;
           return val;
       }

	/**
	 * Init Color Sensor
	 */
	export function initColorSensor() {
        InitColor();
		enableLightSensor(false);
		control.waitMicros(500);
	}

	/**
	 * Color sensor white calibration, each time you turn on the first use of the color sensor the white must be corrected at first.
	 */
	//% weight=78 blockId=adjustWhite block="Adjust white color"
	export function adjustWhite() {
		R_F = readRedLight();
		G_F = readGreenLight();
		B_F = readBlueLight();

    	//Measure twice, and then calculate their average.
    	R_F =  (readRedLight() + R_F) / 2;
   	 	G_F = (readGreenLight() + G_F) / 2;
    	B_F = (readBlueLight() + B_F) / 2 ;

	}


	/**
	 * Color sensor black calibration, each time you turn on the first use of the color sensor the white must be adjusted at first then adjust black.
	 */
	//% weight=76 blockId=adjustBlack block="Adjust black color"
	export function adjustBlack() {
		r_f = readRedLight();
		g_f = readGreenLight();
		b_f = readBlueLight();

		//Measure twice, and then calculate their average.
		r_f = (readRedLight() + r_f) / 2;
		g_f = (readGreenLight() + g_f) / 2;
		b_f = (readBlueLight() + b_f) / 2;
	}

	/**
	 *  Color sensor to obtain color value, white and black must be corrected before execution.
	 */
	//% weight=74 blockGap=50 blockId=checkColor block="Current color %color"
	export function checkCurrentColor(color: Colors): boolean {
		let r = readRedLight();
		let g = readGreenLight();
		let b = readBlueLight();
        let t = Colors.Red;
        
        // serial.writeLine("rgb:");
        // serial.writeNumber(r);
        // serial.writeLine(" ");
        // serial.writeNumber(g);
        // serial.writeLine(" ");
        // serial.writeNumber(b);

        if (r < r_f || r > R_F || g < g_f || g > G_F || b < b_f || b > B_F)
        {
           // serial.writeLine("none1");
            return false; 
        }       

		r = mapRGB(r, r_f, R_F, 0, 255);
		g = mapRGB(g, g_f, G_F, 0, 255);
        b = mapRGB(b, b_f, B_F, 0, 255);
        
        // serial.writeLine("rgb:");
        // serial.writeNumber(r);
        // serial.writeLine(" ");
        // serial.writeNumber(g);
        // serial.writeLine(" ");
        // serial.writeNumber(b);
        // serial.writeLine(" ");
		if (r > g)
		{
			t = Colors.Red;
		}	
		else
		{
			t = Colors.Green;
		}	

		if (t == Colors.Green && g < b)
		{
			t = Colors.Blue;
		}	
		if (t == Colors.Red && r < b)
		{
			t = Colors.Blue;
		}

		if (t == Colors.Blue && b > 50) {
           // serial.writeLine("blue");
		}
		else if (t == Colors.Green && g > 50) {
           // serial.writeLine("green");
		}
		else if (t == Colors.Red && r > 50) {
			//serial.writeLine("red");
		}
		else
        {
            //serial.writeLine("none");
            return false;
        }		
        return (color == t);
	}

	function mapRGB(x: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
		return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    
    /**
     * Resolve the Bluetooth that phone APP send command type, the total of nine types of commands: tank display command, servo debug command, obtaining the distance of ultrasonic command, obtaining temperature command, obtain sound size rank orders, to obtain the light level command, set the color lights command, honking command, firmware version information command.
     */
    //% weight=72 blockId=analyzeBluetoothCmd block="Get bluetooth command type %str"
    export function analyzeBluetoothCmd(str: string): number {
        if (str.length > 9)
        {
            let cmdHead = str.substr(0, 3);
            
            if (cmdHead == "CMD")
            {
                let cmdTypeStr: string = str.substr(4, 2);
                if (!checkArgsInt(cmdTypeStr))
                {
                    return CmdType.NO_COMMAND;
                }    
                let cmdType = parseInt(cmdTypeStr);

                if (cmdType > CmdType.VERSION || cmdType < 0)
                {
                    return CmdType.NO_COMMAND; 
                } 
                else
                {
                    return cmdType;
                }    
            }
            else
            {
                return CmdType.NO_COMMAND; 
            }    
        }   
        else
        {
            return CmdType.NO_COMMAND;
        }    
    }

    function checkArgsInt(str: string): boolean {
        let i = 0;
        for (; i < str.length; i++)
        {
            if (str.charAt(i) < '0' || str.charAt(i) > '9')
            {
                return false;
            }    
        }
        return true;
    }

    /**
     * Resolve the parameters tha the phone APP send the command,there are 3 parameters of servo debug command,the other command has just one parameter.
     */
    //% weight=70  blockId=getArgs block="Get bluetooth command|%str|argument at %index"
    //% index.min=1 index.max=3
    export function getArgs(str: string,index: number): number {
        let cmdType = analyzeBluetoothCmd(str);
        if (cmdType == CmdType.NO_COMMAND)
        {
            return CarRunCmdType.COMMAND_ERRO;
        }
        else {
            let dataIndex = 7;
            let subLegth = 2;
            if (index == 2)
            {
                dataIndex = 10;
                subLegth = 4;
            }
            else if (index == 3)
            {
                dataIndex = 15;
                subLegth = 4;
            } 
            if (cmdType == CmdType.SERVO)
            {
                if (str.length < 19)
                {
                    return CmdType.NO_COMMAND;
                }    
            }
            if ((index == 1 && str.length < 10)||(index == 2 && str.length < 15)||(index == 3 && str.length < 19))
            {
                return 0;
            }    
            let strArgs = str.substr(dataIndex, subLegth);
            if (!checkArgsInt(strArgs))
            {
                return 0;
            }    
            let arg = parseInt(strArgs);
            return arg;
        }
    }

    /**
     * Returns the enumeration of the command type, which can be compared with this module after obtaining the bluetooth command type sent by the mobile phone APP.
     */
    //% weight=68 blockId=getCmdtype block="Bluetooth command type %type"
    export function getCmdtype(type: CmdType): number {
        return type;
    }

    /**
     * The command type of the tank is stop, go ahead, back, turn left, turn right, slow down, turn left slowly, turn right slowly.
     */
    //% weight=66 blockId=getRunCarType block="Car run type %type"
    export function getRunCarTypeget(type: CarRunCmdType): number {
        return type;
    }

    /**
     * The distance from the ultrasonic obstacle is the standard command, which is sent to the mobile phone. The APP will indicate the distance of the ultrasonic obstacle.
     */
    //% weight=64 blockId=convertUltrasonic block="Convert ultrasonic distance %data"
    export function convertUltrasonic(data: number): string {
        let cmdStr: string = "CMD|03|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }

    /**
     * The conversion temperature value is standard command, sent to the mobile phone, and the APP displays the current temperature.
     */
    //% weight=62 blockId=convertTemperature block="Convert temperature %data"
    export function convertTemperature(data: number): string {
        let cmdStr: string = "CMD|04|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }

    /**
     * Convert the light value is the standard command and send it to the mobile phone. The APP displays the current light level (0~255).
     */
    //% weight=60 blockId=convertLight block="Convert light %data"
    export function convertLight(data: number): string {
        let cmdStr: string = "CMD|06|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }

    /**
     *  The Melody of Little star   
     */
    //% weight=58 blockId=littleStarMelody block="Little star melody"
    export function littleStarMelody(): string[] {
        return ["C4:4", "C4:4", "G4:4", "G4:4", "A4:4", "A4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "D4:4", "C4:4", "G4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "G4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "C4:4", "C4:4", "G4:4", "G4:4", "A4:4", "A4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "D4:4", "C4:4"];
    }
}
