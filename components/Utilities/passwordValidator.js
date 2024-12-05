import PasswordValidator from "password-validator";

const schema = new PasswordValidator();

// Define password rules
schema
  .is().min(8) // Minimum length 8
  .is().max(100) // Maximum length 100
  .has().uppercase() // Must have uppercase letters
  .has().lowercase() // Must have lowercase letters
  .has().digits() // Must have at least one digit
  .has().not().spaces() // Should not have spaces
  .is().not().oneOf(['Password123', '12345678']); // Blacklist common passwords

export default schema;
