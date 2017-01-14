/*
 * GLOBALS
*/
// Glitch -- param: duration
Message "global" [string "glitch", Float 500]
// Strobe -- param: duration
Message "global" [string "strobe", Float 400]
// Random Masks -- param: duration
Message "global" [string "randMask", Float 550]
// Preset -- param: presetNumber [1-4]
Message "global" [string "preset", Float 2]
// Toggles -- param: none
Message "global" [string "shake", Float 1]
Message "global" [string "rgbShift", Float 1]
Message "global" [string "hueSaturation", Float 1]
Message "global" [string "brightContrast", Float 1]
Message "global" [string "barrelBlur", Float 1]
Message "global" [string "glow", Float 1]
Message "global" [string "halftone", Float 1]
Message "global" [string "pixelate", Float 1]
Message "global" [string "pixelRolls", Float 1]
Message "global" [string "patches", Float 1]
Message "global" [string "edge", Float 1]
Message "global" [string "mirror", Float 1]

/*
 * OBJECT
*/
// Toggle drawing five spinning sphres -- param: none
Message "object" [string "spheres", Float 1]
// Shaders on PGraphics -- param: shaderNumber [1-6]
Message "object" [string "shaders", Float 1]

/*
 * UNIFORM MANIPULATIONS
*/
// Lines
Message "lines" [string "lineStrength", Float 0.07]  // param: [0-0.1]
Message "lines" [string "lineSize", Float 2000.]     // param: [2000-5000]
Message "lines" [string "lineTilt", Float 0.45]      // param: [0-1]
// Shake
Message "shake" [string "angle", Float 3.14]        // param: [0-TWO_PI]
Message "shake" [string "amount", Float .005]       // param: [0-0.1]
// Hue Saturation
Message "hueSaturation" [string "hue", Float 0.0]   // param: [0-2]
Message "hueSaturation" [string "saturation", Float 1.]// param: [-1 - 1]
// Brightness Contrast
Message "brightContrast" [string "brightness", Float 1.0]  // param: [0-1]
Message "brightContrast" [string "contrast", Float 1.]     // param: [-1 - 1]
// Barrel Blur
Message "barrelBlur" [string "amount", Float 0.1]  // param: [0-1]
// Glow
Message "glow" [string "brightness", Float .25]     // param: [0-0.5]
Message "glow" [string "radius", Float 2]           // param: [0-3]
// Glow
Message "pixelate" [string "pixels", Float .25]     // param: [0-0.5]
// Patches
Message "patches" [string "row", Float .5]          // param: [0-1]
Message "patches" [string "col", Float .5]          // param: [0-1]
// PixelRolls
Message "pixelRolls" [string "rollRate", Float 10]  // param: [1-50]
Message "pixelRolls" [string "rollAmount", Float .09]//param: [0-0.1]
// Edge
// -- no uniforms to set
// Mirror
Message "mirror" [string "dir", Float 0.0]          //param: {0, 1}
