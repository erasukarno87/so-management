/**
 * GS1-128 Barcode Parser Utility
 * Parses GS1-128 barcodes with format: [)>06{6chars}{14chars}V{vendor}3L{location}K{order}Q{qty}
 */

/**
 * Parse GS1-128 barcode data
 * @param {string} barcode - Raw barcode string
 * @param {Array} productMasters - Array of {modelCode, prefix} for model resolution
 * @returns {Object|null} Parsed barcode data or null if invalid
 */
export function parseGS1Barcode(barcode, productMasters = []) {
  if (!barcode) return null;

  try {
    // Normalize input: trim whitespace and remove extra spaces
    const normalized = String(barcode).trim()
      .replace(/[\r\n\t]/g, '')
      .replace(/\s+/g, '')
      .toUpperCase();

    // Check for GS1-128 header
    if (!normalized.startsWith('[)>06') || normalized.length < 30) {
      return null;
    }

    // Parse using regex - NOTE: In character class [)>06, the ) must be escaped as [\)]>06
    const match = normalized.match(/[\)>06[A-Z0-9]{6}([A-Z0-9]{14})V([A-Z0-9]+)3L(\d+)K([A-Z0-9]+)Q(\d+)$/);

    if (!match) return null;

    const [, rawPartNumber, vendorCode, location, orderNumber, qtyStr] = match;
    const quantity = parseInt(qtyStr, 10);

    if (quantity <= 0) return null;

    // Format part number with dashes if not already formatted
    const partNumber = formatPartNumber(rawPartNumber);

    // Get model code from part number
    const modelCode = extractModelCode(partNumber);

    // Resolve prefix from product masters
    const prefix = resolveModelPrefix(modelCode, productMasters);

    return {
      partNumber,
      vendorCode: vendorCode || '',
      location: location || '',
      orderNumber: orderNumber || '',
      quantity,
      modelCode,
      prefix
    };
  } catch {
    return null;
  }
}

/**
 * Format raw part number with dashes
 * @param {string} partNumber - Raw part number
 * @returns {string} Formatted part number
 */
function formatPartNumber(partNumber) {
  if (!partNumber) return '';

  // Already formatted
  if (partNumber.includes('-')) return partNumber;

  // Format as XXX-XX-XX-XX-XX
  if (partNumber.length >= 14) {
    return `${partNumber.slice(0, 3)}-${partNumber.slice(3, 8)}-${partNumber.slice(8, 10)}-${partNumber.slice(10, 12)}-${partNumber.slice(12, 14)}`;
  }

  return partNumber;
}

/**
 * Extract model code from part number
 * @param {string} partNumber - Formatted part number
 * @returns {string} Model code
 */
function extractModelCode(partNumber) {
  if (!partNumber) return '';

  const parts = partNumber.split('-');
  // Model code is first and third segment (e.g., "ABC-XX-YY-ZZ")
  if (parts.length >= 3) {
    return `${parts[0]}-${parts[2]}`;
  }

  return partNumber;
}

/**
 * Resolve prefix from product masters based on model code
 * @param {string} modelCode - Model code to resolve
 * @param {Array} productMasters - Array of {modelCode, prefix}
 * @returns {string} Prefix or default "0000"
 */
function resolveModelPrefix(modelCode, productMasters) {
  if (!productMasters || productMasters.length === 0) {
    return '0000';
  }

  // Exact match
  const exact = productMasters.find(p => p.modelCode === modelCode);
  if (exact) return exact.prefix;

  // Prefix match (first segment)
  const firstSegment = modelCode.split('-')[0];
  const partial = productMasters.find(p => p.modelCode.startsWith(firstSegment));

  return partial?.prefix || '0000';
}

/**
 * Check if barcode is a valid GS1-128 format
 * @param {string} barcode - Barcode to check
 * @returns {boolean} True if valid GS1-128
 */
export function isValidGS1Barcode(barcode) {
  if (!barcode) return false;
  const normalized = String(barcode).trim().toUpperCase();
  return normalized.startsWith('[)>06') && normalized.length >= 30;
}
