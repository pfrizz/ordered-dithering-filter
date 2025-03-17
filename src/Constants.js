export const BASE_THRESHOLD_MAP = [[0, 2],
                                   [3, 1]]

export const PALETTES = {
    BLACK_AND_WHITE: [[0, 0, 0], [256, 256, 256]],
    GRAYSCALE: [[0, 0, 0], [42, 42, 42], [85, 85, 85], [128, 128, 128], [171, 171, 171], [213, 213, 213], [255, 255, 255]],
    GAMEBOY: [[6, 53, 6], [44, 98, 44], [140, 174, 6], [156, 189, 7]],
    RED_GREEN_BLUE: [[0, 0, 0], [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 255]],
    RGB_3_BIT: [[0, 0, 0], [255, 255, 255], [255, 0, 0], [255, 255, 0], [0, 255, 0], [0, 255, 255], [0, 0, 255], [255, 0, 255]]
}

export const DEFAULT_BRIGHTNESS = 0;
export const DEFAULT_PIXEL_SIZE = 2;
export const DEFAULT_IS_DITHERED = true;
export const DEFAULT_DITHERING_INTENSITY = 50;
export const DEFAULT_THRESHOLD_MAP_N = 3;
export const DEFAULT_PALETTE = PALETTES.GAMEBOY;