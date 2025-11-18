// JavaScript for Riventia Pension Landing Page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 50
    });

    // Form Elements
    const form = document.getElementById('reservationForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));

    // Input Elements
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const instagramInput = document.getElementById('instagram');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const guestsSelect = document.getElementById('guests');
    const requestsTextarea = document.getElementById('requests');
    const requestsCount = document.getElementById('requestsCount');
    const agreeCheckbox = document.getElementById('agree');

    // Smooth scrolling for anchor links
    initSmoothScrolling();

    // Form validation and submission
    initFormValidation();

    // Input formatting and real-time validation
    initInputFormatting();

    // Date restrictions
    initDateRestrictions();

    // Character counter for requests textarea
    initCharacterCounter();

    /**
     * Initialize smooth scrolling for internal links
     */
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed header if any
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Initialize form validation
     */
    function initFormValidation() {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Reset previous validation states
            form.classList.remove('was-validated');
            clearCustomErrors();

            // Validate all fields
            const isValid = validateForm();

            if (isValid && form.checkValidity()) {
                await handleFormSubmission();
            } else {
                form.classList.add('was-validated');
                // Focus on first invalid field
                const firstInvalid = form.querySelector('.is-invalid, :invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
            }
        });
    }

    /**
     * Validate all form fields
     */
    function validateForm() {
        let isValid = true;

        // Validate name (2-10 characters, Korean/English)
        if (!validateName(nameInput.value)) {
            setCustomError(nameInput, '이름을 2-10자로 입력해주세요');
            isValid = false;
        }

        // Validate phone number
        if (!validatePhone(phoneInput.value)) {
            setCustomError(phoneInput, '올바른 전화번호를 입력해주세요 (010-0000-0000)');
            isValid = false;
        }

        // Validate Instagram ID
        if (!validateInstagram(instagramInput.value)) {
            setCustomError(instagramInput, '인스타그램 아이디를 입력해주세요');
            isValid = false;
        }

        // Validate dates
        const dateValidation = validateDates(checkinInput.value, checkoutInput.value);
        if (!dateValidation.valid) {
            setCustomError(checkinInput, dateValidation.message);
            isValid = false;
        }

        return isValid;
    }

    /**
     * Validate name field
     */
    function validateName(name) {
        const nameRegex = /^[가-힣a-zA-Z\s]{2,10}$/;
        return nameRegex.test(name.trim());
    }

    /**
     * Validate phone number
     */
    function validatePhone(phone) {
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Validate Instagram ID
     */
    function validateInstagram(instagram) {
        const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;
        return instagram && instagramRegex.test(instagram);
    }

    /**
     * Validate dates
     */
    function validateDates(checkin, checkout) {
        if (!checkin) {
            return { valid: false, message: '체크인 날짜를 선택해주세요' };
        }

        if (!checkout) {
            return { valid: false, message: '체크아웃 날짜를 선택해주세요' };
        }

        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if dates are in the past
        if (checkinDate < today) {
            return { valid: false, message: '체크인 날짜는 오늘 이후로 선택해주세요' };
        }

        // Check if checkout is after checkin
        if (checkoutDate <= checkinDate) {
            return { valid: false, message: '체크아웃은 체크인 다음날부터 가능합니다' };
        }

        // Check if checkin is on weekday (Monday-Thursday)
        const checkinDay = checkinDate.getDay();
        if (checkinDay === 0 || checkinDay === 5 || checkinDay === 6) {
            return { valid: false, message: '평일(월~목)만 예약 가능합니다' };
        }

        return { valid: true };
    }

    /**
     * Set custom error message
     */
    function setCustomError(input, message) {
        input.classList.add('is-invalid');
        const feedback = input.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = message;
        }
    }

    /**
     * Clear all custom error states
     */
    function clearCustomErrors() {
        form.querySelectorAll('.is-invalid').forEach(element => {
            element.classList.remove('is-invalid');
        });
        form.querySelectorAll('.is-valid').forEach(element => {
            element.classList.remove('is-valid');
        });
    }

    /**
     * Initialize input formatting
     */
    function initInputFormatting() {
        // Phone number formatting
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d]/g, '');
            if (value.length >= 3) {
                if (value.length <= 7) {
                    value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
                } else {
                    value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
                }
            }
            e.target.value = value;
        });

        // Instagram input formatting (remove @ if user types it)
        instagramInput.addEventListener('input', function(e) {
            let value = e.target.value;
            if (value.startsWith('@')) {
                value = value.substring(1);
            }
            e.target.value = value;
        });

        // Real-time validation on blur
        [nameInput, phoneInput, instagramInput].forEach(input => {
            input.addEventListener('blur', function() {
                validateSingleField(this);
            });
        });
    }

    /**
     * Validate single field
     */
    function validateSingleField(input) {
        let isValid = true;
        let message = '';

        switch (input.id) {
            case 'name':
                isValid = validateName(input.value);
                message = '이름을 2-10자로 입력해주세요';
                break;
            case 'phone':
                isValid = validatePhone(input.value);
                message = '올바른 전화번호를 입력해주세요 (010-0000-0000)';
                break;
            case 'instagram':
                isValid = validateInstagram(input.value);
                message = '인스타그램 아이디를 입력해주세요';
                break;
        }

        if (input.value) {
            if (isValid) {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            } else {
                input.classList.remove('is-valid');
                setCustomError(input, message);
            }
        } else {
            input.classList.remove('is-invalid', 'is-valid');
        }
    }

    /**
     * Initialize date restrictions
     */
    function initDateRestrictions() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Set minimum date to tomorrow
        const minDate = tomorrow.toISOString().split('T')[0];
        checkinInput.setAttribute('min', minDate);

        // Update checkout minimum when checkin changes
        checkinInput.addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            const checkoutMin = new Date(checkinDate);
            checkoutMin.setDate(checkoutMin.getDate() + 1);

            checkoutInput.setAttribute('min', checkoutMin.toISOString().split('T')[0]);

            // Clear checkout if it's before new minimum
            if (checkoutInput.value && new Date(checkoutInput.value) <= checkinDate) {
                checkoutInput.value = '';
            }
        });

        // Validate weekday restriction
        checkinInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const dayOfWeek = selectedDate.getDay();

            if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
                setCustomError(this, '평일(월~목)만 예약 가능합니다');
                this.value = '';
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }

    /**
     * Initialize character counter for requests textarea
     */
    function initCharacterCounter() {
        if (requestsTextarea && requestsCount) {
            requestsTextarea.addEventListener('input', function() {
                const currentLength = this.value.length;
                requestsCount.textContent = currentLength;

                // Change color when approaching limit
                if (currentLength > 450) {
                    requestsCount.style.color = '#dc3545';
                } else if (currentLength > 400) {
                    requestsCount.style.color = '#ffc107';
                } else {
                    requestsCount.style.color = '#6c757d';
                }
            });
        }
    }

    /**
     * Handle form submission
     */
    async function handleFormSubmission() {
        // Show loading state
        showLoadingState(true);

        try {
            // Collect form data
            const formData = collectFormData();

            // Send data to Google Apps Script
            await sendToGoogleScript(formData);

            // Show success message
            showSuccessModal();

            // Reset form after successful submission
            setTimeout(() => {
                resetForm();
            }, 1000);

        } catch (error) {
            console.error('Form submission error:', error);
            showErrorMessage('예약 문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            showLoadingState(false);
        }
    }

    /**
     * Collect form data
     */
    function collectFormData() {
        return {
            name: nameInput.value.trim(),
            phone: phoneInput.value,
            instagram: instagramInput.value,
            checkin: checkinInput.value,
            checkout: checkoutInput.value,
            guests: guestsSelect.value,
            arrival: document.getElementById('arrival').value,
            pool: document.getElementById('pool').checked,
            requests: requestsTextarea.value.trim(),
            agree: agreeCheckbox.checked,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Send data to Google Apps Script
     */
    async function sendToGoogleScript(data) {
        // Google Apps Script Web App URL - 실제 배포된 URL
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwCtBBgfBCP4AbfYktrIHnzntnjTpK6jg7kM02G_rg9lpH7jXEi_EdETL1GStsQZmRyFQ/exec';

        try {
            // CORS 문제 해결: Content-Type을 text/plain으로 변경하여 preflight 요청 방지
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(data),
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log('예약 문의 접수 완료:', result.reservationId);
                return result;
            } else {
                throw new Error(result.error || '예약 문의 처리 중 오류가 발생했습니다');
            }

        } catch (error) {
            console.error('Google Apps Script 호출 오류:', error);
            throw new Error('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    }

    /**
     * Show loading state
     */
    function showLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    }

    /**
     * Show success modal
     */
    function showSuccessModal() {
        successModal.show();
    }

    /**
     * Show error message
     */
    function showErrorMessage(message) {
        // Create and show error alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    /**
     * Reset form
     */
    function resetForm() {
        form.reset();
        form.classList.remove('was-validated');
        clearCustomErrors();
        requestsCount.textContent = '0';
    }

    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // Page became visible, refresh any time-sensitive data if needed
            updateDateRestrictions();
        }
    });

    /**
     * Update date restrictions (refresh minimum dates)
     */
    function updateDateRestrictions() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const minDate = tomorrow.toISOString().split('T')[0];
        checkinInput.setAttribute('min', minDate);
    }

    // Add floating effect to price banner
    const priceBanner = document.querySelector('.price-banner');
    if (priceBanner) {
        let mouseX = 0;
        let mouseY = 0;
        let ballX = 0;
        let ballY = 0;
        let speed = 0.1;

        function animate() {
            let distX = mouseX - ballX;
            let distY = mouseY - ballY;

            ballX += distX * speed;
            ballY += distY * speed;

            priceBanner.style.transform = `rotate(-2deg) translate(${ballX * 0.02}px, ${ballY * 0.02}px)`;

            requestAnimationFrame(animate);
        }

        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        animate();
    }

    // Easter egg: Konami code for special animation
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A

    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.keyCode);
        if (konamiCode.length > 10) {
            konamiCode.shift();
        }

        if (konamiCode.toString() === konamiSequence.toString()) {
            triggerEasterEgg();
            konamiCode = [];
        }
    });

    /**
     * Easter egg animation
     */
    function triggerEasterEgg() {
        document.body.style.animation = 'rainbow 2s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 2000);
    }

    // Add rainbow animation for easter egg
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            25% { filter: hue-rotate(90deg); }
            50% { filter: hue-rotate(180deg); }
            75% { filter: hue-rotate(270deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});