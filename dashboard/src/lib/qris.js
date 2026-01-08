/**
 * QRIS Static to Dynamic Converter
 * Ported from: https://github.com/verssache/qris-dinamis/blob/main/qris.php
 */

/**
 * Calculate CRC16 checksum for QRIS string
 * @param {string} str - The QRIS string to calculate checksum for
 * @returns {string} - 4 character hex CRC16 checksum
 */
export function convertCRC16(str) {
    let crc = 0xFFFF;
    const strlen = str.length;

    for (let c = 0; c < strlen; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
        }
    }

    let hex = (crc & 0xFFFF).toString(16).toUpperCase();
    // Pad to 4 characters
    while (hex.length < 4) {
        hex = '0' + hex;
    }
    return hex;
}

/**
 * Convert static QRIS to dynamic QRIS with specified amount
 * @param {string} qrisStatic - Static QRIS code string
 * @param {number} amount - Amount in Rupiah
 * @param {object} options - Optional fee configuration
 * @param {string} options.feeType - 'rupiah' or 'percent' (optional)
 * @param {number} options.feeAmount - Fee amount (optional)
 * @returns {string} - Dynamic QRIS code with amount embedded
 */
export function convertQRIS(qrisStatic, amount, options = {}) {
    // Remove the last 4 characters (old CRC)
    let qris = qrisStatic.slice(0, -4);

    // Change from static (010211) to dynamic (010212)
    const step1 = qris.replace('010211', '010212');

    // Split at country code marker
    const step2 = step1.split('5802ID');

    if (step2.length !== 2) {
        throw new Error('Invalid QRIS format: missing 5802ID marker');
    }

    // Build amount field: 54 + length(2 digits) + amount
    const amountStr = amount.toString();
    let uang = '54' + amountStr.length.toString().padStart(2, '0') + amountStr;

    // Add fee if specified
    if (options.feeType && options.feeAmount) {
        const feeStr = options.feeAmount.toString();
        if (options.feeType === 'rupiah') {
            // Fee in Rupiah: 55020256 + length + fee
            uang += '55020256' + feeStr.length.toString().padStart(2, '0') + feeStr;
        } else if (options.feeType === 'percent') {
            // Fee in Percent: 55020357 + length + fee
            uang += '55020357' + feeStr.length.toString().padStart(2, '0') + feeStr;
        }
    }

    // Add country code back
    uang += '5802ID';

    // Combine parts
    let fix = step2[0].trim() + uang + step2[1].trim();

    // Calculate and append new CRC16
    fix += convertCRC16(fix);

    return fix;
}

/**
 * Validate if a string looks like a QRIS code
 * @param {string} qris - The string to validate
 * @returns {boolean} - True if valid QRIS format
 */
export function isValidQRIS(qris) {
    if (!qris || typeof qris !== 'string') return false;

    // Basic validation: starts with 000201, contains 5802ID
    return qris.startsWith('000201') && qris.includes('5802ID');
}

/**
 * Parse merchant info from QRIS code
 * @param {string} qris - QRIS code string
 * @returns {object} - Parsed merchant information
 */
export function parseQRISInfo(qris) {
    try {
        // Extract merchant name (field 59)
        const merchantNameMatch = qris.match(/59(\d{2})(.+?)60/);
        const merchantName = merchantNameMatch ? merchantNameMatch[2].slice(0, parseInt(merchantNameMatch[1])) : 'Unknown';

        // Extract city (field 60)
        const cityMatch = qris.match(/60(\d{2})(.+?)61/);
        const city = cityMatch ? cityMatch[2].slice(0, parseInt(cityMatch[1])) : 'Unknown';

        return { merchantName, city };
    } catch {
        return { merchantName: 'Unknown', city: 'Unknown' };
    }
}
