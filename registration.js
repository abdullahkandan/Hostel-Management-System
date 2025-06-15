document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('studentForm');
    const registrationForm = document.getElementById('registration-form');
    const successMessage = document.getElementById('success-message');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validate required fields
        if (!data.name || !data.rollNo || !data.email || !data.phone || !data.course || !data.year) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        // Validate phone format (basic)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(data.phone) || data.phone.length < 10) {
            showToast('Please enter a valid phone number', 'error');
            return;
        }
        
        // Submit to API
        fetch('api_registration.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                document.getElementById('welcome-message').textContent = `Welcome to the hostel, ${result.data.name}!`;
                document.getElementById('allocated-room').textContent = result.data.allocatedRoom;
                
                registrationForm.style.display = 'none';
                successMessage.style.display = 'block';
                
                showToast(result.message, 'success');
                
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                showToast(result.message, 'error');
            }
        })
        .catch(error => {
            showToast('Error submitting registration: ' + error.message, 'error');
        });
    });
});

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