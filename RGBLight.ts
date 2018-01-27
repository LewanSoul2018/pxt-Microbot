/**
 * RGBLight package
 */

enum RGBColors {
    //% block=red
    Red = 1,
    //% block=orange
    Orange = 2,
    //% block=yellow
    Yellow = 3,
    //% block=green
    Green = 4,
    //% block=blue
    Blue = 5,
    //% block=indigo
    Indigo = 6,
    //% block=violet
    Violet = 7,
    //% block=purple
    Purple = 8,
    //% block=white
    White = 9
}

/**
 * Different modes for RGB or RGB+W RGBLight LHRGBLight
 */
enum RGBPixelMode {
    //% block="RGB (GRB format)"
    RGB = 0,
    //% block="RGB+W"
    RGBW = 1,
    //% block="RGB (RGB format)"
    RGB_RGB = 2
}

/**
 * RGBLight Functions
 */
namespace RGBLight {
    //% shim=sendBufferAsm
    //% parts="RGBLight"
    function sendBuffer(buf: Buffer, pin: DigitalPin) {

    }

    /**
    * A RGBLight class
    */
    export class LHRGBLight {
        buf: Buffer;
        pin: DigitalPin;
        // TODO: encode as bytes instead of 32bit
        brightness: number;
        start: number; // start offset in LED strip
        _length: number; // number of LEDs
        _mode: RGBPixelMode;

        setBrightness(brightness: number): void {
            this.brightness = brightness & 0xff;
        }

        setPin(pin: DigitalPin): void {
            this.pin = pin;
            pins.digitalWritePin(this.pin, 0);
            // don't yield to avoid races on initialization
        }

        setPixelColor(pixeloffset: number, rgb: RGBColors): void {
            this.setPixelRGB(pixeloffset, rgb);
        }

        private setPixelRGB(pixeloffset: number, rgb: RGBColors): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;
            let tureRgb = 0;
            switch (rgb)
            {
                case RGBColors.Red:
                    tureRgb = 0xFF0000;
                    break;    

                case RGBColors.Orange:
                    tureRgb = 0xFFA500;    
                    break;    

                case RGBColors.Yellow:
                    tureRgb = 0xFFFF00;
                    break;    
                    
                case RGBColors.Green:
                    tureRgb = 0x00FF00;    
                    break;    

                    case RGBColors.Blue:
                    tureRgb = 0x0000FF;
                    break;    
                    
                case RGBColors.Indigo:
                    tureRgb = 0x4b0082;    
                    break;    

                case RGBColors.Violet:
                    tureRgb = 0x8a2be2;
                    break;    
                    
                case RGBColors.Purple:
                    tureRgb = 0xFF00FF;    
                    break;   

                case RGBColors.White:
                    tureRgb = 0xFFFFFF;    
                    break;   
            }

            let stride = this._mode === RGBPixelMode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + this.start) * stride;

            let red = unpackR(tureRgb);
            let green = unpackG(tureRgb);
            let blue = unpackB(tureRgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            this.setBufferRGB(pixeloffset, red, green, blue)
        }

        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            if (this._mode === RGBPixelMode.RGB_RGB) {
                this.buf[offset + 0] = red;
                this.buf[offset + 1] = green;
            } else {
                this.buf[offset + 0] = green;
                this.buf[offset + 1] = red;
            }
            this.buf[offset + 2] = blue;
        }

        show() {
            sendBuffer(this.buf, this.pin);
        }

        clear(): void {
            const stride = this._mode === RGBPixelMode.RGBW ? 4 : 3;
            this.buf.fill(0, this.start * stride, this._length * stride);
            this.show();
        }
    }
    export function create(pin: DigitalPin, numleds: number, mode: RGBPixelMode): LHRGBLight {
        let light = new LHRGBLight();
        let stride = mode === RGBPixelMode.RGBW ? 4 : 3;
        light.buf = pins.createBuffer(numleds * stride);
        light.start = 0;
        light._length = numleds;
        light._mode = mode;
        light.setBrightness(255);
        light.setPin(pin);
        return light;
    }

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }
}
