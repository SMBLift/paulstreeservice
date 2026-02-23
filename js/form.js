'use strict';

document.addEventListener('DOMContentLoaded', function () {

  // =========================================================================
  // Form Elements
  // =========================================================================

  var form = document.getElementById('contact-form');
  var submitBtn = document.getElementById('submit-btn');
  var formWrapper = document.getElementById('contact-form-wrapper');
  var formSuccess = document.getElementById('form-success');
  var honeypot = document.getElementById('website');

  // Exit early if the form is not on this page
  if (!form) return;

  // =========================================================================
  // Field Definitions
  // =========================================================================

  var fields = {
    name: {
      element: document.getElementById('name'),
      errorId: 'name-error',
      validate: function (value) {
        return value.trim().length >= 2;
      }
    },
    phone: {
      element: document.getElementById('phone'),
      errorId: 'phone-error',
      validate: function (value) {
        var digits = value.replace(/\D/g, '');
        return digits.length >= 10;
      }
    },
    email: {
      element: document.getElementById('email'),
      errorId: 'email-error',
      validate: function (value) {
        // Optional field — valid if empty or matches email pattern
        if (value.trim() === '') return true;
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(value.trim());
      }
    },
    address: {
      element: document.getElementById('address'),
      errorId: 'address-error',
      validate: function (value) {
        return value.trim().length >= 5;
      }
    },
    service: {
      element: document.getElementById('service'),
      errorId: 'service-error',
      validate: function (value) {
        return value !== '';
      }
    }
  };

  // =========================================================================
  // Helper Functions
  // =========================================================================

  /**
   * Show error state on a field
   */
  function showError(fieldElement, errorId) {
    var errorElement = document.getElementById(errorId);
    var isSelect = fieldElement.tagName === 'SELECT';
    var errorClass = isSelect ? 'form__select--error' : 'form__input--error';

    fieldElement.classList.add(errorClass);
    if (errorElement) {
      errorElement.classList.add('form__error--visible');
    }
  }

  /**
   * Clear error state on a field
   */
  function clearError(fieldElement, errorId) {
    var errorElement = document.getElementById(errorId);

    fieldElement.classList.remove('form__input--error');
    fieldElement.classList.remove('form__select--error');
    if (errorElement) {
      errorElement.classList.remove('form__error--visible');
    }
  }

  /**
   * Validate a single field and return whether it is valid
   */
  function validateField(fieldName) {
    var field = fields[fieldName];
    if (!field || !field.element) return true;

    var value = field.element.value;
    var isValid = field.validate(value);

    if (isValid) {
      clearError(field.element, field.errorId);
    } else {
      showError(field.element, field.errorId);
    }

    return isValid;
  }

  /**
   * Validate all fields and return whether the entire form is valid
   */
  function validateAllFields() {
    var isFormValid = true;
    var firstInvalidField = null;

    for (var fieldName in fields) {
      if (fields.hasOwnProperty(fieldName)) {
        var isFieldValid = validateField(fieldName);
        if (!isFieldValid && !firstInvalidField) {
          firstInvalidField = fields[fieldName].element;
        }
        if (!isFieldValid) {
          isFormValid = false;
        }
      }
    }

    // Scroll the first invalid field into view
    if (firstInvalidField) {
      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidField.focus();
    }

    return isFormValid;
  }

  // =========================================================================
  // Phone Number Auto-Formatting
  // =========================================================================

  var phoneInput = fields.phone.element;

  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      var cursorPosition = this.selectionStart;
      var previousLength = this.value.length;

      // Strip all non-digits
      var digits = this.value.replace(/\D/g, '');

      // Limit to 10 digits
      if (digits.length > 10) {
        digits = digits.substring(0, 10);
      }

      // Format as (XXX) XXX-XXXX
      var formatted = '';
      if (digits.length === 0) {
        formatted = '';
      } else if (digits.length <= 3) {
        formatted = '(' + digits;
      } else if (digits.length <= 6) {
        formatted = '(' + digits.substring(0, 3) + ') ' + digits.substring(3);
      } else {
        formatted = '(' + digits.substring(0, 3) + ') ' + digits.substring(3, 6) + '-' + digits.substring(6);
      }

      this.value = formatted;

      // Adjust cursor position
      var newLength = this.value.length;
      var lengthDiff = newLength - previousLength;
      var newCursorPosition = cursorPosition + lengthDiff;

      // Ensure cursor is within valid bounds
      if (newCursorPosition < 0) newCursorPosition = 0;
      if (newCursorPosition > newLength) newCursorPosition = newLength;

      this.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  }

  // =========================================================================
  // Real-Time Validation (blur and input events)
  // =========================================================================

  for (var fieldName in fields) {
    if (fields.hasOwnProperty(fieldName)) {
      (function (name) {
        var field = fields[name];
        if (!field.element) return;

        // Validate on blur
        field.element.addEventListener('blur', function () {
          validateField(name);
        });

        // Clear error on input if field becomes valid
        field.element.addEventListener('input', function () {
          var value = field.element.value;
          if (field.validate(value)) {
            clearError(field.element, field.errorId);
          }
        });

        // For select elements, also listen for change
        if (field.element.tagName === 'SELECT') {
          field.element.addEventListener('change', function () {
            validateField(name);
          });
        }
      })(fieldName);
    }
  }

  // =========================================================================
  // Form Submission
  // =========================================================================

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Honeypot check — if filled, silently pretend success (anti-spam)
    if (honeypot && honeypot.value !== '') {
      form.style.display = 'none';
      if (formSuccess) {
        formSuccess.classList.add('form__success--visible');
      }
      return;
    }

    // Validate all fields
    if (!validateAllFields()) {
      return;
    }

    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Collect form data
    var formData = new FormData(form);

    // Submit via fetch
    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(function (response) {
      if (response.ok) {
        // Success — hide form and show success message
        form.style.display = 'none';
        if (formSuccess) {
          formSuccess.classList.add('form__success--visible');
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        throw new Error('Form submission failed');
      }
    })
    .catch(function () {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Estimate Request';

      // Show error message
      alert('Something went wrong. Please try again or call us at (412) 441-4444.');
    });
  });

});
