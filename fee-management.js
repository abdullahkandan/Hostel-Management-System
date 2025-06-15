document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('paymentForm');
    const validateBtn = document.getElementById('validate-btn');
    const validateRollNoInput = document.getElementById('validate-rollNo');
    const validationResult = document.getElementById('validation-result');
    const paidResult = document.getElementById('paid-result');
    const unpaidResult = document.getElementById('unpaid-result');
    
    // Payment form submission
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(paymentForm);
        const data = Object.fromEntries(formData);
        
        // Validate required fields
        if (!data.name || !data.rollNo || !data.amount || !data.paymentDate || !data.paymentMethod || !data.transactionCode) {
            showToast('Please fill in all required fields including payment date', 'error');
            return;
        }
        
        // Validate amount
        if (parseFloat(data.amount) <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }
        
        // Submit payment to API
        fetch('api_payment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showToast(result.message, 'success');
                paymentForm.reset();
            } else {
                showToast(result.message, 'error');
            }
        })
        .catch(error => {
            showToast('Error submitting payment: ' + error.message, 'error');
        });
    });
    
    // Payment validation
    validateBtn.addEventListener('click', function() {
        const rollNo = validateRollNoInput.value.trim();
        
        if (!rollNo) {
            showToast('Please enter a roll number to validate', 'error');
            return;
        }
        
        // Show loading state
        validateBtn.textContent = 'Checking...';
        validateBtn.disabled = true;
        
        // Hide previous results
        paidResult.style.display = 'none';
        unpaidResult.style.display = 'none';
        validationResult.style.display = 'none';
        
        // Validate payment via API
        fetch(`api_payment.php?rollNo=${encodeURIComponent(rollNo)}`)
        .then(response => response.json())
        .then(result => {
            validationResult.style.display = 'block';
            
            if (result.success && result.isPaid) {
                paidResult.style.display = 'block';
                showToast(result.message, 'success');
            } else {
                unpaidResult.style.display = 'block';
                showToast(result.message, 'error');
            }
            
            validateBtn.textContent = 'Check Payment Status';
            validateBtn.disabled = false;
            
            validationResult.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            showToast('Error validating payment: ' + error.message, 'error');
            validateBtn.textContent = 'Check Payment Status';
            validateBtn.disabled = false;
        });
    });
});

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
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