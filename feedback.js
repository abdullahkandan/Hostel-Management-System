document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.getElementById('feedbackForm');
    const formContainer = document.getElementById('feedback-form');
    const successMessage = document.getElementById('success-message');
    const stars = document.querySelectorAll('.star');
    const ratingText = document.getElementById('rating-text');
    const anonymousCheckbox = document.getElementById('anonymous');
    const studentDetails = document.getElementById('student-details');
    const studentNameInput = document.getElementById('student-name');
    const studentRollNoInput = document.getElementById('student-rollNo');
    
    let currentRating = 0;
    
    // Star rating functionality
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            currentRating = index + 1;
            updateStarRating();
            updateRatingText();
        });
        
        star.addEventListener('mouseover', function() {
            highlightStars(index + 1);
        });
    });
    
    document.querySelector('.star-rating').addEventListener('mouseleave', function() {
        updateStarRating();
    });
    
    function updateStarRating() {
        stars.forEach((star, index) => {
            if (index < currentRating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
    
    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#ffc107';
            } else {
                star.style.color = '#ddd';
            }
        });
    }
    
    function updateRatingText() {
        if (currentRating > 0) {
            ratingText.textContent = `You rated: ${currentRating} star${currentRating !== 1 ? 's' : ''}`;
        } else {
            ratingText.textContent = '';
        }
    }
    
    // Anonymous checkbox functionality
    anonymousCheckbox.addEventListener('change', function() {
        if (this.checked) {
            studentDetails.style.display = 'none';
            studentNameInput.value = '';
            studentRollNoInput.value = '';
            studentNameInput.required = false;
            studentRollNoInput.required = false;
        } else {
            studentDetails.style.display = 'block';
            studentNameInput.required = true;
            studentRollNoInput.required = true;
        }
    });
    
    // Form submission
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(feedbackForm);
        const data = Object.fromEntries(formData);
        data.rating = currentRating;
        data.isAnonymous = anonymousCheckbox.checked;
        
        // Validate feedback text
        if (!data.feedback || data.feedback.trim().length === 0) {
            showToast('Please write your feedback before submitting', 'error');
            return;
        }
        
        // Validate required fields if not anonymous
        if (!anonymousCheckbox.checked) {
            if (!data.name || !data.rollNo) {
                showToast('Please provide your name and roll number, or choose to submit anonymously', 'error');
                return;
            }
        }
        
        // Submit feedback to API
        fetch('api_feedback.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                formContainer.style.display = 'none';
                successMessage.style.display = 'block';
                showToast(result.message, 'success');
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                showToast(result.message, 'error');
            }
        })
        .catch(error => {
            showToast('Error submitting feedback: ' + error.message, 'error');
        });
    });
});

function resetForm() {
    const feedbackForm = document.getElementById('feedbackForm');
    const formContainer = document.getElementById('feedback-form');
    const successMessage = document.getElementById('success-message');
    const stars = document.querySelectorAll('.star');
    const ratingText = document.getElementById('rating-text');
    const anonymousCheckbox = document.getElementById('anonymous');
    const studentDetails = document.getElementById('student-details');
    const studentNameInput = document.getElementById('student-name');
    const studentRollNoInput = document.getElementById('student-rollNo');
    
    // Reset form
    feedbackForm.reset();
    
    // Reset rating
    currentRating = 0;
    stars.forEach(star => {
        star.classList.remove('active');
        star.style.color = '#ddd';
    });
    ratingText.textContent = '';
    
    // Reset anonymous checkbox state
    anonymousCheckbox.checked = false;
    studentDetails.style.display = 'block';
    studentNameInput.required = true;
    studentRollNoInput.required = true;
    
    // Show form, hide success message
    formContainer.style.display = 'block';
    successMessage.style.display = 'none';
    
    // Scroll to form
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        toast.style.background = '#4caf50';
    } else if (type === 'error') {
        toast.style.background = '#f44336';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}