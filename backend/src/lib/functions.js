// Used in products
const isIdValid = (id, res) => {
  if (isNaN(id) || id <= 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid or missing ID parameter'
    });
    return false;
  }
  return true;
};

//Used in Inventory
const inputValidation = (id, quant, res) => {
  if (isNaN(id) || isNaN(quant)) {
    res.status(400).json({
      success: false,
      message: 'Invalid ID or quantity - must be numbers'
    });
    return false
  };
  return true
};

const quantityValidation = (quant, res) => {
  if (quant <= 0) {
    res.status(400).json({
      success: false,
      message: 'Quantity must be positive'
    });
    return false;
  };
  return true;
};

export const productNotFound = (rows, res, msg = 'Product not found') => {
  if (rows.length === 0) {
    res.status(404).json({
      success: false,
      message: msg
    });
    return true;
  }
  return false;
};

const functions = {
  isIdValid,
  inputValidation,
  quantityValidation,
  productNotFound
};

export default functions;